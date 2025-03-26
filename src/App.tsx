
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Dashboard from "./pages/admin/Dashboard";
import Messages from "./pages/Messages";
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
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<NotFound />} />
          <Route path="/profile/:id" element={<NotFound />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/message/:id" element={<NotFound />} />
          <Route path="/marketplace" element={<NotFound />} />
          <Route path="/marketplace/:id" element={<NotFound />} />
          <Route path="/events" element={<NotFound />} />
          <Route path="/events/:id" element={<NotFound />} />
          <Route path="/settings" element={<NotFound />} />
          <Route path="/notifications" element={<NotFound />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<NotFound />} />
          <Route path="/admin/posts" element={<NotFound />} />
          <Route path="/admin/events" element={<NotFound />} />
          <Route path="/admin/marketplace" element={<NotFound />} />
          <Route path="/admin/settings" element={<NotFound />} />
          <Route path="/featured" element={<NotFound />} />
          <Route path="/wishlist" element={<NotFound />} />
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
