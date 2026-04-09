# CS 8903: High-Speed Audio-First Data Exploration

This project explores the optimization of non-visual data navigation through large, sorted lists. Current screen reader technology often relies on linear, one-by-one item iteration, which becomes increasingly inefficient as dataset sizes grow. This research proposes and implements a **Velocity-Adaptive Audio (VAA)** model that treats navigation as a physics-based "shuttling" experience.

## Research Objective
The goal is to minimize **Time-to-Target** for visually impaired users by mapping scroll velocity to audio density. By utilizing structural landmarks (alphabetical boundaries) and synthesized auditory feedback, the system allows users to "scan" thousands of entries in seconds.

## The Accelerator Metaphor
Navigation is implemented using a "gear-based" physics engine where the user controls velocity rather than individual item selection:
- **Accelerate (W)**: Increases the scroll velocity (Gears 1-6).
- **Brake/Reverse (S)**: Decelerates or reverses the scroll direction.
- **Hard Stop (A)**: Immediately halts all motion.

## Velocity-Adaptive Audio (VAA) Model
The system dynamically mutates the audio output based on the current navigation speed to prevent cognitive overload while maintaining spatial awareness:

- **Low Velocity (Gears 1-2)**: High-fidelity output. The engine announces the full "LastName, FirstName" of entries.
- **Medium Velocity (Gear 3)**: Adaptive simplification. The engine announces only the "LastName" and plays audio ticks for every 5 entries.
- **High Velocity (Gears 4-6)**: Structural landmarks. The engine announces only the current alphabetical section (e.g., "A", "B", "C") and plays high-frequency ticks for every crossing.

## Core Components

The system consists of the following technical components:

*   **Acoustic Drive Engine**: A singleton manager utilizing the Web Speech API and Web Audio API for coordinated feedback.
*   **Alphabet Quick-Nav**: A vertical structural map providing real-time section tracking across thousand-entry datasets.
*   **Voice Pulse**: A visual telemetry indicator showing auditory data bursts for multi-modal verification.
*   **Encounter Ticker**: A real-time history log of the most recently traversed entries for data validation.

## Getting Started
```bash
# Clone the repository
git clone https://github.com/priyanshumehta/acoustic-drive.git

# Install dependencies
npm install

# Start the environment
npm run dev
```

## Technical Documentation
Detailed specifications and implementation details can be found in the `/docs` directory:
- [Design Specifications](docs/design.md)
- [Functional Breakdown & Screenshots](docs/screenshots.md)
- [Initial Research Notes](docs/research.md)

---
*CS 8903 Special Problems | Spring 2026*
