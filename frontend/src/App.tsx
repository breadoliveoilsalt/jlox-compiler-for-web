import { useState } from 'react';
import { CheatSheet } from './CheatSheet';
import { type EvaluateResponse } from './types';

// Use environment variable if set, otherwise default to localhost for dev
// In Kubernetes with Ingress, use relative URL '/api'
const API_URL =
  import.meta.env.VITE_API_URL ||
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to server',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatResult = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'nil';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return String(value);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          jlox Compiler
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Code Input */}
            <div>
              <label
                htmlFor="code-input"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >
                Enter jlox code:
              </label>
              <textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="var x = 10;&#10;print x;"
                className="w-full h-96 p-5 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         resize-none shadow-sm hover:shadow-md transition-shadow duration-200
                         placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              disabled={isLoading || !code.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                       disabled:from-gray-400 disabled:to-gray-500
                       text-white font-semibold py-4 px-6 rounded-xl
                       transition-all duration-200 disabled:cursor-not-allowed
                       shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none
                       disabled:shadow-none"
            >
              {isLoading ? 'Evaluating...' : 'Evaluate'}
            </button>

            {/* Result Display */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Result:
              </label>
              <div
                className="min-h-40 p-5 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                            bg-white dark:bg-gray-800 font-mono text-sm shadow-sm"
              >
                {result === null ? (
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    Results will appear here...
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Error Display */}
                    {result.error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded text-red-700 dark:text-red-400">
                        <strong className="font-semibold">Error:</strong>{' '}
                        {result.error}
                      </div>
                    )}

                    {/* Print Output */}
                    {result.output.length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded text-gray-700 dark:text-gray-300">
                        <strong className="font-semibold text-blue-700 dark:text-blue-400">
                          Output:
                        </strong>
                        <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                          {result.output.map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Final Result */}
                    {!result.error && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded text-gray-900 dark:text-gray-100">
                        <strong className="font-semibold text-green-700 dark:text-green-400">
                          Result:
                        </strong>{' '}
                        <span className="ml-2">
                          {formatResult(result.result)}
                        </span>
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
