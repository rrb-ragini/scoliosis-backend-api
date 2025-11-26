// app/page.jsx
"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setImage(file);

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>SpinalSense</h1>
      <p>Upload X-ray to detect Cobb's Angle</p>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {loading && <p>Processing...</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Cobb's Angle: {result.cobb_angle ?? "N/A"}°</h2>
        </div>
      )}
    </div>
  );
}
