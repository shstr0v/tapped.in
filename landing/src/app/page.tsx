import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowRight, Play, Sparkles, UsersRound, Volume2 } from "lucide-react";
import { ProductMockup } from "@/components/product-mockup";
import { WaitlistForm } from "@/components/waitlist-form";

const navLinks = [
  ["Discover", "#discover"],
  ["How it works", "#how"],
  ["For Artists", "#artists"],
  ["For Producers", "#producers"],
];

const howSteps = [
  {
    title: "Build your profile",
    body: "Set your role, genres, influences, location, sound tags, and what kind of collaborator you want.",
    tone: "bg-card-blue",
  },
  {
    title: "Share your sound",
    body: "Drop a beat, vocal, hook idea, loop, freestyle, or unreleased snippet so people can listen first.",
    tone: "bg-card-yellow",
  },
  {
    title: "Discover people",
    body: "Swipe through artists and producers one at a time, with compatibility cues that explain the match.",
    tone: "bg-card-pink",
  },
  {
    title: "Connect and collaborate",
    body: "Save profiles, send a request, trade feedback, and turn a good match into a real session.",
    tone: "bg-card-mint",
  },
];

const profileCards = [
  {
    id: "artists",
    eyebrow: "For artists",
    title: "Find producers who already make the world you hear in your head.",
    body: "Skip cold DMs and follower-count guessing. Listen to beats, check influences, and connect when the sound fits.",
    accent: "text-blue",
    bg: "bg-card-blue",
    chips: ["Rage hooks", "Alt pop vocals", "Local sessions"],
  },
  {
    id: "producers",
    eyebrow: "For producers",
    title: "Get your beats in front of artists who actually want that lane.",
    body: "Show the style, BPM, mood, and references behind your work, then match with artists looking for that exact energy.",
    accent: "text-green",
    bg: "bg-card-mint",
    chips: ["Type beat fit", "Open verses", "Feedback ready"],
  },
];

const feedbackNotes = [
  "Hard drums",
  "Hook hits",
  "Mix feels clean",
  "Needs bridge",
  "Send stems",
  "Studio soon",
];

function SectionIntro({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="section-intro">
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink">
      <header className="site-header">
        <nav className="mx-auto flex h-20 w-full max-w-site items-center justify-between px-5 sm:px-8">
          <a href="#top" className="pressable flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="TappedIn mascot"
              width={44}
              height={44}
              priority
              className="size-11 rounded-2xl"
            />
            <span className="font-display text-xl font-black tracking-tight">
              TappedIn
            </span>
          </a>
          <div className="hidden items-center gap-9 text-[15px] font-semibold text-ink/70 lg:flex">
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} className="nav-link">
                {label}
              </a>
            ))}
          </div>
          <a
            href="#join"
            className="pressable hidden min-h-12 items-center gap-2 rounded-2xl bg-ink px-5 text-[15px] font-black text-white shadow-button sm:inline-flex"
          >
            Join TappedIn
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section id="top" className="hero-shell">
        <div className="hero-art" aria-hidden="true">
          <Image
            src="/welcome-illustration.png"
            alt=""
            width={900}
            height={900}
            priority
            className="hero-illustration"
          />
        </div>
        <div className="hero-copy">
          <div className="hero-badge">
            <Sparkles className="size-4" aria-hidden="true" />
            Music people, not follower counts
          </div>
          <h1 className="text-1xl">
            Make music.
            <span>Find your people.</span>
          </h1>
          <p>
            Discover producers, artists, and collaborators who match your sound.
          </p>
          <div className="hero-actions">
            <a href="#join" className="primary-cta pressable">
              Join TappedIn
              <ArrowRight className="size-5" aria-hidden="true" />
            </a>
            <a href="#how" className="secondary-cta pressable">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section id="discover" className="statement-section">
        <p>
          TappedIn turns the first listen into a first move - a softer, faster
          way for musicians to find the people who make their sound click.
        </p>
      </section>

      <section id="how" className="content-section">
        <SectionIntro
          kicker="How it works"
          title="Four steps from soundcheck to collaborator."
          body="A profile-first flow that feels closer to discovering music than filling out a networking form."
        />
        <div className="steps-grid">
          {howSteps.map((step, index) => (
            <article
              key={step.title}
              className={`play-card ${step.tone}`}
              style={
                {
                  "--tilt": `${index % 2 === 0 ? -1.2 : 1.2}deg`,
                } as CSSProperties
              }
            >
              <div className="step-number">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="preview-section">
        <div className="preview-copy">
          <span className="kicker">Discovery feed</span>
          <h2>Swipe through sounds, not empty profiles.</h2>
          <p>
            Each card puts the audio up front, then gives enough context to
            decide whether to connect, save, skip, or leave feedback.
          </p>
          <div className="mini-proof">
            <span>
              <Volume2 className="size-4" aria-hidden="true" />
              Audio first
            </span>
            <span>
              <UsersRound className="size-4" aria-hidden="true" />
              Match context
            </span>
          </div>
        </div>
        <ProductMockup />
      </section>

      <section className="profiles-section">
        {profileCards.map((card) => (
          <article
            id={card.id}
            key={card.id}
            className={`profile-panel ${card.bg}`}
          >
            <div>
              <span className={`kicker ${card.accent}`}>{card.eyebrow}</span>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </div>
            <div className="profile-chip-list">
              {card.chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="collab-section">
        <div className="collab-card">
          <div className="collab-copy">
            <span className="kicker">Feedback and collabs</span>
            <h2>Make the chat useful before the session starts.</h2>
            <p>
              Reactions, structured feedback, saved contacts, and connection
              requests keep the creative energy moving without turning TappedIn
              into another inbox.
            </p>
          </div>
          <div className="feedback-board" aria-label="Example feedback notes">
            {feedbackNotes.map((note, index) => (
              <span key={note} className={`note note-${index + 1}`}>
                {note}
              </span>
            ))}
            <div className="voice-note">
              <button
                type="button"
                className="pressable"
                aria-label="Play voice note"
              >
                <Play
                  className="ml-0.5 size-5 fill-current"
                  aria-hidden="true"
                />
              </button>
              <div>
                <strong>Nova sent a hook idea</strong>
                <div className="wave-bars" aria-hidden="true">
                  {Array.from({ length: 16 }).map((_, index) => (
                    <i
                      key={index}
                      style={{ height: `${18 + ((index * 9) % 42)}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="join" className="final-cta">
        <div className="final-cta-card">
          <Image
            src="/logo.png"
            alt=""
            width={96}
            height={96}
            className="mx-auto size-20 rounded-[1.8rem]"
          />
          <h2>Get tapped into your next collaborator.</h2>
          <p>
            Join the waitlist for early access and product drops from the
            TappedIn team.
          </p>
          <div className="mx-auto mt-8 w-full max-w-2xl">
            <WaitlistForm variant="dark" />
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="mx-auto flex w-full max-w-site flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Image
              src="/footer_logo_2.png"
              alt="TappedIn"
              width={220}
              height={124}
              className="h-auto w-36"
            />
            <p>Find your sound. Find your people.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-white/60">
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} className="nav-link">
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
