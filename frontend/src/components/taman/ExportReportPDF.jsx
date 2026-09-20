import React, { useState } from "react";
import { FileText, X, AlertCircle, CheckCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// ── Komponen Toast Notifikasi ──
const Toast = ({ message, type, onClose }) => {
  const isError = type === "error";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm animate-fade-in ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
      )}
      <p className="text-sm leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="ml-1 shrink-0 opacity-50 hover:opacity-100 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ExportReportPDF = ({ tamanId, tamanName }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchHistoryData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/locations/${tamanId}/history?days=7`,
      );
      if (!response.ok) {
        const response2 = await fetch(
          `http://localhost:3000/api/locations/${tamanId}/history?days=7`,
        );
        if (!response2.ok) throw new Error("History API tidak tersedia");
        const data = await response2.json();
        return data.data || [];
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Gagal ambil history:", error);
      return [];
    }
  };

  const getWeekRange = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    const fmt = (d) =>
      d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    return `${fmt(start)} s.d. ${fmt(today)}`;
  };

  const getTodayFormatted = () =>
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const getTodaySlug = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  };

  const exportToPDF = async () => {
    setLoading(true);
    try {
      // ── Fetch data ──
      let historyData = [];
      try {
        historyData = await fetchHistoryData();
      } catch (fetchErr) {
        console.error("Fetch error:", fetchErr);
        showToast(
          "Gagal mengambil data dari server. Periksa koneksi ke backend.",
          "error",
        );
        setLoading(false);
        return;
      }

      if (!historyData || historyData.length === 0) {
        showToast("Belum ada data histori keramaian untuk taman ini.", "error");
        setLoading(false);
        return;
      }

      // ── Buat grafik di DOM tersembunyi ──
      let chartDataUrl = null;
      try {
        const chartContainer = document.createElement("div");
        chartContainer.style.cssText = `
          position: absolute; left: -9999px; top: -9999px;
          width: 700px; background: #ffffff;
          font-family: Arial, Helvetica, sans-serif; padding: 10px 20px 20px;
        `;

        const maxCount = Math.max(...historyData.map((d) => d.avg_count), 1);
        const BAR_MAX_H = 110;

        const bars = historyData
          .map((item) => {
            const h = Math.max(
              Math.round((item.avg_count / maxCount) * BAR_MAX_H),
              4,
            );
            const color =
              item.crowd_level === "Tinggi"
                ? "#374151"
                : item.crowd_level === "Sedang"
                  ? "#6b7280"
                  : "#9ca3af";
            return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center;">
              <div style="font-size:10px; color:#111827; font-weight:600; margin-bottom:3px;">${item.avg_count}</div>
              <div style="width:36px; height:${h}px; background:${color};"></div>
              <div style="width:36px; height:1px; background:#374151;"></div>
              <div style="font-size:8.5px; color:#111827; margin-top:5px; text-align:center; line-height:1.4;">${item.date}</div>
              <div style="font-size:8px; color:#6b7280; margin-top:2px;">${item.crowd_level}</div>
            </div>
          `;
          })
          .join("");

        chartContainer.innerHTML = `
          <div style="font-family: Arial, Helvetica, sans-serif;">
            <div style="display:flex; align-items:flex-end; gap:10px; height:${BAR_MAX_H + 70}px; padding: 0 10px 0;">
              ${bars}
            </div>
            <div style="display:flex; gap:20px; margin-top:14px; padding-top:10px; border-top:1px solid #d1d5db;">
              <div style="display:flex; align-items:center; gap:6px;">
                <div style="width:14px;height:14px;background:#9ca3af;"></div>
                <span style="font-size:9px;color:#374151;">Rendah</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <div style="width:14px;height:14px;background:#6b7280;"></div>
                <span style="font-size:9px;color:#374151;">Sedang</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <div style="width:14px;height:14px;background:#374151;"></div>
                <span style="font-size:9px;color:#374151;">Tinggi</span>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(chartContainer);

        const chartCanvas = await html2canvas(chartContainer, {
          scale: 2,
          backgroundColor: "#ffffff",
          logging: false,
        });
        chartDataUrl = chartCanvas.toDataURL("image/png");
        document.body.removeChild(chartContainer);
      } catch (chartErr) {
        console.error("Chart error:", chartErr);
        showToast("Gagal membuat grafik. Coba lagi.", "error");
        setLoading(false);
        return;
      }

      // ── Buat PDF ──
      try {
        const doc = new jsPDF("p", "mm", "a4");
        const W = doc.internal.pageSize.width;
        const H = doc.internal.pageSize.height;
        const ML = 20;
        const MR = 20;
        const CW = W - ML - MR;
        let y = 0;

        // Kop
        doc.setDrawColor(0);
        doc.setLineWidth(1.0);
        doc.line(ML, 12, W - MR, 12);

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("LAPORAN KERAMAIAN TAMAN", W / 2, 21, { align: "center" });

        doc.setFontSize(11);
        doc.text("KOTA SURABAYA", W / 2, 28, { align: "center" });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(
          "Dinas Lingkungan Hidup — Jl. Taman Surya No.1, Surabaya",
          W / 2,
          34,
          { align: "center" },
        );

        doc.setDrawColor(0);
        doc.setLineWidth(0.8);
        doc.line(ML, 38, W - MR, 38);
        doc.setLineWidth(0.25);
        doc.line(ML, 40, W - MR, 40);

        y = 40;

        // Info dokumen
        y += 9;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Grafik Keramaian Taman", W / 2, y, { align: "center" });
        y += 7;

        const labelX = ML;
        const colonX = ML + 22;
        const valueX = ML + 26;
        const infoGap = 6;

        [
          ["Taman", tamanName],
          ["Periode", getWeekRange()],
        ].forEach(([label, value]) => {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(label, labelX, y);
          doc.setFont("helvetica", "normal");
          doc.text(":", colonX, y);
          doc.text(value, valueX, y);
          y += infoGap;
        });

        y += 3;

        // Grafik
        const chartH = 62;
        doc.addImage(chartDataUrl, "PNG", ML, y, CW, chartH);
        y += chartH + 8;

        // Tabel
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Tabel Data Keramaian", ML, y);
        y += 4;

        const tableData = historyData.map((item, i) => [
          String(i + 1),
          item.date,
          item.crowd_level,
          `${item.avg_count} orang`,
        ]);

        autoTable(doc,{
          startY: y,
          head: [["No.", "Tanggal", "Tingkat", "Rata-Rata"]],
          body: tableData,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 3.5,
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
            font: "helvetica",
            valign: "middle",
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
          },
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 70 },
            2: { cellWidth: 35, halign: "center" },
            3: { cellWidth: 45, halign: "center" },
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        y = doc.lastAutoTable.finalY + 10;

        // Tanda tangan
        const sigY = y + 4;
        const sigX = W - MR - 55;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`Surabaya, ${getTodayFormatted()}`, sigX + 27, sigY, {
          align: "center",
        });
        doc.text("Kepala UPTD Taman Kota", sigX + 27, sigY + 6, {
          align: "center",
        });
        doc.text("Dinas Lingkungan Hidup", sigX + 27, sigY + 11, {
          align: "center",
        });
        doc.text("Kota Surabaya", sigX + 27, sigY + 16, { align: "center" });
        doc.line(sigX, sigY + 34, sigX + 54, sigY + 34);
        doc.setFont("helvetica", "bold");
        doc.text(
          "NIP. ................................",
          sigX + 27,
          sigY + 39,
          { align: "center" },
        );

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setDrawColor(0);
          doc.setLineWidth(0.4);
          doc.line(ML, H - 14, W - MR, H - 14);
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text("Dinas Lingkungan Hidup — Kota Surabaya", ML, H - 9);
          doc.text(`Halaman ${i} dari ${pageCount}`, W - MR, H - 9, {
            align: "right",
          });
        }

        doc.save(
          `Laporan_Keramaian_${tamanName.replace(/\s+/g, "_")}_${getTodaySlug()}.pdf`,
        );

        // Notif sukses
        showToast("PDF berhasil diunduh.", "success");
      } catch (pdfErr) {
        console.error("PDF error:", pdfErr);
        showToast(
          `Gagal membuat PDF: ${pdfErr.message || "Silakan coba lagi."}`,
          "error",
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      showToast("Terjadi kesalahan tidak terduga. Silakan coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={exportToPDF}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition disabled:opacity-50 shadow-sm"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {loading ? "Memproses..." : "Rekap"}
        </span>
      </button>

      {/* Toast notifikasi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default ExportReportPDF;
