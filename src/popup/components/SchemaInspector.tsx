import { useState } from 'react';
import type { Schema } from '../../lib/types';

interface SchemaInspectorProps {
  schema: Schema;
  onClose: () => void;
  onClearCache?: () => Promise<void>;
}

export function SchemaInspector({ schema, onClose, onClearCache }: SchemaInspectorProps) {
  const [isClearing, setIsClearing] = useState(false);
  const requiredFields = schema.fields.filter(f => f.required);
  const dropdownFields = schema.fields.filter(f => f.type === 'dropdown' && f.options);

  const handleClearCache = async () => {
    if (!onClearCache) return;
    setIsClearing(true);
    try {
      await onClearCache();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Schema Inspector (Read-Only Mode)</h2>
        <div className="flex gap-2">
          {onClearCache && (
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
            >
              {isClearing ? 'Refreshing...' : 'Clear Cache & Refresh'}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Back to Upload
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        This view shows your CRM schema. No data will be written.
        <br />
        Schema fetched at: {new Date(schema.fetchedAt).toLocaleString()}
      </div>

      {/* Debug: Show raw response if no fields found */}
      {schema.fields.length === 0 && (
        <div className="bg-red-50 border border-red-300 rounded p-3">
          <h3 className="font-medium text-red-800 mb-2">Debug: No fields parsed!</h3>
          <p className="text-sm text-red-700 mb-2">
            The API response didn't match the expected format. Raw response below:
          </p>
          <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto text-xs">
            {JSON.stringify(schema.rawResponse, null, 2)}
          </pre>
          <p className="text-xs text-red-600 mt-2">
            Check browser console (F12) for more logs. The service worker console is at:
            chrome://extensions → Saventa Uploader → "service worker" link
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded p-3">
          <div className="text-2xl font-bold text-gray-800">{schema.fields.length}</div>
          <div className="text-xs text-gray-500">Total Fields</div>
        </div>
        <div className="bg-red-50 rounded p-3">
          <div className="text-2xl font-bold text-red-600">{requiredFields.length}</div>
          <div className="text-xs text-gray-500">Required</div>
        </div>
        <div className="bg-purple-50 rounded p-3">
          <div className="text-2xl font-bold text-purple-600">{dropdownFields.length}</div>
          <div className="text-xs text-gray-500">Dropdowns</div>
        </div>
      </div>

      {/* Required Fields */}
      <div>
        <h3 className="font-medium text-sm mb-2 text-red-700">Required Fields ({requiredFields.length})</h3>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-red-50">
              <tr>
                <th className="px-2 py-1 text-left">Field Name</th>
                <th className="px-2 py-1 text-left">Label</th>
                <th className="px-2 py-1 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {requiredFields.map(field => (
                <tr key={field.name} className="border-t">
                  <td className="px-2 py-1 font-mono text-xs">{field.name}</td>
                  <td className="px-2 py-1">{field.label}</td>
                  <td className="px-2 py-1">
                    <span className="bg-gray-100 px-1 rounded">{field.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dropdown Fields with Options */}
      {dropdownFields.length > 0 && (
        <div>
          <h3 className="font-medium text-sm mb-2 text-purple-700">Dropdown Fields & Options</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {dropdownFields.map(field => (
              <div key={field.name} className="border rounded p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-medium">{field.name}</span>
                  <span className="text-gray-500 text-xs">({field.label})</span>
                  {field.required && (
                    <span className="bg-red-100 text-red-700 text-xs px-1 rounded">required</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {field.optionlistFull ? (
                    Object.entries(field.optionlistFull).map(([key, label]) => (
                      <span
                        key={key}
                        className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded"
                        title={`Key: ${key}`}
                      >
                        {label}
                      </span>
                    ))
                  ) : field.options?.map(opt => (
                    <span
                      key={opt}
                      className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded"
                    >
                      {opt}
                    </span>
                  ))}
                  {(!field.options || field.options.length === 0) && !field.optionlistFull && (
                    <span className="text-gray-400 text-xs italic">No options defined</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Fields Table */}
      <div>
        <h3 className="font-medium text-sm mb-2">All Fields ({schema.fields.length})</h3>
        <div className="border rounded overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-2 py-1 text-left">Field Name</th>
                <th className="px-2 py-1 text-left">Label</th>
                <th className="px-2 py-1 text-left">Type</th>
                <th className="px-2 py-1 text-left">Required</th>
              </tr>
            </thead>
            <tbody>
              {schema.fields.map(field => (
                <tr key={field.name} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1 font-mono">{field.name}</td>
                  <td className="px-2 py-1">{field.label}</td>
                  <td className="px-2 py-1">
                    <span className="bg-gray-100 px-1 rounded">{field.type}</span>
                  </td>
                  <td className="px-2 py-1">
                    {field.required ? (
                      <span className="text-red-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw JSON */}
      <details className="text-xs">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
          View Raw Schema JSON
        </summary>
        <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded overflow-x-auto max-h-48 overflow-y-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </details>
    </div>
  );
}
