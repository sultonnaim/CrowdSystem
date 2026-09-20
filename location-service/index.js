const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "data", "taman.json");
const historyPath = path.join(__dirname, "data", "crowd-history.json");

let tamanData = { taman: [] };
let crowdHistory = { history: [] };

// Load data taman
try {
  const rawData = fs.readFileSync(dataPath, "utf8");
  tamanData = JSON.parse(rawData);
  console.log(" Loaded " + tamanData.taman.length + " taman");
} catch (error) {
  console.error(" Error loading taman.json:", error.message);
  process.exit(1);
}

// Load history
try {
  const rawHistory = fs.readFileSync(historyPath, "utf8");
  crowdHistory = JSON.parse(rawHistory);
  console.log(" Loaded " + crowdHistory.history.length + " history records");
} catch (error) {
  crowdHistory = { history: [] };
  fs.writeFileSync(historyPath, JSON.stringify(crowdHistory, null, 2));
  console.log(" Created new crowd-history.json");
}

// FUNGSI DASAR
function determineCrowdLevel(count) {
  if (count <= 10) return "Rendah";
  if (count <= 25) return "Sedang";
  return "Tinggi";
}

// SIMPAN HISTORY
function saveCrowdHistory(location_id, location_name, count, level) {
  const record = {
    id: crowdHistory.history.length + 1,
    location_id: location_id,
    location_name: location_name,
    timestamp: new Date().toISOString(),
    count: count,
    crowd_level: level || determineCrowdLevel(count),
  };

  crowdHistory.history.push(record);
  fs.writeFileSync(historyPath, JSON.stringify(crowdHistory, null, 2));
}

// ============ ENDPOINTS ============

// Get semua taman (DENGAN DEFAULT VALUE)
app.get("/api/locations", (req, res) => {
  const dataWithDefaults = tamanData.taman.map((taman) => ({
    ...taman,
    current_visitors:
      taman.current_visitors !== undefined ? taman.current_visitors : 0,
    crowd_level: taman.crowd_level || "Rendah",
  }));

  res.json({
    success: true,
    total: dataWithDefaults.length,
    data: dataWithDefaults,
  });
});

// Get detail taman by ID (DENGAN DEFAULT VALUE)
app.get("/api/locations/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taman = tamanData.taman.find((t) => t.id === id);
  if (!taman) {
    return res.status(404).json({ error: "Taman tidak ditemukan" });
  }

  const response = {
    ...taman,
    current_visitors:
      taman.current_visitors !== undefined ? taman.current_visitors : 0,
    crowd_level: taman.crowd_level,
  };

  res.json(response);
});

// Update dari Crowd Service (YOLO detection)
app.put("/api/locations/:id/crowd", (req, res) => {
  const id = parseInt(req.params.id);
  const { count, level } = req.body;

  const taman = tamanData.taman.find((t) => t.id === id);
  if (!taman) {
    return res.status(404).json({ error: "Taman tidak ditemukan" });
  }

  taman.current_visitors = count;
  taman.crowd_level = level || determineCrowdLevel(count);
  taman.last_update = new Date().toISOString();

  try {
    fs.writeFileSync(dataPath, JSON.stringify(tamanData, null, 2));
  } catch (err) {
    console.error("Gagal simpan taman.json:", err.message);
  }

  saveCrowdHistory(id, taman.name, count, taman.crowd_level);

  res.json({
    success: true,
    id,
    name: taman.name,
    current_visitors: count,
    crowd_level: taman.crowd_level,
  });
});

// Get history untuk laporan PDF
app.get("/api/locations/:id/history", (req, res) => {
  const id = parseInt(req.params.id);
  const { days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const filtered = crowdHistory.history.filter((item) => {
    return item.location_id === id && new Date(item.timestamp) >= startDate;
  });

  if (filtered.length === 0) {
    return res.json({
      location_id: id,
      days: days,
      data: [],
      message: "Belum ada data",
    });
  }

  const dailyData = {};

  filtered.forEach((item) => {
    const date = new Date(item.timestamp).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    if (!dailyData[date]) {
      dailyData[date] = { total: 0, count: 0, levels: [] };
    }
    dailyData[date].total += item.count;
    dailyData[date].count++;
    dailyData[date].levels.push(item.crowd_level);
  });

  const result = Object.keys(dailyData).map((date) => {
    const avgCount = Math.round(dailyData[date].total / dailyData[date].count);

    const levelCount = { Rendah: 0, Sedang: 0, Tinggi: 0 };
    dailyData[date].levels.forEach((l) => levelCount[l]++);
    const dominantLevel = Object.keys(levelCount).reduce((a, b) =>
      levelCount[a] > levelCount[b] ? a : b,
    );

    return {
      date: date,
      avg_count: avgCount,
      crowd_level: dominantLevel,
    };
  });

  res.json({
    location_id: id,
    days: days,
    data: result,
    total_records: filtered.length,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Location Service",
    totalTaman: tamanData.taman.length,
    historyRecords: crowdHistory.history.length,
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    name: "Location Service",
    version: "1.0.0",
    status: "running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(" LOCATION SERVICE READY");
  console.log("=".repeat(50));
  console.log(`Port: ${PORT}`);
  console.log(`Taman: ${tamanData.taman.length}`);
  console.log(`History: ${crowdHistory.history.length} records`);
  console.log(`API: http://localhost:${PORT}/api/locations`);
  console.log("=".repeat(50));
});
