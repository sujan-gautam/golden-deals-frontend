
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart, Users, ShoppingBag, Calendar, Settings, Bell, LogOut, Menu, X, Home, Newspaper } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/signin');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate('/feed');
      return;
    }
    
    setUser(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden mr-2"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-usm-gold">Social</span>Eagle
              </span>
              <span className="ml-2 text-sm text-gray-500">Admin</span>
            </Link>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>

            <Link to="/feed">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Home className="h-5 w-5 mr-1" />
                <span className="text-sm">View Site</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-transparent p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/feed" className="cursor-pointer flex w-full">
                    <Home className="mr-2 h-4 w-4" />
                    <span>View Site</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="cursor-pointer flex w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileSidebarOpen(false)}></div>
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed md:sticky top-16 z-30 md:z-0 h-[calc(100vh-4rem)] w-64 md:w-64 shrink-0 
            border-r bg-white p-4 transition-transform duration-200 
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <nav className="flex flex-col space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </div>
            <Link to="/admin/dashboard">
              <Button 
                variant={isActive('/admin/dashboard') ? "secondary" : "ghost"} 
                className="w-full justify-start h-10"
              >
                <BarChart className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button 
                variant={isActive('/admin/users') ? "secondary" : "ghost"} 
                className="w-full justify-start h-10"
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </Button>
            </Link>
            <Link to="/admin/posts">
              <Button 
                variant={isActive('/admin/posts') ? "secondary" : "ghost"}
                className="w-full justify-start h-10"
              >
                <Newspaper className="mr-2 h-4 w-4" />
                Posts
              </Button>
            </Link>
            <Link to="/admin/events">
              <Button 
                variant={isActive('/admin/events') ? "secondary" : "ghost"}
                className="w-full justify-start h-10"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </Button>
            </Link>
            <Link to="/admin/marketplace">
              <Button 
                variant={isActive('/admin/marketplace') ? "secondary" : "ghost"}
                className="w-full justify-start h-10"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Marketplace
              </Button>
            </Link>

            <div className="px-3 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              System
            </div>
            <Link to="/admin/settings">
              <Button 
                variant={isActive('/admin/settings') ? "secondary" : "ghost"}
                className="w-full justify-start h-10"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
