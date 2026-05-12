import { useState } from "react";
import toast from "react-hot-toast";
import { NWCClient } from "@getalby/sdk/nwc";
import { Zap, X, Send, Loader2 } from "lucide-react";
import { ChatFileUpload } from "./ChatFileUpload";

interface ChatInputBarProps {
  currentUserPubkey: string;
  activeContact: string;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  onSendText: () => void;
  sendMessage: (contact: string, msg: string) => Promise<boolean>;
}

export function ChatInputBar({
  currentUserPubkey,
  activeContact,
  inputValue,
  setInputValue,
  onSendText,
  sendMessage,
}: ChatInputBarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRequestingSats, setIsRequestingSats] = useState(false);
  const [satsAmount, setSatsAmount] = useState("");
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const handleToggleSatsRequest = () => {
    const nwcUrl = localStorage.getItem(`nwc_url_${currentUserPubkey}`);
    if (!nwcUrl) {
      toast.error(
        "Connect your wallet by inserting your NWC key at the 'Wallet' page",
      );
      return;
    }
    setIsRequestingSats(!isRequestingSats);
    setSatsAmount("");
  };

  const handleSendSatsRequest = async () => {
    if (!activeContact) return;
    const amount = parseInt(satsAmount);
    if (isNaN(amount) || amount <= 0) return;

    const nwcUrl = localStorage.getItem(`nwc_url_${currentUserPubkey}`);
    if (!nwcUrl) {
      toast.error(
        "Connect your wallet by inserting your NWC key at the 'Wallet' page",
      );
      return;
    }

    setIsGeneratingInvoice(true);
    const toastId = toast.loading("Generating invoice...");

    try {
      const nwcClient = new NWCClient({ nostrWalletConnectUrl: nwcUrl });
      const response = await nwcClient.makeInvoice({
        amount: amount * 1000,
        description: "Payment request from Marketplace",
      });

      if (response && response.invoice) {
        const messageText = `[Lightning Request: ${amount} sats]\n\nlightning:${response.invoice}`;
        const success = await sendMessage(activeContact, messageText);

        if (success) {
          setIsRequestingSats(false);
          setSatsAmount("");
          toast.success("Request sent!", { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
      } else {
        throw new Error("No invoice generated");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Error generating invoice. Does your wallet have support for NWC?",
        { id: toastId },
      );
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <ChatFileUpload
        onUploadSuccess={(url) =>
          setInputValue((prev) => (prev ? `${prev}\n${url}` : url))
        }
        onUploadStateChange={setIsUploading}
        disabled={isGeneratingInvoice}
      />

      <button
        onClick={handleToggleSatsRequest}
        disabled={isUploading || isGeneratingInvoice}
        className={`p-2 rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${
          isRequestingSats
            ? "bg-yellow-500/20 text-yellow-500"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
        title="Request Sats"
      >
        <Zap className="w-5 h-5" />
      </button>

      {isRequestingSats ? (
        <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
          <input
            type="number"
            min="1"
            value={satsAmount}
            onChange={(e) => setSatsAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendSatsRequest()}
            placeholder="Amount in sats..."
            disabled={isGeneratingInvoice}
            className="flex-1 px-3 py-2 rounded-md bg-background border border-yellow-500/50 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50"
          />
          <button
            onClick={handleToggleSatsRequest}
            disabled={isGeneratingInvoice}
            className="p-1 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendText()}
          placeholder={isUploading ? "Uploading file..." : "Type a message..."}
          disabled={isUploading || isGeneratingInvoice}
          className="flex-1 px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      )}

      <button
        onClick={isRequestingSats ? handleSendSatsRequest : onSendText}
        disabled={
          isRequestingSats
            ? !satsAmount || isGeneratingInvoice
            : !inputValue.trim() || isUploading
        }
        className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
      >
        {isGeneratingInvoice ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
