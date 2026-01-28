// Sevanta API Types

export interface SchemaField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'dropdown' | 'url' | 'email' | 'boolean';
  required: boolean;
  options?: string[]; // For dropdown fields - the keys to send to API
  optionlistFull?: Record<string, string>; // Full key->label mapping for display
}

export interface Schema {
  fields: SchemaField[];
  fetchedAt: number;
  rawResponse?: unknown; // For debugging - stores the raw API response
}

export interface Deal {
  id?: string;
  CompanyName: string;
  Website?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Company {
  id: string; // Local ID for tracking
  data: Record<string, string>;
  validation: ValidationResult;
  duplicate?: DuplicateInfo;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
  createdDealId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface DuplicateInfo {
  isDuplicate: boolean;
  matchedOn: 'CompanyName' | 'Website' | 'both';
  existingDeal?: {
    id: string;
    CompanyName: string;
    Website?: string;
  };
}

export interface ColumnMapping {
  csvColumn: string;
  crmField: string | null;
}

export interface UploadProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  current?: string; // Current company being uploaded
}

// Message types for communication between popup and background
export type MessageType =
  | { type: 'CHECK_CONNECTION' }
  | { type: 'GET_SCHEMA' }
  | { type: 'CLEAR_CACHE' }
  | { type: 'SEARCH_DEALS'; filter: string }
  | { type: 'CREATE_DEAL'; data: Record<string, string> }
  | { type: 'CHECK_DUPLICATE'; companyName: string; website?: string };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
}
