import React, { useRef, useState } from "react";
import { MapPin, Filter } from "lucide-react";

const taman = [
  {
    name: "Taman Apsari",
    kec: "Genteng",
    wilayah: "pusat",
    luas: "5.123 m²",
    x: 386.0,
    y: 190.2,
  },
  {
    name: "Taman Bambu Runcing",
    kec: "Genteng",
    wilayah: "pusat",
    luas: "9.149 m²",
    x: 391.8,
    y: 167.1,
  },
  {
    name: "Taman Keputran Stren Kali",
    kec: "Tegalsari",
    wilayah: "pusat",
    luas: "2.754 m²",
    x: 365.4,
    y: 209.7,
  },
  {
    name: "Taman Buah Undaan",
    kec: "Genteng",
    wilayah: "pusat",
    luas: "1.594 m²",
    x: 407.4,
    y: 183.9,
  },
  {
    name: "Taman BMX Ketabang",
    kec: "Genteng",
    wilayah: "pusat",
    luas: "4.500 m²",
    x: 401.6,
    y: 177.1,
  },
  {
    name: "Taman Ekspresi",
    kec: "Genteng",
    wilayah: "pusat",
    luas: "6.019 m²",
    x: 403.5,
    y: 180.0,
  },
  {
    name: "Taman Prestasi",
    kec: "Genteng",
    wilayah: "pusat",
    luas: "15.303 m²",
    x: 397.7,
    y: 181.5,
  },
  {
    name: "Taman Kartika",
    kec: "Tegalsari",
    wilayah: "pusat",
    luas: "2.376 m²",
    x: 363.7,
    y: 218.9,
  },
  {
    name: "Taman Kombes Pol M. Duryat",
    kec: "Genteng",
    wilayah: "pusat",
    luas: "8.100 m²",
    x: 383.1,
    y: 197.1,
  },
  {
    name: "Taman Sejarah/Jayenggrono",
    kec: "Krembangan",
    wilayah: "utara",
    luas: "5.315 m²",
    x: 355.9,
    y: 105.9,
  },
  {
    name: "Taman Suroboyo",
    kec: "Kenjeran",
    wilayah: "utara",
    luas: "11.900 m²",
    x: 522.7,
    y: 84.7,
  },
  {
    name: "Taman Kalongan",
    kec: "Kenjeran",
    wilayah: "utara",
    luas: "4.165 m²",
    x: 446.2,
    y: 93.2,
  },
  {
    name: "Taman Krembangan",
    kec: "Krembangan",
    wilayah: "utara",
    luas: "1.295 m²",
    x: 339.4,
    y: 111.9,
  },
  {
    name: "Taman Bulak",
    kec: "Kenjeran",
    wilayah: "utara",
    luas: "2.153 m²",
    x: 507.0,
    y: 97.4,
  },
  {
    name: "Taman Kali Kedinding",
    kec: "Kenjeran",
    wilayah: "utara",
    luas: "1.080 m²",
    x: 477.8,
    y: 90.1,
  },
  {
    name: "Taman Ngagel",
    kec: "Wonokromo",
    wilayah: "selatan",
    luas: "839 m²",
    x: 414.7,
    y: 265.1,
  },
  {
    name: "Taman Bungkul",
    kec: "Wonokromo",
    wilayah: "selatan",
    luas: "10.324 m²",
    x: 385.5,
    y: 279.7,
  },
  {
    name: "Taman Lesti",
    kec: "Wonokromo",
    wilayah: "selatan",
    luas: "2.314 m²",
    x: 397.7,
    y: 287.0,
  },
  {
    name: "Taman Lumumba",
    kec: "Wonokromo",
    wilayah: "selatan",
    luas: "1.578 m²",
    x: 417.1,
    y: 260.3,
  },
  {
    name: "Taman Persahabatan",
    kec: "Wonokromo",
    wilayah: "selatan",
    luas: "4.715 m²",
    x: 419.5,
    y: 253.0,
  },
  {
    name: "Taman Ronggolawe",
    kec: "Wonokromo",
    wilayah: "selatan",
    luas: "6.376 m²",
    x: 344.2,
    y: 304.0,
  },
  {
    name: "Taman Pelangi",
    kec: "Gayungan",
    wilayah: "selatan",
    luas: "5.542 m²",
    x: 405.0,
    y: 338.1,
  },
  {
    name: "Taman Jangkar",
    kec: "Jambangan",
    wilayah: "selatan",
    luas: "1.440 m²",
    x: 324.8,
    y: 384.3,
  },
  {
    name: "Taman Mayangkara",
    kec: "Wonokromo",
    wilayah: "selatan",
    luas: "5.292 m²",
    x: 400.1,
    y: 296.7,
  },
  {
    name: "Taman Balas Klumprik",
    kec: "Wiyung",
    wilayah: "selatan",
    luas: "1.796 m²",
    x: 281.1,
    y: 379.4,
  },
  {
    name: "Taman Mozaik",
    kec: "Wiyung",
    wilayah: "selatan",
    luas: "1.556 m²",
    x: 288.4,
    y: 357.5,
  },
  {
    name: "Taman Kebun Bibit Wonorejo",
    kec: "Rungkut",
    wilayah: "timur",
    luas: "100.000 m²",
    x: 526.4,
    y: 335.7,
  },
  {
    name: "Taman Flora",
    kec: "Mulyorejo",
    wilayah: "timur",
    luas: "33.810 m²",
    x: 482.7,
    y: 201.9,
  },
  {
    name: "Taman Nginden Intan",
    kec: "Sukolilo",
    wilayah: "timur",
    luas: "3.351 m²",
    x: 468.1,
    y: 277.3,
  },
  {
    name: "Taman Kunang-Kunang",
    kec: "Rungkut",
    wilayah: "timur",
    luas: "9.681 m²",
    x: 509.4,
    y: 316.2,
  },
  {
    name: "Taman 10 Nopember",
    kec: "Tambaksari",
    wilayah: "timur",
    luas: "5.075 m²",
    x: 446.2,
    y: 204.3,
  },
  {
    name: "Taman Paliatif/Soka",
    kec: "Tambaksari",
    wilayah: "timur",
    luas: "1.260 m²",
    x: 451.1,
    y: 209.2,
  },
  {
    name: "Taman Teratai",
    kec: "Tambaksari",
    wilayah: "timur",
    luas: "4.066 m²",
    x: 439.0,
    y: 201.9,
  },
  {
    name: "Taman Pandugo",
    kec: "Rungkut",
    wilayah: "timur",
    luas: "4.878 m²",
    x: 531.2,
    y: 313.8,
  },
  {
    name: "Taman Lansia",
    kec: "Gubeng",
    wilayah: "timur",
    luas: "2.694 m²",
    x: 429.2,
    y: 233.5,
  },
  {
    name: "Taman Harmoni",
    kec: "Sukolilo",
    wilayah: "timur",
    luas: "84.490 m²",
    x: 541.0,
    y: 284.6,
  },
  {
    name: "Taman Incenerator",
    kec: "Sukolilo",
    wilayah: "timur",
    luas: "12.560 m²",
    x: 543.4,
    y: 291.9,
  },
  {
    name: "Taman PUPR",
    kec: "Sukolilo",
    wilayah: "timur",
    luas: "212.542 m²",
    x: 548.2,
    y: 299.2,
  },
  {
    name: "Taman Pakal",
    kec: "Pakal",
    wilayah: "barat",
    luas: "902 m²",
    x: 157.3,
    y: 199.5,
  },
  {
    name: "Taman Cahaya",
    kec: "Pakal",
    wilayah: "barat",
    luas: "16.233 m²",
    x: 171.8,
    y: 175.2,
  },
];

