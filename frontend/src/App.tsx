import { useEffect, useState } from "react";

function App() {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    const host = window.location.hostname;
    setHostname(host);
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Hello, {hostname}</h1>
    </div>
  );
}

export default App;

