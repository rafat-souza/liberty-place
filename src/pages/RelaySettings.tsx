import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNDK } from "../providers/NDKProvider";
import toast from "react-hot-toast";
import { Server, Plus, Trash2, ChevronLeft } from "lucide-react";

export function RelaySettings() {
  const { ndk } = useNDK();
  const [relays, setRelays] = useState<string[]>([]);
  const [newRelay, setNewRelay] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const updateRelaysList = () => {
    if (!ndk) return;
    const connectedRelays = Array.from(ndk.pool.relays.keys());
    setRelays(connectedRelays);
  };

  useEffect(() => {
    updateRelaysList();

    if (ndk) {
      ndk.pool.on("relay:connect", updateRelaysList);
      ndk.pool.on("relay:disconnect", updateRelaysList);
    }

    return () => {
      if (ndk) {
        ndk.pool.removeAllListeners("relay:connect");
        ndk.pool.removeAllListeners("relay:disconnect");
      }
    };
  }, [ndk]);

  const handleAddRelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ndk) return;

    const url = newRelay.trim().toLowerCase();

    if (!url) return;

    if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
      toast.error("Relay URL must start with wss:// or ws://");
      return;
    }

    if (relays.includes(url)) {
      toast.error("Relay is already in your list!");
      return;
    }

    setIsAdding(true);
    const toastId = toast.loading("Connecting to relay...");

    try {
      const relay = ndk.addExplicitRelay(url);
      await relay.connect();

      toast.success("Relay added and connected!", { id: toastId });
      setNewRelay("");
      updateRelaysList();

      const savedRelays = JSON.parse(
        localStorage.getItem("customRelays") || "[]",
      );
      if (!savedRelays.includes(url)) {
        localStorage.setItem(
          "customRelays",
          JSON.stringify([...savedRelays, url]),
        );
      }
    } catch (error) {
      console.error("Failed to add relay:", error);
      toast.error("Failed to connect to relay.", { id: toastId });
      ndk.pool.removeRelay(url);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveRelay = (url: string) => {
    if (!ndk) return;

    ndk.pool.removeRelay(url);
    updateRelaysList();
    toast.success("Relay removed");

    const savedRelays = JSON.parse(
      localStorage.getItem("customRelays") || "[]",
    );
    const updatedSaved = savedRelays.filter((r: string) => r !== url);
    localStorage.setItem("customRelays", JSON.stringify(updatedSaved));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-4xl font-bold text-foreground">
          Relay Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage the servers that power your decentralized Nostr network.
        </p>
      </div>

      <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <Server className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Connect a Relay
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            You are currently connected to {relays.length} relays.
          </p>

          <form onSubmit={handleAddRelay} className="flex gap-3">
            <input
              type="text"
              value={newRelay}
              onChange={(e) => setNewRelay(e.target.value)}
              placeholder="wss://relay.example.com"
              className="flex-1 px-4 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={!newRelay.trim() || isAdding}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isAdding ? (
                "Adding..."
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Relay
                </>
              )}
            </button>
          </form>
        </div>

        <div className="divide-y divide-border">
          {relays.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No relays connected.
            </div>
          ) : (
            relays.map((url) => (
              <div
                key={url}
                className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="font-medium text-sm text-foreground">
                    {url}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveRelay(url)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                  title="Remove Relay"
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
