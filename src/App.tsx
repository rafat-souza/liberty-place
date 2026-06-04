import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

import { ChatSidebar } from "./components/ChatSidebar";
import { useNDK } from "./providers/NDKProvider";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";

export default function App() {
  const { isConnected } = useNDK();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-foreground">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="shrink-0 border-b bg-card p-3 sm:p-4 shadow-sm z-50">
        <Navbar
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar
          isExpanded={isSidebarExpanded}
          toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />

        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <main
          className="flex-1 overflow-y-auto p-4 flex flex-col [&::-webkit-scrollbar]:w-1.5 
            [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <div className="container mx-auto pb-20 md:pb-0 flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>

        <ChatSidebar />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
