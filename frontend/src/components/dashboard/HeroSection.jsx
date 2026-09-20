import React from 'react';
import backgroundImage from '../../assets/images/bgtaman.jpg';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to top, rgba(6, 78, 59, 0.9), rgba(74, 222, 128, 0.1)), url(${backgroundImage})` 
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Headline  */}
        <div className="text-center text-white">
          <h1 className="font-serif font-extrabold leading-none tracking-tight">
            <span className="block text-8xl md:text-9xl text-orange-400">
              Surabaya
            </span>
            <span className="block text-5xl md:text-6xl lg:text-7xl text-white mt-2 whitespace-nowrap">
              Kota Seribu Taman
            </span>
          </h1>


          {/* Right Column - Kosong */}
          <div className="flex-1"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-3xl font-bold text-white">814K m²</h3>
            <p className="text-green-200"> Taman</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-3xl font-bold text-white">5</h3>
            <p className="text-green-200">Wilayah Kota</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-3xl font-bold text-white">24/7</h3>
            <p className="text-green-200">Akses</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;