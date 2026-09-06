import React, { useState, useMemo } from 'react';
import { AlertCircle, FileJson, Copy, Check } from 'lucide-react';

const JsonNode = ({ node, nodeKey = '', isLast = true, depth = 0 }: { node: any, nodeKey?: string, isLast?: boolean, depth?: number }) => {
  const [expanded, setExpanded] = useState(true);
  const isObject = node !== null && typeof node === 'object';
  const isArray = Array.isArray(node);

  if (!isObject) {
    const valueColor = typeof node === 'string' ? 'text-green-600 dark:text-green-400' :
                       typeof node === 'number' ? 'text-blue-600 dark:text-blue-400' :
                       typeof node === 'boolean' ? 'text-purple-600 dark:text-purple-400' :
                       'text-gray-500';
    const displayValue = typeof node === 'string' ? `"${node}"` : String(node);
    return (
      <div className="font-mono text-sm pl-4" style={{ paddingLeft: `${depth * 16}px` }}>
        {nodeKey && <span className="text-accent">"{nodeKey}"</span>}
        {nodeKey && <span className="text-foreground mx-1">:</span>}
        <span className={valueColor}>{displayValue}</span>
        {!isLast && <span className="text-foreground">,</span>}
      </div>
    );
  }

  const entries = Object.entries(node);
  const isEmpty = entries.length === 0;
  const bracketOpen = isArray ? '[' : '{';
  const bracketClose = isArray ? ']' : '}';

  return (
    <div className="font-mono text-sm" style={{ paddingLeft: `${depth * 16}px` }}>
      <div 
        className="flex items-center cursor-pointer hover:bg-surface-2 -ml-1 pl-1 rounded"
        onClick={() => setExpanded(!expanded)}
      >
        {nodeKey && <span className="text-accent mr-1">"{nodeKey}":</span>}
        <span className="text-muted mr-2">{expanded ? '▼' : '▶'}</span>
        <span className="text-foreground">{bracketOpen}</span>
        {!expanded && (
          <span className="text-muted mx-2">
            {isEmpty ? '' : `${entries.length} items`}
          </span>
        )}
        {!expanded && <span className="text-foreground">{bracketClose}{!isLast ? ',' : ''}</span>}
      </div>

      {expanded && !isEmpty && (
        <div>
          {entries.map(([key, value], index) => (
            <JsonNode
              key={key}
              nodeKey={isArray ? '' : key}
              node={value}
              isLast={index === entries.length - 1}
              depth={depth + 1}
            />
          ))}
          <div style={{ paddingLeft: `${depth * 16}px` }}>
            <span className="text-foreground">{bracketClose}{!isLast ? ',' : ''}</span>
          </div>
        </div>
      )}
      {expanded && isEmpty && (
        <div style={{ paddingLeft: `${depth * 16}px` }}>
          <span className="text-foreground">{bracketClose}{!isLast ? ',' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState('{\n  "hello": "world",\n  "example": [1, 2, 3]\n}');
  const [copied, setCopied] = useState(false);

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: null };
    try {
      return { parsed: JSON.parse(input), error: null };
    } catch (err: any) {
      return { parsed: null, error: err.message };
    }
  }, [input]);

  const handleCopy = () => {
    if (parsed) {
      navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-line bg-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="text-accent" />
          <h1 className="font-semibold text-lg">JSON Formatter</h1>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
        <div className="bg-surface flex flex-col min-h-0">
          <div className="px-4 py-2 border-b border-line bg-surface-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Input</span>
          </div>
          <textarea
            className="flex-1 w-full p-4 bg-surface text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            spellCheck={false}
          />
        </div>

        <div className="bg-surface flex flex-col min-h-0">
          <div className="px-4 py-2 border-b border-line bg-surface-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Viewer</span>
            <div className="flex items-center gap-4">
              {error ? (
                <div className="flex items-center text-warn text-sm gap-1">
                  <AlertCircle size={14} />
                  <span>Invalid JSON</span>
                </div>
              ) : (
                <button
                  onClick={handleCopy}
                  className="text-muted hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                  disabled={!parsed}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Formatted'}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {error ? (
              <div className="text-warn font-mono text-sm bg-warn-soft p-4 rounded-md">
                {error}
              </div>
            ) : parsed ? (
              <JsonNode node={parsed} />
            ) : (
              <div className="text-muted text-sm text-center mt-10">
                Awaiting input...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
