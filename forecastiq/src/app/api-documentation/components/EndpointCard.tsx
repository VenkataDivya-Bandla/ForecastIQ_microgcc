'use client';

import React, { useState } from 'react';
import { Copy, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { EndpointDef } from './endpointData';

interface Props {
  endpoint: EndpointDef;
}

type CodeTab = 'curl' | 'python';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <CheckCheck size={12} className="text-accent" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative">
      <div className="absolute top-2.5 right-3 z-10">
        <CopyButton text={code} />
      </div>
      <div className="code-block p-4 pr-16 overflow-x-auto scrollbar-thin">
        <pre className="text-2xs leading-relaxed">
          {code.split('\n').map((line, i) => {
            // Simple syntax highlight via span coloring
            const highlighted = line
              .replace(/(curl|Bearer|Authorization|Content-Type)/g, '<kw>$1</kw>')
              .replace(/(".*?")/g, '<str>$1</str>')
              .replace(/(#.*$)/g, '<cmt>$1</cmt>');
            return (
              <span key={`line-${i}`} className="block">
                {line.startsWith('#') ? (
                  <span className="text-muted-foreground">{line}</span>
                ) : line.includes('"') ? (
                  <span>
                    {line.split(/(".*?")/).map((part, j) =>
                      part.startsWith('"') ? (
                        <span key={`part-${i}-${j}`} className="text-accent">{part}</span>
                      ) : (
                        <span key={`part-${i}-${j}`} className="text-foreground">{part}</span>
                      )
                    )}
                  </span>
                ) : (
                  <span className="text-foreground">{line}</span>
                )}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

export default function EndpointCard({ endpoint }: Props) {
  const [codeTab, setCodeTab] = useState<CodeTab>('curl');
  const [schemaExpanded, setSchemaExpanded] = useState(false);

  const methodClass =
    endpoint.method === 'GET' ?'endpoint-method-get'
      : endpoint.method === 'POST' ?'endpoint-method-post' :'endpoint-method-delete';

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="metric-card">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <span className={methodClass}>{endpoint.method}</span>
          <code className="text-sm font-mono font-semibold text-foreground">{endpoint.path}</code>
          <span className="badge badge-pending ml-auto">{endpoint.category}</span>
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">{endpoint.summary}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{endpoint.description}</p>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-2xs">
            <span className="text-muted-foreground">Rate Limit: </span>
            <span className="font-mono text-warning font-medium">{endpoint.rateLimit}</span>
          </div>
          <div className="text-2xs">
            <span className="text-muted-foreground">Auth Required: </span>
            <span className="font-mono text-accent font-medium">Bearer Token</span>
          </div>
        </div>
      </div>

      {/* Parameters */}
      {endpoint.params.length > 0 && (
        <div className="metric-card">
          <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
            Parameters
          </h3>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map((p) => (
                  <tr key={`param-${endpoint.id}-${p.name}`} className="row-hover">
                    <td>
                      <code className="font-mono text-xs text-primary">{p.name}</code>
                    </td>
                    <td>
                      <code className="font-mono text-2xs text-chart-4">{p.type}</code>
                    </td>
                    <td>
                      {p.required ? (
                        <span className="badge badge-error">required</span>
                      ) : (
                        <span className="badge badge-pending">optional</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-muted-foreground">{p.description}</span>
                    </td>
                    <td>
                      {p.example && (
                        <code className="font-mono text-2xs text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                          {p.example}
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Examples */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Code Examples
          </h3>
          <div className="flex gap-1">
            {(['curl', 'python'] as CodeTab[]).map((tab) => (
              <button
                key={`tab-${tab}`}
                onClick={() => setCodeTab(tab)}
                className={`tab-button text-xs ${codeTab === tab ? 'active' : ''}`}
              >
                {tab === 'curl' ? 'cURL' : 'Python'}
              </button>
            ))}
          </div>
        </div>
        <CodeBlock
          code={codeTab === 'curl' ? endpoint.curlExample : endpoint.pythonExample}
          lang={codeTab}
        />
      </div>

      {/* Response Schema */}
      <div className="metric-card">
        <button
          onClick={() => setSchemaExpanded((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Response Schema
          </h3>
          {schemaExpanded ? (
            <ChevronUp size={14} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </button>
        {schemaExpanded && (
          <div className="mt-3">
            <CodeBlock code={endpoint.responseSchema} lang="json" />
          </div>
        )}
        {!schemaExpanded && (
          <p className="text-2xs text-muted-foreground mt-2">
            Click to expand JSON response schema
          </p>
        )}
      </div>

      {/* Status Codes */}
      <div className="metric-card">
        <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
          HTTP Status Codes
        </h3>
        <div className="space-y-2">
          {endpoint.statusCodes.map((sc) => {
            const isSuccess = sc.code < 300;
            const isClientError = sc.code >= 400 && sc.code < 500;
            const isServerError = sc.code >= 500;
            const codeClass = isSuccess
              ? 'text-accent bg-accent/10 border-accent/20'
              : isClientError
              ? 'text-warning bg-warning/10 border-warning/20'
              : isServerError
              ? 'text-destructive bg-destructive/10 border-destructive/20' :'text-muted-foreground bg-muted/20 border-border';
            return (
              <div
                key={`sc-${endpoint.id}-${sc.code}`}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                <code
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${codeClass} flex-shrink-0`}
                >
                  {sc.code}
                </code>
                <span className="text-xs text-muted-foreground">{sc.meaning}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error codes reference */}
      <div className="metric-card bg-destructive/5 border-destructive/20">
        <h3 className="text-xs font-semibold text-destructive mb-3 uppercase tracking-wider">
          Common Error Codes
        </h3>
        <div className="space-y-2">
          {[
            { code: 'FORECAST_NOT_READY', meaning: 'Model training incomplete — retry after training job finishes' },
            { code: 'DATA_INSUFFICIENT', meaning: 'State has fewer than 52 weeks of history — forecast unreliable' },
            { code: 'INVALID_STATE_CODE', meaning: 'State code not recognized — use ISO 3166-2 two-letter codes' },
            { code: 'MODEL_TRAINING_FAILED', meaning: 'All 4 algorithms failed to converge — check data quality' },
            { code: 'RATE_LIMIT_EXCEEDED', meaning: 'Too many requests — check Retry-After header for wait time' },
          ].map((e) => (
            <div key={`err-${e.code}`} className="flex gap-3 text-2xs">
              <code className="font-mono text-destructive flex-shrink-0 min-w-[180px]">{e.code}</code>
              <span className="text-muted-foreground">{e.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}