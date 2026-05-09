import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Paperclip, Loader2 } from "lucide-react";
import { useNDK } from "../providers/NDKProvider";

interface ChatFileUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadStateChange: (isUploading: boolean) => void;
  disabled: boolean;
}

export function ChatFileUpload({
  onUploadSuccess,
  onUploadStateChange,
  disabled,
}: ChatFileUploadProps) {
  const { ndk } = useNDK();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !ndk) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File is too large. Limit is 25MB.");
      return;
    }

    setIsUploading(true);
    onUploadStateChange(true);
    const toastId = toast.loading("Uploading media...");

    try {
      const uploadUrl = "https://nostr.build/api/v2/upload/files";

      const authEvent = new NDKEvent(ndk);
      authEvent.kind = 27235;
      authEvent.tags = [
        ["u", uploadUrl],
        ["method", "POST"],
      ];

      await authEvent.sign();

      const encodedEvent = btoa(
        unescape(encodeURIComponent(JSON.stringify(authEvent.rawEvent()))),
      );
      const authHeader = `Nostr ${encodedEvent}`;

      const formData = new FormData();
      formData.append("fileToUpload", file);

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const responseData = await response.json();

      let fileUrl = "";
      if (responseData?.data?.[0]?.url) {
        fileUrl = responseData.data[0].url;
      } else if (responseData?.url) {
        fileUrl = responseData.url;
      }

      if (fileUrl) {
        toast.success("Upload successful!", { id: toastId });
        onUploadSuccess(fileUrl);
      } else {
        throw new Error("Upload response missing URL.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file.", { id: toastId });
    } finally {
      setIsUploading(false);
      onUploadStateChange(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        title="Attach file"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Paperclip className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
