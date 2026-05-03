import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  MessageSquare,
  ChevronLeft,
  X,
  Send,
  User,
  ShoppingBag,
  Paperclip,
  Loader2,
} from "lucide-react";

import { useChatStore } from "../store/chatStore";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../providers/AuthProvider";
import { useNDK } from "../providers/NDKProvider";

export function ChatSidebar() {
  const { ndk } = useNDK();
  const { currentUser } = useAuth();
  const {
    isOpen,
    toggleOpen,
    contacts,
    activeContact,
    setActiveContact,
    markAsRead,
    productContext,
    setProductContext,
  } = useChatStore();

  const { sendMessage, activeContactMessages } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContactMessages]);

  if (!currentUser) return null;

  const handleSelectContact = (pubkey: string) => {
    setActiveContact(pubkey);
    markAsRead(pubkey);
    setProductContext(null);
  };

  const handleBackToList = () => {
    setActiveContact(null);
    setProductContext(null);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !activeContact) return;

    let finalMessageText = inputValue.trim();
    if (productContext) {
      finalMessageText = `[Inquiring about: ${productContext.title}]\n\n${finalMessageText}`;
    }

    const success = await sendMessage(activeContact, finalMessageText);

    if (success) {
      setInputValue("");
      setProductContext(null);
    }
  };

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
        setInputValue((prev) => (prev ? `${prev}\n${fileUrl}` : fileUrl));
      } else {
        throw new Error("Upload response missing URL.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file.", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGoToProfile = () => {
    if (!activeContact) return;
    toggleOpen();
    navigate(`/seller/${activeContact}`);
  };

  const activeContactData = contacts.find((c) => c.pubkey === activeContact);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const parseMessage = (content: string) => {
    const match = content.match(/^\[Inquiring about:\s*(.*?)\]\n\n([\s\S]*)$/);
    if (match) {
      return {
        hasContext: true,
        contextTitle: match[1],
        actualMessage: match[2],
      };
    }
    return {
      hasContext: false,
      contextTitle: null,
      actualMessage: content,
    };
  };

  const renderMessageContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <span className="break-words whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            if (part.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
              return (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={part}
                    alt="Upload"
                    className="max-w-full rounded-md my-2 max-h-64 object-cover border border-border"
                  />
                </a>
              );
            }
            if (part.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
              return (
                <video
                  key={i}
                  src={part}
                  controls
                  className="max-w-full rounded-md my-2 max-h-64 border border-border bg-black"
                />
              );
            }
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 opacity-80 hover:opacity-100"
              >
                {part}
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none flex justify-end container mx-auto">
      <div
        className={`pointer-events-auto w-[340px] h-[70vh] bg-card border border-border border-b-0 shadow-2xl rounded-t-xl flex flex-col transition-all duration-300 ease-out origin-bottom
          ${isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"}`}
      >
        {activeContact && activeContactData ? (
          /* Conversation View */
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
              <button
                onClick={handleBackToList}
                className="p-1 rounded hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleGoToProfile}
                className="flex flex-1 items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
              >
                {activeContactData.profile?.image ||
                activeContactData.profile?.picture ? (
                  <img
                    src={
                      activeContactData.profile.image ||
                      activeContactData.profile.picture
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {activeContactData.profile?.name ||
                      activeContactData.profile?.displayName ||
                      `${activeContactData.pubkey.slice(0, 8)}...`}
                  </p>
                </div>
              </button>
              <button
                onClick={toggleOpen}
                className="p-1 ml-2 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeContactMessages.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Start a conversation!
                </p>
              ) : (
                activeContactMessages.map((msg, idx) => {
                  const showDate =
                    idx === 0 ||
                    formatDate(msg.createdAt) !==
                      formatDate(activeContactMessages[idx - 1].createdAt);

                  const parsedData = parseMessage(msg.content);

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          msg.isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg text-sm flex flex-col overflow-hidden
                            ${
                              msg.isMine
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-muted text-foreground rounded-bl-none"
                            }`}
                        >
                          {/* Visual Context Block */}
                          {parsedData.hasContext && (
                            <div
                              className={`flex items-center gap-2 p-2 border-b ${msg.isMine ? "bg-black/10 border-black/10" : "bg-background/50 border-border"} `}
                            >
                              <ShoppingBag
                                className={`w-4 h-4 shrink-0 ${msg.isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                              />
                              <div className="min-w-0">
                                <span
                                  className={`text-[9px] block leading-none ${msg.isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                                >
                                  Inquiring about
                                </span>
                                <strong className="text-xs truncate block leading-tight">
                                  {parsedData.contextTitle}
                                </strong>
                              </div>
                            </div>
                          )}

                          <div className="p-3">
                            {renderMessageContent(parsedData.actualMessage)}

                            <span
                              className={`text-[10px] mt-1 block text-right
                                ${msg.isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                            >
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-card flex flex-col gap-2">
              {productContext && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md border border-border relative animate-in fade-in slide-in-from-bottom-2">
                  {productContext.image ? (
                    <img
                      src={productContext.image}
                      alt="Product"
                      className="w-8 h-8 object-cover rounded shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-background rounded flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-muted-foreground block leading-none">
                      Inquiring about:
                    </span>
                    <strong className="text-xs text-foreground truncate block leading-tight">
                      {productContext.title}
                    </strong>
                  </div>
                  <button
                    onClick={() => setProductContext(null)}
                    className="p-1 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                    title="Remove context"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  title="Attach file"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    isUploading ? "Uploading file..." : "Type a message..."
                  }
                  disabled={isUploading}
                  className="flex-1 px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />

                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isUploading}
                  className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Contacts List View */
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </h2>
              <button
                onClick={toggleOpen}
                className="p-1 ml-2 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No conversations yet.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Contact a seller to start chatting!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {contacts
                    .sort(
                      (a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0),
                    )
                    .map((contact) => (
                      <button
                        key={contact.pubkey}
                        onClick={() => handleSelectContact(contact.pubkey)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                      >
                        {contact.profile?.image || contact.profile?.picture ? (
                          <img
                            src={
                              contact.profile.image || contact.profile.picture
                            }
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {contact.profile?.name ||
                                contact.profile?.displayName ||
                                `${contact.pubkey.slice(0, 12)}...`}
                            </p>
                            {contact.lastMessageAt && (
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {formatTime(contact.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-muted-foreground truncate pr-2">
                              {contact.lastMessage?.replace(
                                /^\[Inquiring about:\s*(.*?)\]\n\n/,
                                "",
                              ) || "No messages"}
                            </p>
                            {contact.unreadCount > 0 && (
                              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[18px] text-center">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
