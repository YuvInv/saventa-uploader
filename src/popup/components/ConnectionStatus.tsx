interface ConnectionStatusProps {
  connected: boolean;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}

export function ConnectionStatus({ connected, loading, error, onRetry }: ConnectionStatusProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        Connecting to Sevanta...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
        Error: {error}
        <button
          onClick={onRetry}
          className="text-blue-600 hover:underline ml-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
        Connected to Sevanta
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-yellow-600">
      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" />
      Not connected
      <button
        onClick={onRetry}
        className="text-blue-600 hover:underline ml-2"
      >
        Retry
      </button>
    </div>
  );
}
