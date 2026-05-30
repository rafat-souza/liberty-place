import { NavLink } from "react-router-dom";

export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-4xl font-bold text-foreground">
        About Liberty Place
      </h1>

      <div className="prose prose-invert max-w-none text-muted-foreground">
        <p className="text-lg">
          Nostr Marketplace is a decentralized platform connecting buyers and
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
    </div>
  );
}
