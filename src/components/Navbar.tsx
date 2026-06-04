import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { Menu, Plus } from "lucide-react";

import { LoginButton } from "./LoginButton";
import { useChatStore } from "@/store/chatStore";
import { useAuth } from "@/providers/AuthProvider";
import LibertyPlaceLogo from "../assets/LibertyPlaceLogo.png";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { toggleOpen, contacts } = useChatStore();
  const { currentUser } = useAuth();

  const handleChatClick = () => {
    if (!currentUser) {
      toast.error("You must be logged in to send messages.");
      return;
    }
    toggleOpen();
  };

  const totalUnread = contacts.reduce(
    (sum, contact) => sum + contact.unreadCount,
    0,
  );
  return (
    <div className="container flex items-center justify-between mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-foreground hover:bg-accent rounded-md transition-colors shrink-0"
          aria-label="Toggle Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <NavLink to="/" className="flex items-center shrink-0" reloadDocument>
          <img
            src={LibertyPlaceLogo}
            alt="Liberty Place Logo"
            className="h-7 sm:h-8 md:h-10 w-auto object-contain shrink-0 hover:opacity-80 transition-opacity"
          />
        </NavLink>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-8 shrink-0">
        <button
          onClick={handleChatClick}
          className="relative p-2 rounded-full hover:bg-accent text-foreground transition-colors cursor-pointer shrink-0"
          title="Messages"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>

          {totalUnread > 0 && (
            <span
              className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500
                 text-[10px] font-bold text-white shadow-sm"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>

        <NavLink
          to="/new"
          className="bg-yellow-400 text-black p-2 md:px-4 md:py-2 rounded-full font-semibold shadow-sm flex items-center justify-center shrink-0"
          title="Sell Product"
        >
          <span className="hidden md:inline">Sell Product</span>
          <Plus className="w-5 h-5 md:hidden" />
        </NavLink>

        <div className="shrink-0 flex items-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
