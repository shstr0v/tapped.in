# 7. Product Requirements

## 7.1. Brand

**Name:** TappedIn

**Definition:**  
TappedIn is a discovery and networking platform for music producers and artists. It works like Tinder for music collaboration: users discover relevant people, listen to their work, connect, exchange feedback, and start working together.

**Core idea:**  
**Discover people by their sound, not by their follower count.**

**Positioning:**  
TappedIn helps producers and artists find collaborators who actually match their musical style.

**Primary color:** Sky blue

**UI direction:**

- Soft
- Minimal
- Modern
- Music-first
- Mobile-first
- Fast and swipe-based
- Strong focus on audio and profiles

**Possible tagline:**  
**Find your sound. Find your people.**

Alternative:
**Get tapped in.**

---

# 7.2. User Types

TappedIn has two main user types:

### Artist

A rapper, singer, vocalist, songwriter, or performing artist looking for:

- Producers
- Beats
- Collaborators
- Feedback
- Networking

### Producer

A beatmaker or music producer looking for:

- Artists
- Placements
- Collaborators
- Feedback
- Networking opportunities

Users may later be allowed to select multiple roles.

---

# 7.3. Core Product Flow

The main user flow:

**Sign Up → Create Music Profile → Upload Work → Receive Recommendations → Listen → Swipe / Connect → Match → Communicate / Share Work**

The product should make discovering relevant collaborators as fast as discovering content on TikTok or people on Tinder.

---

# 7.4. Onboarding & Authentication

During registration, the user creates a **music profile**.

### Basic information

- Name / artist name
- Profile picture
- Artist or Producer
- Location
- Experience level
- Bio
- Social media links

### Music preferences

The user selects:

- Genres
- Subgenres
- Artists they are inspired by
- Type beats they make / use
- Preferred styles
- Preferred BPM range
- Mood / sound
- Artists they want to work with

Possible integrations:

- Spotify search
- SoundCloud search
- YouTube search

Example:

> Inspired by: Playboi Carti, Ken Carson, Destroy Lonely  
> Genres: Rage, Trap  
> Type Beats: Ken Carson / Carti  
> Location: Bucharest  
> Experience: 3 years

This information becomes the initial input for the recommendation algorithm.

---

# 7.5. Recommendation Feed

The **Recommendation Feed is the core feature of TappedIn.**

It should feel like a combination of:

**Tinder + TikTok + SoundCloud**

Users are shown one profile/work at a time.

Each card contains:

- Profile picture
- Artist / producer name
- User type
- Location
- Genre
- Influences
- Uploaded track / beat
- Social media
- Match score
- Short bio

### Main actions

**Swipe Right — Connect**

User is interested in working with this person.

**Swipe Left — Skip**

User is not interested.

**Save**

Save profile for later.

**Feedback**

Optionally leave feedback on the uploaded work.

---

# 7.6. Smart Recommendations

Recommendations should not be random.

The system should rank users based on compatibility.

Possible signals:

- Genre similarity
- Artist inspirations
- Type beat preferences
- Location
- Experience level
- Listening behaviour
- Previous likes
- Previous skips
- User feedback
- Profile interactions

Later versions can analyse uploaded audio directly.

Example:

> **92% Match**

because:

- Same genre
- Similar influences
- Producer creates the type of beats the artist uses
- Both work with similar BPM ranges

---

# 7.7. Music Uploads

Every user can upload examples of their work.

### Producers

Can upload:

- Beats
- Loops
- Snippets
- Producer demos

### Artists

Can upload:

- Songs
- Unreleased demos
- Freestyles
- Vocals
- Snippets

For MVP, each user could be limited to **1–3 featured uploads**.

Each upload contains:

- Audio
- Title
- Genre
- Tags
- BPM if relevant
- Description

---

# 7.8. Feedback System

Users can optionally give feedback on music.

Instead of only having likes, feedback should be structured.

Example categories:

- Production
- Mix
- Vocals
- Flow
- Melody
- Arrangement
- Originality

Users can leave:

**Quick feedback**

> 🔥 Hard  
> 🎧 Good mix  
> 🎤 Vocals need work  
> 💡 Interesting idea

or:

**Detailed feedback**

Free-text feedback.

