import { NavLink } from "react-router-dom";
import {
  Home,
  Wallet,
  Info,
  ChevronLeft,
  Menu,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isMobileOpen?: boolean;
  closeMobileSidebar?: () => void;
}

export function Sidebar({
  isExpanded,
  toggleSidebar,
  isMobileOpen,
  closeMobileSidebar,
}: SidebarProps) {
  return (
    <aside
      className={`bg-card border-r border-border h-full flex flex-col transition-all duration-300 ease-in-out shrink-0
        fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0
        ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full"}
        ${isExpanded ? "md:w-64" : "md:w-16"}`}
    >
      <div
        className={`p-4 border-b border-border flex items-center ${
          isExpanded || isMobileOpen ? "justify-between" : "justify-center"
        }`}
      >
        {(isExpanded || isMobileOpen) && (
          <span className="font-bold text-foreground truncate">Menu</span>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer hover:text-[#FDC700]"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {isMobileOpen && (
          <button
            onClick={closeMobileSidebar}
            className="md:hidden p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer hover:text-destructive"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2">
        <NavLink
          to="/"
          onClick={closeMobileSidebar}
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-md transition-colors hover:text-[#FDC700] ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            } ${!isExpanded && !isMobileOpen && "md:justify-center"}`
          }
          title="Home"
        >
          <Home className="w-5 h-5 shrink-0" />
          {(isExpanded || isMobileOpen) && <span>Home</span>}
        </NavLink>

        <NavLink
          to="/wallet"
          onClick={closeMobileSidebar}
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-md transition-colors hover:text-[#FDC700]  ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            } ${!isExpanded && !isMobileOpen && "md:justify-center"}`
          }
          title="Wallet"
        >
          <Wallet className="w-5 h-5 shrink-0" />
          {(isExpanded || isMobileOpen) && <span>Wallet</span>}
        </NavLink>

        <NavLink
          to="/settings"
          onClick={closeMobileSidebar}
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-md transition-colors hover:text-[#FDC700]  ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            } ${!isExpanded && !isMobileOpen && "md:justify-center"}`
          }
          title="Settings"
        >
          <Settings className="w-5 h-5 shrink-0" />
          {(isExpanded || isMobileOpen) && <span>Settings</span>}
        </NavLink>

        <NavLink
          to="/about"
          onClick={closeMobileSidebar}
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-md transition-colors hover:text-[#FDC700]  ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            } ${!isExpanded && !isMobileOpen && "md:justify-center"}`
          }
          title="About"
        >
          <Info className="w-5 h-5 shrink-0" />
          {(isExpanded || isMobileOpen) && <span>About</span>}
        </NavLink>
      </nav>
    </aside>
  );
}
