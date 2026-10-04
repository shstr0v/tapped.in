import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  AudioLines,
  Clock,
  Heart,
  Lock,
  MapPin,
  Music2,
  Play,
  UserCheck,
  VolumeX,
  Waypoints,
} from "lucide-react";
import { MascotBlob, Waveform } from "@/components/app-screens";

const reasons = [
  { icon: Music2, title: "Same references", body: "You both list Ken Carson." },
  { icon: Activity, title: "Tempo overlap", body: "140–150 BPM on both sides." },
  { icon: MapPin, title: "Same city", body: "Both based in Atlanta." },
  { icon: UserCheck, title: "Open to collab", body: "Looking for vocals now." },
  { icon: AudioLines, title: "Similar sound", body: "Dark synths, hard 808s." },
  { icon: Clock, title: "Active this week", body: "Usually replies same day." },
];

const hearts = [
  { left: "6%", top: "22%", size: 30, r: -14 },
  { left: "18%", top: "58%", size: 22, r: 10 },
  { left: "40%", top: "14%", size: 18, r: 6 },
  { left: "54%", top: "40%", size: 38, r: -8 },
  { left: "70%", top: "8%", size: 26, r: 14 },
  { left: "80%", top: "50%", size: 20, r: -18 },
  { left: "30%", top: "72%", size: 26, r: 4 },
  { left: "88%", top: "26%", size: 16, r: 8 },
];

const connections = [
  { initials: "MK", name: "Mila K.", role: "Singer", status: "accept" },
  { initials: "TV", name: "Tavi", role: "Producer", status: "connected" },
  { initials: "RA", name: "Rae", role: "Rapper", status: "sent" },
  { initials: "DX", name: "Dex", role: "Engineer", status: "connected" },
] as const;

function BentoCard({
  tone,
  title,
  body,
  mark,
  children,
}: {
  tone: "yellow" | "blue" | "pink" | "green";
  title: string;
  body: string;
  mark: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className={`bento-card bento-${tone}`}>
      <div className="bento-head">
        <h3>{title}</h3>
        <span className="bento-mark" aria-hidden="true">
          {mark}
        </span>
      </div>
      <p>{body}</p>
      <div className="bento-visual" aria-hidden="true">
        {children}
      </div>
    </article>
  );
}

function ReasonRow({ items, offset }: { items: typeof reasons; offset: string }) {
  return (
    <div className="reason-row" style={{ "--offset": offset } as CSSProperties}>
      {items.map((reason) => (
        <div key={reason.title} className="reason-card">
          <strong>
            <reason.icon className="size-4 text-blue" strokeWidth={2.25} />
            {reason.title}
          </strong>
          <span>{reason.body}</span>
        </div>
      ))}
    </div>
  );
}

export function FeatureBento() {
  return (
    <section className="bento-section" aria-label="Features">
      <div className="bento-column">
        <BentoCard
          tone="yellow"
          title="Matching that explains itself"
          body="Every match comes with the reasons, so you know why someone showed up before you hit connect."
          mark={<MascotBlob className="bento-mascot" />}
        >
          <div className="reason-rows">
            <ReasonRow items={reasons.slice(0, 3)} offset="-18%" />
            <ReasonRow items={reasons.slice(3)} offset="-42%" />
          </div>
        </BentoCard>

        <BentoCard
          tone="pink"
          title="Private chat, just you two"
          body="No group threads, no public comments. Send texts, voice memos, and stems to the one person you're working with."
          mark={<Lock className="size-7" strokeWidth={2.5} />}
        >
          <div className="chat-stack">
            <div className="chat-card">
              <span className="chat-card-head">
                <Lock className="size-3.5" strokeWidth={2.5} />
                Nova Ray · private
              </span>
              <p className="bubble bubble-in">sent the stems, check your inbox</p>
              <p className="bubble bubble-out">got them. vocals by friday</p>
            </div>
            <div className="memo-card">
              <span className="track-play">
                <Play className="ml-px size-3.5 fill-current" />
              </span>
              <Waveform bars={14} />
              <time>0:12</time>
            </div>
          </div>
        </BentoCard>
      </div>

      <div className="bento-column">
        <BentoCard
          tone="blue"
          title="Audio feedback with a tap"
          body="React right on the waveform. Drop a heart where the hook lands or leave a voice note at the exact second."
          mark={<AudioLines className="size-8" strokeWidth={2.5} />}
        >
          <div className="feedback-player">
            <div className="player-bars">
              {Array.from({ length: 22 }).map((_, index) => (
                <i key={index} style={{ height: `${28 + ((index * 41) % 66)}%` }} />
              ))}
            </div>
            <strong className="player-lyric">hook hits here</strong>
            <div className="player-progress">
              <span />
            </div>
            <span className="player-mute">
              <VolumeX className="size-4" strokeWidth={2.5} />
            </span>
            {hearts.map((heart, index) => (
              <Heart
                key={index}
                className="player-heart"
                style={{
                  left: heart.left,
                  top: heart.top,
                  width: heart.size,
                  height: heart.size,
                  rotate: `${heart.r}deg`,
                }}
                strokeWidth={0}
              />
            ))}
          </div>
        </BentoCard>

        <BentoCard
          tone="green"
          title="Connections that stick"
          body="Accept a request and they land in your connections, ready for the next session or the next drop."
          mark={<Waypoints className="size-7" strokeWidth={2.5} />}
        >
          <ul className="connection-card">
            {connections.map((person) => (
              <li key={person.name}>
                <span className="avatar avatar-md">{person.initials}</span>
                <span className="match-name">
                  {person.name}
                  <small>{person.role}</small>
                </span>
                {person.status === "accept" ? (
                  <span className="connection-accept">Accept</span>
                ) : person.status === "connected" ? (
                  <span className="connection-status is-connected">Connected</span>
                ) : (
                  <span className="connection-status">Request sent</span>
                )}
              </li>
            ))}
          </ul>
        </BentoCard>
      </div>
    </section>
  );
}
