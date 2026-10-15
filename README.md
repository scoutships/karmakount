# ⚖️ KarmaKount // The Massively Multiplayer IRL Game

> **Every action leaves an indelible ripple on the Cosmic Scales.**  
> KarmaKount is an alternate-reality massively multiplayer real-world game where players log, witness, verify, and atone for deeds done in physical reality.

---

## 🌟 Core Game Mechanics

### 1. The Cosmic Ledger (Virtues & Vices)
- **Self-Reported Confessions & Merits**: Players can confess their daily missteps (e.g. cutting in line, littering, gossiping) or log good deeds (e.g. picking up neighborhood plastic, paying for a stranger's meal).
- **Witness / Encounter Logging**: Log deeds witnessed on other IRL players by selecting them, entering their gamer handle, or scanning their real-world **Karmic Sigil (QR code)**.
- **Impact Tiers**:
  - `TRIVIAL` (±10 Karma): Minor daily gestures (held door, picked up a single cup).
  - `NOTABLE` (±35 Karma): Meaningful community actions or public nuisances.
  - `MAJOR` (±100 Karma): High-impact interventions or major breaches of trust.
  - `MYTHIC` (±300 Karma): Heroic acts of life-saving benevolence or catastrophic community harm.

### 2. The Karmic Court (Peer Review & Anti-Fraud Tribunal)
In an IRL MMO, consensus is the foundation of truth:
- Notable & Major deeds enter a **`PENDING_JURY`** state.
- Other players act as **Arbiters** in the **Karmic Court**:
  - **Vouch (Corroborate)**: Confirms the deed occurred as described. 2 vouches verify the deed into **`VERIFIED TRUTH`** and release the Karma reward to the actor.
  - **Call Cap (Flag Fraud)**: Flags fabricated or exaggerated claims. 2 caps rule the deed **`CALL_CAP_DISPUTED`** and inflict a **-25 Karma penalty** on the dishonest reporter.
  - Arbiters earn **+15 Arbiter XP** for every verified verdict cast.

### 3. Soul Alignments & Auras
Player profiles dynamically calculate status and render unique visual aura glows:
- 👑 **Celestial Ascendant** (+1,000+ Karma): Pulsing golden celestial aura & Archon title.
- 🛡️ **Virtuous Guardian** (+250 to +999 Karma): Emerald guardian halo.
- ⚖️ **Mortal Drifter** (-99 to +249 Karma): Balanced silver threshold.
- 🃏 **Rogue Trickster** (-500 to -100 Karma): Neon amethyst flicker.
- 👹 **Infernal Titan** (Below -500 Karma): Raging crimson flame aura.

### 4. Karmic Debt & The Atonement Sanctuary
- When a player falls into negative Karma, they are marked with **Karmic Debt**.
- Debt can only be cleansed by accepting and completing **IRL Atonement Rituals** and **Community Bounties** (e.g. shopping cart returns, public park cleanups, sincere apologies).

### 5. Tactical IRL Proximity Radar
- Visual circular radar with an animated sweep scanner detecting nearby deeds and active players within a 1.5 km sector.
- Click any blip on the radar screen to inspect their dossier or deed narrative.
- Web Audio synthesizer emits an 880Hz sonar frequency ping.

### 6. Scannable Karmic Sigils (QR Codes)
- Every player has a dynamic, scannable QR code generated using their player ID and handle.
- Bring up your Sigil in the app for another player to scan in person using their phone camera or screen scanner.
- Instantly loads their dossier for immediate IRL actions: **"Bestow Karmic Blessing (+5 Karma)"** or **"Report Caught Vice"**.

### 7. Synthesized Soundscape (Web Audio API)
- Pure browser-synthesized audio without requiring external downloads:
  - **Angelic Chimes**: Resonant major pentatonic harmonic chords on virtue logs.
  - **Infernal Bass Rumble**: Detuned sawtooth sweep with sub-bass drop on vice logs.
  - **Courtroom Gavel**: Wooden resonance impact when arbitrating consensus.
  - **Ascension Fanfare**: Triumphant brass sequence upon quest completion.
  - Sound can be toggled on/off in the top header.

---

## 🚀 Running the Game

The project is installed in `C:\Users\dunky\.gemini\antigravity\scratch\karma`.

### 1. Start Both Frontend and Backend Concurrently
```bash
npm start
```

Or run them individually:
```bash
# Terminal 1: Real-Time WebSocket & REST Backend
npm run server

# Terminal 2: Vite React Frontend with LAN support
npm run dev
```

### 2. Access the Game
- **Local Desktop**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Mobile Phone / LAN Play**: Open `http://<your-lan-ip>:5173` (e.g., `http://192.168.0.26:5173`) on your phone connected to the same Wi-Fi.

---

## 👥 Instant Multi-Persona Testing
Use the **"Persona"** dropdown in the top navigation bar to instantaneously swap between different players:
- **@SaintSophia** (Celestial Ascendant, +1455 Karma, Lumen Faction)
- **@ShadowRebel** (Rogue Trickster, -340 Karma, Chaos Faction)
- **@ZenTao** (Mortal Drifter, True Neutral Arbiter, Equilibrium Faction)
- **@ApexNovice** (Rookie exploring atonement, Lumen Faction)

Test reporting a deed from one persona, switching to another persona, and vouching for it in the Karmic Court in real time!

---

## 📱 Multi-Platform Implementations

KarmaKount is engineered to run seamlessly across 5 platforms from a unified codebase:

### 1. 🌐 Web & Mobile Web
- **Dev Server**: `npm run dev` (Runs on `http://localhost:5173` and LAN `http://<your-ip>:5173`)
- **Backend**: `npm run server` (Express 5 + WebSocket on port 3001)

### 2. 🧩 Chrome Extension (`extension/`)
- **Features**: Quick-log deeds directly from your browser toolbar, view live Karma balance badge, receive Chrome notifications for court votes.
- **How to Load**:
  1. Open Chrome and navigate to `chrome://extensions`.
  2. Toggle **"Developer mode"** in the top-right corner.
  3. Click **"Load unpacked"** and select `C:\Users\dunky\.gemini\antigravity\scratch\karma\extension`.

### 3. 🖥️ Desktop App (Electron)
- **Features**: Dedicated native window, system tray presence, and global hotkey `Ctrl+Alt+K` / `Cmd+Alt+K` to summon KarmaKount anywhere.
- **Run**:
  ```bash
  npm run desktop
  ```

### 4. 🤖 Android Native App (`android/`)
- **Features**: Native Capacitor Gradle project with Camera QR scanning, Geolocation radar, and physical Haptic feedback.
- **Open in Android Studio**:
  ```bash
  npm run mobile:android
  ```

### 5. 🍏 iOS Native App (`ios/`)
- **Features**: Native Capacitor Xcode project with `Info.plist` camera and location privacy descriptions and Apple Taptic Engine feedback.
- **Open in Xcode**:
  ```bash
  npm run mobile:ios
  ```

