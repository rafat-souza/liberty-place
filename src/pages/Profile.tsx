import { useEffect, useState, useRef } from "react";
import { NDKEvent, type NDKUserProfile } from "@nostr-dev-kit/ndk";
import toast from "react-hot-toast";
import { Pencil, X, Zap, BadgeCheck, Share2, Copy, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useNDK } from "../providers/NDKProvider";
import { useAuth } from "../providers/AuthProvider";

import { ProfileEditModal } from "../components/ProfileEditModal";
import { ProfileListings } from "../components/ProfileListings";

export function Profile() {
  const { ndk } = useNDK();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<NDKUserProfile | null>(null);
  const [listings, setListings] = useState<NDKEvent[]>([]);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editPicture, setEditPicture] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ndk || !currentUser) return;

    const fetchProfileData = async () => {
      try {
        const userProfile = await currentUser.fetchProfile().catch(() => null);
        if (userProfile) {
          setProfile(userProfile);
          setEditPicture(userProfile.image || userProfile.picture || "");
        }

        const userListings = await ndk
          .fetchEvents({ kinds: [30402], authors: [currentUser.pubkey] })
          .catch(() => new Set<NDKEvent>());
        setListings(Array.from(userListings));

        const followingEvent = await ndk
          .fetchEvents({ kinds: [3], authors: [currentUser.pubkey] })
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
          .fetchEvents({ kinds: [3], "#p": [currentUser.pubkey] })
          .catch(() => null);
        if (followersEvents) {
          setFollowersCount(followersEvents.size);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [ndk, currentUser]);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !ndk || !currentUser) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image (JPEG, PNG, WEBP, GIF).");
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading("Requesting authorization...");

    try {
      const savedServersStr = localStorage.getItem("app_media_servers");
      const savedServers: string[] = savedServersStr
        ? JSON.parse(savedServersStr)
        : ["https://nostr.build"];

      if (savedServers.length === 0) {
        throw new Error("No media servers configured.");
      }

      const baseServer = savedServers.includes("https://nostr.build")
        ? "https://nostr.build"
        : savedServers[0];

      let uploadUrl = `${baseServer}/upload`;
      if (baseServer.includes("nostr.build")) {
        uploadUrl = "https://nostr.build/api/v2/nip96/upload";
      }

      const authEvent = new NDKEvent(ndk);
      authEvent.kind = 27235;
      authEvent.content = "";
      authEvent.tags = [
        ["u", uploadUrl],
        ["method", "POST"],
      ];

      await authEvent.sign();

      const base64Event = btoa(
        unescape(encodeURIComponent(JSON.stringify(authEvent.rawEvent()))),
      );
      const authHeader = `Nostr ${base64Event}`;

      toast.loading("Uploading photo...", { id: toastId });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let imageUrl = "";

      if (data.status === "success" && data.nip94_event?.tags) {
        const urlTag = data.nip94_event.tags.find(
          (t: string[]) => t[0] === "url",
        );
        if (urlTag) imageUrl = urlTag[1];
      } else if (data.url) {
        imageUrl = data.url;
      } else if (data.file && data.file.url) {
        imageUrl = data.file.url;
      } else {
        throw new Error("Could not locate image URL in server response.");
      }

      if (!imageUrl) throw new Error("Image URL is empty");

      setEditPicture(imageUrl);
      toast.success("Photo uploaded! Click 'Save Changes'.", { id: toastId });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message || "Try again."}`, {
        id: toastId,
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startEditMode = () => {
    setEditPicture(profile?.image || profile?.picture || "");
    setIsEditing(true);
  };

  if (!currentUser)
    return (
      <p className="p-8 text-center">Please log in to view your profile.</p>
    );
  if (isLoading) return <p className="p-8 text-center">Loading profile...</p>;

  const displayPicture = isEditing
    ? editPicture
    : profile?.image || profile?.picture;
  const name = profile?.name || profile?.displayName || "Anonymous User";
  const bio = profile?.about || "No biography provided.";

  const npub = currentUser?.npub || "";
  const shareUrl = currentUser
    ? `${window.location.origin}/#/seller/${currentUser.pubkey}`
    : "";

  const handleCopyNpub = () => {
    if (!npub) return;
    navigator.clipboard.writeText(npub);
    setCopied(true);
    toast.success("npub copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <section className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {!isEditing && (
            <>
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
              <button
                onClick={startEditMode}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="relative group shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/jpeg, image/png, image/webp, image/gif"
            className="hidden"
          />

          {displayPicture ? (
            <img
              src={displayPicture}
              alt={name}
              className={`w-32 h-32 rounded-full object-cover border-4 border-background shadow-md ${isEditing ? "cursor-pointer group-hover:opacity-70 transition-opacity" : ""} ${isUploadingPhoto ? "opacity-50 animate-pulse" : ""}`}
              onClick={() => isEditing && fileInputRef.current?.click()}
            />
          ) : (
            <div
              className={`w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-md ${isEditing ? "cursor-pointer hover:bg-primary/20 transition-colors" : ""}`}
              onClick={() => isEditing && fileInputRef.current?.click()}
            >
              <span className="text-4xl font-bold text-primary">
                {name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {isEditing && !isUploadingPhoto && (
            <div
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {isEditing ? (
          <ProfileEditModal
            ndk={ndk}
            profile={profile}
            editPicture={editPicture}
            onSave={(updatedProfile) => {
              setProfile(updatedProfile);
              setIsEditing(false);
            }}
            onCancel={() => {
              setEditPicture(profile?.image || profile?.picture || "");
              setIsEditing(false);
            }}
          />
        ) : (
          <div className="flex-1 text-center md:text-left w-full pr-10">
            <h2 className="text-2xl font-bold text-foreground pr-24">{name}</h2>

            {profile?.nip05 && (
              <p className="flex items-center justify-center md:justify-start gap-1.5 text-sm text-gray-600 dark:text-gray-500 mt-1 font-medium">
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

            <div className="flex items-center justify-center md:justify-start gap-6 mt-6 pt-4 border-t border-border">
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
        )}
      </section>

      <ProfileListings
        ndk={ndk}
        listings={listings}
        setListings={setListings}
      />

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
    </div>
  );
}
