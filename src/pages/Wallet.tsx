import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { NWCClient } from "@getalby/sdk/nwc";
import {
  Wallet as WalletIcon,
  Zap,
  Unplug,
  Key,
  Info,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Coins,
  Loader2,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";

export function Wallet() {
  const { currentUser } = useAuth();

  const [nwcUrl, setNwcUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const [balance, setBalance] = useState<number | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setSavedUrl(null);
      setShowSecret(false);
      setShowBalance(false);
      setBalance(null);
      return;
    }

    const stored = localStorage.getItem(`nwc_url_${currentUser.pubkey}`);
    if (stored) {
      setSavedUrl(stored);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!savedUrl) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setIsFetchingBalance(true);
      try {
        const nwcClient = new NWCClient({ nostrWalletConnectUrl: savedUrl });
        const response = await nwcClient.getBalance();

        if (response && typeof response.balance === "number") {
          setBalance(response.balance);
        }
      } catch (error) {
        console.error("Falha ao buscar saldo via NWC:", error);
        setBalance(null);
      } finally {
        setIsFetchingBalance(false);
      }
    };

    fetchBalance();
  }, [savedUrl]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const url = nwcUrl.trim();

    if (!url) return;

    if (!url.startsWith("nostr+walletconnect://")) {
      toast.error("Invalid format. URL must start with nostr+walletconnect://");
      return;
    }

    localStorage.setItem(`nwc_url_${currentUser.pubkey}`, url);
    setSavedUrl(url);
    setNwcUrl("");
    toast.success("Wallet connected successfully!");
  };

  const handleDisconnect = () => {
    if (!currentUser) return;

    localStorage.removeItem(`nwc_url_${currentUser.pubkey}`);
    setSavedUrl(null);
    setShowSecret(false);
    setShowBalance(false);
    setBalance(null);
    toast.success("Wallet disconnected.");
  };

  const maskUrl = (url: string) => {
    const prefix = "nostr+walletconnect://";
    if (url.startsWith(prefix)) {
      return prefix + "••••••••••••••••••••••••••••••••••••••••••••";
    }
    return "••••••••••••••••••••••••••••••••••••••••••••";
  };

  if (!currentUser) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Please log in to manage your wallet connection.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <WalletIcon className="w-8 h-8 text-primary" />
          Wallet
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect your Lightning wallet using Nostr Wallet Connect (NWC) for
          one-click payments in the chat.
        </p>
      </div>

      <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {savedUrl ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Wallet Connected
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    {isFetchingBalance ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : balance !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {showBalance
                            ? `${balance.toLocaleString()} sats`
                            : "•••••••• sats"}
                        </span>
                        <button
                          onClick={() => setShowBalance(!showBalance)}
                          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={showBalance ? "Hide balance" : "Show balance"}
                        >
                          {showBalance ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-sm text-muted-foreground"
                        title="The current NWC string does not have 'get_balance' permissions."
                      >
                        Balance hidden (permission denied by your wallet)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors font-medium cursor-pointer"
              >
                <Unplug className="w-4 h-4" />
                Disconnect
              </button>
            </div>

            <div className="bg-muted p-4 rounded-md border border-border flex items-start gap-3">
              <Key className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  Connection Secret
                </p>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-foreground font-mono break-all select-all">
                    {showSecret ? savedUrl : maskUrl(savedUrl)}
                  </p>
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-1">
              <LinkIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Link a Wallet
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Paste your NWC pairing secret below. Providers like Alby, Mutiny,
              or Strike generate this link for you.
            </p>

            <form onSubmit={handleConnect} className="flex flex-col gap-4">
              <input
                type="password"
                value={nwcUrl}
                onChange={(e) => setNwcUrl(e.target.value)}
                placeholder="nostr+walletconnect://..."
                className="w-full px-4 py-3 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!nwcUrl.trim()}
                className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                Connect Wallet
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="bg-muted/30 p-6 rounded-xl border border-border">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          How it works
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nostr Wallet Connect (NIP-47) grants this application permission to
          request invoice payments directly from your Lightning wallet node.
          Your connection string is stored securely in your browser's local
          storage and is never sent to any centralized server. You can revoke
          this connection at any time from your wallet provider's dashboard.
        </p>
      </section>
    </div>
  );
}
