import React from 'react';
import HeroSection from '../components/dashboard/HeroSection';
import MapTaman from '../components/dashboard/MapTaman';
import InfoSection from '../components/dashboard/InfoSection';

const Dashboard = () => {
  return (
    <div>
      <HeroSection />
      
      <MapTaman />
      
      <InfoSection />
    </div>
  );
};

export default Dashboard;