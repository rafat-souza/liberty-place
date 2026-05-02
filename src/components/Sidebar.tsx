import { NavLink } from "react-router-dom";
import { Home, Info, ChevronLeft, ChevronRight, Menu } from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isExpanded, toggleSidebar }: SidebarProps) {
  return (
    <aside
      className={`bg-card border-r border-border h-full flex flex-col transition-all duration-300 ease-in-out shrink-0
        ${isExpanded ? "w-64" : "w-16"}`}
    >
      <div
        className={`p-4 border-b border-border flex items-center ${isExpanded ? "justify-between" : "justify-center"}`}
      >
        {isExpanded && (
          <span className="font-bold text-foreground truncate">Menu</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-md transition-colors ${
              isActive
                ? "bg-primary/10 text-primary font-medium hover:text-[#FDC700]"
                : "text-muted-foreground hover:bg-muted hover:text-[#FDC700]"
            } ${!isExpanded && "justify-center"}`
          }
          title="Home"
        >
          <Home className="w-5 h-5 shrink-0" />
          {isExpanded && <span>Home</span>}
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-md transition-colors ${
              isActive
                ? "bg-primary/10 text-primary font-medium hover:text-[#FDC700]"
                : "text-muted-foreground hover:bg-muted hover:text-[#FDC700]"
            } ${!isExpanded && "justify-center"}`
          }
          title="About"
        >
          <Info className="w-5 h-5 shrink-0" />
          {isExpanded && <span>About</span>}
        </NavLink>
      </nav>
    </aside>
  );
}
