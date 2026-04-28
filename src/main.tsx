import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "rsuite/dist/rsuite-no-reset.min.css";

const root = document.getElementById("root")!;
createRoot(root).render(<App />);
