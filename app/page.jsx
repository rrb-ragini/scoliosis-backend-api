"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadXray = async () => {
    if (!file) return alert("Please upload an X-ray first.");

    const fd = new FormData();
    fd.append("xray", file);

    setLoading(true);
    try {
      const res = await fetch("/api/infer", { method: "POST", body: fd });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      alert("Error: " + err);
    }
    setLoading(false);
  };

  const formatCobb = (val) => {
    if (val === undefined || val === null) return "—";
    return Number(val).toFixed(2);
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>SpinalSense — Cobb Angle Detection</h1>

      <input
        type="file"
        accept="image/*"
        style={{ marginTop: 20 }}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={uploadXray}
        disabled={loading}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          background: "#0070f3",
          color: "white",
          borderRadius: 6,
        }}
      >
        {loading ? "Processing..." : "Upload X-ray"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>Cobb Angle:</h2>
          <p style={{ fontSize: 20 }}>{formatCobb(result.cobb_angle)}°</p>

          {result.overlay_url && (
            <img
              src={result.overlay_url}
              alt="overlay"
              style={{ maxWidth: "100%", marginTop: 12, border: "1px solid #ddd" }}
            />
          )}
        </div>
      )}
    </main>
  );
}
