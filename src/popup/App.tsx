import { useState, useEffect } from 'react';
import { ConnectionStatus } from './components/ConnectionStatus';
import { CsvUpload } from './components/CsvUpload';
import { ColumnMapper } from './components/ColumnMapper';
import { CompanyTable } from './components/CompanyTable';
import { CompanyEditor } from './components/CompanyEditor';
import { ValidationPanel } from './components/ValidationPanel';
import { UploadProgress } from './components/UploadProgress';
import { SchemaInspector } from './components/SchemaInspector';
import { UploadPreview } from './components/UploadPreview';
import { useSevantaApi } from './hooks/useSevantaApi';
import { useValidation } from './hooks/useValidation';
import { useDuplicateCheck } from './hooks/useDuplicateCheck';
import { parseCsv, autoMapColumns, applyMapping } from '../lib/csv';
import type { Company, ColumnMapping, UploadProgress as UploadProgressType } from '../lib/types';

type Step = 'upload' | 'map' | 'review' | 'preview' | 'uploading' | 'complete' | 'schema';

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType | null>(null);

  const { connected, loading: connectionLoading, schema, error: connectionError, refreshConnection, clearCache } = useSevantaApi();
  const { validateCompanies } = useValidation(schema);
  const { checkDuplicates } = useDuplicateCheck();

  // Handle CSV upload
  const handleCsvUpload = (content: string) => {
    const parsed = parseCsv(content);
    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
    }
    setCsvData({ headers: parsed.headers, rows: parsed.rows });

    // Auto-map columns if schema is available
    if (schema) {
      const mappings = autoMapColumns(parsed.headers, schema.fields);
      setColumnMappings(mappings);
    }

    setStep('map');
  };

  // Handle column mapping confirmation
  const handleMappingConfirm = async () => {
    if (!csvData || !schema) return;

    const mappedData = applyMapping(csvData.rows, columnMappings);

    // Create company objects with validation
    const newCompanies: Company[] = mappedData.map((data, index) => ({
      id: `company-${index}-${Date.now()}`,
      data,
      validation: { valid: true, errors: [], warnings: [] },
      uploadStatus: 'pending' as const,
    }));

    // Validate all companies
    const validated = validateCompanies(newCompanies);
    setCompanies(validated);

    // Check for duplicates
    const withDuplicates = await checkDuplicates(validated);
    setCompanies(withDuplicates);

    setStep('review');
  };

  // Handle company edit
  const handleCompanyEdit = (id: string, field: string, value: string) => {
    setCompanies(prev =>
      prev.map(company => {
        if (company.id !== id) return company;

        const updatedData = { ...company.data, [field]: value };
        return {
          ...company,
          data: updatedData,
        };
      })
    );
  };

  // Re-validate after edit
  useEffect(() => {
    if (schema && companies.length > 0 && step === 'review') {
      const revalidated = validateCompanies(companies);
      if (JSON.stringify(revalidated) !== JSON.stringify(companies)) {
        setCompanies(revalidated);
      }
    }
  }, [companies.map(c => JSON.stringify(c.data)).join(','), schema]);

  // Handle upload preview (shows dry-run before actual upload)
  const handleShowPreview = () => {
    setStep('preview');
  };

  // Handle confirmed upload (after preview)
  const handleConfirmedUpload = async () => {
    const toUpload = companies.filter(
      c => c.validation.valid && c.uploadStatus === 'pending' && !c.duplicate?.isDuplicate
    );

    if (toUpload.length === 0) return;

    setStep('uploading');
    setUploadProgress({
      total: toUpload.length,
      completed: 0,
      successful: 0,
      failed: 0,
    });

    for (const company of toUpload) {
      setUploadProgress(prev => prev ? { ...prev, current: company.data.CompanyName } : null);

      // Update status to uploading
      setCompanies(prev =>
        prev.map(c => (c.id === company.id ? { ...c, uploadStatus: 'uploading' as const } : c))
      );

      // Log to console for debugging
      console.log('Uploading company:', company.data);

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'CREATE_DEAL',
          data: company.data,
        });

        console.log('Upload response:', response);

        if (response.success) {
          setCompanies(prev =>
            prev.map(c =>
              c.id === company.id
                ? { ...c, uploadStatus: 'success' as const, createdDealId: response.data?.dealId }
                : c
            )
          );
          setUploadProgress(prev =>
            prev ? { ...prev, completed: prev.completed + 1, successful: prev.successful + 1 } : null
          );
        } else {
          setCompanies(prev =>
            prev.map(c =>
              c.id === company.id
                ? { ...c, uploadStatus: 'error' as const, uploadError: response.error }
                : c
            )
          );
          setUploadProgress(prev =>
            prev ? { ...prev, completed: prev.completed + 1, failed: prev.failed + 1 } : null
          );
        }
      } catch (error) {
        console.error('Upload error:', error);
        setCompanies(prev =>
          prev.map(c =>
            c.id === company.id
              ? { ...c, uploadStatus: 'error' as const, uploadError: 'Network error' }
              : c
          )
        );
        setUploadProgress(prev =>
          prev ? { ...prev, completed: prev.completed + 1, failed: prev.failed + 1 } : null
        );
      }
    }

    setUploadProgress(prev => prev ? { ...prev, current: undefined } : null);
    setStep('complete');
  };

  // Reset to start
  const handleReset = () => {
    setCsvData(null);
    setColumnMappings([]);
    setCompanies([]);
    setSelectedCompanyId(null);
    setUploadProgress(null);
    setStep('upload');
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const validCount = companies.filter(c => c.validation.valid && !c.duplicate?.isDuplicate).length;
  const invalidCount = companies.filter(c => !c.validation.valid).length;
  const duplicateCount = companies.filter(c => c.duplicate?.isDuplicate).length;

  return (
    <div className="p-4">
      <header className="mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Saventa Uploader</h1>
          {connected && schema && step !== 'schema' && (
            <button
              onClick={() => setStep('schema')}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Inspect Schema (Read-Only)
            </button>
          )}
        </div>
        <ConnectionStatus
          connected={connected}
          loading={connectionLoading}
          error={connectionError}
          onRetry={refreshConnection}
        />
      </header>

      {!connected && !connectionLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            Please log into <a href="https://run.mydealflow.com" target="_blank" rel="noopener noreferrer" className="underline">Sevanta Dealflow</a> first, then reopen this extension.
          </p>
        </div>
      )}

      {/* Schema Inspector (Read-Only Mode) */}
      {connected && step === 'schema' && schema && (
        <SchemaInspector
          schema={schema}
          onClose={() => setStep('upload')}
          onClearCache={clearCache}
        />
      )}

      {/* Upload Step */}
      {connected && step === 'upload' && (
        <CsvUpload onUpload={handleCsvUpload} />
      )}

      {/* Column Mapping Step */}
      {connected && step === 'map' && csvData && schema && (
        <ColumnMapper
          csvHeaders={csvData.headers}
          schemaFields={schema.fields}
          mappings={columnMappings}
          onMappingChange={setColumnMappings}
          onConfirm={handleMappingConfirm}
          onBack={() => setStep('upload')}
        />
      )}

      {/* Review Step */}
      {connected && (step === 'review' || step === 'complete') && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">{validCount} valid</span>
              {invalidCount > 0 && <span className="text-red-600">{invalidCount} invalid</span>}
              {duplicateCount > 0 && <span className="text-orange-600">{duplicateCount} duplicates</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Start Over
              </button>
              {step === 'review' && (
                <button
                  onClick={handleShowPreview}
                  disabled={validCount === 0}
                  className="px-4 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview Upload ({validCount})
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <CompanyTable
                companies={companies}
                schema={schema}
                selectedId={selectedCompanyId}
                onSelect={setSelectedCompanyId}
              />
            </div>

            {selectedCompany && schema && (
              <div className="w-64 flex-shrink-0">
                <CompanyEditor
                  company={selectedCompany}
                  schema={schema}
                  onEdit={(field, value) => handleCompanyEdit(selectedCompany.id, field, value)}
                  onClose={() => setSelectedCompanyId(null)}
                />
                <ValidationPanel company={selectedCompany} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview/Dry-Run Step */}
      {connected && step === 'preview' && (
        <UploadPreview
          companies={companies}
          onConfirm={handleConfirmedUpload}
          onCancel={() => setStep('review')}
        />
      )}

      {/* Uploading Step */}
      {connected && step === 'uploading' && uploadProgress && (
        <UploadProgress progress={uploadProgress} />
      )}
    </div>
  );
}
