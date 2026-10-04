import Image from "next/image";
import { Bookmark, Heart, MessageCircle, Play, X } from "lucide-react";

const matchReasons = ["Rage", "Carti refs", "145 BPM"];

export function ProductMockup() {
  return (
    <div className="mockup-wrap" aria-label="TappedIn mobile discovery preview">
      <div className="phone-frame phone-main">
        <div className="phone-screen">
          <div className="phone-topbar">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-xl"
              />
              <div>
                <p>TappedIn</p>
                <strong>Discover</strong>
              </div>
            </div>
            <span className="match-pill">94%</span>
          </div>

          <article className="feed-card">
            <div className="audio-panel">
              <button type="button" className="pressable play-button" aria-label="Play demo">
                <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
              </button>
              <div className="min-w-0 flex-1">
                <strong>RAGE 145 demo</strong>
                <div className="wave-bars" aria-hidden="true">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <i key={index} style={{ height: `${22 + ((index * 11) % 46)}%` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-row">
              <div>
                <h3>Nova Ray</h3>
                <p>Producer - Bucharest</p>
              </div>
              <span>Open</span>
            </div>

            <div className="tag-row">
              {matchReasons.map((reason) => (
                <span key={reason}>{reason}</span>
              ))}
            </div>

            <p className="profile-copy">
              Synth-heavy beats for artists who like hooks that arrive fast and
              drums that feel slightly unhinged.
            </p>
          </article>

          <div className="action-row">
            {[
              { label: "Skip", icon: X },
              { label: "Save", icon: Bookmark },
              { label: "Feedback", icon: MessageCircle },
              { label: "Connect", icon: Heart },
            ].map((action) => (
              <button key={action.label} type="button" className="pressable" aria-label={action.label}>
                <action.icon className="size-5" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="phone-frame phone-side" aria-hidden="true">
        <div className="side-screen">
          <span className="side-kicker">Feedback</span>
          <h3>Hook hits hard.</h3>
          <p>Try a shorter intro and send stems when you can.</p>
          <div className="side-note">
            <MessageCircle className="size-4" />
            Good mix
          </div>
        </div>
      </div>
    </div>
  );
}
