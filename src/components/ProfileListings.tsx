import { useState } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import toast from "react-hot-toast";

import { ListingCard } from "../components/ListingCard";

interface ProfileListingsProps {
  ndk: any;
  listings: NDKEvent[];
  setListings: React.Dispatch<React.SetStateAction<NDKEvent[]>>;
}

export function ProfileListings({
  ndk,
  listings,
  setListings,
}: ProfileListingsProps) {
  const [listingToDelete, setListingToDelete] = useState<NDKEvent | null>(null);

  const confirmDelete = async () => {
    if (!ndk || !listingToDelete) return;

    try {
      const deleteEvent = new NDKEvent(ndk);
      deleteEvent.kind = 5;
      deleteEvent.tags = [["e", listingToDelete.id]];
      await deleteEvent.publish();

      setListings((prev) => prev.filter((e) => e.id !== listingToDelete.id));
      setListingToDelete(null);
      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing.");
    }
  };

  return (
    <section>
      <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">
        My Listings
      </h3>

      {listings.length === 0 ? (
        <p className="text-muted-foreground bg-muted/20 p-6 rounded-lg text-center border border-border border-dashed">
          You haven't posted any products yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((event) => (
            <div key={event.id} className="relative group">
              <ListingCard event={event} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setListingToDelete(event);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-sm cursor-pointer"
                title="Delete Listing"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {listingToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-96 border border-border">
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Delete Listing
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete this listing? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setListingToDelete(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
