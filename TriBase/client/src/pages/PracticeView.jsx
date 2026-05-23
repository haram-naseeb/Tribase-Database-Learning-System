import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Network } from 'vis-network/standalone';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RotateCcw, Copy, CheckCircle2, AlertCircle,
  ChevronRight, ChevronDown, Database, Loader2
} from 'lucide-react';

// ─── DB Config ────────────────────────────────────────────────────
const DB_CONFIG = {
  postgres: {
    color: '#3B82F6', lang: 'sql', label: 'PostgreSQL',
    defaultQuery: `-- Query the ECommerceDB\nSELECT p.name, p.price, c.name AS category\nFROM products p\nJOIN ecom_categories c ON p.category_id = c.id\nORDER BY p.price DESC\nLIMIT 10;`,
    hints: [
      'SELECT * FROM ecom_users LIMIT 5;',
      'SELECT status, COUNT(*) FROM orders GROUP BY status;',
      'SELECT p.name, AVG(r.rating) AS avg_rating FROM products p JOIN reviews r ON p.id = r.product_id GROUP BY p.name ORDER BY 2 DESC LIMIT 5;',
      'INSERT INTO ecom_users (name, email, country) VALUES (\'Test User\', \'test@demo.com\', \'USA\') RETURNING *;',
      'UPDATE products SET stock = stock - 1 WHERE id = 1 RETURNING name, stock;',
      'DELETE FROM reviews WHERE rating < 2 RETURNING id, rating, comment;'
    ]
  },
  mongo: {
    color: '#10B981', lang: 'javascript', label: 'MongoDB',
    defaultQuery:
`// MongoDB Shell syntax — same as Compass & mongosh
db.users.find({})

// More examples to try:
// db.users.find({ followers_count: { $gt: 100 } })
// db.posts.find({}, { content: 1, hashtags: 1 }).limit(5)
// db.users.insertOne({ username: "new_user", email: "x@demo.com" })
// db.users.deleteOne({ username: "alex_j" })
// db.posts.aggregate([{ $group: { _id: null, total_likes: { $sum: "$likes_count" } } }])`,
    hints: [
      'db.users.find({ followers_count: { $gt: 500 } })',
      'db.posts.find({ }, { content: 1, hashtags: 1, likes_count: 1 }).limit(5)',
      'db.messages.find({ read: false })',
      'db.users.countDocuments({ is_premium: true })',
      'db.posts.aggregate([{ $group: { _id: null, avg_likes: { $avg: "$likes_count" } } }])',
      'db.users.insertOne({ username: "forge_user", email: "forge@demo.com", bio: "Learning DB" })',
      'db.users.updateOne({ username: "alex_j" }, { $set: { bio: "Updated bio!" } })',
      'db.users.deleteOne({ username: "charlie_y" })'
    ]
  },
  neo4j: {
    color: '#8B5CF6', lang: 'cypher', label: 'Neo4j',
    defaultQuery: `// 🕸 Graph View — returns full nodes & relationships\nMATCH (p:Person)-[r:ACTED_IN]->(m:Movie)\nRETURN p, r, m LIMIT 25`,
    hints: [
      // ── Graph View queries (return full nodes → shows network) ──
      'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m LIMIT 25',
      'MATCH (m:Movie)-[r:BELONGS_TO]->(g:Genre) RETURN m, r, g LIMIT 20',
      'MATCH (m:Movie)-[r:PRODUCED_BY]->(s:Studio) RETURN m, r, s LIMIT 20',
      'MATCH (p:Person)-[r]->(x) RETURN p, r, x LIMIT 30',
      'MATCH (p:Person)-[r:DIRECTED]->(m:Movie) RETURN p, r, m LIMIT 20',
      // ── Table View queries (return scalars) ──
      'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) RETURN p.name AS actor, m.title AS movie ORDER BY m.released DESC LIMIT 10',
      'MATCH (m:Movie) RETURN m.title, m.rating, m.released ORDER BY m.rating DESC LIMIT 10',
      'MATCH (m:Movie)-[:BELONGS_TO]->(g:Genre) RETURN g.name AS genre, COUNT(m) AS movies ORDER BY movies DESC'
    ]
  }
};

