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

  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, createdAt + 600 - Math.floor(Date.now() / 1000)),
  );

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const paidInvoices = JSON.parse(
      localStorage.getItem("paid_invoices") || "[]",
    );
    if (paidInvoices.includes(invoice)) {
      setPaymentStatus("paid");
    }
  }, [invoice]);

  useEffect(() => {
    if (paymentStatus === "paid" || paymentStatus === "expired") return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        createdAt + 600 - Math.floor(Date.now() / 1000),
      );
      setTimeLeft(remaining);

      if (remaining === 0) {
        const paidInvoices = JSON.parse(
          localStorage.getItem("paid_invoices") || "[]",
        );
        if (!paidInvoices.includes(invoice)) {
          setPaymentStatus("expired");
        }
        return false;
      }
      return true;
    };

    if (!updateTimer()) return;

    const timerId = setInterval(() => {
      if (!updateTimer()) clearInterval(timerId);
    }, 1000);

    return () => clearInterval(timerId);
  }, [createdAt, paymentStatus, invoice]);

  useEffect(() => {
    if (!isMine) {
      setPaymentStatus((prev) => {
        if (prev === "paid" || prev === "expired") return prev;
        const remaining = createdAt + 600 - Math.floor(Date.now() / 1000);
        return remaining > 0 ? "waiting" : "expired";
      });
      return;
    }

    if (paymentStatus === "paid" || paymentStatus === "expired") return;

    const checkInvoiceStatus = async () => {
      const isTimeExpired = Math.floor(Date.now() / 1000) >= createdAt + 600;

      const nwcUrl = localStorage.getItem(`nwc_url_${currentUserPubkey}`);
      if (!nwcUrl) {
        setPaymentStatus(isTimeExpired ? "expired" : "waiting");
        if (isTimeExpired && pollIntervalRef.current)
          clearInterval(pollIntervalRef.current);
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

          const paidInvoices = JSON.parse(
            localStorage.getItem("paid_invoices") || "[]",
          );
          if (!paidInvoices.includes(invoice)) {
            localStorage.setItem(
              "paid_invoices",
              JSON.stringify([...paidInvoices, invoice]),
            );
          }

          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (isTimeExpired) {
          setPaymentStatus("expired");
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else {
          setPaymentStatus("waiting");
        }
      } catch (error) {
        if (isTimeExpired) {
          setPaymentStatus("expired");
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else {
          setPaymentStatus("waiting");
        }
      }
    };

    checkInvoiceStatus();
    pollIntervalRef.current = setInterval(checkInvoiceStatus, 10000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isMine, invoice, currentUserPubkey, createdAt, paymentStatus]);

  const handlePayInvoice = async () => {
    if (timeLeft <= 0 || paymentStatus === "expired") {
      toast.error("This request has expired.");
      setPaymentStatus("expired");
      return;
    }

    const amount = parseInt(satsAmount);
    const nwcUrl = localStorage.getItem(`nwc_url_${currentUserPubkey}`);

    if (!nwcUrl) {
      toast.error("Connect your NWC wallet in the Wallet tab to pay.");
      return;
    }

    setPayingInvoice(invoice);
    const toastId = toast.loading("Checking balance...");

    try {
      const nwcClient = new NWCClient({ nostrWalletConnectUrl: nwcUrl });

      const balanceData = await nwcClient.getBalance();
      if (balanceData && typeof balanceData.balance === "number") {
        if (balanceData.balance < amount) {
          toast.error("Insufficient balance.", { id: toastId });
          setPayingInvoice(null);
          return;
        }
      }

      toast.loading("Processing payment...", { id: toastId });
      const payRes = await nwcClient.payInvoice({ invoice });

      if (payRes && payRes.preimage) {
        toast.success("Payment successful!", { id: toastId });
        setPaymentStatus("paid");

        const paidInvoices = JSON.parse(
          localStorage.getItem("paid_invoices") || "[]",
        );
        if (!paidInvoices.includes(invoice)) {
          localStorage.setItem(
            "paid_invoices",
            JSON.stringify([...paidInvoices, invoice]),
          );
        }
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error processing payment.", { id: toastId });
    } finally {
      setPayingInvoice(null);
    }
  };

  const formatTimeString = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-md mb-1 ${
        isMine ? "bg-zinc-900" : "bg-yellow-500/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            isMine ? "bg-zinc-800" : "bg-yellow-500/30"
          }`}
        >
          <Zap
            className={`w-5 h-5 ${
              isMine
                ? "text-yellow-400"
                : "text-yellow-600 dark:text-yellow-500"
            }`}
          />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${
              isMine ? "text-zinc-100" : "text-foreground"
            }`}
          >
            Sats request
          </p>
          <p
            className={`text-xs ${
              isMine ? "text-zinc-400" : "text-muted-foreground"
            }`}
          >
            {satsAmount} sats
          </p>
        </div>
      </div>

      {/* SENDER VIEW */}
      {isMine && (
        <div className="mt-2 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {paymentStatus === "checking" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                <span className="text-xs text-zinc-400">Checking...</span>
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
                  Expired
                </span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-400">
                  Waiting...{" "}
                  <span className="font-mono">
                    ({formatTimeString(timeLeft)})
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* RECEIVER VIEW (Waiting) */}
      {!isMine && paymentStatus === "waiting" && (
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={handlePayInvoice}
            disabled={payingInvoice === invoice || timeLeft <= 0}
            className="w-full bg-yellow-500 text-yellow-950 font-bold py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {payingInvoice === invoice ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Pay {satsAmount} sats</>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
            <Clock className="w-3 h-3" />
            <span>Expires in {formatTimeString(timeLeft)}</span>
          </div>
        </div>
      )}

      {/* RECEIVER VIEW (Paid) */}
      {!isMine && paymentStatus === "paid" && (
        <div className="w-full bg-green-500/20 text-green-700 dark:text-green-400 font-bold py-2.5 rounded-md flex items-center justify-center gap-2 mt-1">
          <CheckCircle2 className="w-4 h-4" />
          Paid
        </div>
      )}

      {/* RECEIVER VIEW (Expired) */}
      {!isMine && paymentStatus === "expired" && (
        <div className="w-full bg-destructive/20 text-destructive font-bold py-2.5 rounded-md flex items-center justify-center gap-2 mt-1 opacity-90">
          <XCircle className="w-4 h-4" />
          Expired
        </div>
      )}
    </div>
  );
}
