import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import GoogleTagPageViews from "./components/GoogleTagPageViews";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleTagPageViews />
      <App />
    </BrowserRouter>
  </StrictMode>,
);
