import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/use-auth";
import Alerts from '@/pages/Alerts';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Dashboard from "./pages/admin/Dashboard";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Events from "./pages/Events";
import SingleEvent from "./pages/SingleEvent";
import Marketplace from "./pages/Marketplace";
import SingleProduct from "./pages/SingleProduct";
import SinglePost from "./pages/SinglePost";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Saved from "./pages/Saved";
import SearchPage from './pages/SearchPage';
import GoogleCallback from "@/components/social/GoogleCallback";
import InterestedPage from "./pages/InterestedPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/notification" element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            } />
            <Route path="/messages/:conversationId" element={
  <ProtectedRoute>
    <Messages />
  </ProtectedRoute>
} />
<Route path="/messages" element={
  <ProtectedRoute>
    <Messages />
  </ProtectedRoute>
} />
            
            {/* Food Routes */}
            <Route path="/food" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/food/:venue" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/meal-plans" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            
            {/* Events Routes */}
            <Route path="/events" element={
                <Events />
            } />
            <Route path="/events/:id" element={
              <ProtectedRoute>
                 <SingleEvent />
              </ProtectedRoute>
            } />
            
            {/* Events Routes */}
            <Route path="/search" element={
              <ProtectedRoute>
                 <SearchPage />
              </ProtectedRoute>
            } />
            
            
            {/* Saved Items Routes */}
            <Route path="/saved" element={
              <ProtectedRoute>
                 <Saved />
              </ProtectedRoute>
            } />


             {/* Marketplace Routes */}
             <Route path="/marketplace" element={
                <Marketplace />
            } />

             <Route path="/products/:id" element={
               <ProtectedRoute>
                 <SingleProduct />
               </ProtectedRoute>
             } />

             <Route path="/post/:id" element={
               <ProtectedRoute>
                 <SinglePost />
               </ProtectedRoute>
             } />

            {/* Login Routes */}
            <Route path="/login" element={
               <SignIn />
           } />

            {/* Settings Routes */}
            <Route path="/settings" element={
               <Settings />
           } />
            
            <Route path="/saved" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/admin/posts" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/admin/marketplace" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <NotFound />
              </ProtectedRoute>
            } />
            
            <Route path="/featured" element={<NotFound />} />
            <Route path="/wishlist" element={<NotFound />} />
            <Route path="/about" element={<NotFound />} />
            <Route path="/contact" element={<NotFound />} />
            <Route path="/faq" element={<NotFound />} />
            <Route path="/terms" element={<NotFound />} />
            <Route path="/category/:slug" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;