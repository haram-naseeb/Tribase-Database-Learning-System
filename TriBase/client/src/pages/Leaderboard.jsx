import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Database, Leaf, Network, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'global',   label: 'Global',     color: '#F59E0B', icon: Trophy },
  { id: 'postgres', label: 'PostgreSQL', color: '#3B82F6', icon: Database },
  { id: 'mongo',    label: 'MongoDB',    color: '#10B981', icon: Leaf },
  { id: 'neo4j',    label: 'Neo4j',      color: '#8B5CF6', icon: Network },
];

const RANK_ICONS = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('global');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        if (tab === 'global') {
          const res = await axios.get('http://localhost:5000/api/leaderboard/global', { headers });
          setLeaders(res.data);
        } else {
          // Per-DB leaderboard: rank by lessons completed in that db
          const res = await axios.get(`http://localhost:5000/api/leaderboard/db/${tab}`, { headers });
          setLeaders(res.data);
        }
      } catch (err) {
        console.error('Leaderboard error:', err.message);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [tab]);

  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">Compete. Learn. Rise to the top.</p>
        </div>

        <div className="bg-[#111827] border border-borderLine rounded-2xl overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-borderLine overflow-x-auto">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                    active ? 'border-b-2 bg-surface/30' : 'text-gray-400 hover:text-white'
                  }`}
                  style={active ? { borderColor: t.color, color: t.color } : {}}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* DB Module links (when on per-db tabs) */}
          {tab !== 'global' && (
            <div className="px-6 py-3 border-b border-borderLine flex items-center justify-between bg-surface/20">
              <span className="text-xs text-gray-500">Ranked by lessons completed in this module</span>
              <Link
                to={`/learn/${tab}`}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-white"
                style={{ backgroundColor: activeTab?.color + '33', color: activeTab?.color }}
              >
                Go to {activeTab?.label} Module →
              </Link>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0d121c] border-b border-borderLine">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-20 text-center">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Learner</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Level</th>
                  {tab === 'global' ? (
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total XP</th>
                  ) : (
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Lessons Done</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLine">
                {loading ? (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-500">Loading rankings…</td></tr>
                ) : leaders.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-500">
                    No data yet. <Link to={`/learn/${tab === 'global' ? 'postgres' : tab}`} className="text-blue-400 hover:underline">Start learning!</Link>
                  </td></tr>
                ) : (
                  leaders.map((person, idx) => {
                    const isCurrentUser = currentUser && person.id === currentUser.id;
                    return (
                      <motion.tr
                        key={person.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`transition-colors ${isCurrentUser ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'hover:bg-surface/30'}`}
                      >
                        <td className="px-6 py-4 text-center">
                          {idx < 3
                            ? <span className="text-2xl">{RANK_ICONS[idx]}</span>
                            : <span className="font-mono text-gray-400 font-bold text-sm">#{idx + 1}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ backgroundColor: idx === 0 ? '#F59E0B' : idx === 1 ? '#9CA3AF' : idx === 2 ? '#CD7F32' : activeTab?.color || '#3B82F6' }}>
                              {person.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white">{person.name}</span>
                              {isCurrentUser && <span className="ml-2 text-xs text-blue-400 font-bold">(You)</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface border border-borderLine text-gray-300">
                            Lvl {person.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-lg" style={{ color: activeTab?.color || '#3B82F6' }}>
                          {tab === 'global' ? `${person.xp} XP` : person.lessons_completed || 0}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-borderLine bg-surface/20 flex flex-wrap gap-4 justify-center">
            {['postgres', 'mongo', 'neo4j'].map(db => (
              <Link key={db} to={`/learn/${db}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-borderLine hover:bg-surface transition-colors capitalize text-gray-300 hover:text-white">
                {db === 'postgres' ? <Database className="w-4 h-4 text-blue-400" /> :
                 db === 'mongo' ? <Leaf className="w-4 h-4 text-emerald-400" /> :
                 <Network className="w-4 h-4 text-purple-400" />}
                {db === 'postgres' ? 'PostgreSQL' : db === 'mongo' ? 'MongoDB' : 'Neo4j'} Module
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
