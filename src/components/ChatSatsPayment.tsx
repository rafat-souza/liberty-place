import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { NWCClient } from "@getalby/sdk/nwc";
import { Zap, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

interface ChatSatsPaymentProps {
  invoice: string;
  satsAmount: string;
  isMine: boolean;
  currentUserPubkey: string;
  createdAt: number;
}

export function ChatSatsPayment({
  invoice,
  satsAmount,
  isMine,
  currentUserPubkey,
  createdAt,
}: ChatSatsPaymentProps) {
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<
    "checking" | "waiting" | "paid" | "expired"
  >("checking");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const getSecondsRemaining = () =>
      createdAt + 600 - Math.floor(Date.now() / 1000);

    if (!isMine) {
      const timeRemaining = getSecondsRemaining();

      if (timeRemaining <= 0) {
        setPaymentStatus("expired");
      } else {
        setPaymentStatus("waiting");
        const timeout = setTimeout(() => {
          setPaymentStatus((prev) => (prev === "paid" ? "paid" : "expired"));
        }, timeRemaining * 1000);

        return () => clearTimeout(timeout);
      }
      return;
    }

    const checkInvoiceStatus = async () => {
      const isTimeExpired = getSecondsRemaining() <= 0;

      const nwcUrl = localStorage.getItem(`nwc_url_${currentUserPubkey}`);
      if (!nwcUrl) {
        setPaymentStatus(isTimeExpired ? "expired" : "waiting");
        if (isTimeExpired && intervalRef.current)
          clearInterval(intervalRef.current);
        return;
      }

      try {
        const nwcClient = new NWCClient({ nostrWalletConnectUrl: nwcUrl });
        const result = await nwcClient.lookupInvoice({ invoice });

        if (
          result &&
          (result.preimage || result.settled_at || (result as any).settledAt)
        ) {
          setPaymentStatus("paid");
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setPaymentStatus(isTimeExpired ? "expired" : "waiting");
          if (isTimeExpired && intervalRef.current)
            clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.error("Error checking invoice status:", error);
        setPaymentStatus(isTimeExpired ? "expired" : "waiting");
        if (isTimeExpired && intervalRef.current)
          clearInterval(intervalRef.current);
      }
    };

    checkInvoiceStatus();

    intervalRef.current = setInterval(() => {
      checkInvoiceStatus();
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMine, invoice, currentUserPubkey, createdAt]);

  const handlePayInvoice = async () => {
    if (Math.floor(Date.now() / 1000) > createdAt + 600) {
      toast.error("Esta solicitação expirou.");
      setPaymentStatus("expired");
      return;
    }

    const amount = parseInt(satsAmount);
    const nwcUrl = localStorage.getItem(`nwc_url_${currentUserPubkey}`);

    if (!nwcUrl) {
      toast.error("Conecte sua carteira NWC na aba Wallet para poder pagar.");
      return;
    }

    setPayingInvoice(invoice);
    const toastId = toast.loading("Verificando saldo...");

    try {
      const nwcClient = new NWCClient({ nostrWalletConnectUrl: nwcUrl });

      const balanceData = await nwcClient.getBalance();
      if (balanceData && typeof balanceData.balance === "number") {
        if (balanceData.balance < amount) {
          toast.error("Saldo insuficiente.", { id: toastId });
          setPayingInvoice(null);
          return;
        }
      }

      toast.loading("Processando pagamento...", { id: toastId });
      const payRes = await nwcClient.payInvoice({ invoice });

      if (payRes && payRes.preimage) {
        toast.success("Pagamento realizado com sucesso!", { id: toastId });
        setPaymentStatus("paid");
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar o pagamento.", { id: toastId });
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

      {isMine && (
        <div className="mt-1 pt-2 border-t border-primary-foreground/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {paymentStatus === "checking" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-primary-foreground/60" />
                <span className="text-xs text-primary-foreground/80">
                  Checking...
                </span>
              </>
            ) : paymentStatus === "paid" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium text-green-400">Paid</span>
              </>
            ) : paymentStatus === "expired" ? (
              <>
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium text-red-400">
                  Cancelled / Expired
                </span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-primary-foreground/70" />
                <span className="text-xs text-primary-foreground/80">
                  Waiting for payment
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {!isMine && paymentStatus === "waiting" && (
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

      {!isMine && paymentStatus === "paid" && (
        <div className="w-full bg-green-500/10 text-green-500 font-bold py-2 rounded-md flex items-center justify-center gap-2 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4" />
          Paid
        </div>
      )}

      {!isMine && paymentStatus === "expired" && (
        <div className="w-full bg-destructive/10 text-destructive font-bold py-2 rounded-md flex items-center justify-center gap-2 border border-destructive/20 opacity-80">
          <XCircle className="w-4 h-4" />
          Expired
        </div>
      )}
    </div>
  );
}
