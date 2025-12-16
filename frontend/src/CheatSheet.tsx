export function CheatSheet() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
        jlox Cheat Sheet
      </h2>
      <div className="space-y-6 text-sm">
        <div>
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            Expressions
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">1 + 2 * 3;</code></li>
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">"hello" + " world";</code></li>
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">true and false;</code></li>
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">5 == 5;</code></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            Variables
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">var x = 10;</code></li>
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">x = 20;</code></li>
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">print x;</code></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            Control Flow
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">if (x &gt; 5) print "big";</code></li>
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">while (x &gt; 0) x = x - 1;</code></li>
            <li><code className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-800 dark:text-indigo-200">for (var i = 0; i &lt; 10; i = i + 1) print i;</code></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            Functions
          </h3>
          <pre className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg text-xs overflow-x-auto text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
{`fun fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            Blocks & Scope
          </h3>
          <pre className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg text-xs overflow-x-auto text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
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

