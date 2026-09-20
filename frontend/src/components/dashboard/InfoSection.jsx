import React, { useEffect, useRef, useState } from 'react';
import { Trees, MapPin, Leaf, Clock, ArrowRight, Sun, Wind, Droplets } from 'lucide-react';

const stats = [
  { value: '40', label: 'Taman Aktif', sub: 'Data UPTD resmi', icon: Trees },
  { value: '814K', label: 'M² Lahan Hijau', sub: 'Total luas taman kota', icon: Leaf },
  { value: '5', label: 'Wilayah', sub: 'Tersebar merata', icon: MapPin },
  { value: '24 Jam', label: 'Akses Terbuka', sub: 'Bebas untuk semua', icon: Clock },
];

const categories = [
  {
    tag: 'Taman Ikonik',
    title: 'Bungkul & Suroboyo',
    desc: 'Destinasi favorit warga Surabaya. Taman Bungkul menjadi ruang publik paling ramai dengan jogging track, skatepark, dan zona kuliner. Taman Suroboyo di tepi laut menawarkan pemandangan selat yang memukau.',
    color: '#1D9E75',
    bg: '#f0fdf4',
    area: 'Surabaya Selatan & Utara',
    luas: '22.224 m²',
  },
  {
    tag: 'Taman Alam',
    title: 'Flora & Kebun Bibit',
    desc: 'Taman Flora di Mulyorejo dan Kebun Bibit Wonorejo adalah surga hijau di tengah kota. Ribuan spesies tanaman tumbuh di sini, menjadikannya ruang edukatif sekaligus refugi alam perkotaan.',
    color: '#0284c7',
    bg: '#f0f9ff',
    area: 'Surabaya Timur',
    luas: '133.810 m²',
  },
  {
    tag: 'Taman Tematik',
    title: 'Pelangi & Ekspresi',
    desc: 'Taman Pelangi hadir dengan lampu warna-warni yang memukau di malam hari. Taman Ekspresi menjadi panggung seni warga — tempat komunitas berkumpul, berkreasi, dan berkolaborasi.',
    color: '#d97706',
    bg: '#fffbeb',
    area: 'Surabaya Selatan & Pusat',
    luas: '11.561 m²',
  },
];

const features = [
  { icon: Sun, title: 'Ruang Terbuka Hijau', desc: 'Setiap taman menjadi paru-paru kota yang menyuplai oksigen dan menurunkan suhu udara di kawasan sekitarnya.' },
  { icon: Wind, title: 'Ramah Semua Usia', desc: 'Fasilitas yang dirancang inklusif — dari area bermain anak, jogging track, hingga zona relaksasi lansia.' },
  { icon: Droplets, title: 'Ekosistem Kota', desc: 'Taman-taman Surabaya mendukung keanekaragaman hayati dan menjaga siklus air kota tetap seimbang.' },
];

const CountUp = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const isNum = !isNaN(parseInt(target));
        if (!isNum) { setCount(target); return; }
        const end = parseInt(target);
        let start = 0;
        const duration = 1400;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(start);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{typeof count === 'number' ? count.toLocaleString() : count}{suffix}</span>;
};

const InfoSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-white overflow-hidden">

      {/* ── HERO BAND ── */}
      <div className="relative bg-[#052e16] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* decorative rings */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-emerald-800/40 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-emerald-800/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-emerald-900/40 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full mb-5 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Portal Informasi Taman Kota Surabaya
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Mengenal Ruang Hijau<br />
                <span className="text-emerald-400">Kota Surabaya</span>
              </h2>
              <p className="text-emerald-100/60 text-base leading-relaxed max-w-lg">
                Website ini hadir sebagai direktori lengkap taman-taman aktif Surabaya — 
                dari informasi lokasi, luas lahan, hingga persebaran wilayah, semua tersaji 
                dalam satu platform yang mudah diakses siapa saja.
              </p>
            </div>

            {/* stat pills */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {stats.map(({ value, label, sub, icon: Icon }) => (
                <div key={label} className="bg-emerald-900/50 border border-emerald-800/50 rounded-xl p-4 min-w-[130px]">
                  <Icon className="w-4 h-4 text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-white leading-none">
                    {/^\d/.test(value)
                      ? <CountUp target={value.replace(/\D/g, '')} suffix={value.replace(/[\d]/g, '')} />
                      : value}
                  </p>
                  <p className="text-xs text-emerald-300 mt-1 font-medium">{label}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
          {categories.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeTab === i
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
              style={activeTab === i ? { background: categories[i].color, borderColor: categories[i].color } : {}}
            >
              {c.tag}
            </button>
          ))}
        </div>

        {/* tab content */}
        <div
          key={activeTab}
          className="rounded-2xl overflow-hidden border border-gray-100"
          style={{ background: categories[activeTab].bg }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* text */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <span
                className="text-xs font-semibold tracking-widest uppercase mb-3 inline-block"
                style={{ color: categories[activeTab].color }}
              >
                {categories[activeTab].tag}
              </span>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {categories[activeTab].title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-[15px]">
                {categories[activeTab].desc}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" style={{ color: categories[activeTab].color }} />
                  {categories[activeTab].area}
                </span>
                <span className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" style={{ color: categories[activeTab].color }} />
                  {categories[activeTab].luas} lahan hijau
                </span>
              </div>
            </div>

            {/* visual accent */}
            <div
              className="hidden lg:flex items-center justify-center p-12 relative"
              style={{ background: categories[activeTab].color + '15' }}
            >
              <div
                className="w-48 h-48 rounded-full flex items-center justify-center"
                style={{ background: categories[activeTab].color + '20' }}
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ background: categories[activeTab].color + '30' }}
                >
                  <Trees className="w-14 h-14" style={{ color: categories[activeTab].color }} />
                </div>
              </div>
              {/* dots decoration */}
              <div className="absolute top-6 right-6 grid grid-cols-4 gap-1.5 opacity-20">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: categories[activeTab].color }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURE STRIP ── */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mt-0.5">
                  <Icon className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA BAND ── */}
      <div className="bg-[#052e16] px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs text-emerald-500 font-semibold tracking-widest uppercase mb-2">Mulai Eksplorasi</p>
            <h3 className="text-2xl font-bold text-white">Temukan taman favoritmu di Surabaya</h3>
            <p className="text-emerald-100/50 text-sm mt-1">40 taman aktif tersebar dari Utara hingga Selatan, Barat hingga Timur.</p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default InfoSection;