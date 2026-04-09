# Design Specifications: Acoustic Drive System (ADS)

This document outlines the technical implementation of the Velocity-Adaptive Audio (VAA) model and the underlying physics engine used in the Acoustic Drive System.

## 1. Velocity Scaling & Physics
Navigation is based on a "Gear" system that manipulates the scroll velocity ($v$). 

### Physics Modes
- **Linear Mode**: Velocity increases linearly with gears.
  $$v = \text{sign}(level) \times (|level| \times \text{baseSpeed})$$
- **Exponential Mode**: Velocity increases exponentially for rapid traversal of massive datasets.
  $$v = \text{sign}(level) \times \text{baseSpeed} \times 1.8^{(|level|-1)}$$

### Acceleration Constraints
- **Max Level**: 6 (Forward or Reverse).
- **Base Speed**: Modifiable by user (0.5 to 50 items per second).

## 2. Velocity-Adaptive Audio (VAA) Mapping
To maintain high-speed orientation without auditory clutter, the system adjusts its output granularity based on the active gear level.

| Level | Audio Granularity | Description |
| :--- | :--- | :--- |
| **0** | None | System idle. |
| **1** | Full Detail | Announces "LastName, FirstName" for every centered entry. |
| **2** | Primary Detail | Announces only "LastName" to reduce word count per second. |
| **3** | Transition | Announces "LastName" but throttles output to prevent overlap. |
| **4+** | Structural Only | Announces only the current primary letter (e.g., "A") when crossing section boundaries. |

## 3. Feedback Mechanisms
- **Audio Context Ticks**: Sine-wave oscillators generate a 0.05s pulse when crossing item boundaries. This provides a tactile sense of distance.
- **Visual Pulse**: A 3-bar animation visually confirms audio activity, used for multi-modal verification.
- **Alphabetical Anchors**: Continuous tracking of the primary letter ensures the user always knows their relative position in the sorted set.

## 4. Technical Stack
- **React 18**: Component-based UI and state management.
- **Web Speech API**: `SpeechSynthesis` for natural language output.
- **Web Audio API**: `AudioContext` for low-latency feedback "ticks."
- **Vite**: Modern development and build toolchain.
