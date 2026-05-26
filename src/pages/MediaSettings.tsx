import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { UploadCloud, Plus, Trash2, ChevronLeft } from "lucide-react";

export function MediaSettings() {
  const [serversData, setServersData] = useState<string[]>([]);
  const [newServer, setNewServer] = useState("");

  useEffect(() => {
    const savedServers = JSON.parse(
      localStorage.getItem("app_media_servers") || '["https://nostr.build"]',
    );
    setServersData(savedServers);
  }, []);

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();

    let url = newServer.trim().toLowerCase();

    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    if (serversData.includes(url)) {
      toast.error("Media server is already in your list!");
      return;
    }

    const updatedServers = [...serversData, url];
    setServersData(updatedServers);
    localStorage.setItem("app_media_servers", JSON.stringify(updatedServers));
    setNewServer("");
    toast.success("Media server added!");
  };

  const handleRemoveServer = (urlToRemove: string) => {
    if (serversData.length === 1) {
      toast.error("You must have at least one media server configured.");
      return;
    }

    const updatedServers = serversData.filter((url) => url !== urlToRemove);
    setServersData(updatedServers);
    localStorage.setItem("app_media_servers", JSON.stringify(updatedServers));
    toast.success("Media server removed");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors mt-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-4xl font-bold text-foreground">
          Media Server Configuration
        </h1>
        <p className="text-muted-foreground mt-4">
          Manage the servers used to host your uploaded images and videos (e.g.
          Blossom servers).
        </p>
        <p className="text-muted-foreground mt-2">
          Default provider:{" "}
          <a className="text-white" href="https://nostr.build" target="_blank">
            https://nostr.build
          </a>
        </p>
      </div>

      <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <UploadCloud className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Add a Media Server
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            You have {serversData.length} media server(s) configured.
          </p>

          <form onSubmit={handleAddServer} className="flex gap-3">
            <input
              type="text"
              value={newServer}
              onChange={(e) => setNewServer(e.target.value)}
              placeholder="https://nostr.build"
              className="flex-1 px-4 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={!newServer.trim()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Server
            </button>
          </form>
        </div>

        <div className="divide-y divide-border">
          {serversData.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No media servers configured.
            </div>
          ) : (
            serversData.map((serverUrl) => (
              <div
                key={serverUrl}
                className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="relative flex h-3 w-3" title="Active">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>

                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">
                      {serverUrl}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      HTTP SERVER
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveServer(serverUrl)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                  title="Remove Server"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
