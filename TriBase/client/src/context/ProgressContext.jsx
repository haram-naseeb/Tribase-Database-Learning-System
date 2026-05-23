import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState([]);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProgress();
    } else {
      setProgress([]);
    }
  }, [user]);

  const fetchProgress = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(res.data);
    } catch (error) {
      console.error('Failed to fetch progress', error);
    }
  };

  const markComplete = async (db_type, lesson_id, xp_awarded = 10) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post('http://localhost:5000/api/progress/complete', 
        { db_type, lesson_id, xp_awarded },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProgress(); // Refresh lesson list
      await refreshUser();  // Refresh XP + level in navbar
    } catch (error) {
      console.error('Failed to save progress', error);
    }
  };

  const isCompleted = (db_type, lesson_id) => {
    return progress.some(p => p.db_type === db_type && p.lesson_id === lesson_id);
  };

  return (
    <ProgressContext.Provider value={{ progress, markComplete, isCompleted, fetchProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};
