import Image from "next/image";
import type { ReactNode } from "react";
import {
  BatteryFull,
  Bell,
  ChevronLeft,
  Play,
  Search,
  Signal,
  Volume2,
  Waypoints,
  Wifi,
  X,
} from "lucide-react";

export function Phone({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`phone ${className}`}>
      <div className="phone-screen">
        <div className="status-bar" aria-hidden="true">
          <span>9:41</span>
          <span className="island" />
          <span className="status-icons">
            <Signal className="size-3.5" strokeWidth={2.5} />
            <Wifi className="size-3.5" strokeWidth={2.5} />
            <BatteryFull className="size-4" strokeWidth={2} />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

const scallopCircles = [
  [50, 50, 34],
  [22, 24, 18],
  [50, 13, 16],
  [78, 24, 18],
  [88, 50, 15],
  [78, 77, 18],
  [50, 88, 16],
  [22, 77, 18],
  [12, 50, 15],
];

export function Scallop() {
  return scallopCircles.map(([cx, cy, r]) => (
    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
  ));
}

export function CloudShape() {
  return (
    <svg
      className="cloud-shape"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <Scallop />
    </svg>
  );
}

export function MascotBlob({ className = "" }: { className?: string }) {
  return (
    <svg className={`mascot-blob ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <Scallop />
      <ellipse cx="40" cy="47" rx="6.5" ry="9" fill="white" />
      <ellipse cx="60" cy="47" rx="6.5" ry="9" fill="white" />
    </svg>
  );
}

export function HeroCloud({
  id = "hero-cloud-fill",
  className = "hero-cloud",
}: {
  id?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 760 240"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="240"
        >
          <stop offset="0%" stopColor="#edf1f8" />
          <stop offset="60%" stopColor="#f7f8f8" />
          <stop offset="100%" stopColor="#fffdf8" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <circle cx="130" cy="150" r="80" />
        <circle cx="235" cy="100" r="78" />
        <circle cx="345" cy="78" r="86" />
        <circle cx="455" cy="88" r="80" />
        <circle cx="560" cy="110" r="76" />
        <circle cx="645" cy="152" r="72" />
        <rect x="50" y="150" width="660" height="90" />
      </g>
    </svg>
  );
}

export function Waveform({ bars = 18 }: { bars?: number }) {
  return (
    <span className="waveform" aria-hidden="true">
      {Array.from({ length: bars }).map((_, index) => (
        <i key={index} style={{ height: `${24 + ((index * 37) % 70)}%` }} />
      ))}
    </span>
  );
}

function Avatar({
  initials,
  size = "md",
}: {
  initials: string;
  size?: "md" | "lg";
}) {
  return <span className={`avatar avatar-${size}`}>{initials}</span>;
}

const tracks = [
  { title: "night drive 145", kind: "Beat", length: "0:32" },
  { title: "hook idea v3", kind: "Voice memo", length: "0:18" },
  { title: "basement loop", kind: "Loop", length: "0:41" },
  { title: "untitled 4", kind: "Beat", length: "0:27" },
];

export function ProfileScreen() {
  return (
    <div className="screen-body">
      <div className="profile-head">
        <Avatar initials="NR" size="lg" />
        <div>
          <strong>Nova Ray</strong>
          <span>Producer · Atlanta, US</span>
        </div>
      </div>
      <div className="screen-chips">
        <span>rage</span>
        <span>hyperpop</span>
        <span>145 BPM</span>
      </div>
      <p className="screen-label">Snippets</p>
      <ul className="track-list">
        {tracks.map((track) => (
          <li key={track.title}>
            <span className="track-play">
              <Play className="ml-px size-3.5 fill-current" />
            </span>
            <span className="track-title">
              {track.title}
              <small>{track.kind}</small>
            </span>
            <time>{track.length}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}

const matches = [
  { initials: "MK", name: "Mila K.", role: "Singer · Houston", score: 96 },
  { initials: "TV", name: "Tavi", role: "Producer · Atlanta", score: 94 },
  { initials: "RA", name: "Rae", role: "Rapper · Chicago", score: 89 },
  { initials: "DX", name: "Dex", role: "Engineer · LA", score: 85 },
  { initials: "JO", name: "Jojo", role: "Rapper · Atlanta", score: 82 },
];

export function MatchesScreen() {
  return (
    <div className="screen-body">
      <div className="screen-title">
        <strong>Matches</strong>
        <span>5 new</span>
      </div>
      <ul className="match-list">
        {matches.map((match) => (
          <li key={match.name}>
            <Avatar initials={match.initials} />
            <span className="match-name">
              {match.name}
              <small>{match.role}</small>
            </span>
            <span className="match-score">{match.score}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChatScreen() {
  return (
    <div className="screen-body">
      <div className="chat-head">
        <ChevronLeft className="size-5 text-blue" />
        <Avatar initials="NR" />
        <span className="match-name">
          Nova Ray
          <small>Producer</small>
        </span>
      </div>
      <div className="chat-thread">
        <p className="bubble bubble-in">sent you the beat, lmk what you think</p>
        <p className="bubble bubble-out">hook is crazy. can you send stems?</p>
        <div className="bubble bubble-in bubble-voice">
          <span className="track-play">
            <Play className="ml-px size-3.5 fill-current" />
          </span>
          <Waveform bars={16} />
          <time>0:24</time>
        </div>
        <p className="bubble bubble-out">studio friday?</p>
        <p className="bubble bubble-in">bet</p>
      </div>
    </div>
  );
}

export function DiscoverScreen() {
  return (
    <div className="discover">
      <div className="discover-bar">
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          className="discover-me"
        />
        <span className="discover-search">
          <Search className="size-[18px]" strokeWidth={2.5} />
          Search
        </span>
        <Bell className="size-5 fill-current text-[#c9ccd2]" strokeWidth={0} />
      </div>

      <div className="discover-card">
        <div className="discover-photo" aria-hidden="true">
          <Image src="/logo.png" alt="" width={220} height={220} />
        </div>
        <div className="discover-info">
          <div className="discover-row">
            <span className="avatar avatar-md avatar-dark">NR</span>
            <span className="discover-name">
              800pts
              <small>Rapper · Atlanta, US</small>
            </span>
            <Volume2 className="size-5 fill-current" strokeWidth={1.75} />
          </div>
          <div className="discover-tags">
            <span>hip-hop</span>
            <span>rage</span>
            <span>ken carson</span>
          </div>
        </div>
      </div>

      <div className="discover-actions">
        <button type="button" className="pressable discover-connect" aria-label="Connect">
          <Waypoints className="size-7" strokeWidth={2.5} />
        </button>
        <button type="button" className="pressable discover-pass" aria-label="Pass">
          <span>
            <X className="size-4" strokeWidth={3} />
          </span>
        </button>
      </div>
    </div>
  );
}
