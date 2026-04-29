import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileMock } from "@/components/MobileMock";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MobileMock>
        <Routes>
          {/* All app screens render <Index/>; it reads the URL to decide which screen to show. */}
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          <Route path="/onboard" element={<Index />} />
          <Route path="/building" element={<Index />} />
          <Route path="/analysis" element={<Index />} />
          <Route path="/card-id" element={<Index />} />
          <Route path="/manual-entry" element={<Index />} />
          <Route path="/gmail-extra" element={<Index />} />
          <Route path="/txn-eval" element={<Index />} />
          <Route path="/tools-intro" element={<Index />} />
          <Route path="/final-loading" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/calculate" element={<Index />} />
          <Route path="/redeem" element={<Index />} />
          <Route path="/optimize" element={<Index />} />
          <Route path="/optimise" element={<Index />} />
          <Route path="/actions" element={<Index />} />
          <Route path="/transactions" element={<Index />} />
          <Route path="/profile" element={<Index />} />
          <Route path="/cards" element={<Index />} />
          <Route path="/cards/:id" element={<Index />} />
          <Route path="/portfolio/create" element={<Index />} />
          <Route path="/portfolio/results" element={<Index />} />
          <Route path="/gmail" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </MobileMock>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
