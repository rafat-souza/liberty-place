import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NDKEvent, type NDKUserProfile, NDKUser } from "@nostr-dev-kit/ndk";
import {
  Zap,
  BadgeCheck,
  Share2,
  Copy,
  X,
  UserPlus,
  UserCheck,
  UserMinus,
} from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

import { useNDK } from "../providers/NDKProvider";
import { useAuth } from "../providers/AuthProvider";
import { ListingCard } from "../components/ListingCard";

export function SellerProfile() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const { ndk } = useNDK();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<NDKUserProfile | null>(null);
  const [listings, setListings] = useState<NDKEvent[]>([]);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [currentUserContactList, setCurrentUserContactList] =
    useState<NDKEvent | null>(null);
  const [hoverUnfollow, setHoverUnfollow] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showNsfw, setShowNsfw] = useState(false);

  useEffect(() => {
    const savedNsfwPref = localStorage.getItem("app_show_nsfw");
    if (savedNsfwPref === "true") {
      setShowNsfw(true);
    }
  }, []);

  useEffect(() => {
    if (!ndk || !pubkey) return;

    const fetchSellerData = async () => {
      try {
        const user = new NDKUser({ pubkey });
        user.ndk = ndk;

        const userProfile = await user.fetchProfile().catch(() => null);
        if (userProfile) setProfile(userProfile);

        const userListings = await ndk
          .fetchEvents({ kinds: [30402], authors: [pubkey] })
          .catch(() => new Set<NDKEvent>());

        let fetchedListings = Array.from(userListings);

        if (!showNsfw) {
          fetchedListings = fetchedListings.filter(
            (event) => !event.tags.some((t) => t[0] === "content-warning"),
          );
        }

        fetchedListings.sort(
          (a, b) => (b.created_at || 0) - (a.created_at || 0),
        );

        setListings(fetchedListings);

        const followingEvent = await ndk
          .fetchEvents({ kinds: [3], authors: [pubkey] })
          .catch(() => null);

        if (followingEvent) {
          const followsArray = Array.from(followingEvent)[0];
          if (followsArray) {
            setFollowingCount(
              followsArray.tags.filter((t) => t[0] === "p").length,
            );
          } else {
            setFollowingCount(0);
          }
        }

        const followersEvents = await ndk
          .fetchEvents({ kinds: [3], "#p": [pubkey] })
          .catch(() => null);

        if (followersEvents) {
          setFollowersCount(followersEvents.size);
        }
      } catch (error) {
        console.error("Error fetching seller data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [ndk, pubkey, showNsfw]);

  useEffect(() => {
    if (!ndk || !currentUser || !pubkey) return;

    const checkFollowStatus = async () => {
      try {
        const events = await ndk.fetchEvents({
          kinds: [3],
          authors: [currentUser.pubkey],
        });

        if (events && events.size > 0) {
          const latestContactList = Array.from(events).sort(
            (a, b) => (b.created_at || 0) - (a.created_at || 0),
          )[0];

          setCurrentUserContactList(latestContactList);

          const isUserFollowing = latestContactList.tags.some(
            (t) => t[0] === "p" && t[1] === pubkey,
          );
          setIsFollowing(isUserFollowing);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [ndk, currentUser, pubkey]);

  const handleFollow = async () => {
    if (!currentUser || !ndk || !pubkey || isFollowing) return;

    setIsFollowLoading(true);
    const toastId = toast.loading("Following user...");

    try {
      const newContactListEvent = new NDKEvent(ndk);
      newContactListEvent.kind = 3;

      let newTags = currentUserContactList
        ? [...currentUserContactList.tags]
        : [];

      newTags.push(["p", pubkey, "", ""]);
      newContactListEvent.tags = newTags;

      await newContactListEvent.publish();

      setIsFollowing(true);
      setCurrentUserContactList(newContactListEvent);
      setFollowersCount((prev) => (prev !== null ? prev + 1 : 1));

      toast.success("User followed successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to follow user:", error);
      toast.error("Failed to follow user. Try again.", { id: toastId });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !ndk || !pubkey || !currentUserContactList) return;

    setIsFollowLoading(true);
    setShowUnfollowModal(false);
    const toastId = toast.loading("Unfollowing user...");

    try {
      const newContactListEvent = new NDKEvent(ndk);
      newContactListEvent.kind = 3;

      const newTags = currentUserContactList.tags.filter(
        (t) => !(t[0] === "p" && t[1] === pubkey),
      );

      newContactListEvent.tags = newTags;
      await newContactListEvent.publish();

      setIsFollowing(false);
      setCurrentUserContactList(newContactListEvent);
      setHoverUnfollow(false);

      setFollowersCount((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));

      toast.success("User unfollowed successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to unfollow user:", error);
      toast.error("Failed to unfollow user. Try again.", { id: toastId });
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading)
    return (
      <p className="p-8 text-center text-muted-foreground animate-pulse">
        Loading seller's profile...
      </p>
    );

  const avatar = profile?.image || profile?.picture;
  const name = profile?.name || profile?.displayName || "Anonymous user";
  const bio = profile?.about || "This user still didn't add a bio.";

  const npub = pubkey ? new NDKUser({ pubkey }).npub : "";
  const shareUrl = `${window.location.origin}/#/seller/${pubkey}`;

  const handleCopyNpub = () => {
    if (!npub) return;
    navigator.clipboard.writeText(npub);
    setCopied(true);
    toast.success("npub copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isSelfProfile = currentUser?.pubkey === pubkey;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
            title="Share Profile (QR Code)"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopyNpub}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
            title="Copy npub"
          >
            <Copy className={`w-5 h-5 ${copied ? "text-green-500" : ""}`} />
          </button>
        </div>

        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md shrink-0"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-md shrink-0">
            <span className="text-4xl font-bold text-primary">
              {name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 pr-16 mb-2">
            <h2 className="text-2xl font-bold text-foreground">{name}</h2>

            {!isSelfProfile && (
              <button
                onClick={() =>
                  isFollowing ? setShowUnfollowModal(true) : handleFollow()
                }
                onMouseEnter={() => isFollowing && setHoverUnfollow(true)}
                onMouseLeave={() => isFollowing && setHoverUnfollow(false)}
                disabled={isFollowLoading || !currentUser}
                className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors mt-2 md:mt-0 ${
                  isFollowing
                    ? hoverUnfollow
                      ? "bg-destructive/10 text-destructive border border-destructive cursor-pointer"
                      : "bg-muted text-foreground border border-border cursor-pointer"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                }`}
                title={!currentUser ? "Log in to follow users" : ""}
              >
                {isFollowLoading ? (
                  "Updating..."
                ) : isFollowing ? (
                  hoverUnfollow ? (
                    <>Unfollow</>
                  ) : (
                    <>Following</>
                  )
                ) : (
                  <>Follow</>
                )}
              </button>
            )}
          </div>

          {profile?.nip05 && (
            <p className="flex items-center justify-center md:justify-start gap-1.5 text-sm text-green-600 dark:text-green-500 mt-1 font-medium">
              <BadgeCheck className="w-4 h-4" />
              {profile.nip05}
            </p>
          )}

          {profile?.lud16 && (
            <p className="flex items-center justify-center md:justify-start gap-1.5 text-sm text-yellow-500 mt-1 font-medium">
              <Zap className="w-4 h-4 fill-yellow-500" />
              {profile.lud16}
            </p>
          )}

          <p className="text-muted-foreground mt-2 max-w-xl whitespace-pre-wrap">
            {bio}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">
                {followingCount !== null ? followingCount : "-"}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Following
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">
                {followersCount !== null ? followersCount : "-"}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Followers
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">
          Listings from {name}
        </h3>

        {listings.length === 0 ? (
          <p className="text-muted-foreground bg-muted/20 p-6 rounded-lg text-center border border-border border-dashed">
            This user still doesn't have active listings.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((event) => (
              <ListingCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {showQR && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-xl shadow-lg w-80 border border-border flex flex-col items-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-foreground text-center">
              Share Profile
            </h3>
            <div className="bg-white p-3 rounded-lg border border-border mb-4">
              <QRCodeSVG
                value={shareUrl}
                size={176}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center break-all px-2 select-all">
              {shareUrl}
            </p>
          </div>
        </div>
      )}

      {showUnfollowModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-xl shadow-lg w-80 border border-border flex flex-col items-center animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Unfollow {name}?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Their posts will no longer show up in your Following tab.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowUnfollowModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors text-foreground cursor-pointer border border-input"
              >
                Cancel
              </button>
              <button
                onClick={handleUnfollow}
                className="flex-1 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors cursor-pointer"
              >
                Unfollow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
