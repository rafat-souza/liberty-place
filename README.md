# Liberty Place

A decentralized, peer-to-peer marketplace built on the [Nostr](https://nostr.org) protocol. Buy and sell goods locally without intermediaries, censorship, or central authority.

![Liberty Place](./src/assets/LibertyPlaceLogo.png)

## Overview

Liberty Place is an open-source web client that connects buyers and sellers directly using Nostr's cryptographic identity system and decentralized relay network. No accounts, no fees, no middlemen — your keys, your market.

## Features

- **Decentralized listings** — Classifieds published as Nostr events (NIP-99 / Kind 30402), stored across independent relays
- **Geolocation search** — Find listings near you using geohash-based filtering (OpenStreetMap / Nominatim)
- **Encrypted chat** — NIP-04 end-to-end encrypted direct messages between buyers and sellers
- **Lightning payments** — Request and pay Bitcoin invoices directly in the chat via Nostr Wallet Connect (NIP-47)
- **NIP-07 support** — Log in with any browser extension signer (Alby, nos2x, Nostore, etc.)
- **Seller profiles** — Follow system, follower counts, NIP-05 verification, Lightning address (LUD-16), QR sharing
- **Media uploads** — Authenticated file hosting via NIP-96 (nostr.build by default)
- **NSFW filter** — Client-side toggle to show or hide sensitive content
- **Relay management** — Add, remove, and sync relays; publishes your list to the network via NIP-65
- **Dark / Light mode** — Persisted theme preference
- **Fully client-side** — No backend, no database, no tracking

## Tech Stack

| Layer      | Technology                                                 |
| ---------- | ---------------------------------------------------------- |
| Framework  | React 19 + TypeScript                                      |
| Build tool | Vite 8                                                     |
| Styling    | Tailwind CSS v4                                            |
| Nostr      | [@nostr-dev-kit/ndk](https://github.com/nostr-dev-kit/ndk) |
| Lightning  | [@getalby/sdk](https://github.com/getAlby/js-sdk) (NWC)    |
| State      | Zustand                                                    |
| Routing    | React Router v7                                            |
| Location   | ngeohash + Nominatim (OpenStreetMap)                       |

## Supported NIPs

| NIP         | Description                               |
| ----------- | ----------------------------------------- |
| NIP-01      | Basic protocol flow & event format        |
| NIP-02      | Contact list (follow / unfollow)          |
| NIP-04      | Encrypted direct messages                 |
| NIP-07      | Browser extension signer                  |
| NIP-09      | Event deletion                            |
| NIP-19      | bech32-encoded entities (npub, nsec)      |
| NIP-47      | Nostr Wallet Connect (Lightning payments) |
| NIP-65      | Relay List Metadata                       |
| NIP-94 / 96 | Authenticated media upload                |
| NIP-99      | Classified listings                       |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/rafat-souza/liberty-place.git
cd liberty-place
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173/liberty-place/](http://localhost:5173/liberty-place/) in your browser.

### Build

```bash
npm run build
```

The static output will be in the `dist/` folder, ready to deploy to any static host (GitHub Pages, Vercel, Cloudflare Pages, etc.).

### Lint

```bash
npm run lint
```

## Deployment

This project is configured for **GitHub Pages** via the included GitHub Actions workflow (`.github/workflows/deploy.yml`). Every push to `master` triggers an automatic build and deploy.

To deploy to your own GitHub Pages:

1. Fork the repository
2. Go to **Settings → Pages** and set the source to **GitHub Actions**
3. Push to `master` — the workflow handles the rest

The `vite.config.ts` base path is set to `/liberty-place/`. Update it if you're deploying under a different path.

## Configuration

### Environment Variables

Create a `.env` file in the project root (see `.gitignore` — it's excluded from version control):

```env
VITE_NOMINATIM_EMAIL=your@email.com
```

The Nominatim API requires an email address for identification per their [usage policy](https://operations.osmfoundation.org/policies/nominatim/). Without it, location search still works but may be rate-limited.

### Default Relays

Out of the box, Liberty Place connects to:

```
wss://relay.damus.io
wss://nos.lol
wss://nostr.mom
```

Users can add or remove relays from the **Settings → Relays** page. Changes sync to the network via NIP-65.

### Default Media Server

Images are uploaded to `https://nostr.build` by default. Users can configure additional Blossom-compatible servers from **Settings → Media Servers**.

## How to Use

### Logging In

- **Browser extension (recommended):** Install a NIP-07 signer like [Alby](https://getalby.com) or [nos2x](https://github.com/fiatjaf/nos2x) and click "Use Browser Extension"
- **Private key (nsec):** Paste your `nsec1...` key directly — it stays in your browser's local storage only
- **New to Nostr?** Use the "Create new Nostr profile" option to generate a fresh key pair

### Posting a Listing

1. Click **Sell Product** in the header
2. Fill in the title, description, category, price, and location
3. Upload images (up to 5 MB each, via NIP-96)
4. Optionally mark the listing as NSFW
5. Click **Publish Product Listing** — the event is signed and broadcast to your relays

### Buying / Contacting a Seller

1. Browse listings on the home feed or use the search filters
2. Click a listing to view details
3. Click **Message** to open an encrypted DM chat with the seller
4. Agree on terms and use the ⚡ **Request Sats** button to send a Lightning invoice request (requires NWC wallet)

### Connecting a Wallet

1. Go to **Wallet** in the sidebar
2. Paste your NWC connection string (`nostr+walletconnect://...`)
3. Your wallet is now linked for in-chat Lightning payments

NWC strings can be generated from wallet providers like [Alby](https://getalby.com), Mutiny, or Strike.

## Project Structure

```
src/
├── assets/              # Static images and logos
├── components/          # Reusable UI components
│   ├── ChatSidebar.tsx  # Sliding chat panel
│   ├── ChatInvoiceInputBar.tsx  # Message input + NWC invoice requests
│   ├── ChatSatsPayment.tsx      # Lightning payment UI in messages
│   ├── ListingCard.tsx          # Marketplace card component
│   ├── LocationAutocomplete.tsx # Nominatim location search
│   ├── LoginButton.tsx          # Auth modal + key generation
│   ├── ProfileEditModal.tsx     # Edit Nostr profile (Kind 0)
│   ├── ProfileListings.tsx      # User's own listings with delete
│   ├── ChatFileUpload.tsx       # NIP-96 media upload in chat
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── Navbar.tsx
│   └── Footer.tsx
├── hooks/
│   └── useChat.ts       # NIP-04 DM subscribe / send / decrypt
├── pages/
│   ├── Home.tsx         # Feed + search + filters
│   ├── ListingDetail.tsx
│   ├── NewListing.tsx   # Publish Kind 30402 event
│   ├── Profile.tsx      # Own profile + listings
│   ├── SellerProfile.tsx
│   ├── Settings.tsx
│   ├── RelaySettings.tsx
│   ├── MediaSettings.tsx
│   ├── Wallet.tsx       # NWC wallet management
│   ├── About.tsx
│   └── Terms.tsx
├── providers/
│   ├── NDKProvider.tsx  # NDK instance + relay pool
│   ├── AuthProvider.tsx # Login (NIP-07 / nsec) + relay sync
│   └── ThemeProvider.tsx
├── store/
│   └── chatStore.ts     # Zustand store for chat state
└── main.tsx             # App entry + hash router
```

## Privacy & Security

- **No servers.** All data lives on public Nostr relays you control.
- **No tracking.** No analytics, cookies, or marketing scripts.
- **Local storage only.** Theme, relay list, NWC string, and session key (if using nsec login) are stored in your browser's `localStorage` and never transmitted anywhere.
- **Public by design.** Nostr is a public network. Listings, profile metadata, images, and approximate geohashes are visible to anyone. Do not publish sensitive personal information.
- **NWC security.** Your wallet connection string grants payment permissions scoped to what your wallet provider allows. Revoke access from your provider's dashboard at any time.

## Contributing

Pull requests are welcome! If you find a bug or have a feature idea, please [open an issue](https://github.com/rafat-souza/liberty-place/issues) first to discuss it.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

## License

[MIT](LICENSE) — © 2026 Rafael Toledo Souza