const colors = {
  pusat: "#1D9E75",
  utara: "#3B82F6",
  selatan: "#F59E0B",
  timur: "#EF4444",
  barat: "#8B5CF6",
};

const wilayahList = ["all", "pusat", "utara", "selatan", "timur", "barat"];

const LAND_PATH =
  "M 331.9 390.4 L 304.7 379.7 L 286.2 395.0 L 240.8 414.4 L 201.9 416.6 L 187.1 430.0 L 183.2 429.8 L 185.9 395.5 L 181.1 386.7 L 168.2 377.7 L 174.0 344.2 L 167.7 338.1 L 170.4 327.4 L 140.3 323.7 L 139.3 319.8 L 121.8 320.1 L 120.1 295.0 L 114.0 292.1 L 120.1 266.6 L 115.2 250.3 L 118.9 240.1 L 114.5 236.4 L 126.7 230.4 L 128.8 198.8 L 121.6 193.9 L 114.0 197.8 L 92.2 188.5 L 93.9 176.9 L 84.9 176.1 L 85.9 165.9 L 66.2 166.9 L 55.3 161.8 L 65.2 151.3 L 66.2 144.8 L 59.9 139.2 L 61.6 128.5 L 45.1 117.8 L 47.5 114.9 L 43.4 106.1 L 30.0 105.1 L 34.1 86.4 L 43.8 102.2 L 44.8 95.2 L 52.1 89.6 L 37.5 84.5 L 46.5 79.1 L 31.7 66.0 L 32.7 54.3 L 48.5 56.5 L 82.9 70.6 L 120.3 52.4 L 182.8 39.2 L 194.2 40.0 L 196.8 33.6 L 203.6 32.2 L 205.3 45.8 L 198.8 49.7 L 196.1 67.4 L 201.2 69.4 L 216.0 97.1 L 222.8 103.2 L 237.6 106.6 L 239.6 97.8 L 245.2 101.0 L 245.7 105.6 L 259.5 110.7 L 265.1 105.6 L 279.7 106.1 L 304.9 99.1 L 309.0 109.0 L 309.3 105.4 L 320.9 101.7 L 318.0 91.3 L 329.4 86.7 L 330.9 72.1 L 336.0 72.3 L 339.4 65.7 L 345.9 73.5 L 335.5 46.5 L 342.1 44.8 L 355.7 72.6 L 359.1 71.6 L 352.7 56.7 L 355.4 55.5 L 362.7 70.9 L 367.3 70.1 L 365.6 66.0 L 372.7 64.8 L 372.7 57.2 L 371.2 52.1 L 367.6 51.6 L 369.7 45.1 L 352.3 48.5 L 350.6 43.9 L 408.8 34.6 L 411.3 37.1 L 405.2 40.7 L 419.5 48.5 L 437.5 39.2 L 447.7 38.8 L 474.9 56.0 L 473.9 62.6 L 478.8 69.4 L 487.5 69.9 L 484.4 95.9 L 504.3 102.7 L 503.8 95.9 L 497.5 90.1 L 498.5 87.4 L 505.5 95.7 L 508.7 111.5 L 522.0 123.6 L 529.3 136.3 L 530.3 147.0 L 541.7 156.2 L 540.2 162.3 L 546.1 174.9 L 553.1 175.7 L 551.9 184.2 L 560.4 181.0 L 562.3 187.8 L 571.3 190.5 L 575.4 188.1 L 604.3 202.4 L 612.8 198.3 L 624.3 212.4 L 603.9 217.7 L 604.3 221.1 L 607.5 226.2 L 629.4 234.3 L 636.6 243.3 L 650.0 283.9 L 646.8 290.2 L 648.8 310.4 L 639.3 333.2 L 633.7 337.8 L 623.0 338.8 L 627.7 346.4 L 616.0 353.4 L 601.4 372.4 L 599.0 396.9 L 581.8 397.7 L 567.4 404.5 L 532.9 401.1 L 520.6 404.7 L 509.1 398.9 L 496.5 402.5 L 486.3 400.6 L 481.5 391.6 L 463.5 387.2 L 456.7 393.0 L 454.7 385.0 L 427.8 381.1 L 423.2 394.5 L 397.7 391.1 L 395.2 401.8 L 382.6 400.8 L 373.9 408.8 L 360.0 409.8 L 341.1 400.1 L 341.3 396.4 L 331.4 393.5 L 331.9 390.4 Z";

