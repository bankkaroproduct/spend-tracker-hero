// Production app shell.
// Provides global providers and maps every supported route to the Index orchestrator.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileMock } from "@/components/MobileMock";
import { INDEX_ROUTE_PATHS } from "@/routes/appRoutes";
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
            {INDEX_ROUTE_PATHS.map((path) => <Route key={path} path={path} element={<Index />} />)}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MobileMock>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
