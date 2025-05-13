import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Home, Store, Calendar, User, Bell, Heart, LogOut, Tag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "@/hooks/use-search";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "@/components/auth/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const { setSearchQuery, handleSearch } = useSearch();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const fullName = user
    ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || "User"
    : "User";
  const avatarSrc = user?.avatar ? `${IMAGE_URL}${user.avatar}` : undefined;

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      handleSearch(localQuery);
      navigate(`/search?q=${encodeURIComponent(localQuery)}`);
      setIsSearchOpen(false);
      setLocalQuery("");
    }
  };

  // Focus trap and close menu on outside click/ESC
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsSearchOpen(false);
      }
      if (event.key === "Tab" && isOpen && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
      firstFocusableRef.current?.focus();
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/marketplace", icon: Store, label: "Marketplace" },
    { to: "/events", icon: Calendar, label: "Events" },
  ];

  const authNavItems = [
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/saved", icon: Heart, label: "Saved" },
    { to: "/notification", icon: Bell, label: "Notifications" },
    { to: "/marketplace/my-listings", icon: Tag, label: "My Listings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-usm-gold" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              <span className="text-usm-gold">Golden</span> Deals
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-semibold text-gray-900 hover:text-usm-gold transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
            {/* {isAuthenticated && (
              <Link
                to="/marketplace"
                className=" linked to the marketplace page text-sm font-semibold text-gray-900 hover:text-usm-gold transition-colors duration-200"
              >
                Marketplace
              </Link>
            )} */}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full text-gray-600 hover:text-usm-gold hover:bg-gray-50 transition-all duration-200"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/saved"
                  className="p-2 rounded-full text-gray-600 hover:text-usm-gold hover:bg-gray-50 transition-all duration-200"
                  aria-label="Saved items"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Link
                  to="/notification"
                  className="p-2 rounded-full text-gray-600 hover:text-usm-gold hover:bg-gray-50 transition-all duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarSrc} alt={fullName} />
                        <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                          {fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-white shadow-lg rounded-lg py-2" align="end" forceMount>
                    <DropdownMenuLabel className="px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {authNavItems.map((item) => (
                      <DropdownMenuItem
                        key={item.to}
                        onClick={() => navigate(item.to)}
                        className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 hover:text-usm-gold cursor-pointer transition-colors"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50 hover:text-red-700 cursor-pointer transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                id="auth-button"
                className="bg-usm-gold text-gray-900 hover:bg-usm-gold-dark text-sm font-semibold rounded-md px-4 py-2"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="p-2 rounded-full text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-usm-gold transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 bg-black z-[59]"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                ref={menuRef}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="md:hidden fixed top-0 right-0 w-[80%] max-w-[320px] h-full bg-white z-[60] shadow-2xl"
                role="dialog"
                aria-label="Mobile navigation menu"
              >
                <div className="flex flex-col h-full pt-4 pb-6 px-4">
                  {/* Close Button */}
                  <div className="flex justify-end mb-4">
                    <button
                      aria-label="Close menu"
                      className="p-2 rounded-full text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-usm-gold transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Navigation Items */}
                  <nav className="flex flex-col flex-1 overflow-y-auto">
                    {isAuthenticated && user && (
                      <div className="mb-6 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={avatarSrc} alt={fullName} />
                            <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                              {fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-gray-900 truncate">{fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {navItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        ref={item.to === "/" ? firstFocusableRef : undefined}
                        className={cn(
                          "flex items-center text-gray-900 py-3 px-4 rounded-lg",
                          "hover:bg-gray-50 hover:text-usm-gold active:scale-95 transition-all duration-200"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-6 w-6 mr-3" />
                        <span className="text-base font-semibold">{item.label}</span>
                      </Link>
                    ))}
                    {isAuthenticated && user && (
                      <>
                        <div className="border-t border-gray-200 my-4" />
                        {authNavItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={cn(
                              "flex items-center text-gray-900 py-3 px-4 rounded-lg",
                              "hover:bg-gray-50 hover:text-usm-gold active:scale-95 transition-all duration-200"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="h-6 w-6 mr-3" />
                            <span className="text-base font-semibold">{item.label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className={cn(
                            "flex items-center w-full text-left text-red-600 py-3 px-4 rounded-lg",
                            "hover:bg-gray-50 hover:text-red-700 active:scale-95 transition-all duration-200"
                          )}
                        >
                          <LogOut className="h-6 w-6 mr-3" />
                          <span className="text-base font-semibold">Log out</span>
                        </button>
                      </>
                    )}
                  </nav>

                  {/* Sign In Button for Non-Authenticated Users */}
                  {!isAuthenticated && (
                    <Button
                      className="bg-usm-gold text-gray-900 hover:bg-usm-gold-dark mt-4 w-full rounded-md text-sm font-semibold py-3"
                      onClick={() => {
                        setIsOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-16 left-0 right-0 bg-white shadow-md border-t border-gray-100 p-4 z-50"
            >
              <div className="container mx-auto">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      value={localQuery}
                      onChange={(e) => setLocalQuery(e.target.value)}
                      placeholder="Search users, posts, products, events..."
                      className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-usm-gold"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-usm-gold text-black hover:bg-amber-600 rounded-full px-4"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;