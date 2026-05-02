export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-4xl font-bold text-foreground">
        About Nostr Marketplace
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
      </div>
    </div>
  );
}
