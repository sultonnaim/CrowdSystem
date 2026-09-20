import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, MapPin, Search, Bell } from "lucide-react";
import logoImage from "../../assets/images/logo.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highCrowdParks, setHighCrowdParks] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ambil data taman dan filter yang kondisi "Tinggi"
  const fetchCrowdStatus = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/api/locations");
      if (response.ok) {
        const data = await response.json();
        const tamanList = data.data || [];

        // Filter taman dengan kondisi Tinggi DAN memiliki CCTV aktif
        const highCrowd = tamanList.filter(
          (taman) => taman.hasCCTV === true && taman.crowd_level === "Tinggi",
        );

        setHighCrowdParks(highCrowd);
      }
    } catch (error) {
      console.error("Gagal ambil data keramaian:", error);
    }
  }, []);

  useEffect(() => {
    fetchCrowdStatus();
    const interval = setInterval(fetchCrowdStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchCrowdStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/taman?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsMobileMenuOpen(false);
    }
  };

  // Tutup notifikasi saat klik di luar
  useEffect(() => {
    const handleClickOutside = () => setShowNotification(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const highCrowdCount = highCrowdParks.length;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md"
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Kiri */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src={logoImage} alt="Logo Surabaya" className="h-9 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-800">Surabaya</h1>
              <p className="text-xs text-gray-500 -mt-0.5">kota 1000 taman</p>
            </div>
          </Link>

          {/* Desktop Menu - Kanan */}
          <div className="hidden md:flex items-center space-x-5">
            <Link
              to="/"
              className="text-gray-600 hover:text-green-600 text-sm font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/taman"
              className="text-gray-600 hover:text-green-600 text-sm font-medium transition"
            >
              Taman
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-green-600 text-sm font-medium transition"
            >
              About
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Cari"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-32 pl-8 pr-3 py-1 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </form>

            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotification(!showNotification);
                }}
                className="relative p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {highCrowdCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
                    {highCrowdCount}
                  </span>
                )}
              </button>

              {/*  NOTIFIKASI  */}
              {showNotification && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-4 py-3 bg-red-50 border-b border-red-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-red-700">
                        Informasi Taman
                      </h3>
                      <span className="text-xs text-red-500">
                        {highCrowdCount} taman
                      </span>
                    </div>
                  </div>

                  {/* Daftar Taman */}
                  <div className="max-h-72 overflow-y-auto">
                    {highCrowdParks.length > 0 ? (
                      highCrowdParks.map((taman) => (
                        <Link
                          key={taman.id}
                          to={`/taman/${taman.id}`}
                          onClick={() => setShowNotification(false)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-red-50 transition border-b border-gray-50 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {taman.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {taman.lokasi || taman.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                              {taman.current_visitors || 0} org
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Tidak ada informasi
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={handleSearch} className="mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari taman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </form>

            {/* Notifikasi di mobile */}
            <div className="border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Taman Ramai</span>
                </div>
                {highCrowdCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {highCrowdCount} taman
                  </span>
                )}
              </div>
              {highCrowdParks.length > 0 && (
                <div className="mt-2 space-y-1">
                  {highCrowdParks.slice(0, 3).map((taman) => (
                    <Link
                      key={taman.id}
                      to={`/taman/${taman.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-1.5 text-sm"
                    >
                      <span className="text-gray-600 truncate">
                        {taman.name}
                      </span>
                      <span className="text-red-500 text-xs flex-shrink-0">
                        ● Tinggi
                      </span>
                    </Link>
                  ))}
                  {highCrowdParks.length > 3 && (
                    <p className="text-xs text-gray-400 mt-1">
                      +{highCrowdParks.length - 3} taman lainnya
                    </p>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/"
              className="block text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/taman"
              className="block text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Taman
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-green-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
