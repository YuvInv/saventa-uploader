import Papa from 'papaparse';
import type { ColumnMapping, SchemaField } from './types';

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

export function generateCsvTemplate(schemaFields: SchemaField[]): string {
  const headers = schemaFields.map(f => f.name);
  return Papa.unparse({
    fields: headers,
    data: [],
  });
}
