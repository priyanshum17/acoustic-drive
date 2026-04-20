# The Auditory Overshoot Problem

When navigating at high speeds via auditory interfaces (RSVP), users encounter the "Overshoot Problem" due to human motor and cognitive reaction times. 

By the time the system announces a target (e.g., "K"), the user's brain processes the sound (~200ms), and their finger physically triggers the brake command (~150ms). By the time the brake registers, the system has often already hopped to "L" or "M".

Below are four novel, theoretical UI/UX fixes to solve this without compromising the core navigation speed.

## 1. Elastic Braking (Auto-Rewind)
Instead of stopping exactly where the pointer currently is, the system calculates the user's reaction time and compensates for it.
*   **How it works**: When the user hits the brake (gearing down or stopping), the system assumes they are reacting to an auditory stimulus they heard ~400ms ago. It automatically rewinds the Trie pointer backwards by 1 hop before stopping.
*   **The UX**: It creates a "magnetic" or "elastic" feeling. The user hears "K", they brake, and the system seamlessly snaps back to "K" for them, completely forgiving their motor delay.

## 2. Predictive Audio (Look-Ahead)
Detaching the "Auditory Pointer" from the "Visual Pointer."
*   **How it works**: The Audio Announcer is always exactly 1 hop *ahead* of the actual data structure cursor. When the internal pointer is physically on "J", the audio says "K". 
*   **The UX**: By the time the user hears "K" and hits the brake, the internal pointer has naturally advanced to "K". The audio acts as a "headlight" shining slightly ahead of the user's physical location.

## 3. Auditory Looming (The Doppler Effect)
Providing an acoustic warning *before* reaching a target, allowing the user to prepare their motor response.
*   **How it works**: We use the pitched navigation ticks to create "gravity wells" around major milestones (like vowels). As the user approaches "K", the background tick pitch slowly rises.
*   **The UX**: The user doesn't have to wait for the TTS to explicitly say the letter. Their brain subconsciously recognizes approaching boundaries due to the rising tension of the pitch, allowing them to proactively slow down.

## 4. "Sticky" Friction Nodes
Making certain nodes artificially "heavy" so the cursor rests on them slightly longer.
*   **How it works**: At high gears, the standard hop takes exactly 1.0 seconds. However, if the system lands on a major boundary (e.g., every 5th letter), it applies "friction" and pauses for 1.5 seconds.
*   **The UX**: It creates natural, rhythmic resting stops. A user looking for "K" can ride the fast speed until the system naturally "sticks" slightly on "I", giving them a comfortable window to drop gears and hunt down "K" deliberately.
