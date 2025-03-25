
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<NotFound />} />
          <Route path="/category/:slug" element={<NotFound />} />
          <Route path="/events" element={<NotFound />} />
          <Route path="/sell" element={<NotFound />} />
          <Route path="/item/:id" element={<NotFound />} />
          <Route path="/login" element={<NotFound />} />
          <Route path="/featured" element={<NotFound />} />
          <Route path="/wishlist" element={<NotFound />} />
          <Route path="/notifications" element={<NotFound />} />
          <Route path="/profile" element={<NotFound />} />
          <Route path="/message/:id" element={<NotFound />} />
          <Route path="/settings" element={<NotFound />} />
          <Route path="/about" element={<NotFound />} />
          <Route path="/contact" element={<NotFound />} />
          <Route path="/faq" element={<NotFound />} />
          <Route path="/terms" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
