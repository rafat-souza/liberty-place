import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Server, Plus, Trash2, ChevronLeft } from "lucide-react";
import { NDKEvent } from "@nostr-dev-kit/ndk";

import { useNDK } from "../providers/NDKProvider";
import { useAuth } from "../providers/AuthProvider";

type RelayStatus = "connecting" | "connected" | "disconnected";

interface RelayData {
  url: string;
  status: RelayStatus;
  rawStatus: any;
}

export function RelaySettings() {
  const { ndk } = useNDK();
  const { currentUser } = useAuth();
  const [relaysData, setRelaysData] = useState<RelayData[]>([]);
  const [newRelay, setNewRelay] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const getStatusString = (relay: any): RelayStatus => {
    const s = relay.status;
    const wsStatus = relay.connectivity?.ws?.readyState;

    if (s === 1 || s === 6 || s === 7) return "connected";
    if (s === 0 || s === 4) return "connecting";

    if (typeof s === "string") {
      const up = s.toUpperCase();
      if (up === "CONNECTED" || up.includes("AUTH")) return "connected";
      if (up === "CONNECTING" || up === "RECONNECTING") return "connecting";
    }

    if (wsStatus === 1) return "connected";
    if (wsStatus === 0) return "connecting";

    return "disconnected";
  };

  const updateRelaysList = useCallback(() => {
    if (!ndk) return;

    const relayObjects = Array.from(ndk.pool.relays.values());
    const mappedRelays = relayObjects.map((relay) => ({
      url: relay.url,
      status: getStatusString(relay),
      rawStatus:
        relay.status !== undefined
          ? relay.status
          : (relay as any).connectivity?.ws?.readyState,
    }));

    setRelaysData(mappedRelays);
  }, [ndk]);

  useEffect(() => {
    updateRelaysList();

    if (ndk) {
      ndk.pool.on("relay:connect", updateRelaysList);
      ndk.pool.on("relay:disconnect", updateRelaysList);
      ndk.pool.on("relay:ready", updateRelaysList);
      ndk.pool.on("relay:auth", updateRelaysList);
    }

    const interval = setInterval(() => {
      updateRelaysList();
    }, 2000);

    return () => {
      if (ndk) {
        ndk.pool.removeAllListeners("relay:connect");
        ndk.pool.removeAllListeners("relay:disconnect");
        ndk.pool.removeAllListeners("relay:ready");
        ndk.pool.removeAllListeners("relay:auth");
      }
      clearInterval(interval);
    };
  }, [ndk, updateRelaysList]);

  const publishRelayListToNetwork = async (urlsToSave: string[]) => {
    if (!ndk || !currentUser) return;

    try {
      const event = new NDKEvent(ndk);
      event.kind = 10002;
      event.tags = urlsToSave.map((url) => ["r", url]);

      await event.publish();
      console.log("[NIP-65] Lista de Relays salva na rede com sucesso!");
    } catch (error) {
      console.error("[NIP-65] Falha ao salvar relays na rede:", error);
    }
  };

  const handleAddRelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ndk) return;

    const url = newRelay.trim().toLowerCase();

    if (!url) return;

    if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
      toast.error("Relay URL must start with wss:// or ws://");
      return;
    }

    if (relaysData.some((r) => r.url === url)) {
      toast.error("Relay is already in your list!");
      return;
    }

    setIsAdding(true);
    setRelaysData((prev) => [
      ...prev,
      { url, status: "connecting", rawStatus: 0 },
    ]);
    const toastId = toast.loading("Connecting to relay...");

    try {
      const relay = ndk.addExplicitRelay(url);
      await relay.connect();

      toast.success("Relay added and connected!", { id: toastId });
      setNewRelay("");

      const savedRelays = JSON.parse(
        localStorage.getItem("app_relays") || "[]",
      );
      let newSavedList = savedRelays;

      if (!savedRelays.includes(url)) {
        newSavedList = [...savedRelays, url];
        localStorage.setItem("app_relays", JSON.stringify(newSavedList));
      }

      await publishRelayListToNetwork(newSavedList);
    } catch (error) {
      console.error("Failed to add relay:", error);
      toast.error("Failed to connect to relay.", { id: toastId });
      ndk.pool.removeRelay(url);
    } finally {
      setIsAdding(false);
      updateRelaysList();
    }
  };

  const handleRemoveRelay = async (url: string) => {
    if (!ndk) return;

    ndk.pool.removeRelay(url);
    updateRelaysList();
    toast.success("Relay removed");

    const savedRelays = JSON.parse(localStorage.getItem("app_relays") || "[]");
    const updatedSaved = savedRelays.filter((r: string) => r !== url);
    localStorage.setItem("app_relays", JSON.stringify(updatedSaved));

    await publishRelayListToNetwork(updatedSaved);
  };

  const StatusDot = ({ status }: { status: RelayStatus }) => {
    if (status === "connected") {
      return (
        <span className="relative flex h-3 w-3" title="Connected">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      );
    }
    if (status === "connecting") {
      return (
        <span className="relative flex h-3 w-3" title="Connecting...">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
        </span>
      );
    }
    return (
      <span className="relative flex h-3 w-3" title="Disconnected">
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    );
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
          Relay Configuration
        </h1>
        <p className="text-muted-foreground mt-4">
          Manage the servers that power your decentralized Nostr network.
        </p>
        <p className="text-muted-foreground mt-2">
          Changes here are automatically synced to your Nostr profile (NIP-65).
        </p>
        <p className="text-muted-foreground mt-2">
          You can search for relays at:{" "}
          <a className="text-white" href="https://nostr.watch" target="_blank">
            https://nostr.watch
          </a>
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
            You have {relaysData.length} relays configured.
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
          {relaysData.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No relays connected.
            </div>
          ) : (
            relaysData.map((relay) => (
              <div
                key={relay.url}
                className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <StatusDot status={relay.status} />

                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">
                      {relay.url}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {relay.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveRelay(relay.url)}
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
