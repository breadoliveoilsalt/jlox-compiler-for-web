import { compile } from '../compiler';
import { type ReadLine } from '../types';
import { CompilerError } from '../errors';

/**
 * Converts a code string into a ReadLine function
 */
function createReadLineFromCode(code: string): ReadLine {
  const lines = code.split('\n');
  let index = 0;

  return async () => {
    if (index >= lines.length) {
      return Promise.resolve(false);
    }
    return Promise.resolve(lines[index++]);
  };
}

/**
 * Compiles and evaluates jlox code for API use
 * Returns structured response with result, output, and error
 *
 * Note: This function temporarily patches console.log to capture print statements.
 * This is necessary because systemPrint uses console.log internally.
 */
export async function compileForApi(code: string): Promise<{
  result: any;
  output: string[];
  error: string | null;
}> {
  const outputs: string[] = [];
  const originalConsoleLog = console.log;

  // Patch console.log to capture jlox print statements
  // We use a flag to only capture during compilation
  let isCapturing = true;

  console.log = (...args: any[]) => {
    if (isCapturing) {
      // Only capture if we're in compilation mode
      const output = args
        .map((arg) => (arg === null || arg === undefined ? 'nil' : String(arg)))
        .join(' ');
      outputs.push(output);
    }
    // Always call original to maintain behavior
    originalConsoleLog(...args);
  };

  try {
    const readLine = createReadLineFromCode(code);
    const { result } = await compile(readLine);

    // Stop capturing before we restore
    isCapturing = false;
    console.log = originalConsoleLog;

    // Format result
    const formattedResult =
      result === null || result === undefined ? null : result;

    return {
      result: formattedResult,
      output: outputs,
      error: null,
    };
  } catch (e) {
    // Stop capturing and restore
    isCapturing = false;
    console.log = originalConsoleLog;

    if (e instanceof CompilerError) {
      const { name, message, lineNumber } = e;
      return {
        result: null,
        output: outputs,
        error: `${name}: Line ${lineNumber}: ${message}`,
      };
    } else if (e instanceof Error) {
      return {
        result: null,
        output: outputs,
        error: `Error unrecognized by jlox: ${e.message}`,
      };
    } else {
      return {
        result: null,
        output: outputs,
        error: 'Error unrecognized by jlox',
      };
    }
  }
}