const ISLAND_PATH =
  "M 206.6 36.3 L 204.9 31.9 L 208.3 30.0 L 210.9 40.2 L 206.6 36.3 Z";

const wilayahLabels = [
  { t: "Surabaya Utara", x: 420, y: 128 },
  { t: "Surabaya Pusat", x: 390, y: 210 },
  { t: "Sby Barat", x: 148, y: 245 },
  { t: "Surabaya Selatan", x: 390, y: 355 },
  { t: "Surabaya Timur", x: 530, y: 248 },
];

const MapTaman = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  const filtered =
    activeFilter === "all"
      ? taman
      : taman.filter((t) => t.wilayah === activeFilter);

  const handleMouseMove = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top - 14,
    });
  };

  const getWilayahName = (w) => {
    switch (w) {
      case "pusat":
        return "Surabaya Pusat";
      case "utara":
        return "Surabaya Utara";
      case "selatan":
        return "Surabaya Selatan";
      case "timur":
        return "Surabaya Timur";
      case "barat":
        return "Surabaya Barat";
      default:
        return w;
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-2">
            PETA TAMAN SURABAYA
          </h2>
          <p className="text-gray-500 text-sm">
            {filtered.length} dari 40 taman
          </p>
        </div>

        {/* Filter bar - lebih transparan */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full p-1 shadow-sm">
            {wilayahList.map((w) => (
              <button
                key={w}
                onClick={() => setActiveFilter(w)}
                className={`text-sm px-4 py-1.5 rounded-full transition-all ${
                  activeFilter === w
                    ? "bg-white text-green-700 shadow-sm font-medium"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {w === "all"
                  ? "Semua"
                  : getWilayahName(w).replace("Surabaya ", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Map - background transparan */}
        <div className="relative" ref={mapRef} onMouseMove={handleMouseMove}>
          <svg viewBox="0 0 680 460" className="w-full block">
            {/* Tidak ada background putih - biarkan transparan */}

            {/* Grid garis halus (sangat tipis) */}
            <g stroke="#cbd5e1" strokeWidth="0.3" fill="none" opacity="0.3">
              <line x1="0" y1="115" x2="680" y2="115" />
              <line x1="0" y1="230" x2="680" y2="230" />
              <line x1="0" y1="345" x2="680" y2="345" />
              <line x1="170" y1="0" x2="170" y2="460" />
              <line x1="340" y1="0" x2="340" y2="460" />
              <line x1="510" y1="0" x2="510" y2="460" />
            </g>

            {/* Daratan utama Surabaya - warna hijau transparan */}
            <path
              d={LAND_PATH}
              fill="#dcfce7"
              stroke="#86efac"
              strokeWidth="1"
              opacity="0.8"
            />

            {/* Pulau kecil */}
            <path
              d={ISLAND_PATH}
              fill="#dcfce7"
              stroke="#86efac"
              strokeWidth="0.8"
              opacity="0.8"
            />

            {/* Label wilayah - sangat tipis */}
            {wilayahLabels.map((lb) => (
              <text
                key={lb.t}
                x={lb.x}
                y={lb.y}
                textAnchor="middle"
                fontSize="8"
                fill="#cbd5e1"
                fontFamily="sans-serif"
                opacity="0.6"
              >
                {lb.t}
              </text>
            ))}

            {/* Titik taman */}
            {filtered.map((t) => (
              <g
                key={t.name}
                onMouseEnter={() => setHovered(t)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={8}
                  fill={colors[t.wilayah]}
                  opacity="0.15"
                />
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={hovered?.name === t.name ? 5.5 : 4}
                  fill={colors[t.wilayah]}
                  stroke="#fff"
                  strokeWidth="1.5"
                  style={{ transition: "r 0.15s" }}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hovered && (
            <div
              className="absolute pointer-events-none bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl px-3 py-2 shadow-lg"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
                zIndex: 10,
                maxWidth: 210,
              }}
            >
              <p className="text-sm font-semibold text-gray-800">
                {hovered.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Kec. {hovered.kec}</p>
              <p className="text-xs text-gray-500">Luas: {hovered.luas}</p>
            </div>
          )}
        </div>

        {/* Legend - minimalis, transparan */}
        <div className="flex justify-center gap-4 mt-4">
          {Object.entries(colors).map(([w, c]) => (
            <span
              key={w}
              className="flex items-center gap-1.5 text-xs text-gray-400"
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                style={{ background: c }}
              />
              {getWilayahName(w)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MapTaman;
