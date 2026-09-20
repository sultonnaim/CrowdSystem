import { useState, useEffect } from 'react';
import { fetchCrowdData, fetchParkStats } from '../services/api';

const useCrowdData = () => {
  const [parks, setParks] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch data dari API
        const [parksData, statsData] = await Promise.all([
          fetchCrowdData(),
          fetchParkStats()
        ]);
        setParks(parksData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching crowd data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Auto refresh setiap 30 detik
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { parks, stats, loading, error };
};

export default useCrowdData;