// ─── Result Table (Postgres) ──────────────────────────────────────
const ResultTable = ({ fields, rows }) => {
  if (!rows || rows.length === 0) return <p className="text-gray-400 text-sm">Query returned 0 rows.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-borderLine">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#0d121c] border-b border-borderLine">
          <tr>
            {fields.map(f => (
              <th key={f.name} className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{f.name}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-borderLine/50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-surface/50 transition-colors">
              {fields.map(f => (
                <td key={f.name} className="px-4 py-2 text-gray-300 font-mono text-xs whitespace-nowrap max-w-xs truncate">
                  {row[f.name] === null ? <span className="text-gray-600 italic">NULL</span> : String(row[f.name])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-[#0d121c] border-t border-borderLine text-xs text-gray-500">
        Showing {rows.length} row{rows.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

// ─── JSON Tree (MongoDB) ──────────────────────────────────────────
const JsonNode = ({ data, depth = 0 }) => {
  const [open, setOpen] = useState(depth < 2);
  if (data === null) return <span className="text-gray-500 italic">null</span>;
  if (typeof data !== 'object') {
    const color = typeof data === 'string' ? 'text-emerald-400' : typeof data === 'number' ? 'text-blue-400' : 'text-yellow-400';
    return <span className={color}>{JSON.stringify(data)}</span>;
  }
  const isArr = Array.isArray(data);
  const keys = Object.keys(data);
  if (keys.length === 0) return <span className="text-gray-400">{isArr ? '[]' : '{}'}</span>;
  return (
    <span>
      <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-white">
        {open ? <ChevronDown className="inline w-3 h-3" /> : <ChevronRight className="inline w-3 h-3" />}
        <span className="text-gray-500">{isArr ? `Array[${keys.length}]` : `Object{${keys.length}}`}</span>
      </button>
      {open && (
        <div className="ml-4 border-l border-borderLine/30 pl-3 mt-1 space-y-0.5">
          {keys.map(k => (
            <div key={k} className="text-xs">
              <span className="text-purple-300">{isArr ? `[${k}]` : `"${k}"`}</span>
              <span className="text-gray-500">: </span>
              <JsonNode data={data[k]} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </span>
  );
};

const MongoResults = ({ result }) => {
  const items = Array.isArray(result) ? result : [result];
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">{items.length} document{items.length !== 1 ? 's' : ''} returned</p>
      {items.map((doc, i) => (
        <div key={i} className="bg-[#0d121c] border border-borderLine rounded-lg p-3 font-mono text-xs">
          <JsonNode data={doc} />
        </div>
      ))}
    </div>
  );
};

// ─── Neo4j Graph Visualizer ───────────────────────────────────────
const LABEL_COLOR = { Movie:'#8B5CF6', Person:'#3B82F6', Genre:'#10B981', Studio:'#F59E0B', Award:'#EF4444' };

const buildGraphData = (records) => {
  const nodeMap = new Map();
  const edges = [];
  let autoId = 1;

  records.slice(0, 100).forEach(rec => {
    Object.values(rec).forEach(val => {
      if (!val || typeof val !== 'object') return;

      // Check both: explicit flag (set by backend) OR structural detection
      const isNode = val._isNode || (val.labels !== undefined && val.properties !== undefined);
      const isRel  = val._isRelationship || (val.type !== undefined && val.start !== undefined && val.end !== undefined);

      if (isNode) {
        const id = val.identity !== undefined ? val.identity : autoId++;
        if (!nodeMap.has(id)) {
          const label = (val.labels || [])[0] || 'Node';
          const props = val.properties || {};
          const display = props.name || props.title || props.username || label;
          nodeMap.set(id, {
            id,
            label: display.length > 22 ? display.substring(0, 20) + '…' : String(display),
            title: `[${label}]\n${Object.entries(props).slice(0, 6).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
            color: { background: LABEL_COLOR[label] || '#6B7280', border: '#111827', highlight: { background: LABEL_COLOR[label] || '#9CA3AF', border: '#fff' } },
            font: { color: '#fff', size: 12 },
            shape: 'dot', size: 18, borderWidth: 2,
          });
        }
      }

      if (isRel) {
        edges.push({
          from: val.start,
          to: val.end,
          label: val.type,
          font: { color: '#9CA3AF', size: 10, align: 'middle', strokeWidth: 0 },
          color: { color: '#374151', highlight: '#8B5CF6', hover: '#8B5CF6' },
          arrows: { to: { enabled: true, scaleFactor: 0.7 } },
          smooth: { type: 'continuous', roundness: 0.1 },
          width: 1.5,
        });
      }
    });
  });
  return { nodeMap, edges };
};


const Neo4jResults = ({ records }) => {
  const [viewMode, setViewMode] = useState('graph');
  const graphRef = useRef(null);
  const networkRef = useRef(null);
  const [hasGraphData, setHasGraphData] = useState(false);

  if (!records || records.length === 0) return <p className="text-gray-400 text-sm">Query returned 0 records.</p>;
  const keys = records[0] ? Object.keys(records[0]) : [];

  useEffect(() => {
    if (viewMode !== 'graph' || !graphRef.current) return;

    const { nodeMap, edges } = buildGraphData(records);
    setHasGraphData(nodeMap.size > 0);

    if (nodeMap.size === 0) return; // Stay on graph view — show hint instead

    const data = { nodes: Array.from(nodeMap.values()), edges };
    const options = {
      autoResize: true,
      height: '100%',
      width: '100%',
      physics: {
        enabled: true,
        stabilization: { enabled: true, iterations: 150, fit: true },
        barnesHut: { gravitationalConstant: -4000, springLength: 130, springConstant: 0.04 },
      },
      interaction: { hover: true, tooltipDelay: 150, hideEdgesOnDrag: true },
      edges: { font: { size: 10 } },
      nodes: { borderWidth: 2 },
    };
    if (networkRef.current) networkRef.current.destroy();
    networkRef.current = new Network(graphRef.current, data, options);
    networkRef.current.fit();
    return () => { if (networkRef.current) { networkRef.current.destroy(); networkRef.current = null; } };
  }, [records, viewMode]);

  // Auto-detect on mount
  useEffect(() => {
    const { nodeMap } = buildGraphData(records);
    setHasGraphData(nodeMap.size > 0);
  }, [records]);

  return (
    <div>
      {/* Toggle bar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={() => setViewMode('graph')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'graph' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'border border-borderLine text-gray-400 hover:text-white hover:border-purple-500/50'}`}>
          🕸 Graph View
        </button>
        <button onClick={() => setViewMode('table')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'border border-borderLine text-gray-400 hover:text-white hover:border-purple-500/50'}`}>
          📋 Table View
        </button>
        <span className="text-xs text-gray-500">{records.length} record{records.length !== 1 ? 's' : ''}</span>
        {!hasGraphData && viewMode === 'graph' && (
          <span className="text-xs text-amber-400 font-medium">⚠ Return full nodes for graph viz</span>
        )}
      </div>

      {viewMode === 'graph' ? (
        hasGraphData ? (
          <div ref={graphRef} className="w-full rounded-xl border border-purple-500/30 bg-[#0a0e1a]" style={{ height: '340px' }} />
        ) : (
          <div className="w-full rounded-xl border border-purple-500/20 bg-[#0a0e1a] flex flex-col items-center justify-center gap-4 p-8" style={{ height: '340px' }}>
            <div className="text-4xl">🕸</div>
            <div className="text-center">
              <p className="text-purple-300 font-bold mb-1">Graph view needs node objects</p>
              <p className="text-gray-500 text-xs mb-4">Your query returned scalar values. Return full nodes to visualize the graph:</p>
              <div className="bg-[#111827] border border-purple-500/30 rounded-lg px-4 py-3 font-mono text-xs text-purple-300 text-left">
                {'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)'}<br/>
                {'RETURN p, r, m LIMIT 20'}
              </div>
            </div>
            <button onClick={() => setViewMode('table')} className="text-xs text-gray-400 hover:text-white underline">
              Switch to Table View →
            </button>
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-lg border border-borderLine">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0d121c] border-b border-borderLine">
              <tr>{keys.map(k => <th key={k} className="px-4 py-2 text-xs font-bold text-purple-400 uppercase tracking-wider whitespace-nowrap">{k}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-borderLine/50">
              {records.map((rec, i) => (
                <tr key={i} className="hover:bg-surface/50">
                  {keys.map(k => (
                    <td key={k} className="px-4 py-2 text-gray-300 font-mono text-xs whitespace-nowrap max-w-xs truncate">
                      {rec[k] === null ? <span className="text-gray-600 italic">NULL</span>
                        : typeof rec[k] === 'object' ? <span className="text-gray-400 text-xs">{JSON.stringify(rec[k]).substring(0, 80)}</span>
                        : String(rec[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-[#0d121c] border-t border-borderLine text-xs text-gray-500">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main PracticeView ────────────────────────────────────────────

const PracticeView = () => {
  const { db } = useParams();
  const location = useLocation();
  const cfg = DB_CONFIG[db] || DB_CONFIG.postgres;

  const [query, setQuery] = useState(location.state?.query || cfg.defaultQuery);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [execTime, setExecTime] = useState(null);

  const handleEditorMount = (editor, monaco) => {
    if (db === 'neo4j') {
      monaco.languages.register({ id: 'cypher' });
      monaco.languages.setMonarchTokensProvider('cypher', {
        ignoreCase: true,
        keywords: ['MATCH', 'RETURN', 'WITH', 'UNWIND', 'WHERE', 'ORDER', 'BY', 'SKIP', 'LIMIT', 'ASC', 'DESC', 'AS', 'AND', 'OR', 'NOT', 'IN', 'OPTIONAL', 'CALL', 'YIELD', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COLLECT', 'DISTINCT', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'],
        tokenizer: {
          root: [
            [/\/\/.*$/, 'comment'],
            [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
            [/[{}()[\]]/, '@brackets'],
            [/[0-9]+(\.[0-9]+)?/, 'number'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            [/`([^`])*`/, 'variable'],
            [/:(\w+)/, 'type'],
          ]
        }
      });
      monaco.editor.defineTheme('cypherTheme', {
        base: 'vs-dark', inherit: true,
        rules: [
          { token: 'keyword', foreground: '8B5CF6', fontStyle: 'bold' },
          { token: 'string', foreground: '10B981' },
          { token: 'number', foreground: '3B82F6' },
          { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
          { token: 'type', foreground: 'F59E0B', fontStyle: 'bold' },
        ],
        colors: { 'editor.background': '#111827' }
      });
      monaco.editor.setTheme('cypherTheme');
    } else {
      monaco.editor.defineTheme('learndbTheme', {
        base: 'vs-dark', inherit: true, rules: [],
        colors: { 'editor.background': '#111827' }
      });
      monaco.editor.setTheme('learndbTheme');
    }
    // Ctrl+Enter to run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, executeQuery);
  };

  const executeQuery = useCallback(async () => {
    setLoading(true); setError(null); setResults(null);
    const t0 = Date.now();
    try {
      const token = localStorage.getItem('token');
      let payload;

      if (db === 'mongo') {
        // Parse MongoDB shell syntax: db.collection.method(args)
        const raw = query.trim().split('\n').filter(l => !l.trim().startsWith('//')).join('\n').trim();
        const match = raw.match(/^db\.(\w+)\.(\w+)\(([\s\S]*)\)\s*;?\s*$/);
        if (!match) {
          setError('Use MongoDB shell syntax:\ndb.collection.method({...})\n\nExample: db.users.find({ followers_count: { $gt: 100 } })');
          setLoading(false);
          return;
        }
        const [, collection, method, argsStr] = match;
        let args = [];
        if (argsStr.trim()) {
          try {
            // eslint-disable-next-line no-new-func
            args = Function('"use strict"; return [' + argsStr.trim() + ']')();
          } catch (e) {
            setError(`Invalid query arguments:\n${e.message}\n\nTip: Use double quotes for strings in JSON objects.`);
            setLoading(false);
            return;
          }
        }
        payload = { collection, method, args };
      } else {
        payload = { query };
      }

      const res = await axios.post(`http://localhost:5000/api/queries/${db}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
      setExecTime(Date.now() - t0);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [query, db]);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => { setQuery(cfg.defaultQuery); setResults(null); setError(null); };

  const renderResults = () => {
    if (!results) return null;

    // Sandbox note banner for write operations
    const note = results.sandboxNote;

    if (db === 'postgres') return (
      <div>
        {note && (
          <div className="mb-3 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
            🔒 {note}
          </div>
        )}
        <ResultTable fields={results.fields || []} rows={results.rows || []} />
      </div>
    );
    if (db === 'mongo') return (
      <div>
        {results.sandboxNote && (
          <div className="mb-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
            🔒 {results.sandboxNote}
          </div>
        )}
        <MongoResults result={results.result} />
      </div>
    );
    if (db === 'neo4j') return <Neo4jResults records={results.records || []} />;
    return <pre className="text-xs font-mono text-gray-300">{JSON.stringify(results, null, 2)}</pre>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="border-b border-borderLine bg-surface/50 px-4 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5" style={{ color: cfg.color }} />
          <h1 className="text-lg font-display font-bold text-white">
            {cfg.label} <span className="text-gray-400 font-normal">Sandbox</span>
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full border border-borderLine text-gray-400">
            {db === 'postgres' ? 'ECommerceDB' : db === 'mongo' ? 'SocialMediaDB' : 'MovieNetworkDB'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/learn/${db}`} className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white border border-borderLine transition-colors">
            ← Lessons
          </Link>
          <button onClick={handleReset} className="p-1.5 text-gray-400 hover:text-white border border-borderLine rounded transition-colors" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-white border border-borderLine rounded transition-colors" title="Copy query">
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={executeQuery}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: cfg.color }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Running…' : 'Run  ⌘↵'}
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="w-1/2 flex flex-col border-r border-borderLine">
          <div className="flex-1">
            <Editor
              height="100%"
              language={cfg.lang}
              value={query}
              onChange={v => setQuery(v || '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                padding: { top: 16 },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Hint chips */}
          <div className="border-t border-borderLine bg-[#0d121c] p-3">
            <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Try these queries:</p>
            <div className="flex flex-col gap-1.5">
              {cfg.hints.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(h); setResults(null); setError(null); }}
                  className="text-left text-xs text-gray-400 hover:text-white font-mono bg-surface/50 hover:bg-surface border border-borderLine/50 rounded px-3 py-1.5 transition-colors truncate"
                >
                  {h.split('\n')[0].replace(/^--\s*|^\/\/\s*/, '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="w-1/2 flex flex-col bg-[#0d121c]">
          <div className="px-4 py-2 border-b border-borderLine flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Results</span>
            {execTime && results && !error && (
              <span className="text-xs text-emerald-400 font-mono">✓ {execTime}ms</span>
            )}
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-bold text-sm mb-1">Error</h4>
                    <p className="text-red-300 text-sm font-mono whitespace-pre-wrap">{error}</p>
                  </div>
                </motion.div>
              )}

              {results && !error && (
                <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-4">
                    <CheckCircle2 className="w-4 h-4" /> Query executed successfully
                  </div>
                  {renderResults()}
                </motion.div>
              )}

              {!results && !error && !loading && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                  <Play className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Press <kbd className="px-2 py-0.5 bg-surface border border-borderLine rounded text-xs text-gray-400">⌘ + Enter</kbd> or click Run</p>
                </motion.div>
              )}

              {loading && (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-gray-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: cfg.color }} />
                  <span className="font-mono text-sm">Executing query…</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeView;
