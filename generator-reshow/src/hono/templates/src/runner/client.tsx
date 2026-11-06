import { useState } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>count: {count}</button>;
};

const container = document.getElementById("app");
if (container) {
  createRoot(container).render(<App />);
}
