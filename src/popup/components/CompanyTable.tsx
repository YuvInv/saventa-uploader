import type { Company, Schema } from '../../lib/types';

interface CompanyTableProps {
  companies: Company[];
  schema: Schema | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CompanyTable({ companies, schema, selectedId, onSelect }: CompanyTableProps) {
  // Show key fields in table
  const displayFields = ['CompanyName', 'Website', 'Sector', 'Stage'].filter(
    f => schema?.fields.some(sf => sf.name === f)
  );

  const getRowClass = (company: Company) => {
    if (company.uploadStatus === 'success') return 'bg-green-50';
    if (company.uploadStatus === 'error') return 'bg-red-50';
    if (company.duplicate?.isDuplicate) return 'status-duplicate';
    if (!company.validation.valid) return 'status-error';
    if (company.validation.warnings.length > 0) return 'status-warning';
    return '';
  };

  const getStatusIcon = (company: Company) => {
    if (company.uploadStatus === 'success') return '✓';
    if (company.uploadStatus === 'error') return '✗';
    if (company.uploadStatus === 'uploading') return '...';
    if (company.duplicate?.isDuplicate) return '⚠';
    if (!company.validation.valid) return '!';
    return '';
  };

  return (
    <div className="border rounded-lg overflow-auto max-h-80">
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-8"></th>
            {displayFields.map(field => (
              <th key={field}>{field}</th>
            ))}
            <th className="w-24">Status</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr
              key={company.id}
              className={`cursor-pointer ${getRowClass(company)} ${
                selectedId === company.id ? 'ring-2 ring-blue-500 ring-inset' : ''
              }`}
              onClick={() => onSelect(selectedId === company.id ? null : company.id)}
            >
              <td className="text-center font-bold">
                {getStatusIcon(company)}
              </td>
              {displayFields.map(field => (
                <td key={field} className="truncate max-w-32">
                  {company.data[field] || '-'}
                </td>
              ))}
              <td>
                <StatusBadge company={company} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ company }: { company: Company }) {
  if (company.uploadStatus === 'success') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        Uploaded
      </span>
    );
  }

  if (company.uploadStatus === 'error') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        Failed
      </span>
    );
  }

  if (company.uploadStatus === 'uploading') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        Uploading...
      </span>
    );
  }

  if (company.duplicate?.isDuplicate) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
        Duplicate
      </span>
    );
  }

  if (!company.validation.valid) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        Invalid
      </span>
    );
  }

  if (company.validation.warnings.length > 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
        Warning
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
      Ready
    </span>
  );
}
