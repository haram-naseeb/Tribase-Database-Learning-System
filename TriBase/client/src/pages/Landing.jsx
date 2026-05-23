import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Leaf, Network, ArrowRight, Code, Trophy } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFFMkQ0MCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 z-0"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 border-b border-borderLine/50 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/tribase-logo.png" alt="Tribase" className="w-7 h-7 rounded-md object-cover" />
            <span className="text-xl font-display font-bold" style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tribase</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-white text-background rounded hover:bg-gray-200 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderLine text-sm text-gray-300 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-postgres animate-pulse"></span>
          Master SQL, NoSQL, and Graph Databases in one place
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight mb-6 max-w-4xl"
        >
          The interactive platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-postgres via-mongo to-neo4j">modern data engineers</span>.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 mb-10 max-w-2xl"
        >
          Learn PostgreSQL, MongoDB, and Neo4j through interactive lessons, real-time query execution, and gamified challenges.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link to="/register" className="px-8 py-4 rounded-lg bg-postgres text-white font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-lg">
            Start Learning for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#features" className="px-8 py-4 rounded-lg border border-borderLine text-white font-bold hover:bg-surface transition-colors flex items-center justify-center text-lg">
            Explore Features
          </a>
        </motion.div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-32 text-left">
          <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-t-4 border-postgres">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <Code className="w-6 h-6 text-postgres" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-3">Interactive Sandboxes</h3>
            <p className="text-gray-400 leading-relaxed">
              Execute real SQL, MQL, and Cypher queries directly in your browser. Complete with syntax highlighting and instant results visualization.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-t-4 border-mongo">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
              <Database className="w-6 h-6 text-mongo" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-3">Real-world Data</h3>
            <p className="text-gray-400 leading-relaxed">
              Practice on pre-seeded datasets mirroring real-world applications like e-commerce, social media, and movie networks.
            </p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-t-4 border-neo4j">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
              <Trophy className="w-6 h-6 text-neo4j" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-3">Gamified Progression</h3>
            <p className="text-gray-400 leading-relaxed">
              Earn XP, collect badges, maintain streaks, and climb the global leaderboard as you master complex database concepts.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
