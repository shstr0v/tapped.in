import Image from "next/image";
import { Scallop } from "@/components/app-screens";
import { WaitlistForm } from "@/components/waitlist-form";

const columns = [
  {
    title: "Product",
    links: [
      ["Discover", "#discover"],
      ["How it works", "#how"],
      ["Why TappedIn", "#problem"],
    ],
  },
  {
    title: "Get started",
    links: [
      ["Join the waitlist", "#join"],
      ["Back to top", "#top"],
    ],
  },
];

function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size / 2;
  return (
    <path
      d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`}
      fill="#ffc53d"
    />
  );
}

function Note({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} fill="#081226">
      <ellipse cx="0" cy="18" rx="6" ry="4.6" transform="rotate(-20 0 18)" />
      <rect x="4.2" y="-4" width="2.4" height="22" rx="1.2" />
      <path d="M5.4 -4c6 2 10 5 9 12-2-4-5-5-9-6z" />
    </g>
  );
}

function JoinScene() {
  return (
    <svg className="join-scene" viewBox="0 0 400 220" aria-hidden="true">
      <path
        d="M86 120C120 70 170 60 205 92s60 10 70-30"
        fill="none"
        stroke="#e4dccd"
        strokeWidth="3"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />

      <Sparkle x={150} y={44} size={14} />
      <Sparkle x={330} y={30} size={18} />
      <Sparkle x={210} y={150} size={10} />
      <Note x={196} y={52} rotate={-12} />
      <Note x={372} y={40} rotate={14} />

      <g transform="translate(58 102) scale(0.5) rotate(-10 50 50)" fill="#ff4fb8">
        <Scallop />
        <ellipse cx="40" cy="47" rx="6.5" ry="9" fill="white" />
        <ellipse cx="60" cy="47" rx="6.5" ry="9" fill="white" />
      </g>
      <ellipse cx="80" cy="203" rx="72" ry="8" fill="#2fb875" />
      <g fill="#2fb875">
        <circle cx="50" cy="176" r="28" />
        <circle cx="84" cy="168" r="36" />
        <circle cx="116" cy="182" r="22" />
        <rect x="20" y="176" width="118" height="28" rx="4" />
      </g>

      <g transform="translate(150 132) rotate(-14)">
        <circle r="34" fill="#081226" />
        <circle r="25" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
        <circle r="18" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
        <circle r="11" fill="#ff7a2f" />
        <circle r="2.5" fill="#081226" />
      </g>

      <ellipse cx="300" cy="196" rx="74" ry="9" fill="#2fb875" />
      <path
        d="M288 156v34h-9M314 156v34h9"
        fill="none"
        stroke="#081226"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="translate(246 52) scale(1.1)" fill="#2671fe">
        <Scallop />
        <ellipse cx="40" cy="47" rx="6.5" ry="9" fill="white" />
        <ellipse cx="60" cy="47" rx="6.5" ry="9" fill="white" />
        <circle cx="41.5" cy="49" r="3" fill="#081226" />
        <circle cx="61.5" cy="49" r="3" fill="#081226" />
        <path
          d="M-4 40C-4-26 104-26 104 40"
          fill="none"
          stroke="#081226"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect x="-11" y="34" width="14" height="26" rx="7" fill="#081226" />
        <rect x="97" y="34" width="14" height="26" rx="7" fill="#081226" />
      </g>
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <section id="join" className="join-band">
        <div className="join-inner">
          <div className="join-copy">
            <h2>Join TappedIn early</h2>
            <p>
              Artists and producers, matched by sound. We&apos;re letting people
              in a few at a time, so leave your email and we&apos;ll send an
              invite.
            </p>
            <WaitlistForm />
          </div>
          <JoinScene />
        </div>
      </section>

      <div className="site-footer">
        <a href="#top" className="footer-mark pressable" aria-label="TappedIn, back to top">
          <Image src="/logo.png" alt="" width={32} height={32} className="size-8 rounded-[10px]" />
        </a>
        <nav className="footer-columns" aria-label="Footer">
          {columns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="nav-link rounded-md">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="footer-meta">© 2026 TappedIn</p>
      </div>
    </footer>
  );
}
