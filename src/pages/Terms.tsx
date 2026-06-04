import { ChevronLeft, Scale } from "lucide-react";
import { Link } from "react-router-dom";

export function Terms() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in pb-12">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors mt-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          Terms & Privacy
        </h1>
        <p className="text-muted-foreground mt-2">Last updated: June 2026</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-10 text-foreground leading-relaxed">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary border-b border-border pb-2">
            Terms of Use
          </h2>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-bold mb-2">1. Introduction</h3>
              <p className="text-muted-foreground">
                This application is a decentralized, open-source graphical user
                interface (client) that interacts with the Nostr network. It
                allows users to browse, publish, and interact with product
                listings created by other users on public relays. By accessing
                or using this client, you agree to these terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">
                2. No Intermediation and No Custody
              </h3>
              <p className="text-muted-foreground">
                We are not a traditional marketplace, broker, or payment
                processor. We do not host the listings, we do not custody funds,
                and we do not facilitate the transactions. All payments and
                negotiations are strictly Peer-to-Peer (P2P) between the buyer
                and the seller. We are not responsible for scams, unfulfilled
                orders, or disputes between users.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">3. User Responsibility</h3>
              <p className="text-muted-foreground">
                You are entirely responsible for the content you publish using
                this client and for your interactions with other users. You must
                ensure that your listings comply with the laws of your
                jurisdiction. Your private key (nsec) is your sole
                responsibility; we do not have access to it and cannot recover
                it if lost.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">
                4. Decentralized Content
              </h3>
              <p className="text-muted-foreground">
                The data displayed in this application is fetched directly from
                independent Nostr relays chosen by the users. We do not control,
                censor, or endorse the content published on the network.
                However, we provide client-side tools (like the NSFW toggle) to
                help you filter the content you wish to see locally.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">
                5. Disclaimer of Warranties (MIT License)
              </h3>
              <p className="text-muted-foreground text-sm uppercase">
                The software is provided "as is", without warranty of any kind,
                express or implied, including but not limited to the warranties
                of merchantability, fitness for a particular purpose and
                noninfringement. In no event shall the authors or copyright
                holders be liable for any claim, damages or other liability,
                whether in an action of contract, tort or otherwise, arising
                from, out of or in connection with the software or the use or
                other dealings in the software.
              </p>
            </section>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary border-b border-border pb-2 mt-8">
            Privacy Policy
          </h2>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-bold mb-2">1. Local Storage Only</h3>
              <p className="text-muted-foreground">
                We do not maintain centralized databases. All your preferences
                (such as theme, UI settings, active relays, and Nostr Wallet
                Connect strings) are stored locally in your browser's
                `localStorage`. If you clear your browser data, these settings
                will be reset.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">2. Private Keys (nsec)</h3>
              <p className="text-muted-foreground">
                If you choose to log in directly using your private key (nsec),
                it is kept exclusively in your device's local memory to sign
                events. It is never transmitted to our servers (because we don't
                have any) or to any third-party. We strongly recommend using a
                NIP-07 browser extension for better security.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">
                3. Public Network Exposure
              </h3>
              <p className="text-muted-foreground">
                By design, the Nostr network is public. Any information you
                choose to broadcast (such as your profile details, product
                listings, images, and approximate location geohashes) will be
                sent to public relays and can be viewed or stored by anyone
                globally. Do not publish sensitive personal information.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">
                4. Third-Party Services
              </h3>
              <p className="text-muted-foreground">
                To provide specific functionalities, this client connects to
                external services:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong>Nominatim (OpenStreetMap):</strong> When you search
                    for a location, the text query is sent to Nominatim's public
                    API to retrieve geographic coordinates.
                  </li>
                  <li>
                    <strong>Media Servers:</strong> When you upload a picture,
                    the file is sent to the media server you configured (e.g.,
                    nostr.build). We do not control these servers.
                  </li>
                  <li>
                    <strong>Relays:</strong> Your connection IP is exposed to
                    the Nostr relays you choose to connect to.
                  </li>
                </ul>
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">
                5. Analytics & Tracking
              </h3>
              <p className="text-muted-foreground">
                We do not implement any hidden tracking scripts, cookies for
                marketing purposes, or user analytics. The client only performs
                network requests strictly necessary for its core functionality.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
