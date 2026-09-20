import React, { useEffect, useRef, useState } from 'react';
import {
  Trees, MapPin, Leaf, Clock, ArrowRight,
  Globe, Shield, BookOpen, Heart, Users, Sprout
} from 'lucide-react';

/* ── simple intersection-observer hook ── */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.2, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

/* ── animated counter ── */
const Counter = ({ to, suffix = '' }) => {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    const n = parseInt(to);
    if (isNaN(n)) { setVal(to); return; }
    let cur = 0;
    const step = Math.ceil(n / 50);
    const t = setInterval(() => {
      cur += step;
      if (cur >= n) { setVal(n); clearInterval(t); }
      else setVal(cur);
    }, 20);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{typeof val === 'number' ? val.toLocaleString() : val}{suffix}</span>;
};

const stats = [
  { icon: Trees,  value: '40',   suffix: '',  label: 'Taman Aktif',      sub: 'Data resmi UPTD' },
  { icon: Leaf,   value: '814',  suffix: 'K', label: 'M² Lahan Hijau',   sub: 'Total keseluruhan' },
  { icon: MapPin, value: '5',    suffix: '',  label: 'Wilayah Kota',      sub: 'Merata di seluruh kota' },
  { icon: Clock,  value: '24',   suffix: '/7',label: 'Akses Terbuka',     sub: 'Gratis untuk semua' },
];

const values = [
  {
    icon: Globe,
    title: 'Akses Terbuka',
    desc: 'Informasi taman Surabaya yang transparan dan mudah diakses oleh siapa saja, kapan saja, tanpa hambatan.',
    color: '#0284c7',
    bg: '#eff6ff',
  },
  {
    icon: Shield,
    title: 'Data Terpercaya',
    desc: 'Seluruh data bersumber langsung dari UPTD Taman Kota Surabaya — valid, terverifikasi, dan selalu diperbarui.',
    color: '#1D9E75',
    bg: '#f0fdf4',
  },
  {
    icon: Heart,
    title: 'Untuk Warga',
    desc: 'Dibangun dengan semangat melayani warga Surabaya agar lebih mudah menemukan dan menikmati ruang hijau kota.',
    color: '#e11d48',
    bg: '#fff1f2',
  },
  {
    icon: Sprout,
    title: 'Ruang Hijau Lestari',
    desc: 'Mendukung kesadaran warga akan pentingnya ruang terbuka hijau sebagai paru-paru dan jiwa kota Surabaya.',
    color: '#d97706',
    bg: '#fffbeb',
  },
];

const timeline = [
  { year: '2020', title: 'Inisiatif Awal', desc: 'Gagasan portal informasi taman kota lahir dari kebutuhan warga yang kesulitan menemukan informasi taman secara terpusat.' },
  { year: '2022', title: 'Pengumpulan Data', desc: 'Kolaborasi dengan UPTD Taman Kota Surabaya dimulai. Data resmi 39 taman aktif dikumpulkan, divalidasi, dan didigitalisasi.' },
  { year: '2023', title: 'Pengembangan Platform', desc: 'Platform web mulai dibangun dengan fitur peta interaktif, direktori taman, dan integrasi data keramaian real-time via CCTV.' },
  { year: '2024', title: 'Peluncuran Publik', desc: 'Website resmi diluncurkan dan dapat diakses publik. Warga Surabaya kini punya satu portal untuk semua ruang hijau kota.' },
];

const team = [
  { name: 'Divisi Data', desc: 'Bertanggung jawab atas akurasi dan pembaruan data taman dari sumber resmi UPTD Taman Kota.' },
  { name: 'Divisi Teknologi', desc: 'Membangun dan memelihara platform web, sistem peta interaktif, dan integrasi data real-time.' },
  { name: 'Divisi Konten', desc: 'Menyusun informasi yang informatif, mudah dipahami, dan relevan bagi seluruh lapisan warga Surabaya.' },
];

