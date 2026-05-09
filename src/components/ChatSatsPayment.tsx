import { useState } from "react";
import toast from "react-hot-toast";
import { NWCClient } from "@getalby/sdk/nwc";
import { Zap, Loader2 } from "lucide-react";

interface ChatSatsPaymentProps {
  invoice: string;
  satsAmount: string;
  isMine: boolean;
  currentUserPubkey: string;
}

export function ChatSatsPayment({
  invoice,
  satsAmount,
  isMine,
  currentUserPubkey,
}: ChatSatsPaymentProps) {
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);

  const handlePayInvoice = async () => {
    const amount = parseInt(satsAmount);
    const nwcUrl = localStorage.getItem(`nwc_url_${currentUserPubkey}`);

    if (!nwcUrl) {
      toast.error("Connect your NWC key from your wallet at the 'Wallet' page");
      return;
    }

    setPayingInvoice(invoice);
    const toastId = toast.loading("Verifying balance...");

    try {
      const nwcClient = new NWCClient({ nostrWalletConnectUrl: nwcUrl });

      const balanceData = await nwcClient.getBalance();
      if (balanceData && typeof balanceData.balance === "number") {
        if (balanceData.balance < amount) {
          toast.error("Insufficient balance", { id: toastId });
          setPayingInvoice(null);
          return;
        }
      }

      toast.loading("Processing payment...", { id: toastId });
      const payRes = await nwcClient.payInvoice({ invoice });

      if (payRes && payRes.preimage) {
        toast.success("Payment realized!", { id: toastId });
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error processing the payment", { id: toastId });
    } finally {
      setPayingInvoice(null);
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 p-3 mb-1 rounded-md border ${
        isMine
          ? "bg-primary-foreground/10 border-primary-foreground/20"
          : "bg-yellow-500/10 border-yellow-500/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            isMine ? "bg-primary-foreground/20" : "bg-yellow-500/20"
          }`}
        >
          <Zap
            className={`w-5 h-5 ${
              isMine ? "text-primary-foreground" : "text-yellow-500"
            }`}
          />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${
              isMine ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Sats request
          </p>
          <p
            className={`text-xs ${
              isMine ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {satsAmount} sats
          </p>
        </div>
      </div>
      {!isMine && (
        <button
          onClick={handlePayInvoice}
          disabled={payingInvoice === invoice}
          className="w-full bg-yellow-500 text-yellow-950 font-bold py-2 rounded-md flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {payingInvoice === invoice ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Pay {satsAmount} sats</>
          )}
        </button>
      )}
    </div>
  );
}
