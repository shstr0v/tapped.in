import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tappedin.app"),
  title: {
    default: "TappedIn - Music-first matching for artists and producers",
    template: "%s | TappedIn",
  },
  description:
    "TappedIn helps artists and producers discover collaborators by sound, influences, and music compatibility instead of follower count.",
  openGraph: {
    title: "TappedIn - Find your sound. Find your people.",
    description:
      "A music-first matching network for artists and producers.",
    type: "website",
    siteName: "TappedIn",
  },
  twitter: {
    card: "summary_large_image",
    title: "TappedIn - Music-first matching",
    description:
      "Discover collaborators by sound, influences, and compatibility.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full bg-cream font-body antialiased">
        {children}
      </body>
    </html>
  );
}
