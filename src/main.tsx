// Production React entry point.
// App-level providers and routes live in App.tsx; screen orchestration lives in pages/Index.tsx.

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "rsuite/dist/rsuite-no-reset.min.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root was not found");
createRoot(root).render(<App />);
