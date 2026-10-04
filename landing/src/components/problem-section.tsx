import { Check, Play } from "lucide-react";
import { Waveform } from "@/components/app-screens";

const coldDms = [
  {
    initials: "LW",
    handle: "@lilwave",
    text: "yo got some beats for u, link in bio",
    status: "Seen 3d",
  },
  {
    initials: "KM",
    handle: "@kaii.music",
    text: "would you hop on something dark?",
    status: "No reply",
  },
  {
    initials: "YS",
    handle: "@yungsol",
    text: "sent you a pack, lmk what you think",
    status: "Seen 1w",
  },
  {
    initials: "NB",
    handle: "@nobody.b",
    text: "big fan, open to collab?",
    status: "Delivered",
  },
];

const tags = ["145 BPM", "F minor", "Dark", "Rage"];

const shortlist = [
  { initials: "MK", name: "Mila K.", meta: "Singer · Atlanta", score: 96 },
  { initials: "RA", name: "Rae", meta: "Rapper · Houston", score: 91 },
  { initials: "JO", name: "Jojo", meta: "Rapper · Atlanta", score: 88 },
];

const steps = [
  {
    title: "It listens to your beat",
    body: "Tempo, key, mood, and the texture of your 808s and synths, straight from the audio.",
  },
  {
    title: "It compares every artist",
    body: "Their uploads, the references they list, and what they're looking for this week.",
  },
  {
    title: "You get people, not a feed",
    body: "A short list ranked by fit, with the reason next to every name.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="problem-section">
      <div className="section-intro">
        <h2>Finding the right artist takes hours. It should take minutes.</h2>
        <p>
          Right now producers scroll hashtags, send cold DMs, and wait. Most
          messages never get an answer, and the ones that do often want a
          different sound.
        </p>
      </div>

      <div className="problem-grid">
        <article className="problem-card problem-before">
          <span className="problem-tag">Today</span>
          <strong className="problem-time">Hours.</strong>
          <p>Scroll, DM thirty people, wait a week, hear back from one.</p>
          <ul className="dm-list" aria-label="Example of unanswered messages">
            {coldDms.map((dm) => (
              <li key={dm.handle}>
                <span className="avatar avatar-md avatar-muted">
                  {dm.initials}
                </span>
                <span className="match-name">
                  {dm.handle}
                  <small>{dm.text}</small>
                </span>
                <span className="dm-status">{dm.status}</span>
              </li>
            ))}
            <li className="dm-more">+ 26 more like this</li>
          </ul>
        </article>

        <article className="problem-card problem-after">
          <span className="problem-tag">With TappedIn</span>
          <strong className="problem-time">Minutes.</strong>
          <p>Upload one beat. Our model finds the artists who fit it.</p>
          <div className="shortlist-card" aria-label="Example of a shortlist">
            <div className="shortlist-track">
              <span className="track-play">
                <Play
                  className="ml-px size-3.5 fill-current"
                  aria-hidden="true"
                />
              </span>
              <span className="match-name">
                night drive 145.wav
                <small>Analyzed in 0:42</small>
              </span>
              <Waveform bars={16} />
            </div>
            <ul className="shortlist-tags">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <span className="shortlist-label">Best fits for this beat</span>
            <ul className="shortlist-people">
              {shortlist.map((person) => (
                <li key={person.name}>
                  <span className="avatar avatar-md">{person.initials}</span>
                  <span className="match-name">
                    {person.name}
                    <small>{person.meta}</small>
                  </span>
                  <span className="match-score">{person.score}%</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}
