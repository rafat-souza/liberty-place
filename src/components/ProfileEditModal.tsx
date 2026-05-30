import { useState } from "react";
import { type NDKUserProfile, NDKEvent } from "@nostr-dev-kit/ndk";
import toast from "react-hot-toast";

interface ProfileEditModalProps {
  ndk: any;
  profile: NDKUserProfile | null;
  editPicture: string;
  onSave: (updatedProfile: NDKUserProfile) => void;
  onCancel: () => void;
}

export function ProfileEditModal({
  ndk,
  profile,
  editPicture,
  onSave,
  onCancel,
}: ProfileEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [editName, setEditName] = useState(
    profile?.name || profile?.displayName || "",
  );
  const [editBio, setEditBio] = useState(profile?.about || "");
  const [editLud16, setEditLud16] = useState(profile?.lud16 || "");
  const [editNip05, setEditNip05] = useState(profile?.nip05 || "");

  const handleSave = async () => {
    if (!ndk) return;

    setIsSaving(true);
    const toastId = toast.loading("Saving profile...");

    try {
      const updatedProfile: NDKUserProfile = {
        ...profile,
        name: editName.trim(),
        displayName: editName.trim(),
        about: editBio.trim(),
        lud16: editLud16.trim(),
        nip05: editNip05.trim(),
        image: editPicture.trim(),
        picture: editPicture.trim(),
      };

      const event = new NDKEvent(ndk);
      event.kind = 0;
      event.content = JSON.stringify(updatedProfile);

      await event.publish();

      toast.success("Profile updated successfully!", { id: toastId });
      onSave(updatedProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 pr-16 md:pr-24">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
          Name
        </label>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          disabled={isSaving}
          className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="Your Name"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
          NIP-05 Address
        </label>
        <input
          type="text"
          value={editNip05}
          onChange={(e) => setEditNip05(e.target.value)}
          disabled={isSaving}
          className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="name@domain.com"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
          Lightning Address (LUD-16)
        </label>
        <input
          type="text"
          value={editLud16}
          onChange={(e) => setEditLud16(e.target.value)}
          disabled={isSaving}
          className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="name@getalby.com"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
          Bio
        </label>
        <textarea
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
          disabled={isSaving}
          rows={4}
          className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="rounded border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
