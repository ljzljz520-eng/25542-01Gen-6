import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import { cn } from '../../lib/utils';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: 'python' | 'javascript' | 'typescript' | 'json' | 'bash';
  readOnly?: boolean;
  lineNumbers?: boolean;
  className?: string;
  minHeight?: string;
  placeholder?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  readOnly = false,
  lineNumbers = true,
  className,
  minHeight = '300px',
  placeholder,
}: CodeEditorProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>(value.split('\n'));

  useEffect(() => {
    setLines(value.split('\n'));
  }, [value]);

  useEffect(() => {
    if (codeRef.current && readOnly) {
      Prism.highlightElement(codeRef.current);
    }
  }, [value, language, readOnly]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (codeRef.current && codeRef.current !== target) {
      codeRef.current.scrollTop = target.scrollTop;
      codeRef.current.scrollLeft = target.scrollLeft;
    }
    if (textareaRef.current && textareaRef.current !== target) {
      textareaRef.current.scrollTop = target.scrollTop;
      textareaRef.current.scrollLeft = target.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    setLines(newValue.split('\n'));
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900 font-mono text-sm',
        className
      )}
      style={{ minHeight }}
    >
      <div className="flex h-full" style={{ minHeight }}>
        {lineNumbers && (
          <div
            ref={lineNumbersRef}
            className="flex-shrink-0 select-none overflow-hidden border-r border-slate-700 bg-slate-800/50 py-4 text-right"
            style={{ minWidth: '3rem' }}
          >
            {lines.map((_, i) => (
              <div
                key={i}
                className="px-3 py-0.5 text-xs text-slate-500 leading-6"
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          {!readOnly ? (
            <>
              <pre
                ref={codeRef}
                aria-hidden="true"
                onScroll={handleScroll}
                className="absolute inset-0 m-0 p-4 overflow-auto pointer-events-none bg-transparent leading-6 whitespace-pre"
              >
                <code className={`language-${language}`}>{value}</code>
              </pre>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onScroll={handleScroll}
                placeholder={placeholder}
                spellCheck={false}
                className={cn(
                  'absolute inset-0 w-full h-full p-4 m-0 resize-none bg-transparent',
                  'text-transparent caret-white leading-6 whitespace-pre',
                  'focus:outline-none focus:ring-0'
                )}
                style={{ minHeight }}
              />
            </>
          ) : (
            <pre
              ref={codeRef}
              className="m-0 p-4 overflow-auto leading-6"
              style={{ minHeight }}
            >
              <code className={`language-${language}`}>{value}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
