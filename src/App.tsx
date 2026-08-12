import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MarketingLayout from "./layouts/MarketingLayout";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import About from "./pages/About";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetail";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminShell from "./admin/components/AdminShell";
import AdminLogin from "./admin/pages/Login";
import AdminSignup from "./admin/pages/Signup";
import AdminPending from "./admin/pages/Pending";
import AdminSetup from "./admin/pages/Setup";
import Dashboard from "./admin/pages/Dashboard";
import ProjectsPage from "./admin/pages/Projects";
import ProjectDetail from "./admin/pages/ProjectDetail";
import TasksPage from "./admin/pages/TasksPage";
import ApprovalsPage from "./admin/pages/Approvals";
import UsersPage from "./admin/pages/Users";
import AuthHashRedirect from "./admin/components/AuthHashRedirect";
import InvoicesPage from "./admin/pages/Invoices";
import ClientsPage from "./admin/pages/Clients";
import FinancePage from "./admin/pages/Finance";
import SalariesPage from "./admin/pages/Salaries";
import AdminBlogPage from "./admin/pages/Blog";
import AdminBlogAdsPage from "./admin/pages/BlogAds";
import AdminBlogAiPage from "./admin/pages/BlogAi";
import BlogPage from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import BlogPostRedirect from "./pages/BlogPostRedirect";
import ContactPage from "./pages/Contact";
import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";
import CaseStudyPage from "./pages/CaseStudy";

export default function App() {
  return (
    <AuthProvider>
      <AuthHashRedirect />
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostRedirect />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/:slug" element={<BlogPostPage />} />
        </Route>

        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/pending" element={<AdminPending />} />

        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminShell />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="salaries" element={<SalariesPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="blog-ads" element={<AdminBlogAdsPage />} />
            <Route path="blog-ai" element={<AdminBlogAiPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
