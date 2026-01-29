import Papa from 'papaparse';
import type { ColumnMapping, ContactColumnMapping, SchemaField } from './types';

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export function parseCsv(content: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  const errors: string[] = [];

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      errors.push(`Row ${error.row}: ${error.message}`);
    }
  }

  return {
    headers: result.meta.fields || [],
    rows: result.data,
    errors,
  };
}

export function autoMapColumns(
  csvHeaders: string[],
  schemaFields: SchemaField[]
): ColumnMapping[] {
  return csvHeaders.map(csvColumn => {
    const normalizedCsvColumn = normalizeFieldName(csvColumn);

    // Try exact match first
    let matchedField = schemaFields.find(
      f => normalizeFieldName(f.name) === normalizedCsvColumn ||
           normalizeFieldName(f.label) === normalizedCsvColumn
    );

    // Try partial match
    if (!matchedField) {
      matchedField = schemaFields.find(f => {
        const normalizedName = normalizeFieldName(f.name);
        const normalizedLabel = normalizeFieldName(f.label);
        return normalizedName.includes(normalizedCsvColumn) ||
               normalizedCsvColumn.includes(normalizedName) ||
               normalizedLabel.includes(normalizedCsvColumn) ||
               normalizedCsvColumn.includes(normalizedLabel);
      });
    }

    return {
      csvColumn,
      crmField: matchedField?.name || null,
    };
  });
}

function normalizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Common aliases for contact fields
const CONTACT_ALIASES: Record<string, string[]> = {
  Name: ['founder', 'foundername', 'contactname', 'ceoname', 'ceo', 'contact', 'person', 'foundercontact'],
  Email: ['founderemail', 'contactemail', 'ceoemail', 'email', 'emailaddress'],
  Phone: ['founderphone', 'contactphone', 'ceophone', 'phone', 'phonenumber', 'mobile', 'cell'],
  Title: ['foundertitle', 'contacttitle', 'jobtitle', 'position', 'role'],
  LinkedIn: ['founderlinkedin', 'contactlinkedin', 'linkedinurl', 'linkedin'],
};

export function autoMapContactColumns(
  csvHeaders: string[],
  contactSchemaFields: SchemaField[]
): ContactColumnMapping[] {
  const mappings: ContactColumnMapping[] = [];

  for (const csvColumn of csvHeaders) {
    const normalizedCsvColumn = normalizeFieldName(csvColumn);

    // Check if this column looks like a contact field
    let matchedField: SchemaField | undefined;

    // Check aliases first
    for (const [fieldName, aliases] of Object.entries(CONTACT_ALIASES)) {
      if (aliases.some(alias => normalizedCsvColumn.includes(alias) || alias.includes(normalizedCsvColumn))) {
        matchedField = contactSchemaFields.find(f => f.name === fieldName);
        break;
      }
    }

    // Try direct match with schema fields
    if (!matchedField) {
      matchedField = contactSchemaFields.find(
        f => normalizeFieldName(f.name) === normalizedCsvColumn ||
             normalizeFieldName(f.label) === normalizedCsvColumn
      );
    }

    // Only add mapping if we found a match (contact columns are optional)
    if (matchedField) {
      mappings.push({
        csvColumn,
        contactField: matchedField.name,
      });
    }
  }

  return mappings;
}

export function applyContactMapping(
  rows: Record<string, string>[],
  mappings: ContactColumnMapping[]
): Record<string, string>[] {
  return rows.map(row => {
    const mapped: Record<string, string> = {};

    for (const mapping of mappings) {
      if (mapping.contactField) {
        const value = row[mapping.csvColumn];
        if (value) {
          mapped[mapping.contactField] = value;
        }
      }
    }

    return mapped;
  });
}

export function applyMapping(
  rows: Record<string, string>[],
  mappings: ColumnMapping[]
): Record<string, string>[] {
  return rows.map(row => {
    const mapped: Record<string, string> = {};

    for (const mapping of mappings) {
      if (mapping.crmField) {
        mapped[mapping.crmField] = row[mapping.csvColumn] || '';
      }
    }

    return mapped;
  });
}

export interface TemplateOptions {
  includeDescriptionRow?: boolean;
  includeContactFields?: boolean;
  contactSchemaFields?: SchemaField[];
}

export function generateCsvTemplate(
  schemaFields: SchemaField[],
  options: TemplateOptions = {}
): string {
  const { includeDescriptionRow = false, includeContactFields = false, contactSchemaFields = [] } = options;

  // Build headers from deal fields
  const dealHeaders = schemaFields.map(f => f.name);

  // Optionally add contact fields
  const contactHeaders = includeContactFields && contactSchemaFields.length > 0
    ? contactSchemaFields.map(f => `Contact_${f.name}`)
    : [];

  const headers = [...dealHeaders, ...contactHeaders];

  // Build data rows
  const data: string[][] = [];

  if (includeDescriptionRow) {
    // Create description row with field info
    const dealDescriptions = schemaFields.map(f => {
      const parts: string[] = [];
      if (f.label !== f.name) parts.push(f.label);
      if (f.required) parts.push('REQUIRED');
      if (f.type !== 'string') parts.push(`Type: ${f.type}`);
      if (f.options && f.options.length > 0) {
        const optionSample = f.options.slice(0, 3).join(', ');
        parts.push(`Options: ${optionSample}${f.options.length > 3 ? '...' : ''}`);
      }
      return parts.join(' | ') || '';
    });

    const contactDescriptions = includeContactFields && contactSchemaFields.length > 0
      ? contactSchemaFields.map(f => {
          const parts: string[] = [];
          if (f.label !== f.name) parts.push(f.label);
          if (f.required) parts.push('REQUIRED');
          return parts.join(' | ') || '';
        })
      : [];

    data.push([...dealDescriptions, ...contactDescriptions]);
  }

  return Papa.unparse({
    fields: headers,
    data,
  });
}

export function downloadCsvTemplate(
  schemaFields: SchemaField[],
  options: TemplateOptions = {},
  filename = 'sevanta-template.csv'
): void {
  const csvContent = generateCsvTemplate(schemaFields, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
