import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, Home, Users, Settings, Search } from "lucide-react";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/browse", icon: Search, label: "Browse Books" },
    { to: "/members", icon: Users, label: "Member Dashboard" },
    { to: "/librarian", icon: Settings, label: "Librarian Panel" },
  ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">
              LibroHub
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                )}
              </NavLink>
            ))}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <BookOpen className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;