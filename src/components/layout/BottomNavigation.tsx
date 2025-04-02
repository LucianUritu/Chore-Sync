import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileButton from "./ProfileButton";

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: Users, label: "Roommates", path: "/roommates" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around px-4 shadow-md z-50">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "nav-item transition-colors duration-200 flex flex-col items-center",
              isActive ? "text-choresync-blue" : "text-choresync-darkGray"
            )}
          >
            <item.icon size={20} className="mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
      <ProfileButton isActive={currentPath === "/profile"} />
    </div>
  );
};

export default BottomNavigation;
