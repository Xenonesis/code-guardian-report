import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import About from "./pages/About";
import NavbarDemo from "./pages/NavbarDemo";
import FooterDemo from "./pages/FooterDemo";
import NotFound from "./pages/NotFound";

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/navbar-demo" element={<NavbarDemo />} />
          <Route path="/footer-demo" element={<FooterDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
