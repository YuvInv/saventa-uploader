import type { Schema, Deal, SchemaField } from './types';

const BASE_URL = 'https://run.mydealflow.com/inv/api';

// Rate limiting state
let requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;
const RATE_LIMIT_DELAY = 600; // 100 requests per minute = ~600ms between requests

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      await request();
      if (requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    }
  }

  isProcessingQueue = false;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            reject(new Error('NOT_AUTHENTICATED'));
            return;
          }
          if (response.status === 429) {
            reject(new Error('RATE_LIMITED'));
            return;
          }
          reject(new Error(`API Error: ${response.status}`));
          return;
        }

        const data = await response.json();
        resolve(data as T);
      } catch (error) {
        reject(error);
      }
    });

    processQueue();
  });
}

export async function checkConnection(): Promise<boolean> {
  try {
    await apiRequest('/schema/deals');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
      return false;
    }
    throw error;
  }
}

// Sevanta API schema field format
interface RawSchemaField {
  dbname: string;
  label?: string;
  type?: string;
  optiongroup?: string;
  helptext?: string;
  optionlist?: Record<string, string>;  // Sevanta uses object {key: label} not array
}

// Sevanta returns { status: "ok", data: { fieldName: {...}, ... } }
interface RawSchemaResponse {
  status?: string;
  data?: Record<string, RawSchemaField>;  // Object keyed by field name, not array
  [key: string]: unknown;
}

export async function getSchema(): Promise<Schema> {
  const response = await apiRequest<RawSchemaResponse>('/schema/deals');

  // Log raw response for debugging
  console.log('Raw schema response:', response);

  // Sevanta returns { data: { fieldName: {...}, ... } } as an object
  const dataObj = response.data || {};
  const rawFields = Object.values(dataObj);

  console.log('Raw fields count:', rawFields.length);

  // Transform API response to our Schema type
  const fields: SchemaField[] = rawFields.map((field: RawSchemaField) => {
    const fieldName = field.dbname || '';

    // Convert optionlist object to array of values (the display labels)
    let options: string[] | undefined;
    if (field.optionlist && typeof field.optionlist === 'object') {
      // Store as "key:label" so we can map back later, or just use keys
      // For dropdowns, we typically need to send the key, not the label
      options = Object.entries(field.optionlist).map(([key]) => key);
    }

    return {
      name: fieldName,
      label: field.label || fieldName,
      type: mapFieldType(field.type),
      required: fieldName === 'CompanyName', // Only CompanyName is truly required
      options,
      // Store the full optionlist for reference
      optionlistFull: field.optionlist,
    };
  });

  console.log('Parsed fields:', fields.length);

  return {
    fields,
    fetchedAt: Date.now(),
    rawResponse: response,
  };
}

function mapFieldType(apiType?: string): SchemaField['type'] {
  switch (apiType?.toLowerCase()) {
    case 'select':
    case 'multi-check':
    case 'multi-tag':
    case 'radio':
      return 'dropdown';
    case 'int':
    case 'float':
    case 'number':
    case 'integer':
      return 'number';
    case 'date':
    case 'datetime':
      return 'date';
    case 'url':
      return 'url';
    case 'email':
      return 'email';
    case 'boolean':
    case 'bool':
      return 'boolean';
    case 'text':
    case 'textarea':
    case 'tel':
    default:
      return 'string';
  }
}

interface SearchResponse {
  status?: string;
  data?: Array<{
    CompanyID?: number;
    'Deal Name'?: string;
    Website?: string;
    [key: string]: unknown;
  }>;
  count_returned?: number;
  count_total?: number;
  [key: string]: unknown;
}

export async function searchDeals(filter: string): Promise<Deal[]> {
  const response = await apiRequest<SearchResponse>(
    `/deal/list?${filter}&_x[]=CompanyName&_x[]=Website`
  );

  // API returns data array, not deals
  const rawData = response.data || [];

  // Transform to our Deal format (API returns "Deal Name" not "CompanyName")
  return rawData.map(item => ({
    id: item.CompanyID?.toString(),
    CompanyName: item['Deal Name'] || '',
    Website: item.Website || undefined,
  }));
}

export async function checkDuplicate(
  companyName: string,
  website?: string
): Promise<{ isDuplicate: boolean; matches: Deal[] }> {
  const matches: Deal[] = [];

  // Search by company name
  if (companyName) {
    const nameFilter = `filter[CompanyName]=${encodeURIComponent(companyName)}`;
    const nameResults = await searchDeals(nameFilter);

    // Filter client-side for exact match (case-insensitive)
    // API may return partial matches or all records
    const exactMatches = nameResults.filter(
      deal => deal.CompanyName?.toLowerCase() === companyName.toLowerCase()
    );
    matches.push(...exactMatches);
  }

  // Search by website if provided
  if (website) {
    const websiteFilter = `filter[URL]=${encodeURIComponent(website)}`;
    const websiteResults = await searchDeals(websiteFilter);

    // Filter client-side for exact match
    const normalizedWebsite = website.toLowerCase().replace(/\/$/, '');
    const exactMatches = websiteResults.filter(deal => {
      const dealWebsite = deal.Website?.toLowerCase().replace(/\/$/, '');
      return dealWebsite === normalizedWebsite;
    });

    // Add unique matches
    for (const match of exactMatches) {
      if (!matches.some(m => m.id === match.id)) {
        matches.push(match);
      }
    }
  }

  return {
    isDuplicate: matches.length > 0,
    matches,
  };
}

interface CreateDealResponse {
  status?: string;
  error?: string;
  id?: string;
  CompanyID?: number;
  deal?: { id: string };
  [key: string]: unknown;
}

export async function createDeal(
  data: Record<string, string>
): Promise<{ success: boolean; dealId?: string; error?: string }> {
  try {
    // Use form-urlencoded format as the API might not accept JSON
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    }

    const response = await fetch(`${BASE_URL}/deal/add`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json() as CreateDealResponse;

    console.log('Create deal response:', result);

    // Check for error in response body
    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    // Check for success indicators
    if (result.status === 'ok' || result.CompanyID || result.id) {
      return {
        success: true,
        dealId: result.CompanyID?.toString() || result.id || result.deal?.id,
      };
    }

    return {
      success: false,
      error: 'Unknown response format',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export for use in background service worker
export const sevantaApi = {
  checkConnection,
  getSchema,
  searchDeals,
  checkDuplicate,
  createDeal,
};
