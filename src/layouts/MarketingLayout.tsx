import { Outlet } from "react-router-dom";
import Nav from "../components/Nav";
import ScrollProgress from "../components/ScrollProgress";
import CustomCursor from "../components/CustomCursor";
import ScrollManager from "../components/ScrollManager";
import Footer from "../components/Footer";
import CalendlyBookingModal from "../components/CalendlyBookingModal";

/** Public marketing site chrome — not used on /admin routes. */
export default function MarketingLayout() {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <CustomCursor />
      <ScrollManager />
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CalendlyBookingModal />
    </div>
  );
}
