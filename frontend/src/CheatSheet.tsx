export function CheatSheet() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        jlox Cheat Sheet
      </h2>
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Expressions
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">1 + 2 * 3;</code></li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">"hello" + " world";</code></li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">true and false;</code></li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">5 == 5;</code></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Variables
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">var x = 10;</code></li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">x = 20;</code></li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">print x;</code></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Control Flow
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">if (x &gt; 5) print "big";</code></li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">while (x &gt; 0) x = x - 1;</code></li>
            <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">for (var i = 0; i &lt; 10; i = i + 1) print i;</code></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Functions
          </h3>
          <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
{`fun fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Blocks & Scope
          </h3>
          <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto text-gray-700 dark:text-gray-300">
{`{
  var x = 10;
  print x;
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

