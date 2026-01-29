import { useState } from 'react';
import type { SchemaField, ColumnMapping, ContactColumnMapping } from '../../lib/types';

interface ColumnMapperProps {
  csvHeaders: string[];
  schemaFields: SchemaField[];
  mappings: ColumnMapping[];
  onMappingChange: (mappings: ColumnMapping[]) => void;
  onConfirm: () => void;
  onBack: () => void;
  // Contact mapping props (optional)
  contactSchemaFields?: SchemaField[];
  contactMappings?: ContactColumnMapping[];
  onContactMappingChange?: (mappings: ContactColumnMapping[]) => void;
}

type TabType = 'deals' | 'contacts';

export function ColumnMapper({
  csvHeaders,
  schemaFields,
  mappings,
  onMappingChange,
  onConfirm,
  onBack,
  contactSchemaFields,
  contactMappings,
  onContactMappingChange,
}: ColumnMapperProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deals');
  const hasContactFields = contactSchemaFields && contactSchemaFields.length > 0;

  const handleMappingChange = (csvColumn: string, crmField: string | null) => {
    onMappingChange(
      mappings.map(m =>
        m.csvColumn === csvColumn ? { ...m, crmField } : m
      )
    );
  };

  const handleContactMappingChange = (csvColumn: string, contactField: string | null) => {
    if (!onContactMappingChange || !contactMappings) return;

    // Check if mapping already exists for this column
    const existingIndex = contactMappings.findIndex(m => m.csvColumn === csvColumn);

    if (existingIndex >= 0) {
      // Update existing mapping
      onContactMappingChange(
        contactMappings.map((m, i) =>
          i === existingIndex ? { ...m, contactField } : m
        )
      );
    } else if (contactField) {
      // Add new mapping
      onContactMappingChange([...contactMappings, { csvColumn, contactField }]);
    }
  };

  const removeContactMapping = (csvColumn: string) => {
    if (!onContactMappingChange || !contactMappings) return;
    onContactMappingChange(contactMappings.filter(m => m.csvColumn !== csvColumn));
  };

  const missingRequiredFields = schemaFields
    .filter(f => f.required)
    .filter(f => !mappings.some(m => m.crmField === f.name));

  const canConfirm = missingRequiredFields.length === 0;

  // Get unmapped CSV columns for contact tab
  const unmappedColumns = csvHeaders.filter(
    header => !mappings.some(m => m.crmField && m.csvColumn === header)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Map Columns</h2>
            <p className="text-sm text-gray-500 mt-0.5">Match your CSV columns to CRM fields</p>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600">
            {csvHeaders.length} columns
          </div>
        </div>
      </div>

      {/* Tabs */}
      {hasContactFields && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'deals'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Deal Fields
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'contacts'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contact/Founder
              {contactMappings && contactMappings.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {contactMappings.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      )}

      {missingRequiredFields.length > 0 && activeTab === 'deals' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800 text-sm">Missing required fields:</p>
            <ul className="mt-1 text-sm text-yellow-700">
              {missingRequiredFields.map(f => (
                <li key={f.name}>{f.label}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Deal Fields Tab */}
      {activeTab === 'deals' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">CSV Column</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">CRM Field</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mappings.map(mapping => {
                const currentField = schemaFields.find(f => f.name === mapping.crmField);
                return (
                  <tr key={mapping.csvColumn} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">{mapping.csvColumn}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={mapping.crmField || ''}
                          onChange={e => handleMappingChange(mapping.csvColumn, e.target.value || null)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">-- Skip this column --</option>
                          {schemaFields.map(field => {
                            const isAlreadyMapped = mappings.some(
                              m => m.crmField === field.name && m.csvColumn !== mapping.csvColumn
                            );
                            return (
                              <option
                                key={field.name}
                                value={field.name}
                                disabled={isAlreadyMapped}
                              >
                                {field.label}
                                {field.required ? ' *' : ''}
                                {isAlreadyMapped ? ' (already mapped)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {currentField?.required && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">Required</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Fields Tab */}
      {activeTab === 'contacts' && hasContactFields && contactMappings && onContactMappingChange && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              Map columns containing founder or contact information. These will be created as contacts linked to each deal.
            </p>
          </div>

          {/* Existing contact mappings */}
          {contactMappings.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">CSV Column</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs uppercase tracking-wider">Contact Field</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contactMappings.map(mapping => (
                    <tr key={mapping.csvColumn} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">{mapping.csvColumn}</code>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={mapping.contactField || ''}
                          onChange={e => handleContactMappingChange(mapping.csvColumn, e.target.value || null)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">-- Remove mapping --</option>
                          {contactSchemaFields!.map(field => {
                            const isAlreadyMapped = contactMappings.some(
                              m => m.contactField === field.name && m.csvColumn !== mapping.csvColumn
                            );
                            return (
                              <option
                                key={field.name}
                                value={field.name}
                                disabled={isAlreadyMapped}
                              >
                                {field.label}
                                {field.required ? ' *' : ''}
                                {isAlreadyMapped ? ' (already mapped)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeContactMapping(mapping.csvColumn)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Remove mapping"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add new contact mapping */}
          {unmappedColumns.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Add contact field mapping:</p>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={e => {
                  const csvColumn = e.target.value;
                  if (csvColumn) {
                    handleContactMappingChange(csvColumn, 'Name'); // Default to Name field
                    e.target.value = ''; // Reset select
                  }
                }}
                defaultValue=""
              >
                <option value="">Select CSV column to map...</option>
                {unmappedColumns.map(column => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          )}

          {unmappedColumns.length === 0 && contactMappings.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">
                All columns are already mapped to deal fields. Skip columns on the Deal Fields tab to map them here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
