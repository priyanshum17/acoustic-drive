# Research Application: Implementing the VAA Model

The Acoustic Drive System (ADS) is a direct implementation of several key HCI theories regarding non-visual data navigation. This document maps specific system features to the research findings documented in the [Literature Review](literature_review.md).

## 1. Velocity-Adaptive Audio (VAA) vs. Adaptive Granularity
The core logic in `AudioAnnouncer.ts` implements a multi-level feedback system that scales based on the "Gear" level ($L$).

*   **Implementation**: 
    - **Levels 1-2**: High Granularity (Full Name).
    - **Level 3**: Medium Granularity (Last Name Only).
    - **Levels 4-6**: Low Granularity (Structural Landmark / Initial Letter).
*   **Research Alignment**: This mirrors the work on "Verbosity Control" and "Adaptive Feedback," where researchers show that shielding the user from low-value data at high speeds reduces "Acoustic Overload."

## 2. Audio Ticks vs. Auditory Landmarks
The ADS physics loop generates high-frequency "ticks" whenever the navigation window enters a new item boundary.

*   **Implementation**: A 440Hz-880Hz sine-wave oscillator pulse.
*   **Research Alignment**: This functions as a "Braid Level" landmark. Even when speech is suppressed (Gears 5-6), these ticks provide a temporal pulse of how many items are being bypassed, allowing the user to estimate distance through rhythm—a technique documented in "shuttling" research.

## 3. Alphabet Quick-Nav vs. Auditory Skimming
The system provides immediate orientation via the Alphabetical landmarks.

*   **Implementation**: Structural announcements (e.g., "Entering Section B").
*   **Research Alignment**: In Brewster's evaluations of auditory menus, structural boundaries are considered "Critical Navigation Nodes." By prioritizing the Alphabet section over individual names at high speeds, the ADS allows for efficient **Skimming** behaviors, where the user scans for the correct letter before slowing down for high-fidelity searching.

## 4. Car Metaphor vs. Mental Models
The choice of an "Accelerator/Brake" interaction model (implemented in `ListVisualizer.tsx`) is designed to build on existing "Shuttling" mental models.

*   **Implementation**: Gear-based acceleration logic.
*   **Research Alignment**: Interface metaphors help reduce the learning curve for novel interaction models. The ADS leverages the physical intuition of "momentum" to help users manage the speed of audio delivery.
