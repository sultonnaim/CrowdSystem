import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Search, Trees, Leaf, MapPinned, Clock } from "lucide-react";
import backgroundImage from "../assets/images/bgtaman.jpg";

const stats = [
  { icon: Trees, value: "40", label: "Taman Aktif" },
  { icon: Leaf, value: "814K m²", label: "Total Lahan Hijau" },
  { icon: MapPinned, value: "5", label: "Wilayah Kota" },
  { icon: Clock, value: "24/7", label: "Akses Terbuka" },
];

const wilayahBadges = ["Pusat", "Utara", "Selatan", "Timur", "Barat"];

const TamanPage = () => {
  const [tamanList, setTamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [activeWilayah, setActiveWilayah] = useState(null);
  const [cctvStatusMap, setCctvStatusMap] = useState({});

  const searchTerm = searchParams.get("search") || "";

  // Fetch data taman dari gateway (location service)
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/locations");
      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data))
        setTamanList(data.data);
      else if (Array.isArray(data)) setTamanList(data);
      else setTamanList([]);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch status CCTV dari crowd service
  const fetchCctvStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/crowd/cameras");
      if (response.ok) {
        const data = await response.json();
        const statusMap = {};
        data.cameras?.forEach(cam => {
          // Simpan hanya status aktif/tidak (boolean)
          statusMap[cam.location_id] = cam.is_active === true;
        });
        setCctvStatusMap(statusMap);
      }
    } catch (err) {
      console.log("Crowd service tidak tersedia, semua CCTV dianggap offline");
      // Jika crowd service mati, semua CCTV dianggap tidak aktif
      const offlineMap = {};
      tamanList.forEach(taman => {
        if (taman.hasCCTV) {
          offlineMap[taman.id] = false;
        }
      });
      setCctvStatusMap(offlineMap);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ambil status CCTV setelah data taman tersedia
  useEffect(() => {
    if (tamanList.length > 0) {
      fetchCctvStatus();
      const interval = setInterval(fetchCctvStatus, 30000); // 30 detik
      return () => clearInterval(interval);
    }
  }, [tamanList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value) setSearchParams({ search: value });
    else setSearchParams({});
  };

  const filteredTaman = tamanList.filter((taman) => {
    const matchSearch = searchTerm
      ? taman.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchWilayah = activeWilayah
      ? (taman.wilayah || "")
          .toLowerCase()
          .includes(activeWilayah.toLowerCase())
      : true;
    return matchSearch && matchWilayah;
  });

  const getCrowdLevelClass = (level) => {
    if (level === "Tinggi") return "bg-red-500";
    if (level === "Sedang") return "bg-yellow-500";
    return "bg-green-500";
  };

  const getFirstImage = (taman) => {
    if (taman.images && taman.images.length > 0) return taman.images[0];
    return "/images/taman/default.jpg";
  };

  // Fungsi untuk menentukan apakah badge harus ditampilkan
  const shouldShowBadge = (taman) => {
    // Harus punya CCTV
    if (taman.hasCCTV !== true) return false;
    // Harus ada crowd_level
    if (!taman.crowd_level) return false;
    // Harus CCTV aktif (dari crowd service)
    if (cctvStatusMap[taman.id] !== true) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-24">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500 text-sm">Memuat data taman...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-24">
        <div className="text-center">
          <p className="text-red-500 text-sm">Gagal memuat data</p>
          <button
            onClick={fetchData}
            className="mt-3 text-green-600 text-sm hover:underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: "brightness(0.35)",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#052e16]/60 via-transparent to-[#052e16]/90" />

        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-emerald-500/10 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full border border-emerald-500/10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 pb-0 flex items-center text-xs text-white/50 gap-1.5">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-white/80">Taman</span>
          </div>

          <div className="pt-10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Taman Kota
                <br />
                <span className="text-emerald-400">Surabaya</span>
              </h1>
              <p className="text-white/50 text-sm mt-3 max-w-md leading-relaxed">
                Direktori lengkap taman aktif Surabaya — temukan lokasi,
                fasilitas, dan informasi setiap ruang hijau kota dari satu
                tempat.
              </p>
            </div>

            <div className="shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama taman..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-64 md:w-80 pl-10 pr-4 py-2.5 text-sm border border-white/10 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/15 transition"
                />
              </div>
              {searchTerm && (
                <p className="text-xs text-white/40 mt-2 text-right">
                  Hasil untuk:{" "}
                  <span className="text-white/70">"{searchTerm}"</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-6 border-b border-white/10">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-white leading-none">
                    {value}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveWilayah(null)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  !activeWilayah
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
                }`}
              >
                Semua
              </button>
              {wilayahBadges.map((w) => (
                <button
                  key={w}
                  onClick={() =>
                    setActiveWilayah(activeWilayah === w ? null : w)
                  }
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    activeWilayah === w
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/40 shrink-0">
              Menampilkan{" "}
              <span className="text-white font-semibold">
                {filteredTaman.length}
              </span>{" "}
              dari{" "}
              <span className="text-white font-semibold">
                {tamanList.length}
              </span>{" "}
              taman
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD GRID ── */}
      <div className="w-full px-3 md:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {filteredTaman.map((taman) => (
            <Link key={taman.id} to={`/taman/${taman.id}`} className="group">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={getFirstImage(taman)}
                    alt={taman.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "/images/taman/default.jpg";
                    }}
                  />
                  
                  {/* BADGE - HANYA TAMPIL JIKA CCTV AKTIF */}
                  {shouldShowBadge(taman) && (
                    <div
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-white text-xs font-medium ${getCrowdLevelClass(taman.crowd_level)}`}
                    >
                      {taman.crowd_level}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-green-600 transition line-clamp-1">
                    {taman.name}
                  </h3>
                  <div className="flex items-center text-gray-400 text-xs mb-2">
                    <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {taman.lokasi || taman.location}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2">
                    {taman.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredTaman.length === 0 && (
          <div className="text-center py-16">
            <Trees className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? `Tidak ada taman dengan nama "${searchTerm}"`
                : `Tidak ada taman di wilayah ${activeWilayah}`}
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setActiveWilayah(null);
              }}
              className="mt-3 text-green-600 text-sm hover:underline"
            >
              Lihat semua taman
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TamanPage;