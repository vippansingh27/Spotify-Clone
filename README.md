# 🎵 Spotify Web Player Clone

A responsive, feature-rich web player clone of Spotify built with pure **HTML5**, **Vanilla CSS**, and **Vanilla JavaScript**. It replicates Spotify's signature dark UI, interactive music player, playlist controls, and real-time audio playback.

![Spotify Clone Preview](./asserts/card1img.jpeg)

---

## ✨ Features

- **🎧 Audio Playback Engine**:
  - Full playback controls: Play, Pause, Next Track, Previous Track.
  - **Shuffle Mode**: Random track selection with active visual state.
  - **Repeat Mode**: Single-track loop or continuous playlist flow.
  - Seamless fallback audio synthesizer using Web Audio API to ensure playback even in restricted network environments.

- **🎚️ Interactive Progress & Seek Bar**:
  - Real-time time elapsed and total duration tracking in `MM:SS` format.
  - Draggable seek bar with dynamic Spotify green trail fill.

- **🔊 Volume & Mute Management**:
  - Smooth volume slider (0% – 100%).
  - One-click mute/unmute toggle.
  - Dynamic volume icons (`fa-volume-high`, `fa-volume-low`, `fa-volume-xmark`).

- **🗂️ Interactive Cards & Music Library**:
  - Hover over any card to reveal Spotify's iconic floating green play button.
  - Click any album/song card to immediately load and stream that track.
  - Visual glowing accent on the currently playing track.
  - Interactive heart icon to save tracks to "Liked Songs" with toast notifications.

- **📂 Sidebar & Navigation**:
  - Sidebar with Home, Search, and Library.
  - **Create Playlist**: Custom playlist creator that dynamically appends playlists to your sidebar library.
  - **Search Filter**: Search songs and filter cards in real-time.

- **⌨️ Keyboard Shortcuts**:
  - `Space` : Play / Pause
  - `Arrow Right` : Seek forward 5 seconds
  - `Arrow Left` : Seek backward 5 seconds
  - `Arrow Up` : Increase volume (+5%)
  - `Arrow Down` : Decrease volume (-5%)
  - `M` : Mute / Unmute
  - `N` : Next track
  - `P` : Previous track

---

## 📁 Project Structure

```text
├── project.html       # Main HTML document with Spotify layout
├── project.css        # Responsive styling, design tokens, and animations
├── project.js         # Core player logic, state management, and audio controls
├── README.md          # Project documentation
└── asserts/           # Graphic assets, album arts, and control icons
    ├── logo.png
    ├── library_icon.png
    ├── backward_icon.png
    ├── forward_icon.png
    ├── player_icon1.png # Shuffle
    ├── player_icon2.png # Previous
    ├── player_icon3.png # Play
    ├── player_icon4.png # Next
    ├── player_icon5.png # Repeat
    ├── play_musicbar.png # Pause
    ├── card1img.jpeg
    ├── card2img.jpeg
    ├── card3img.jpeg
    ├── card4img.jpeg
    ├── card5img.jpeg
    └── card6img.jpeg
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/vippansingh27/Spotify-Clone.git
cd Spotify-Clone
```

### 2. Run the Project
Simply open `project.html` in any web browser, or launch it with a local server (e.g., VS Code Live Server or Python):

```bash
# Using Python
python3 -m http.server 3000
```
Then navigate to `http://localhost:3000/project.html`.

---

## 🛠️ Built With

- **HTML5**: Semantic web structure
- **CSS3**: Flexbox, custom range sliders, micro-interactions, and dark theme
- **JavaScript (ES6+)**: Audio API, DOM manipulation, event-driven state
- **Font Awesome**: Media icons & UI glyphs
- **Google Fonts**: Montserrat font family

---

## 👤 Author

- **Vippan Singh** - [GitHub Profile](https://github.com/vippansingh27)
