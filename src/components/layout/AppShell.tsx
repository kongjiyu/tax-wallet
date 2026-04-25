"use client";

import React from "react";
import { 
  Home, 
  Activity, 
  Wallet, 
  FileText, 
  User, 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ScreenType = 
  | "onboarding" 
  | "consent" 
  | "home" 
  | "activity" 
  | "transaction_detail" 
  | "wallet" 
  | "upload" 
  | "review" 
  | "summary" 
  | "profile";

interface AppShellProps {
  children: React.ReactNode;
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  showBottomNav?: boolean;
}

export function AppShell({ 
  children, 
  activeScreen, 
  onNavigate,
  showBottomNav = true 
}: AppShellProps) {
  
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "wallet", label: "Documents", icon: Wallet },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  const getActiveTab = () => {
    if (["home"].includes(activeScreen)) return "home";
    if (["activity", "transaction_detail"].includes(activeScreen)) return "activity";
    if (["wallet", "upload"].includes(activeScreen)) return "wallet";
    if (["summary", "review"].includes(activeScreen)) return "summary";
    if (activeScreen === "profile") return "profile";
    return "";
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </div>

      {showBottomNav && (
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-100 px-4 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.03)]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ScreenType)}
                className="flex flex-col items-center flex-1 transition-all duration-200"
              >
                <div className={cn(
                  "p-2.5 rounded-2xl transition-all duration-200 mb-1",
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-500"
                )}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold transition-all duration-200",
                  isActive ? "text-blue-600" : "text-slate-500"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
