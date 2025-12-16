import { useState } from 'react';
import { CheatSheet } from './CheatSheet';
import { type EvaluateResponse } from './types';

// Use environment variable if set, otherwise default to localhost for dev
// In Kubernetes with Ingress, use relative URL '/api'
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001');

function App() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = async () => {
    if (!code.trim()) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data: EvaluateResponse = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        result: null,
        output: [],
        error: error instanceof Error ? error.message : 'Failed to connect to server',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatResult = (value: any): string => {
    if (value === null || value === undefined) {
      return 'nil';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          jlox Compiler
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Code Input */}
            <div>
              <label htmlFor="code-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter jlox code:
              </label>
              <textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="var x = 10;&#10;print x;"
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
              />
            </div>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              disabled={isLoading || !code.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                       text-white font-semibold py-3 px-6 rounded-lg
                       transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Evaluating...' : 'Evaluate'}
            </button>

            {/* Result Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Result:
              </label>
              <div className="min-h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg
                            bg-white dark:bg-gray-800 font-mono text-sm">
                {result === null ? (
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    Results will appear here...
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Error Display */}
                    {result.error && (
                      <div className="text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}

                    {/* Print Output */}
                    {result.output.length > 0 && (
                      <div className="text-gray-700 dark:text-gray-300">
                        <strong>Output:</strong>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {result.output.map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Final Result */}
                    {!result.error && (
                      <div className="text-gray-900 dark:text-gray-100">
                        <strong>Result:</strong> {formatResult(result.result)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cheat Sheet Sidebar */}
          <div className="lg:col-span-1">
            <CheatSheet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
