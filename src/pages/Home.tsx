import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import geohash from "ngeohash";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";
import toast from "react-hot-toast";
import { X, Globe, Users } from "lucide-react";

import { useNDK } from "../providers/NDKProvider";
import { useAuth } from "../providers/AuthProvider";
import { ListingCard } from "../components/ListingCard";

const CATEGORIES = [
  "Accessories",
  "Clothing",
  "Cosmetics",
  "Electronics",
  "Food",
  "Furniture",
  "Services",
  "Toiletries",
  "Vehicles",
  "Others",
];

export default function Home() {
  const { ndk, isConnected } = useNDK();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [productSearch, setProductSearch] = useState("");
  const [region, setRegion] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    currency: "",
    minPrice: "",
    maxPrice: "",
  });

  const activeTab = searchParams.get("tab") || "all";
  const [followingPubkeys, setFollowingPubkeys] = useState<string[]>([]);
  const [isFollowsLoaded, setIsFollowsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<NDKEvent[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [showNsfw, setShowNsfw] = useState(false);

  useEffect(() => {
    const savedNsfwPref = localStorage.getItem("app_show_nsfw");
    if (savedNsfwPref === "true") {
      setShowNsfw(true);
    }
  }, []);

  useEffect(() => {
    if (!ndk || !isConnected) return;
    if (!currentUser) {
      setFollowingPubkeys([]);
      setIsFollowsLoaded(true);
      return;
    }

    const fetchFollows = async () => {
      try {
        const events = await ndk.fetchEvents({
          kinds: [3],
          authors: [currentUser.pubkey],
        });
        if (events && events.size > 0) {
          const latest = Array.from(events).sort(
            (a, b) => (b.created_at || 0) - (a.created_at || 0),
          )[0];
          const pubkeys = latest.tags
            .filter((t) => t[0] === "p")
            .map((t) => t[1]);
          setFollowingPubkeys(pubkeys);
        } else {
          setFollowingPubkeys([]);
        }
      } catch (e) {
        console.error("Error fetching follows:", e);
      } finally {
        setIsFollowsLoaded(true);
      }
    };

    setIsFollowsLoaded(false);
    fetchFollows();
  }, [ndk, isConnected, currentUser]);

  useEffect(() => {
    setProductSearch(searchParams.get("q") || "");
    setRegion(searchParams.get("region") || "");
    setFilters({
      category: searchParams.get("category") || "",
      currency: searchParams.get("currency") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    if (!ndk || !isConnected || !isFollowsLoaded) return;

    let isMounted = true;

    const q = searchParams.get("q") || "";
    const loc = searchParams.get("region") || "";
    const cat = searchParams.get("category") || "";
    const minP = searchParams.get("minPrice") || "";
    const maxP = searchParams.get("maxPrice") || "";
    const curr = searchParams.get("currency") || "";
    const tab = searchParams.get("tab") || "all";

    const isSearching = !!(q || loc || cat || minP || maxP || curr);
    setHasSearched(isSearching);

    const fetchListings = async () => {
      setIsLoading(true);
      setListings([]);

      if (tab === "following") {
        if (!currentUser || followingPubkeys.length === 0) {
          if (isMounted) setIsLoading(false);
          return;
        }
      }

      try {
        const filter: NDKFilter = {
          kinds: [30402],
          limit: 500,
        };

        if (tab === "following") {
          filter.authors = followingPubkeys;
        }

        if (cat) {
          filter["#t"] = [
            cat
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase(),
          ];
        }

        if (loc) {
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}&email=${import.meta.env.VITE_NOMINATIM_EMAIL}`,
            { headers: { Accept: "application/json" } },
          );
          const geoData = await geoResponse.json();

          if (!geoData || geoData.length === 0) {
            if (isMounted) {
              toast.error("Region not found");
              setIsLoading(false);
            }
            return;
          }

          const { lat, lon } = geoData[0];
          const baseHash = geohash.encode(parseFloat(lat), parseFloat(lon), 8);
          const hashPrecisions = [4, 5, 6, 7, 8].map((len) =>
            baseHash.substring(0, len),
          );
          const neighbors = geohash.neighbors(baseHash.substring(0, 4));
          const finalHashes = Array.from(
            new Set([...hashPrecisions, ...neighbors]),
          );

          filter["#g"] = finalHashes;
        }

        const events = await ndk.fetchEvents(filter, { closeOnEose: true });

        if (!isMounted) return;

        let fetchedListings = Array.from(events).filter((event) =>
          event.tags.some((t) => t[0] === "g"),
        );

        if (!showNsfw) {
          fetchedListings = fetchedListings.filter(
            (event) => !event.tags.some((t) => t[0] === "content-warning"),
          );
        }

        if (q) {
          const normalizeStr = (str: string) =>
            str
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .trim();

          const searchNormalized = normalizeStr(q);

          fetchedListings = fetchedListings.filter((event) => {
            const title = event.tags.find((t) => t[0] === "title")?.[1] || "";
            const content = event.content || "";
            return (
              normalizeStr(title).includes(searchNormalized) ||
              normalizeStr(content).includes(searchNormalized)
            );
          });

          fetchedListings.sort((a, b) => {
            const titleA = normalizeStr(
              a.tags.find((t) => t[0] === "title")?.[1] || "",
            );
            const titleB = normalizeStr(
              b.tags.find((t) => t[0] === "title")?.[1] || "",
            );

            const aHasTitleMatch = titleA.includes(searchNormalized);
            const bHasTitleMatch = titleB.includes(searchNormalized);

            if (aHasTitleMatch && !bHasTitleMatch) return -1;
            if (!aHasTitleMatch && bHasTitleMatch) return 1;

            return (b.created_at || 0) - (a.created_at || 0);
          });
        } else {
          fetchedListings.sort(
            (a, b) => (b.created_at || 0) - (a.created_at || 0),
          );
        }

        if (minP || maxP || curr) {
          fetchedListings = fetchedListings.filter((event) => {
            const priceTag = event.tags.find((t) => t[0] === "price");
            if (!priceTag || !priceTag[1]) return false;

            if (curr && priceTag[2] !== curr) return false;

            const itemPrice = parseFloat(priceTag[1]);
            if (isNaN(itemPrice)) return false;

            const min = minP ? parseFloat(minP) : 0;
            const max = maxP ? parseFloat(maxP) : Infinity;

            return itemPrice >= min && itemPrice <= max;
          });
        }

        if (!isSearching) {
          fetchedListings = fetchedListings.slice(0, 20);
        }

        if (isMounted) {
          setListings(fetchedListings);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed on searching for listings: ", error);
          toast.error("Error performing search");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, [
    searchParams,
    ndk,
    isConnected,
    isFollowsLoaded,
    followingPubkeys,
    currentUser,
    showNsfw,
  ]);

  const handleSearch = () => {
    const params: Record<string, string> = {};

    const currentTab = searchParams.get("tab");
    if (currentTab) params.tab = currentTab;

    if (productSearch) params.q = productSearch;
    if (region) params.region = region;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.currency) params.currency = filters.currency;

    setSearchParams(params);
  };

  const clearSearch = () => {
    setProductSearch("");
    setRegion("");
    setFilters({
      category: "",
      currency: "",
      minPrice: "",
      maxPrice: "",
    });

    const currentTab = searchParams.get("tab");
    setSearchParams(currentTab ? { tab: currentTab } : {});
  };

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams);
    if (newTab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", newTab);
    }
    setSearchParams(params);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-4">
          What and where are you looking for?
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-2 flex items-center">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search for a product (e.g. smartphone, bicycle...)"
              className="w-full p-2 pr-10 rounded bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="City or neighborhood..."
              className="w-full p-2 pr-10 rounded bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {region && (
              <button
                onClick={() => setRegion("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded px-4 py-2 border transition-colors flex items-center justify-center gap-2 cursor-pointer
                ${
                  showFilters
                    ? "bg-accent border-accent text-accent-foreground"
                    : "bg-background border-input text-foreground hover:bg-accent"
                }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>

            <button
              onClick={handleSearch}
              disabled={
                isLoading || (!region && !productSearch && !filters.category)
              }
              className="rounded bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer whitespace-nowrap font-medium"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>

            {hasSearched && (
              <button
                onClick={clearSearch}
                className="rounded px-4 py-2 border border-input bg-background text-foreground hover:bg-accent transition-colors cursor-pointer whitespace-nowrap font-medium"
                title="Clear filters and return"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 fade-in duration-200">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        category: filters.category === cat ? "" : cat,
                      })
                    }
                    className={`px-3 py-1 text-sm rounded-full border transition-colors cursor-pointer
                      ${
                        filters.category === cat
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-input text-foreground hover:bg-accent"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="w-full p-2 rounded bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="w-full p-2 rounded bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Currency
              </label>
              <select
                value={filters.currency}
                onChange={(e) =>
                  setFilters({ ...filters, currency: e.target.value })
                }
                className="w-full p-2 rounded bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm cursor-pointer"
              >
                <option value="">All Currencies</option>
                <option value="USD">USD ($)</option>
                <option value="BRL">BRL (R$)</option>
                <option value="EUR">EUR (€)</option>
                <option value="BTC">BTC (₿)</option>
                <option value="SATS">SATS</option>
              </select>
            </div>
          </div>
        )}
      </section>

      <div className="flex border-b border-border mt-2">
        <button
          onClick={() => handleTabChange("all")}
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer"
          }`}
        >
          <Globe className="w-4 h-4" />
          Global
        </button>
        <button
          onClick={() => handleTabChange("following")}
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
            activeTab === "following"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer"
          }`}
        >
          <Users className="w-4 h-4" />
          Following
        </button>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-4">
          {hasSearched
            ? "Search results"
            : activeTab === "following"
              ? "Recent from following"
              : "Recent Listings"}
        </h3>

        {isLoading ? (
          <p className="text-muted-foreground animate-pulse">
            Loading products...
          </p>
        ) : activeTab === "following" && !currentUser ? (
          <div className="text-center p-8 bg-muted/20 rounded-lg border border-border border-dashed">
            <p className="text-muted-foreground">
              Log in to see listings from people you follow.
            </p>
          </div>
        ) : activeTab === "following" && followingPubkeys.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 rounded-lg border border-border border-dashed">
            <p className="text-muted-foreground">
              You are not following anyone yet.
            </p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 rounded-lg border border-border border-dashed">
            <p className="text-muted-foreground">No listings found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((event) => (
              <ListingCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
