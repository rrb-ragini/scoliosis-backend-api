"use client";
import { useState } from "react";
import UploadCard from "./components/UploadCard";
import ResultCard from "./components/ResultCard";

export default function Page() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFile = (f) => {
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const analyze = async () => {
    if (!file) return alert("Please upload an X-ray first.");

    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("xray", file);

      // POST to your serverless proxy /api/infer — ensure backend exists
      const res = await fetch("/api/infer", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();

      // ensure cobb_angle is a number when present
      if (json.cobb_angle !== undefined && json.cobb_angle !== null) {
        json.cobb_angle = Number(json.cobb_angle);
      }
      setResult(json);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze image: " + String(err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">SpinalSense</h1>
          <p className="text-slate-500 mt-1">AI-powered Cobb angle detection — upload an X-ray to begin.</p>

          <div className="mt-6">
            <UploadCard onFile={onFile} />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={analyze}
              disabled={loading || !file}
              className={`px-4 py-2 rounded-md font-medium text-white ${loading || !file ? "bg-slate-300 cursor-not-allowed" : "bg-primary-500 hover:bg-primary-700"}`}
            >
              {loading ? "Analyzing..." : "Analyze X-ray"}
            </button>

            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setResult(null);
              }}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200"
            >
              Reset
            </button>
          </div>

          {preview && (
            <div className="mt-6">
              <div className="text-sm text-slate-500 mb-2">Preview</div>
              <img src={preview} alt="preview" className="rounded-md border border-slate-100 max-h-80 object-contain w-full" />
            </div>
          )}
        </div>

        <div className="text-sm text-slate-500">
          <strong>Privacy:</strong> Images are sent to your inference backend. Do not upload identifiable patient information to public repos.
        </div>
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="card p-6 flex items-center justify-center">
            <div>
              <div className="loader mb-3" />
              <div className="text-slate-600">Running model inference — this may take a few seconds.</div>
            </div>
          </div>
        )}

        {result ? (
          <ResultCard result={result} onRetry={() => { setFile(null); setPreview(null); setResult(null); }} />
        ) : (
          <div className="card p-6 flex flex-col items-start gap-4">
            <h3 className="text-lg font-semibold">Awaiting analysis</h3>
            <p className="text-slate-500">Upload an X-ray and click <strong>Analyze X-ray</strong> to get the Cobb angle and overlay.</p>
            <ul className="mt-2 text-slate-500">
              <li>• Make sure the X-ray is AP/PA view.</li>
              <li>• For research / demo use only — clinical validation required before clinical use.</li>
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .loader {
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          border: 4px solid rgba(16,24,40,0.08);
          border-top-color: #0070f3;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
