import { sevantaApi } from '../lib/api';
import type { MessageType, MessageResponse, Schema, Deal } from '../lib/types';

// Cache schema in memory
let cachedSchema: Schema | null = null;

// Handle messages from popup
chrome.runtime.onMessage.addListener(
  (
    message: MessageType,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    handleMessage(message)
      .then(sendResponse)
      .catch(error => {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

    // Return true to indicate we'll send response asynchronously
    return true;
  }
);

async function handleMessage(message: MessageType): Promise<MessageResponse> {
  switch (message.type) {
    case 'CHECK_CONNECTION':
      return handleCheckConnection();

    case 'GET_SCHEMA':
      return handleGetSchema();

    case 'SEARCH_DEALS':
      return handleSearchDeals(message.filter);

    case 'CREATE_DEAL':
      return handleCreateDeal(message.data);

    case 'CHECK_DUPLICATE':
      return handleCheckDuplicate(message.companyName, message.website);

    case 'CLEAR_CACHE':
      return handleClearCache();

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

async function handleCheckConnection(): Promise<MessageResponse<boolean>> {
  try {
    const connected = await sevantaApi.checkConnection();
    return { success: true, data: connected };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function handleGetSchema(): Promise<MessageResponse<Schema>> {
  try {
    // Return cached schema if less than 1 hour old
    if (cachedSchema && Date.now() - cachedSchema.fetchedAt < 3600000) {
      return { success: true, data: cachedSchema };
    }

    // Try to get from chrome.storage first
    const stored = await chrome.storage.local.get('schema');
    if (stored.schema && Date.now() - stored.schema.fetchedAt < 3600000) {
      cachedSchema = stored.schema;
      return { success: true, data: cachedSchema! };
    }

    // Fetch fresh schema
    const schema = await sevantaApi.getSchema();
    cachedSchema = schema;

    // Cache in storage
    await chrome.storage.local.set({ schema });

    return { success: true, data: schema };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch schema',
    };
  }
}

async function handleSearchDeals(filter: string): Promise<MessageResponse<Deal[]>> {
  try {
    const deals = await sevantaApi.searchDeals(filter);
    return { success: true, data: deals };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

async function handleCreateDeal(
  data: Record<string, string>
): Promise<MessageResponse<{ dealId?: string }>> {
  try {
    const result = await sevantaApi.createDeal(data);
    if (result.success) {
      return { success: true, data: { dealId: result.dealId } };
    }
    return { success: false, error: result.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Create deal failed',
    };
  }
}

async function handleCheckDuplicate(
  companyName: string,
  website?: string
): Promise<MessageResponse<{ isDuplicate: boolean; matches: Deal[] }>> {
  try {
    const result = await sevantaApi.checkDuplicate(companyName, website);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Duplicate check failed',
    };
  }
}

async function handleClearCache(): Promise<MessageResponse<boolean>> {
  try {
    cachedSchema = null;
    await chrome.storage.local.remove('schema');
    console.log('Schema cache cleared');
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cache',
    };
  }
}

// Clear stale cache on startup to ensure fresh schema after rebuilds
chrome.storage.local.remove('schema').then(() => {
  console.log('Schema cache cleared on startup');
});

// Log when service worker starts
console.log('Saventa Uploader background service worker started');
