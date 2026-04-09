# 🏎 Acoustic Drive: High-Speed Immersive Screen Reader

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed with Vercel](https://img.shields.io/badge/Deployed_with-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

**Acoustic Drive (MOD-5000)** is a professional-grade, experimental screen reader interface designed for extreme-speed data navigation. Inspired by luxury automotive instrumentation and high-performance audio engineering, it allows users to navigate massive datasets at velocities exceeding 900+ WPM through adaptive audio feedback.

![Dashboard Preview](docs/UI.png)

## ✨ Key Features

- **Adaptive Audio Engine**: Spoken feedback dynamically simplifies as navigation speed increases (Full Name → Last Name → Initial Section).
- **Haptic-Inspired Audio Ticks**: High-frequency sine-wave "ticks" provide a spatial sense of progress even when speech is compressed.
- **Alphabet Quick-Nav**: A vertical navigation strip for real-time section tracking across thousands of entries.
- **Acoustic Pulse**: Real-time visual waveform feedback integrated into the status header.
- **Velocity Metrics**: Live precision tracking of WPM, Peak Velocity, and Encounter history.
- **Physics-Driven Navigation**: Toggle between `Linear` and `Exponential` scrolling physics to match your cognitive load.

## 🎮 Navigation Controls

| Key | Action |
| :--- | :--- |
| **W** | Accelerate (Shift Gear Up) |
| **S** | Reverse / Brake (Shift Gear Down) |
| **A** | Emergency Hard Stop |

## 🛠 Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Audio**: Web Speech API (`SpeechSynthesis`), Web Audio API (`AudioContext`)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Hermès-inspired palette)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/priyanshum17/acoustic-drive.git
   cd acoustic-drive
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## 📐 Design Philosophy

Acoustic Drive was built with a "Boutique Technical" aesthetic—merging Apple's minimalist precision with the warm, authoritative palette of luxury craftsmanship. The interface aims to reduce "visual noise" and maximize "auditory bandwidth," allowing for a focused navigation experience where sound is the primary driver.

---

*Developed for Special Problems in Screen Reading / Spring 2026*
