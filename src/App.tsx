import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import ScrollProgress from "./components/ScrollProgress";
import ScrollManager from "./components/ScrollManager";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import About from "./pages/About";
import ServicesPage from "./pages/ServicesPage";

export default function App() {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <ScrollManager />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