This creates another reason for users to stay in the app even when they are not actively searching for collaborators.

---

# 7.9. Connections

When one user wants to work with another, they can send a **Connection Request**.

Possible states:

**Not Connected → Request Sent → Connected**

After accepting a connection, users gain access to additional contact options.

For MVP:

- Share email
- Share social media
- Save user into Connections

Later:

- In-app messaging
- Beat sending
- File sharing

---

# 7.10. Contacts Database

TappedIn can also act as a lightweight CRM for music networking.

Every accepted connection is stored inside the user's network.

Example:

### My Connections

**Artists**

- Alex — Rage
- Mike — Trap
- John — Hyperpop

**Producers**

- Nick — Rage
- Chris — Trap

Users should later be able to:

- Search connections
- Filter by role
- Filter by genre
- Add notes
- Export contacts
- Track previous interactions

Possible export formats:

- CSV
- Contacts
- Email list

---

# 7.11. Private Messenger / Mail Client

This can be implemented after the main MVP.

The purpose is to solve a common music-industry problem:

**artists do not want their private emails publicly exposed.**

Instead of publishing an email address, artists receive submissions inside TappedIn.

Flow:

**Producer → Connect → Artist accepts → Producer can send beat**

The artist controls:

- Who can contact them
- Who can send files
- Who can send beats
- Whether they accept unsolicited submissions

Example settings:

> Accept beats from:
>
> - Everyone
> - Connections only
> - Approved producers only
> - Nobody

---

# 7.12. Beat / File Sending

Connected users should eventually be able to send:

- MP3
- WAV
- Stems
- Demo tracks
- Links

A producer could send:

> **Beat: "RAGE 145 BPM"**

with:

- Audio preview
- BPM
- Key
- Message

Artist can:

**Accept / Save / Reject / Reply**

This gives TappedIn a major advantage over platforms that only provide networking.

---

# 7.13. Studios Nearby

**Post-MVP feature.**

Users can discover:

- Recording studios
- Producers
- Engineers
- Creative spaces

near their location.

Possible filters:

- Distance
- Price
- Rating
- Equipment
- Availability
- Genres

Example:

> **Studios near you**

> 1.2 km — Trap/Rap Studio  
> €20/hour  
> ⭐ 4.8

This could later become a marketplace feature.

---

# 7.14. Discovery Filters

Users should be able to filter recommendations.

Possible filters:

- Artist / Producer
- Genre
- Location
- Distance
- Experience
- Influences
- Type beat
- BPM
- Online / Local
- Looking for paid work
- Looking for free collaboration

For MVP, keep only:

- User type
- Genre
- Location

---

# 7.15. Profile

Each profile should contain:

### Header

- Avatar
- Artist name
- Role
- Location
- Experience

### Music identity

- Genres
- Influences
- Type beats
- Sound description

### Work

- Songs / beats
- Audio previews

### Social

- Instagram
- Spotify
- SoundCloud
- YouTube

### Collaboration status

Example:

> **Looking for artists**

or:

> **Open for collaborations**

---

# 7.16. Match Score

One potentially strong differentiator for TappedIn is a **Music Compatibility Score**.

Example:

## 94% Match

**Why you match**

- 95% genre similarity
- Same artist influences
- Same preferred sound
- Compatible location
- Similar experience

This gives users a reason why the recommendation exists rather than showing random profiles.

---

# 7.17. Recommendation Algorithm

## MVP

Start with a simple weighted ranking algorithm.

Example:

```text
Match Score =
Genre similarity × 35%
Artist influences × 30%
Type beat similarity × 20%
Location × 10%
Experience × 5%
```

Later, the algorithm can learn from behaviour:

- Swipes
- Connections
- Listening time
- Feedback
- Profile visits

Eventually:

**Collaborative filtering + audio embeddings + behavioural recommendations.**

---

# 7.18. Notifications

Possible notifications:

- Someone connected with you
- Connection accepted
- New feedback
- New message
- Someone sent you a beat
- New strong match found

For MVP:

- Connection accepted
- New feedback

---

# 7.19. Monetization

Not required for the hackathon MVP, but useful for product scalability.

### Free

- Limited daily swipes
- Basic recommendations
- Upload music
- Connections
- Feedback

### Pro

Possible features:

