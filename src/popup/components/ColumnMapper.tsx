import type { SchemaField, ColumnMapping } from '../../lib/types';

interface ColumnMapperProps {
  csvHeaders: string[];
  schemaFields: SchemaField[];
  mappings: ColumnMapping[];
  onMappingChange: (mappings: ColumnMapping[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function ColumnMapper({
  csvHeaders,
  schemaFields,
  mappings,
  onMappingChange,
  onConfirm,
  onBack,
}: ColumnMapperProps) {
  const handleMappingChange = (csvColumn: string, crmField: string | null) => {
    onMappingChange(
      mappings.map(m =>
        m.csvColumn === csvColumn ? { ...m, crmField } : m
      )
    );
  };

  const missingRequiredFields = schemaFields
    .filter(f => f.required)
    .filter(f => !mappings.some(m => m.crmField === f.name));

  const canConfirm = missingRequiredFields.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Map Columns to CRM Fields</h2>
        <span className="text-sm text-gray-500">
          {csvHeaders.length} columns found
        </span>
      </div>

      {missingRequiredFields.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <p className="font-medium text-yellow-800 mb-1">Missing required fields:</p>
          <ul className="list-disc list-inside text-yellow-700">
            {missingRequiredFields.map(f => (
              <li key={f.name}>{f.label}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">CSV Column</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">CRM Field</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(mapping => {
              const currentField = schemaFields.find(f => f.name === mapping.crmField);
              return (
                <tr key={mapping.csvColumn} className="border-t">
                  <td className="px-3 py-2">
                    <code className="bg-gray-100 px-1 rounded">{mapping.csvColumn}</code>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={mapping.crmField || ''}
                      onChange={e => handleMappingChange(mapping.csvColumn, e.target.value || null)}
                      className="w-full border rounded px-2 py-1 text-sm"
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
                      <span className="text-green-600 text-xs ml-2">Required</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
