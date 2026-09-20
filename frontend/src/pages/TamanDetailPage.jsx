import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Navigation,
  ExternalLink,
  ArrowLeft,
  Star,
  Camera,
  CameraOff,
} from "lucide-react";
import ExportReportPDF from "../components/taman/ExportReportPDF";

const TamanDetailPage = () => {
  const { id } = useParams();
  const [taman, setTaman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cctvStatus, setCctvStatus] = useState(null);
  const peopleCountRef = useRef(null);

  // Simpan crowd_level terpisah supaya tidak trigger re-render gallery/layout
  const [crowdLevel, setCrowdLevel] = useState(null);
  const [currentVisitors, setCurrentVisitors] = useState(null);

  // Ref untuk cegah flicker
  const cctvStatusRef = useRef(null);
  const crowdLevelRef = useRef(null);

  // ── Fetch data taman ──
  const fetchTamanData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/locations/${id}`);
      if (!response.ok) throw new Error("Taman tidak ditemukan");
      const data = await response.json();

      // Update crowd_level dan current_visitors jika berbeda
      if (data.crowd_level !== crowdLevelRef.current) {
        crowdLevelRef.current = data.crowd_level;
        setCrowdLevel(data.crowd_level);
      }

      if (data.current_visitors !== peopleCountRef.current) {
        peopleCountRef.current = data.current_visitors;
        setCurrentVisitors(data.current_visitors);
      }

      // Update taman hanya jika field non-crowd berubah
      setTaman((prev) => {
        if (!prev) return data;
        const { crowd_level: _a, current_visitors: _c, ...prevRest } = prev;
        const { crowd_level: _b, current_visitors: _d, ...dataRest } = data;
        if (JSON.stringify(prevRest) !== JSON.stringify(dataRest)) {
          return data;
        }
        return prev;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Fetch status CCTV ──
  const fetchCctvStatus = useCallback(async (tamanId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/crowd/camera/status/${tamanId}`,
      );
      const newStatus = response.ok
        ? (await response.json()).is_active
          ? "active"
          : "inactive"
        : "inactive";

      if (newStatus !== cctvStatusRef.current) {
        cctvStatusRef.current = newStatus;
        setCctvStatus(newStatus);
      }
    } catch {
      if (cctvStatusRef.current !== "inactive") {
        cctvStatusRef.current = "inactive";
        setCctvStatus("inactive");
      }
    }
  }, []);

  // ── Effect pertama kali load ──
  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/locations/${id}`,
        );
        if (!response.ok) throw new Error("Taman tidak ditemukan");
        const data = await response.json();
        setTaman(data);
        crowdLevelRef.current = data.crowd_level;
        peopleCountRef.current = data.current_visitors;
        setCrowdLevel(data.crowd_level);
        setCurrentVisitors(data.current_visitors);
        setLoading(false);

        if (data.hasCCTV) {
          setCctvStatus("checking");
          await fetchCctvStatus(data.id);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();
  }, [id, fetchCctvStatus]);

  // ── Interval refresh crowd_level (10 detik) ──
  useEffect(() => {
    const crowdInterval = setInterval(fetchTamanData, 10000);
    return () => clearInterval(crowdInterval);
  }, [fetchTamanData]);

  // ── Interval refresh status CCTV (30 detik) ──
  useEffect(() => {
    if (!taman?.hasCCTV || !taman?.id) return;
    const cctvInterval = setInterval(() => fetchCctvStatus(taman.id), 30000);
    return () => clearInterval(cctvInterval);
  }, [taman?.hasCCTV, taman?.id, fetchCctvStatus]);

  const nextImage = () => {
    if (taman?.images?.length > 1)
      setCurrentImageIndex((p) => (p === taman.images.length - 1 ? 0 : p + 1));
  };
  const prevImage = () => {
    if (taman?.images?.length > 1)
      setCurrentImageIndex((p) => (p === 0 ? taman.images.length - 1 : p - 1));
  };

  const getCrowdStyle = (level) => {
    if (level === "Tinggi")
      return { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50" };
    if (level === "Sedang")
      return {
        dot: "bg-yellow-500",
        text: "text-yellow-700",
        bg: "bg-yellow-50",
      };
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
    };
  };

  const getGoogleMapsUrl = () => {
    const q = encodeURIComponent(
      `${taman.name}, ${taman.lokasi || taman.location}, Surabaya`,
    );
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  };
  const getGoogleReviewUrl = () => {
    const q = encodeURIComponent(
      `${taman.name} ${taman.lokasi || taman.location} Surabaya`,
    );
    return `https://www.google.com/maps?q=${q}`;
  };
  const getEmbedMapUrl = () => {
    const lat = taman.coordinates?.lat || -7.275;
    const lng = taman.coordinates?.lng || 112.745;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-400 text-sm">Memuat...</p>
        </div>
      </div>
    );

  if (error || !taman)
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-gray-500">Taman tidak ditemukan</p>
          <Link
            to="/taman"
            className="mt-3 inline-block text-emerald-600 text-sm hover:underline"
          >
            Kembali ke daftar
          </Link>
        </div>
      </div>
    );

  const galleryImages =
    taman.images?.length > 0 ? taman.images : ["/images/taman/default.jpg"];
  const hasMultipleImages = galleryImages.length > 1;
  const activeCrowdLevel = crowdLevel || taman.crowd_level || "Rendah";
  const activeVisitorCount = currentVisitors ?? taman.current_visitors ?? 0;
  const crowdStyle = getCrowdStyle(activeCrowdLevel);
  const showCrowdInfo = taman.hasCCTV && cctvStatus === "active";
  const showNoCctvWarning = taman.hasCCTV && cctvStatus === "inactive";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 pt-20 pb-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/taman"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>
            {taman.hasCCTV === true && (
              <ExportReportPDF tamanId={taman.id} tamanName={taman.name} />
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {taman.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{taman.lokasi || taman.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={galleryImages[currentImageIndex]}
                alt={taman.name}
                className="w-full h-full object-cover"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? "border-emerald-500 opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Tentang Taman
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {taman.description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Status keramaian DENGAN ANGKA */}
            {taman.hasCCTV && (
              <div>
                {cctvStatus === "checking" && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-3.5 h-3.5 border border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                    Memeriksa status kamera...
                  </div>
                )}

                {showCrowdInfo && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Tingkat Keramaian
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full ${crowdStyle.bg} ${crowdStyle.text}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full animate-pulse ${crowdStyle.dot}`}
                        />
                        {activeCrowdLevel} ({activeVisitorCount})
                      </span>
                      <span className="text-xs text-gray-400">Live CCTV</span>
                    </div>
                  </div>
                )}

                {showNoCctvWarning && (
                  <div className="bg-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <CameraOff className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          CCTV Tidak Aktif
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Informasi keramaian sedang tidak tersedia
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!taman.hasCCTV && (
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Belum Tersedia
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Taman ini belum dilengkapi dengan CCTV
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Jam Operasional */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-gray-800">
                  Jam Operasional
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Setiap Hari</span>
                <span className="text-sm font-medium text-gray-800">
                  {taman.jamBuka || "06:00"} – {taman.jamTutup || "22:00"}
                </span>
              </div>
            </div>

            {/* Fasilitas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Fasilitas
              </h3>
              {taman.facilities?.length > 0 ? (
                <div className="space-y-1.5">
                  {taman.facilities.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 text-sm mt-0.5">•</span>
                      <span className="text-sm text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Belum ada informasi fasilitas
                </p>
              )}
            </div>

            {/* Lokasi + Map */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-800">
                    Lokasi
                  </h3>
                </div>
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                >
                  Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {taman.lokasi || taman.location}
              </p>

              <div className="h-44 bg-gray-100 rounded-xl overflow-hidden">
                <iframe
                  src={getEmbedMapUrl()}
                  title="Map"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <button
                onClick={() => window.open(getGoogleMapsUrl(), "_blank")}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-medium py-2 hover:text-emerald-700 transition"
              >
                <MapPin className="w-3.5 h-3.5" /> Dapatkan Petunjuk Arah
              </button>

              {/* Rating & Ulasan */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Rating & Ulasan
                  </h3>
                  <div className="flex items-center gap-1">
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-xs text-gray-400">Google Maps</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Punya pengalaman berkunjung ke {taman.name}? Bantu pengunjung
                  lain dengan memberikan rating di Google Maps.
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-6 h-6 fill-gray-200 text-gray-200"
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    Klik tombol di bawah
                  </span>
                </div>
                <button
                  onClick={() => window.open(getGoogleReviewUrl(), "_blank")}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 text-xs font-semibold py-3 rounded-xl transition-all shadow-sm"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-4 h-4"
                  />
                  Kirim Ulasan di Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TamanDetailPage;