- Unlimited swipes
- Advanced filters
- See who liked you
- Priority recommendations
- Advanced analytics
- More uploads
- Private inbox
- Contact export
- Profile boost

Potential subscription:

**TappedIn Pro**

Stripe can be used for subscriptions.

---

# 7.20. MVP Scope

For the hackathon, the MVP should focus only on the features that prove the concept.

## MUST HAVE

- Authentication
- Artist / Producer onboarding
- Music profile
- Upload one song / beat
- Recommendation feed
- Swipe left / right
- Connections
- Basic feedback
- Match score
- Basic profile page

## SHOULD HAVE

- Social links
- Email sharing after connection
- Filters
- Simple notifications

## NICE TO HAVE

- Private messenger
- Beat sending
- Studios nearby
- Stripe
- Full ML recommendation engine
- Contact export

---

# 7.21. Technical Stack

## Client

**React Native**

Responsibilities:

- Mobile UI
- Feed
- Audio player
- Profile
- Onboarding
- Connections
- Feedback

Possible tooling:

- Expo
- TypeScript
- TanStack Query / React Query
- Zustand

### Client Architecture

**Feature-Sliced Design (FSD)**

Example:

```text
app/
pages/
widgets/
features/
entities/
shared/
```

---

## Backend

**Python + FastAPI**

Responsibilities:

- Authentication
- Users
- Profiles
- Recommendations
- Connections
- Feedback
- Uploads
- Social links

---

## Database

**PostgreSQL**

Core entities:

```text
User
Profile
MusicUpload
Genre
Influence
Swipe
Connection
Feedback
SocialLink
Message
```

---

## Recommendation System

### MVP

Python-based recommendation service.

Simple similarity ranking based on profile attributes.

### Future

- ML recommendations
- Audio embeddings
- Collaborative filtering
- Recommendation learning based on swipes

Possible architecture:

```text
User
↓
Profile + Music Preferences
↓
Recommendation Service
↓
Candidate Ranking
↓
Feed
↓
Swipe Data
↓
Algorithm improves recommendations
```

---

## File Storage

For audio:

- S3-compatible storage
- Cloudflare R2
- Supabase Storage

Do not store audio directly inside PostgreSQL.

---

## Infrastructure

- Docker
- NGINX
- FastAPI
- PostgreSQL

For a hackathon deployment, something simpler such as:

**React Native / Expo + FastAPI + Supabase / Neon + Render / Railway**

will probably be much faster than building a full production infrastructure.

---

# 7.22. Architecture

Use **DDD + Clean Architecture** on the backend, but avoid overengineering the MVP.

Possible domains:

```text
Identity
Profiles
Discovery
Connections
Feedback
Messaging
```

Backend structure:

```text
domain/
application/
infrastructure/
presentation/
```

The main domain for the MVP is:

**Discovery & Connections**

Everything else supports it.

---

# 7.23. Core Metrics

You should already define what determines whether TappedIn works.

### Discovery

- Swipe → Connection rate
- Profiles listened to
- Average listening time
- Match acceptance rate

### Networking

- Connections per user
- Connection acceptance rate
- Contact exchanges

### Engagement

- Sessions per user
- Feedback submitted
- Music uploads

The most important metric could be:

> **Successful Connections per Active User**

because the product's primary purpose is connecting musicians.

---

# 7.24. Core Hypotheses

These are useful both for product development and your hackathon presentation.

### H1

Artists and producers have difficulty finding collaborators whose sound matches theirs.

### H2

Users prefer music-based discovery over searching through usernames and follower counts.

### H3

Showing a compatibility score makes users more likely to explore recommended collaborators.

### H4

Users are willing to provide feedback when the process is quick and structured.

### H5

Musicians prefer controlling who can contact them instead of publicly exposing their email.

---

# 7.25. Main Product Differentiation

TappedIn should **not** position itself only as:

> Tinder for musicians.

That concept already exists in the market.

A stronger positioning is:

> **TappedIn is a music-first matching network that connects artists and producers based on their actual sound, influences and collaboration compatibility.**

The swipe interface is just the UX.

The real product is:

**Music Compatibility + Discovery + Connection + Collaboration.**

That distinction will also make the project much stronger when explaining its innovation to the hackathon judges.