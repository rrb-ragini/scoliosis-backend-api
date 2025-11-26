// app/layout.jsx
export const metadata = {
  title: "SpinalSense",
  description: "AI Powered Cobb Angle Detection"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", background: "#f5f7fa", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
