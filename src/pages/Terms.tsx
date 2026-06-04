import { ChevronLeft, ShieldAlert } from "lucide-react";
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
          Terms of Use
        </h1>
        <p className="text-muted-foreground mt-2">Last updated: June 2026</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground">
            This application is a decentralized, open-source graphical user
            interface (client) that interacts with the Nostr network. It allows
            users to browse, publish, and interact with product listings created
            by other users on public relays. By accessing or using this client,
            you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">
            2. No Intermediation and No Custody
          </h2>
          <p className="text-muted-foreground">
            We are not a traditional marketplace, broker, or payment processor.
            We do not host the listings, we do not custody funds, and we do not
            facilitate the transactions. All payments and negotiations are
            strictly Peer-to-Peer (P2P) between the buyer and the seller. We are
            not responsible for scams, unfulfilled orders, or disputes between
            users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. User Responsibility</h2>
          <p className="text-muted-foreground">
            You are entirely responsible for the content you publish using this
            client and for your interactions with other users. You must ensure
            that your listings comply with the laws of your jurisdiction. Your
            private key (nsec) is your sole responsibility; we do not have
            access to it and cannot recover it if lost.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Decentralized Content</h2>
          <p className="text-muted-foreground">
            The data displayed in this application is fetched directly from
            independent Nostr relays chosen by the users. We do not control,
            censor, or endorse the content published on the network. However, we
            provide client-side tools (like the NSFW toggle) to help you filter
            the content you wish to see locally.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">
            5. Privacy and Third-Party Services
          </h2>
          <p className="text-muted-foreground">
            Your preferences and private keys are stored locally on your device.
            We do not maintain centralized databases of our users. Be aware that
            interacting with the Nostr network means your data is broadcasted
            publicly. Additionally, this client integrates with third-party
            services (such as Nominatim for location search and nostr.build for
            media hosting) which may have their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">
            6. Disclaimer of Warranties (MIT License)
          </h2>
          <p className="text-muted-foreground">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
            CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </p>
        </section>
      </div>
    </div>
  );
}