/* ────────────────────────────── COMPONENT ────────────────────────────── */
const AboutSection = () => {
  const [heroRef, heroIn] = useInView();
  const [missionRef, missionIn] = useInView();
  const [statsRef, statsIn] = useInView();
  const [valuesRef, valuesIn] = useInView();
  const [timelineRef, timelineIn] = useInView();

  return (
    <div className="bg-white overflow-hidden">

      {/* ══════════════════════════════════════
          HERO BAND
      ══════════════════════════════════════ */}
      <div className="relative bg-[#052e16] overflow-hidden">
        {/* rings */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-emerald-800/30 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-emerald-800/20 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-900/30 blur-3xl pointer-events-none" />
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #6ee7b7 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div
          ref={heroRef}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32"
        >
          <div className="max-w-3xl">
            <span
              className={`inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full mb-6 tracking-wide transition-all duration-700 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tentang Platform Ini
            </span>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 transition-all duration-700 delay-100 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              Satu Portal untuk<br />
              <span className="text-emerald-400">Semua Taman</span><br />
              Surabaya
            </h1>

            <p
              className={`text-emerald-100/60 text-base md:text-lg leading-relaxed max-w-xl transition-all duration-700 delay-200 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              Kami hadir sebagai jembatan antara warga dan ruang hijau kota — menyajikan
              informasi taman Surabaya yang lengkap, akurat, dan mudah dijangkau dari
              satu tempat.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MISSION SPLIT
      ══════════════════════════════════════ */}
      <div
        ref={missionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* left — text */}
          <div className={`transition-all duration-700 ${missionIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <p className="text-xs font-semibold text-emerald-600 tracking-widest uppercase mb-3">Misi Kami</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              Mendekatkan Warga<br />dengan Ruang Hijau Kota
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5 text-[15px]">
              Surabaya memiliki puluhan taman aktif yang tersebar dari ujung utara hingga selatan,
              dari barat hingga timur kota. Namun, banyak warga yang belum mengetahui keberadaan,
              lokasi, maupun fasilitas yang tersedia di taman-taman tersebut.
            </p>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              Platform ini lahir dari kesadaran sederhana: informasi yang mudah diakses adalah
              kunci agar ruang hijau kota benar-benar dimanfaatkan dan dinikmati oleh seluruh
              lapisan masyarakat Surabaya — dari anak-anak hingga lansia, dari pelajar hingga
              pekerja yang butuh tempat untuk bernafas di tengah kesibukan kota.
            </p>
          </div>

          {/* right — visual card stack */}
          <div className={`transition-all duration-700 delay-150 ${missionIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative">
              {/* bg card */}
              <div className="absolute top-4 left-4 right-0 bottom-0 bg-emerald-100 rounded-3xl" />
              {/* main card */}
              <div className="relative bg-[#052e16] rounded-3xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-emerald-300">Tentang Konten</p>
                </div>
                {[
                  'Lokasi & alamat lengkap tiap taman',
                  'Fasilitas yang tersedia di setiap lokasi',
                  'Data luas lahan hijau resmi dari UPTD',
                  'Peta interaktif persebaran taman kota',
                  'Status keramaian real-time via CCTV',
                  'Rute & petunjuk arah ke taman tujuan',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <p className="text-sm text-emerald-100/70">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          STATS BAND
      ══════════════════════════════════════ */}
      <div ref={statsRef} className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, suffix, label, sub }, i) => (
              <div
                key={label}
                className={`text-center transition-all duration-500 ${statsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5 text-emerald-700" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 leading-none mb-1">
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="text-sm font-medium text-gray-700 mb-0.5">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          VALUES GRID
      ══════════════════════════════════════ */}
      <div
        ref={valuesRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28"
      >
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-emerald-600 tracking-widest uppercase mb-3">Nilai Kami</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Yang Kami Pegang Teguh</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <div
              key={title}
              className={`rounded-2xl p-6 border border-transparent hover:border-gray-100 hover:shadow-md transition-all duration-500 ${valuesIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ background: bg, transitionDelay: `${i * 80}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: color + '20' }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* ══════════════════════════════════════
          TEAM
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-emerald-600 tracking-widest uppercase mb-3">Tim Kami</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Di Balik Platform Ini</h2>
          <p className="text-gray-500 text-sm mt-3 max-w-lg mx-auto">
            Platform ini dibangun oleh tim kecil yang peduli terhadap ruang hijau dan kemudahan akses informasi publik di Surabaya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {team.map(({ name, desc }) => (
            <div key={name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AboutSection;