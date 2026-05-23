import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Database, Leaf, Network, Activity, Trophy, LogOut } from 'lucide-react';

const DBCard = ({ title, tagline, icon: Icon, color, bgClass, progress = 0, path }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 border-t-4 transition-all duration-300 hover:shadow-2xl flex flex-col h-full"
    style={{ borderTopColor: color }}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bgClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-display font-bold text-white mb-1">{title}</h3>
    <p className="text-gray-400 text-sm mb-6 flex-grow">{tagline}</p>
    
    <div className="mb-6">
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-400">Progress</span>
        <span className="text-white font-mono">{progress} / 50</span>
      </div>
      <div className="w-full bg-surface/50 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${(progress / 50) * 100}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
    
    <Link 
      to={path}
      className="w-full text-center py-2.5 rounded-lg font-medium text-white transition-all duration-300 block"
      style={{ backgroundColor: `${color}20`, color: color }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = color}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = `${color}20`}
    >
      {progress > 0 ? 'Continue Learning' : 'Start Learning'}
    </Link>
  </motion.div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { progress } = useProgress();

  // Calculate progress per DB
  const pgProgress = progress.filter(p => p.db_type === 'postgres').length;
  const mongoProgress = progress.filter(p => p.db_type === 'mongo').length;
  const neo4jProgress = progress.filter(p => p.db_type === 'neo4j').length;

  return (
    <div className="min-h-screen bg-background relative">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Welcome back, <span className="text-postgres">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-gray-400 text-lg">Master databases. Forge your skills — continue your journey.</p>
        </motion.div>

        {/* Database Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <DBCard 
              title="PostgreSQL" 
              tagline="Master relational data and complex joins."
              icon={Database}
              color="#3B82F6"
              bgClass="bg-blue-500/20"
              progress={pgProgress}
              path="/learn/postgres"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <DBCard 
              title="MongoDB" 
              tagline="Embrace flexibility with document stores."
              icon={Leaf}
              color="#10B981"
              bgClass="bg-emerald-500/20"
              progress={mongoProgress}
              path="/learn/mongo"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DBCard 
              title="Neo4j" 
              tagline="Navigate complex relationships with graphs."
              icon={Network}
              color="#8B5CF6"
              bgClass="bg-purple-500/20"
              progress={neo4jProgress}
              path="/learn/neo4j"
            />
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-postgres" /> Recent Activity
            </h3>
            {progress.length === 0 ? (
              <p className="text-gray-400 text-sm">No activity yet. Start your first lesson!</p>
            ) : (
              <div className="space-y-4">
                {progress.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-borderLine pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-white text-sm font-medium">Completed Lesson: {p.lesson_id}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{p.db_type}</p>
                    </div>
                    <span className="text-postgres font-mono text-sm">+{p.xp_earned} XP</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 flex flex-col items-center justify-center text-center"
          >
            <Trophy className="w-16 h-16 text-yellow-400 mb-4 opacity-80" />
            <h3 className="text-2xl font-display font-bold text-white mb-2">Level {user?.level || 1}</h3>
            <p className="text-gray-400 text-sm mb-6">You're making great progress! Keep pushing your limits.</p>
            <Link to="/leaderboard" className="text-postgres hover:text-white transition-colors text-sm font-medium">
              View Leaderboard →
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
