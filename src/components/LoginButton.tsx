import { useState, useEffect } from "react";
import { type NDKUserProfile } from "@nostr-dev-kit/ndk";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import * as nip19 from "nostr-tools/nip19";

import { useAuth } from "../providers/AuthProvider";

export function LoginButton() {
  const {
    currentUser,
    isLoggingIn,
    loginWithExtension,
    loginWithNsec,
    logout,
  } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nsecInput, setNsecInput] = useState("");
  const [profile, setProfile] = useState<NDKUserProfile | null>(null);

  const [newKeys, setNewKeys] = useState<{ nsec: string; npub: string } | null>(
    null,
  );

  useEffect(() => {
    if (currentUser) {
      currentUser.fetchProfile().then((p) => {
        if (p) setProfile(p);
      });
    }
  }, [currentUser]);

  const handleExtensionLogin = async () => {
    await loginWithExtension();
    setIsModalOpen(false);
    toast.success("Connected");
  };

  const handleNsecLogin = async (nsecToUse?: string) => {
    const key = nsecToUse || nsecInput;
    if (!key) return;

    try {
      await loginWithNsec(key);
      setIsModalOpen(false);
      setNewKeys(null);
      setNsecInput("");
      toast.success("Connected");
    } catch (error) {
      toast.error("Invalid nsec");
      console.error(error);
    }
  };

  const handleGenerateAccount = () => {
    try {
      const sk = generateSecretKey();
      const pk = getPublicKey(sk);

      const nsec = nip19.nsecEncode(sk);
      const npub = nip19.npubEncode(pk);

      setNewKeys({ nsec, npub });
    } catch (error) {
      toast.error("Failed to generate keys");
      console.error(error);
    }
  };

  const handleCopyNewNsec = () => {
    if (!newKeys?.nsec) return;
    navigator.clipboard.writeText(newKeys.nsec);
    toast.success("Private key copied! SAVE IT IN A SAFE PLACE.", {
      duration: 4000,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewKeys(null);
    setNsecInput("");
  };

  if (currentUser) {
    const avatar = profile?.image || profile?.picture;
    const name = profile?.name || profile?.displayName || "Profile";

    return (
      <div className="flex items-center gap-4">
        <NavLink
          to="/profile"
          className="flex items-center gap-2 hover:bg-muted p-1.5 pr-4 rounded-full transition-colors border border-transparent hover:border-border"
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-foreground">{name}</span>
        </NavLink>

        <button
          onClick={logout}
          className="rounded bg-destructive px-4 py-2 font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded bg-primary font-semibold px-4 py-2 text-primary-foreground hover:bg-primary/90 cursor-pointer"
      >
        Log in
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-in fade-in">
          <div className="bg-card p-6 rounded-lg shadow-lg w-[400px] max-w-[95vw] border border-border animate-in zoom-in-95">
            {/* Modal */}
            {!newKeys ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Choose a way to log in
                </h2>

                <button
                  onClick={handleExtensionLogin}
                  disabled={isLoggingIn}
                  className="w-full mb-4 rounded bg-primary px-4 py-2 text-sm text-primary-foreground font-semibold 
                  hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  Use Browser Extension (NIP-07)
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">
                    or
                  </span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Insert your Private Key (nsec)
                  </label>
                  <input
                    type="password"
                    value={nsecInput}
                    onChange={(e) => setNsecInput(e.target.value)}
                    placeholder="nsec1..."
                    className="w-full p-2 mb-2 rounded bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => handleNsecLogin()}
                    disabled={isLoggingIn || !nsecInput}
                    className="w-full rounded border border-input bg-background px-4 py-2 text-sm font-semibold 
                    mb-4 text-foreground hover:bg-accent disabled:opacity-50 cursor-pointer"
                  >
                    Login with nsec
                  </button>
                </div>

                <div className="relative flex py-2 items-center mb-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">
                    or
                  </span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    New at Nostr?
                  </label>
                  <button
                    onClick={handleGenerateAccount}
                    className="w-full rounded bg-secondary px-4 py-2 mb-4 text-sm font-semibold text-secondary-foreground
                    hover:bg-secondary/90 cursor-pointer"
                  >
                    Create new Nostr profile
                  </button>
                </div>

                <div className="relative flex py-2 items-center mt-2">
                  <div className="flex-grow border-t border-border"></div>
                  <div className="flex-grow border-t border-border"></div>
                </div>
              </>
            ) : (
              /* Second screen */
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Keys Generated!
                  </h2>
                  <p className="text-sm text-destructive font-bold">
                    WARNING: Copy and save your private key (nsec) below in a
                    safe place. If you lose it, you lose your account forever.
                  </p>
                </div>

                <div className="bg-muted p-3 rounded-md break-all relative">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">
                    Your Private Key (Secret)
                  </p>
                  <p className="text-sm font-mono text-foreground">
                    {newKeys.nsec}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleCopyNewNsec}
                    className="w-full rounded bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy Private Key
                  </button>
                  <button
                    onClick={() => handleNsecLogin(newKeys.nsec)}
                    disabled={isLoggingIn}
                    className="w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                  >
                    I saved it, Log me in
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={closeModal}
              className="mt-4 w-full rounded border border-destructive px-4 py-2 text-sm font-semibold text-destructive 
              cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
