import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Server,
  ChevronRight,
  UploadCloud,
  Moon,
  Sun,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "../providers/AuthProvider";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();

  const [showNsfw, setShowNsfw] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setShowNsfw(false);
      return;
    }

    const storageKey = `app_show_nsfw_${currentUser.pubkey}`;
    const savedNsfwPref = localStorage.getItem(storageKey);

    if (savedNsfwPref === "true") {
      setShowNsfw(true);
    } else {
      setShowNsfw(false);
    }
  }, [currentUser]);

  const handleToggleNsfw = () => {
    const newValue = !showNsfw;
    setShowNsfw(newValue);

    if (currentUser) {
      const storageKey = `app_show_nsfw_${currentUser.pubkey}`;
      localStorage.setItem(storageKey, newValue.toString());
    } else {
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-bold text-foreground mt-4">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your app preferences and Nostr connections.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {/* Relays */}
          <Link
            to="/settings/relays"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Relays
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your connections to the Nostr network
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          {/* Media Servers */}
          <Link
            to="/settings/media"
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Media Servers
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage servers for image and video uploads
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>

          {/* Theme */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {theme === "dark" ? (
                  <Moon className="w-6 h-6 text-primary" />
                ) : (
                  <Sun className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Appearance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Toggle between dark and light mode
                </p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted font-medium text-sm text-foreground transition-colors cursor-pointer"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          {/* NSFW Content Filter */}
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Sensitive Content
                </h2>
                <p className="text-sm text-muted-foreground">
                  Show listings marked as NSFW (Not Safe For Work)
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleNsfw}
              disabled={!currentUser}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                ${!currentUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} 
                outline-none focus:outline-none select-none ${
                  showNsfw ? "bg-gray-400" : "bg-input dark:bg-zinc-700"
                }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
              role="switch"
              aria-checked={showNsfw}
              title={!currentUser ? "Log in to change this setting" : ""}
            >
              <span className="sr-only">Show Sensitive Content</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  showNsfw ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
