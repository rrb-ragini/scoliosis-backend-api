"use client";

import { useState } from "react";
import UploadCard from "./components/UploadCard";
import ResultCard from "./components/ResultCard";

export default function Page() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const onFile = (f) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return alert("Upload an X-ray first.");

    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("xray", file);

      const res = await fetch("/api/infer", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      json.cobb_angle = Number(json.cobb_angle);
      setResult(json);
    } catch (e) {
      console.error(e);
      alert("Error analyzing image.");
    }
    setLoading(false);
  };

  const sendChat = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    setChatMessages((prev) => [...prev, userMessage]);

    // Fake response for now (you can replace with OpenAI API)
    const botReply = {
      role: "assistant",
      content:
        "Maintaining good posture, doing core strengthening exercises, stretching the hamstrings, and keeping a healthy body weight helps reduce progression. Let me know if you'd like personalized exercise routines!",
    };

    setChatMessages((prev) => [...prev, botReply]);
  };

  return (
      <div className="space-y-12">
    {/* HEADER */}
    <div className="text-center flex flex-col items-center">
      <img 
        src="/logo.png" 
        alt="SpinalSense Logo"
        className="h-16 w-auto mb-4"
      />
      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
        SpinalSense
      </h1>
      <p className="text-slate-500 text-lg mt-2">
        AI-powered Cobb angle detection from your spinal X-ray
      </p>
    </div>

      {/* UPLOAD SECTION */}
      <div className="max-w-3xl mx-auto w-full">
        <UploadCard onFile={onFile} />

        <div className="flex gap-3 mt-6">
          <button
            onClick={analyze}
            disabled={loading || !file}
            className={`px-5 py-2.5 rounded-lg font-semibold text-white ${
              loading || !file
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-700"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze X-ray"}
          </button>

          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
              setResult(null);
            }}
            className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium"
          >
            Reset
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-6 card p-4">
            <p className="text-sm text-slate-500 mb-2 font-medium">Preview</p>
            <img
              src={preview}
              alt="preview"
              className="rounded-md mx-auto max-h-[500px] object-contain"
            />
          </div>
        )}
      </div>

      {/* ANALYSIS SECTION */}
      {result && (
        <div className="max-w-4xl mx-auto w-full">
          <ResultCard
            result={result}
            onRetry={() => {
              setFile(null);
              setPreview(null);
              setResult(null);
            }}
          />
        </div>
      )}

      {/* CHAT ASSISTANT SECTION */}
      <div className="max-w-3xl mx-auto w-full space-y-4 card p-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Ask the Spine Assistant
        </h2>
        <p className="text-slate-500 text-sm">
          Ask questions about exercises, lifestyle, scoliosis severity, and what
          to do with your analysis result.
        </p>

        <div className="space-y-3 max-h-[300px] overflow-y-auto p-3 rounded-md bg-slate-50 border">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-md max-w-[80%] ${
                msg.role === "user"
                  ? "ml-auto bg-primary-500 text-white"
                  : "bg-white border"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {chatMessages.length === 0 && (
            <p className="text-slate-400 text-sm italic">
              No messages yet — ask something!
            </p>
          )}
        </div>

        <ChatInput sendChat={sendChat} />
      </div>
    </div>
  );
}

function ChatInput({ sendChat }) {
  const [text, setText] = useState("");

  return (
    <div className="flex gap-2">
      <input
        className="flex-grow border rounded-lg p-2 bg-white"
        placeholder="Ask something about scoliosis..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={() => {
          sendChat(text);
          setText("");
        }}
        className="px-5 py-2 bg-primary-500 hover:bg-primary-700 text-white rounded-lg font-semibold"
      >
        Send
      </button>
    </div>
  );
}
