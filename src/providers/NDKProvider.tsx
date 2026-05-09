import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import NDK from "@nostr-dev-kit/ndk";

interface NDKContextType {
  ndk: NDK | null;
  isConnected: boolean;
}

const NDKContext = createContext<NDKContextType>({
  ndk: null,
  isConnected: false,
});

const defaultRelays = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://nostr.mom",
];

export const NDKProvider = ({ children }: { children: ReactNode }) => {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    let activeRelays: string[] = [];
    const savedRelaysJSON = localStorage.getItem("app_relays");

    if (!savedRelaysJSON) {
      activeRelays = [...defaultRelays];
      localStorage.setItem("app_relays", JSON.stringify(activeRelays));
    } else {
      activeRelays = JSON.parse(savedRelaysJSON);
    }

    const ndkInstance = new NDK({
      explicitRelayUrls: activeRelays,
    });

    if (isMounted) {
      setNdk(ndkInstance);
    }

    ndkInstance
      .connect(2500)
      .then(() => {
        if (isMounted) setIsConnected(true);
      })
      .catch((error) => {
        console.error("Some relays failed, but NDK will still try:", error);
        if (isMounted) setIsConnected(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <NDKContext.Provider value={{ ndk, isConnected }}>
      {children}
    </NDKContext.Provider>
  );
};

export const useNDK = () => useContext(NDKContext);
