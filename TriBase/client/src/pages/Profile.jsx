import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { Trophy, Medal, Award, Flame, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', xp: 20 },
  { name: 'Tue', xp: 45 },
  { name: 'Wed', xp: 30 },
  { name: 'Thu', xp: 80 },
  { name: 'Fri', xp: 120 },
  { name: 'Sat', xp: 90 },
  { name: 'Sun', xp: 150 },
];

const Profile = () => {
  const { user } = useAuth();
  const { progress } = useProgress();

  const pgProgress = progress.filter(p => p.db_type === 'postgres').length;
  const mongoProgress = progress.filter(p => p.db_type === 'mongo').length;
  const neo4jProgress = progress.filter(p => p.db_type === 'neo4j').length;

  return (
    <div className="min-h-screen bg-background text-gray-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Profile Card */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 text-yellow-400" />
          </div>
          
          <div className="w-32 h-32 rounded-full bg-postgres flex items-center justify-center text-5xl font-display font-bold text-white shadow-lg shadow-postgres/20 z-10">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl font-display font-bold text-white mb-2">{user?.name}</h1>
            <p className="text-gray-400 mb-6">
              {user?.email} • Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-surface/80 border border-borderLine rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><Trophy className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total XP</p>
                  <p className="text-xl font-mono text-white font-bold">{user?.xp || 0}</p>
                </div>
              </div>
              <div className="bg-surface/80 border border-borderLine rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Medal className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Level</p>
                  <p className="text-xl font-mono text-white font-bold">{user?.level || 1}</p>
                </div>
              </div>
              <div className="bg-surface/80 border border-borderLine rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Flame className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Streak</p>
                  <p className="text-xl font-mono text-white font-bold">{user?.streak || 0} {(user?.streak || 0) === 1 ? 'Day' : 'Days'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DB Progress Rings */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-bold text-white mb-6">Course Progress</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="font-bold text-postgres">PostgreSQL</span><span className="text-gray-400">{Math.round((pgProgress/50)*100)}%</span></div>
                <div className="w-full bg-surface rounded-full h-2"><div className="bg-postgres h-2 rounded-full" style={{width: `${(pgProgress/50)*100}%`}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="font-bold text-mongo">MongoDB</span><span className="text-gray-400">{Math.round((mongoProgress/50)*100)}%</span></div>
                <div className="w-full bg-surface rounded-full h-2"><div className="bg-mongo h-2 rounded-full" style={{width: `${(mongoProgress/50)*100}%`}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="font-bold text-neo4j">Neo4j</span><span className="text-gray-400">{Math.round((neo4jProgress/50)*100)}%</span></div>
                <div className="w-full bg-surface rounded-full h-2"><div className="bg-neo4j h-2 rounded-full" style={{width: `${(neo4jProgress/50)*100}%`}}></div></div>
              </div>
            </div>
          </div>

          {/* XP Chart */}
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-lg font-display font-bold text-white mb-6">Activity History (XP)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1E2D40', borderRadius: '8px' }}
                    itemStyle={{ color: '#3B82F6' }}
                  />
                  <Line type="monotone" dataKey="xp" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-bold text-white mb-6">Earned Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-surface border border-borderLine rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-yellow-500/50 transition-colors">
              <Award className="w-10 h-10 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white">First Query</span>
            </div>
            <div className="bg-surface border border-borderLine rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-40 grayscale">
              <Star className="w-10 h-10 text-blue-400 mb-2" />
              <span className="text-xs font-bold text-white">PG Novice</span>
            </div>
            <div className="bg-surface border border-borderLine rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-40 grayscale">
              <Star className="w-10 h-10 text-emerald-400 mb-2" />
              <span className="text-xs font-bold text-white">Mongo Novice</span>
            </div>
            {/* More badges can be added here */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
