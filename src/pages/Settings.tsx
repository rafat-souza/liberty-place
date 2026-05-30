import { Link } from "react-router-dom";
import { Server, ChevronRight, UploadCloud, Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

export function Settings() {
  const { theme, setTheme } = useTheme();

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
              className="px-4 py-2 border border-border rounded-md hover:bg-muted font-medium text-sm text-foreground 
              transition-colors cursor-pointer"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
