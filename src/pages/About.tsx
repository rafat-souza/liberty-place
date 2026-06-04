import { NavLink } from "react-router-dom";
import { GitBranch, Code, Server, ExternalLink } from "lucide-react";

export function About() {
  const APP_VERSION = "0.1.0";
  const GITHUB_LINK = "https://github.com/rafat-souza/liberty-place";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-4xl font-bold text-foreground">
        About Liberty Place
      </h1>

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="text-lg">
          Liberty Place is a decentralized platform connecting buyers and
          sellers near from each other directly using the Nostr protocol.
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          Our Proposal
        </h2>
        <p>
          We aim to create a censorship-resistant environment where individuals
          can trade freely without intermediaries. By leveraging Nostr's
          cryptographic identities and decentralized relays, we ensure that your
          data and reputation remain in your hands.
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          What is Nostr?
        </h2>
        <p className="mb-4">
          Nostr stands for "Notes and Other Stuff Transmitted by Relays". It is
          an open-source, decentralized protocol designed for sharing data over
          the internet. Unlike traditional platforms, Nostr is not owned by any
          company or central authority.
        </p>
        <p>
          Instead of creating an account with an email and password, you are
          identified by a cryptographic key pair: a public key (which acts as
          your username) and a private key (your password). Your data and
          listings are distributed across independent servers called "relays".
          This ensures that nobody can censor you, ban your account, or control
          the market. Liberty Place simply acts as a decentralized window to
          interact with this network.
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          Who is Liberty Place for?
        </h2>
        <p>
          Liberty Place is an option for people who share similar values and
          want to trade goods with one another. Our main focus is to encourage
          users to meet in person, strengthening bonds and helping to build a
          trustworthy local community.
        </p>
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
          How does the payment work in the purchases?
        </h2>
        <p className="mb-4">
          We prioritize privacy and decentralization. Because of this, the only
          payment method integrated into Liberty Place for now is Bitcoin via
          the Lightning Network. We use Nostr Wallet Connect (NWC), a standard
          designed specifically for Nostr clients.
        </p>
        <p className="mb-4">
          To use it, simply paste your NWC secret key on the{" "}
          <NavLink to="/wallet" className="underline">
            Wallet
          </NavLink>{" "}
          page. After that, you can request and fulfill Bitcoin payments
          directly within the chat. However, buyers and sellers are always free
          to agree on any external payment method that is more convenient for
          them (e.g. cash, bank transfers).
        </p>
        <p>
          <span className="font-bold">Disclaimer:</span> Liberty Place is not
          responsible for any transactions or agreements between users. We
          merely provide a non-custodial, peer-to-peer interface to facilitate
          Bitcoin Lightning payments.
        </p>
      </div>

      <hr className="border-border my-8" />

      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-8 text-foreground mt-8">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border border-border">
          <div>
            <h2 className="font-bold text-lg">Liberty Place</h2>
            <p className="text-sm text-muted-foreground">
              Version {APP_VERSION}
            </p>
          </div>
          <a
            href={GITHUB_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            <GitBranch className="w-5 h-5" />
            View Source Code
          </a>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <Server className="w-5 h-5 text-primary" />
            Technical Architecture
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Supported NIPs (Nostr Implementation Possibilities):
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-01:</strong> Basic protocol & event definitions
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-02:</strong> Contact list
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-04:</strong> Encrypted Direct Messages (Chat)
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-07:</strong> Browser extension signer support
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-09:</strong> Event declaration
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-19:</strong> Codification
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-47:</strong> Nostr Wallet Connect (Lightning)
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-65:</strong> Relay List Metadata
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-94 / 96:</strong> Authenticated Media Upload
              </span>
            </li>
            <li className="flex items-start gap-2 bg-muted/20 p-2 rounded border border-border">
              <Code className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>NIP-99:</strong> Classifieds & Marketplace listings
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Third-Party Infrastructure
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Maps & Location:</strong>{" "}
              Geohashing and location search are powered by OpenStreetMap and
              the Nominatim API.
            </li>
            <li>
              <strong className="text-foreground">Nostr Relays:</strong> All
              data (listings, messages, profiles) is stored and distributed
              across decentralized Nostr relay servers chosen by the user.
            </li>
            <li>
              <strong className="text-foreground">Media Hosting:</strong> Images
              are uploaded to community servers like{" "}
              <a
                href="https://nostr.build"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                nostr.build
              </a>{" "}
              via NIP-96.
            </li>
            <li>
              <strong className="text-foreground">Lightning Wallets:</strong>{" "}
              Bitcoin payments rely on NWC-compatible wallet providers (e.g.
              Alby, Mutiny, Strike) via NIP-47.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
