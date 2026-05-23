import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { postgresLessons } from '../data/postgresLessons';
import { mongoLessons } from '../data/mongoLessons';
import { neo4jLessons } from '../data/neo4jLessons';
import {
  Database, Leaf, Network, Play, BookOpen, CheckCircle2,
  ChevronDown, ChevronRight, Table, Key, Hash, Info, X
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────
const DB_CONFIG = {
  postgres: {
    color: '#3B82F6', label: 'PostgreSQL', lessons: postgresLessons,
    icon: Database, dbName: 'ECommerceDB',
    description: 'Master relational databases, SQL, transactions, and complex joins.',
    facts: ['ACID compliant', 'Row-based storage', 'Strong consistency', 'Best for: Financial, ERP, CRM systems'],
    tables: ['ecom_users','products','orders','order_items','ecom_categories','reviews','payments'],
    relationships: [
      { from: 'ecom_users', to: 'orders', label: 'places', type: '1:N' },
      { from: 'orders', to: 'order_items', label: 'contains', type: '1:N' },
      { from: 'products', to: 'order_items', label: 'included in', type: '1:N' },
      { from: 'ecom_categories', to: 'products', label: 'categorizes', type: '1:N' },
      { from: 'ecom_users', to: 'reviews', label: 'writes', type: '1:N' },
      { from: 'products', to: 'reviews', label: 'receives', type: '1:N' },
      { from: 'orders', to: 'payments', label: 'paid by', type: '1:1' },
    ]
  },
  mongo: {
    color: '#10B981', label: 'MongoDB', lessons: mongoLessons,
    icon: Leaf, dbName: 'SocialMediaDB',
    description: 'Flexible document storage for rapidly evolving schemas and JSON data.',
    facts: ['Schema-flexible', 'Document-based', 'Horizontal scaling', 'Best for: Content, Catalogs, Social apps'],
    tables: ['users','posts','messages','notifications'],
    relationships: [
      { from: 'users', to: 'posts', label: 'creates', type: '1:N' },
      { from: 'posts', to: 'posts', label: 'has comments[]', type: 'embedded' },
      { from: 'users', to: 'messages', label: 'sends', type: '1:N' },
      { from: 'users', to: 'notifications', label: 'receives', type: '1:N' },
    ]
  },
  neo4j: {
    color: '#8B5CF6', label: 'Neo4j', lessons: neo4jLessons,
    icon: Network, dbName: 'MovieNetworkDB',
    description: 'Navigate complex relationships with graph traversal and Cypher queries.',
    facts: ['Graph model', 'Relationship-first', 'Flexible schema', 'Best for: Social, Recommendations, Fraud Detection'],
    tables: ['Movie','Person','Genre','Studio','Award'],
    relationships: [
      { from: 'Person', to: 'Movie', label: 'ACTED_IN', type: 'N:M' },
      { from: 'Person', to: 'Movie', label: 'DIRECTED', type: 'N:M' },
      { from: 'Movie', to: 'Genre', label: 'BELONGS_TO', type: 'N:M' },
      { from: 'Movie', to: 'Studio', label: 'PRODUCED_BY', type: 'N:1' },
      { from: 'Person', to: 'Award', label: 'WON', type: 'N:M' },
    ]
  }
};

// ─── Table/Collection Detail Modal ───────────────────────────────
const SchemaDetailModal = ({ db, tableName, color, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetch = async () => {
      try {
        const endpoint = db === 'mongo'
          ? `http://localhost:5000/api/schema/mongo/collection/${tableName}`
          : db === 'neo4j'
          ? `http://localhost:5000/api/schema/neo4j/node/${tableName}`
          : `http://localhost:5000/api/schema/postgres/table/${tableName}`;
        const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
      } catch (e) {
        setData({ error: e.response?.data?.error || e.message });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [tableName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111827] border border-borderLine rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-borderLine flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
              <Table className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">{tableName}</h3>
              <p className="text-xs text-gray-500">{db === 'neo4j' ? 'Node Label' : db === 'mongo' ? 'Collection' : 'Table'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && <div className="text-center text-gray-400 py-8">Loading schema data…</div>}
          {data?.error && <div className="text-red-400 text-sm">{data.error}</div>}

          {/* PostgreSQL: columns + sample rows */}
          {data && !data.error && db === 'postgres' && (
            <>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Columns <span className="text-gray-600 font-normal">— {data.rowCount?.toLocaleString()} rows</span>
                </p>
                <div className="space-y-1">
                  {data.columns?.map(col => (
                    <div key={col.column_name} className="flex items-center gap-3 px-3 py-2 bg-[#0d121c] rounded-lg text-sm">
                      {col.is_primary ? <Key className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" /> : <Hash className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />}
                      <span className="font-mono text-white w-40 truncate">{col.column_name}</span>
                      <span className="text-gray-400 text-xs">{col.data_type}</span>
                      {col.is_nullable === 'YES' && <span className="ml-auto text-xs text-gray-600">nullable</span>}
                    </div>
                  ))}
                </div>
              </div>
              {data.sample?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sample Data (first 5 rows)</p>
                  <div className="overflow-x-auto rounded-lg border border-borderLine">
                    <table className="text-xs w-full">
                      <thead className="bg-[#0d121c]">
                        <tr>{Object.keys(data.sample[0]).map(k => <th key={k} className="px-3 py-2 text-left text-gray-400 font-mono whitespace-nowrap">{k}</th>)}</tr>
                      </thead>
                      <tbody>
                        {data.sample.map((row, i) => (
                          <tr key={i} className="border-t border-borderLine/50">
                            {Object.values(row).map((v, j) => (
                              <td key={j} className="px-3 py-2 text-gray-300 font-mono whitespace-nowrap max-w-xs truncate">
                                {v === null ? <span className="text-gray-600 italic">null</span> : String(v).substring(0, 40)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MongoDB: schema fields + sample doc */}
          {data && !data.error && db === 'mongo' && (
            <>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Document Schema <span className="text-gray-600 font-normal">— {data.count?.toLocaleString()} documents</span>
                </p>
                <div className="space-y-1">
                  {data.schema?.map(field => (
                    <div key={field.field} className="flex items-center gap-3 px-3 py-2 bg-[#0d121c] rounded-lg text-sm">
                      <Hash className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                      <span className="font-mono text-white">{field.field}</span>
                      <span className="ml-auto text-xs" style={{ color: field.type === 'Array' ? '#F59E0B' : field.type === 'Object' ? '#8B5CF6' : field.type === 'string' ? '#10B981' : '#3B82F6' }}>{field.type}</span>
                    </div>
                  ))}
                </div>
              </div>
              {data.sample?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sample Document</p>
                  <pre className="bg-[#0d121c] rounded-lg p-4 text-xs font-mono text-gray-300 overflow-x-auto">
                    {JSON.stringify(data.sample[0], null, 2).substring(0, 800)}
                  </pre>
                </div>
              )}
            </>
          )}

          {/* Neo4j: properties + relationships */}
          {data && !data.error && db === 'neo4j' && (
            <>
              {data.sample?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sample Node Properties</p>
                  <pre className="bg-[#0d121c] rounded-lg p-4 text-xs font-mono text-gray-300 overflow-x-auto">
                    {JSON.stringify(data.sample[0], null, 2)}
                  </pre>
                </div>
              )}
              {data.relationships?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Outgoing Relationships</p>
                  <div className="space-y-1">
                    {data.relationships.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-[#0d121c] rounded-lg text-sm">
                        <span className="text-purple-400 font-mono">-[:{r.type}]-→</span>
                        <span className="text-gray-300">{r.target}</span>
                        <span className="ml-auto text-gray-600 text-xs">{r.count} rels</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main ModuleHome ──────────────────────────────────────────────
const ModuleHome = () => {
  const { db } = useParams();
  const cfg = DB_CONFIG[db];
  const { progress, isCompleted } = useProgress();
  const [selectedTable, setSelectedTable] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  if (!cfg) return <div className="p-10 text-white">Module not found.</div>;

  const Icon = cfg.icon;
  const lessons = cfg.lessons;
  const completedCount = lessons.filter(l => isCompleted(db, l.id)).length;
  const pct = Math.round((completedCount / lessons.length) * 100);

  // Group lessons
  const grouped = {};
  lessons.forEach(l => { if (!grouped[l.group]) grouped[l.group] = []; grouped[l.group].push(l); });

  return (
    <div className="min-h-screen bg-background text-gray-200">
      {/* Hero Header */}
      <div className="border-b border-borderLine bg-surface/20 pt-12 pb-10"
        style={{ background: `linear-gradient(135deg, ${cfg.color}08 0%, transparent 60%)` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: cfg.color + '22' }}>
                <Icon className="w-8 h-8" style={{ color: cfg.color }} />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-white">{cfg.label} Learning Path</h1>
                <p className="text-gray-400 mt-1">{cfg.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/learn/${db}/lesson/${lessons[0].id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: cfg.color }}>
                <BookOpen className="w-4 h-4" />
                {completedCount > 0 ? 'Continue Learning' : 'Start Learning'}
              </Link>
              <Link to={`/learn/${db}/practice`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white border border-borderLine hover:bg-surface transition-all">
                <Play className="w-4 h-4" /> Practice Sandbox
              </Link>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="font-bold" style={{ color: cfg.color }}>{completedCount}/{lessons.length} lessons • {pct}%</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: cfg.color }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Lesson Groups */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: cfg.color }} /> All Topics
          </h2>

          {Object.entries(grouped).map(([group, groupLessons], idx) => {
            const groupDone = groupLessons.filter(l => isCompleted(db, l.id)).length;
            return (
              <motion.div key={group} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className="rounded-xl border border-borderLine bg-surface/30 overflow-hidden hover:border-white/20 transition-colors">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-borderLine flex items-center justify-center font-mono text-sm"
                      style={{ color: groupDone === groupLessons.length ? cfg.color : '#6B7280' }}>
                      {groupDone === groupLessons.length ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{group}</h3>
                      <p className="text-sm text-gray-500">{groupLessons.length} lessons • {groupDone} completed</p>
                    </div>
                  </div>
                  <Link to={`/learn/${db}/lesson/${groupLessons.find(l => !isCompleted(db, l.id))?.id || groupLessons[0].id}`}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white border border-borderLine hover:bg-surface transition-colors flex items-center gap-1">
                    {groupDone === groupLessons.length ? 'Review' : groupDone > 0 ? 'Continue' : 'Start'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to={`/learn/${db}/quiz/${encodeURIComponent(group)}`}
                    className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1"
                    style={{ color: cfg.color, borderColor: cfg.color + '44', backgroundColor: cfg.color + '11' }}>
                    Quiz
                  </Link>
                </div>
                <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                  {groupLessons.map(l => (
                    <Link key={l.id} to={`/learn/${db}/lesson/${l.id}`}
                      title={l.title}
                      className="px-2.5 py-1 rounded-md text-xs font-mono transition-all border"
                      style={isCompleted(db, l.id)
                        ? { backgroundColor: cfg.color + '22', color: cfg.color, borderColor: cfg.color + '44' }
                        : { backgroundColor: 'transparent', color: '#6B7280', borderColor: '#1E2D40' }}>
                      {l.title.substring(0, 18)}{l.title.length > 18 ? '…' : ''}
                    </Link>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT: Schema Explorer */}
        <div className="space-y-6">
          {/* What is this DB? */}
          <div className="rounded-xl border border-borderLine bg-surface/30 overflow-hidden">
            <button onClick={() => setInfoOpen(!infoOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-surface/50 transition-colors">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" style={{ color: cfg.color }} />
                <span className="font-bold text-white">What is {cfg.label}?</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${infoOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {infoOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2">
                    {cfg.facts.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Schema Explorer */}
          <div className="rounded-xl border border-borderLine bg-surface/30 overflow-hidden">
            <div className="p-4 border-b border-borderLine flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Sample Database</p>
                <h3 className="font-bold text-white mt-0.5">{cfg.dbName}</h3>
              </div>
              <Database className="w-5 h-5 text-gray-500" />
            </div>
            <div className="p-3 space-y-1.5">
              <p className="text-xs text-gray-500 px-2 py-1">
                Click any {db === 'neo4j' ? 'node label' : db === 'mongo' ? 'collection' : 'table'} to explore its data →
              </p>
              {cfg.tables.map(name => (
                <button key={name} onClick={() => setSelectedTable(name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-surface transition-colors border border-transparent hover:border-borderLine group">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.color + '22' }}>
                    {db === 'neo4j' ? <Network className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      : db === 'mongo' ? <Leaf className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      : <Table className="w-3.5 h-3.5" style={{ color: cfg.color }} />}
                  </div>
                  <span className="font-mono text-gray-300 group-hover:text-white transition-colors">{name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Relationships */}
          <div className="rounded-xl border border-borderLine bg-surface/30 overflow-hidden">
            <div className="p-4 border-b border-borderLine">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Relationships</p>
            </div>
            <div className="p-3 space-y-1.5">
              {cfg.relationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-surface/30">
                  <span className="font-mono text-blue-300 truncate max-w-[6rem]">{rel.from}</span>
                  <span className="text-gray-600 whitespace-nowrap">—{rel.label}→</span>
                  <span className="font-mono text-emerald-300 truncate max-w-[5rem]">{rel.to}</span>
                  <span className="ml-auto text-gray-600 font-mono">{rel.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schema Detail Modal */}
      <AnimatePresence>
        {selectedTable && (
          <SchemaDetailModal db={db} tableName={selectedTable} color={cfg.color} onClose={() => setSelectedTable(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleHome;
