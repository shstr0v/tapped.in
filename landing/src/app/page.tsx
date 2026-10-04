import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  AudioLines,
  Bell,
  Bookmark,
  Check,
  Layers,
  MessageCircle,
  MessagesSquare,
  Mic,
  Search,
  Tag,
  Trophy,
  UserPlus,
  Waypoints,
} from "lucide-react";
import {
  ChatScreen,
  CloudShape,
  DiscoverScreen,
  HeroCloud,
  MascotBlob,
  MatchesScreen,
  Phone,
  ProfileScreen,
} from "@/components/app-screens";
import { FeatureBento } from "@/components/feature-bento";
import { ProblemSection } from "@/components/problem-section";
import { SiteFooter } from "@/components/site-footer";

const navLinks = [
  ["Discover", "#discover"],
  ["How it works", "#how"],
  ["Why TappedIn", "#problem"],
];

const features: {
  title: string;
  body: string;
  points: string[];
  screen: ReactNode;
  sticker: ReactNode;
  stickerSide: "left" | "right";
}[] = [
  {
    title: "Show what you sound like",
    body: "Your profile is your music. Upload a beat, a hook, or a voice memo, and people hear it before they read anything.",
    points: [
      "Pick your role and genres",
      "Upload snippets in seconds",
      "Add the artists you sound like",
    ],
    screen: <ProfileScreen />,
    sticker: (
      <>
        <span className="sticker-icon">
          <AudioLines className="size-4" strokeWidth={2.25} />
        </span>
        <span>
          <strong>hook idea v3.m4a</strong>
          <small>Uploaded · 0:18</small>
        </span>
      </>
    ),
    stickerSide: "right",
  },
  {
    title: "Match by sound, not followers",
    body: "We match you on genres, references, BPM, and city, and we show the reason, so you know why someone landed in your list.",
    points: [
      "See why you matched",
      "Send a request in one tap",
      "No follower counts anywhere",
    ],
    screen: <MatchesScreen />,
    sticker: (
      <span>
        <small>Why you matched</small>
        <strong>Both into Ken Carson, 140–150 BPM, both in Atlanta</strong>
      </span>
    ),
    stickerSide: "left",
  },
  {
    title: "Turn a match into a session",
    body: "Trade voice notes, leave feedback on a track, and plan the studio day in the same chat.",
    points: [
      "Voice notes and stems",
      "Feedback on specific tracks",
      "Plan the session together",
    ],
    screen: <ChatScreen />,
    sticker: (
      <span>
        <small>Feedback on night drive 145</small>
        <strong>Hook hits hard. Cut the intro to 4 bars.</strong>
      </span>
    ),
    stickerSide: "right",
  },
];

const appTools = [
  { label: "Discover", icon: Layers, color: "#2671fe", deep: "#1a52c9" },
  { label: "Matches", icon: Waypoints, color: "#34b24a", deep: "#238a36" },
  { label: "Snippets", icon: AudioLines, color: "#f97316", deep: "#cf5a0a" },
  { label: "Voice notes", icon: Mic, color: "#ec4899", deep: "#c02f78" },
  { label: "Chat", icon: MessageCircle, color: "#8b5cf6", deep: "#6a3ddb" },
  { label: "Feedback", icon: MessagesSquare, color: "#ef4444", deep: "#c42b2b" },
  { label: "Sound tags", icon: Tag, color: "#14b8a6", deep: "#0d8c7e" },
  { label: "Requests", icon: UserPlus, color: "#4f46e5", deep: "#3a32bd" },
  { label: "Points", icon: Trophy, color: "#eaa000", deep: "#c07f00" },
  { label: "Saved", icon: Bookmark, color: "#0ea5e9", deep: "#0a7fb4" },
  { label: "Search", icon: Search, color: "#64748b", deep: "#475569" },
  { label: "Alerts", icon: Bell, color: "#f43f5e", deep: "#c9223f" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink">
      <header className="site-header">
        <nav className="mx-auto flex h-20 w-full max-w-site items-center justify-between px-5 sm:px-8">
          <a href="#top" className="pressable flex items-center gap-3 rounded-2xl">
            <Image
              src="/logo.png"
              alt="TappedIn mascot"
              width={44}
              height={44}
              priority
              className="size-11 rounded-2xl"
            />
            <span className="font-display text-xl font-extrabold tracking-tight">
              TappedIn
            </span>
          </a>
          <div className="hidden items-center gap-9 text-[15px] font-medium text-ink/70 lg:flex">
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} className="nav-link rounded-md">
                {label}
              </a>
            ))}
          </div>
          <a
            href="#join"
            className="pressable primary-cta primary-cta-sm"
          >
            Join TappedIn
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section id="top" className="hero-shell">
        <div className="hero-stage" aria-hidden="true">
          <MascotBlob className="mascot-blue" />
          <MascotBlob className="mascot-pink" />
          <Phone className="hero-phone">
            <MatchesScreen />
          </Phone>
          <HeroCloud />
        </div>
        <div className="hero-copy">
          <h1>
            Make music.
            <span>Find your people.</span>
          </h1>
          <p>Artists and producers, matched by sound, not follower count.</p>
          <a href="#join" className="hero-cta pressable">
            Join the waitlist
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <FeatureBento />

   

      <section id="how" className="content-section">
        <div className="section-intro">
          <h2>How it works</h2>
        </div>
        <div className="feature-list">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`feature-row${index % 2 === 1 ? " is-flipped" : ""}`}
            >
              <div className="feature-art" aria-hidden="true">
                <CloudShape />
                <Phone>{feature.screen}</Phone>
                <div className={`sticker sticker-${feature.stickerSide}`}>
                  {feature.sticker}
                </div>
              </div>
              <div className="feature-copy">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <ul>
                  {feature.points.map((point) => (
                    <li key={point}>
                      <Check
                        className="size-[18px] shrink-0 text-blue"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="preview-section">
        <div className="preview-copy">
          <h2>Listen first, then decide.</h2>
          <p>
            This is the card you swipe. A snippet plays while you look, the
            tags tell you their lane, and two buttons decide the rest: connect
            or pass.
          </p>
        </div>
        <div className="preview-art">
          <Phone className="phone-lg">
            <DiscoverScreen />
          </Phone>
        </div>
      </section>

      <section className="tools-section">
        <div className="tools-head">
          <HeroCloud id="tools-cloud-fill" className="tools-cloud" />
          <MascotBlob className="mascot-green" />
          <h2>Everything in the app</h2>
        </div>
        <ul className="tools-list">
          {appTools.map((tool) => (
            <li
              key={tool.label}
              className="tool-pill"
              style={
                { "--tool": tool.color, "--tool-deep": tool.deep } as CSSProperties
              }
            >
              <span className="tool-icon" aria-hidden="true">
                <tool.icon className="size-[18px]" strokeWidth={2.25} />
              </span>
              <span className="tool-label">{tool.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <ProblemSection />

      <SiteFooter />
    </main>
  );
}
