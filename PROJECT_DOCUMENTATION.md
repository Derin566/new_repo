# Dyslexia Monitoring System
## Multimodal Cognitive Screening & Telemetry Feature Extraction Platform
**Academic & Clinical Research Documentation**

---

## 1. Project Overview & Motivation
* **Title:** Dyslexia Monitoring System
* **Domain:** Pediatric Neuropsychology, Cognitive Accessibility, Machine Learning Telemetry.
* **Problem Statement:** Dyslexia affects 10–15% of children globally, causing difficulties in phonological processing, rapid naming, and reading fluency. Traditional diagnostic assessments require expensive clinical specialists, leading to under-diagnosis or late diagnosis after academic failure has already occurred.
* **Solution:** A zero-stress, language-independent, game-based cognitive screening platform for ages 5–14. It engages children in 6 non-linguistic visual, auditory, and voice tasks while silently extracting 15 high-precision clinical telemetry features and storing them directly in a cloud database for Machine Learning classification.

---

## 2. Research & Theoretical Grounding
* **Primary Base Paper:**
  * *"Screening Dyslexia Using Visual Auditory Computer Games and Machine Learning"* (IEEE Access, Vol. 13, 2025) by **Maria Rauschenberger, Ricardo Baeza-Yates, and Luz Rello**.
* **Core Scientific Theories Implemented:**
  1. **Visual Attention & Magnocellular Theory (Stein & Walsh):** Children with dyslexia display differences in visual search latency and distinguishing horizontal/vertical mirror symmetries ($b/d$ and $p/q$ confusion).
  2. **Auditory Temporal Sampling & Rise-Time Theory (Dr. Usha Goswami, Cambridge):** Impaired sensitivity to acoustic rise time (the envelope attack of a sound) is a direct biomarker for phonological awareness difficulties.
  3. **Working Memory Architecture (Baddeley & Gathercole 2004 Norms):** Calibrates sequence memory spans strictly by age:
     * *Ages 5–7:* 2 to 3 items (Mean: ~2.8)
     * *Ages 8–10:* 3 to 4 items (Mean: ~3.8)
     * *Ages 11–14:* 4 to 5+ items (Mean: ~5.1)
  4. **Non-Word Repetition Task (NWRT) (Gathercole & Baddeley):** Eliminates socioeconomic and vocabulary bias by testing phonological memory using standardized clinical pseudo-words (*e.g., "Ba-Lo-Ka"*).

---

## 3. System Architecture & Workflow
The platform is built as an end-to-end 6-stage pipeline:
1. **User Authentication:** Cloud Firebase Auth (Email/Password & Google 1-Click) with automatic New User vs. Returning User detection.
2. **Learner Profile Onboarding:** Child nickname, age selection (strictly validated 5–14), and a diverse 28-character mascot avatar picker (Animals, Cartoons & Fiction).
3. **Interactive Cognitive Game Suite:** 6 distinct multimodal mini-games with dynamic theme randomization and Web Audio synthesizers.
4. **Real-Time Telemetry Engine:** Sub-millisecond reaction timing (`performance.now()`), accuracy checking, and error categorization.
5. **Admin Calibration Portal:** Passcode-protected control hub allowing researchers to adjust rounds ($1, 3, 5, 10$), timers ($10\text{s}, 15\text{s}, 20\text{s},$ untimed), and module toggles.
6. **Cloud Database Auto-Save & Dataset Export:** Automatic writing of telemetry records to Google Cloud Firestore (`dyslexiamonitering`) under the `extracted_features` collection, with 1-click CSV/JSON export.

---

## 4. The 6 Cognitive Screening Games
1. **🔍 Visual Search (Target Hunt):**
   * *Mechanism:* Whac-A-Mole style grid ($2\times2$ to $3\times3$) with changing themes (Stars, Diamonds, Rockets, Flowers, Lions).
   * *Measures:* Visual processing speed, distractor error rate.
2. **🪞 Symmetry & Mirror Detection:**
   * *Mechanism:* Side-by-side vector figures comparing identical twins vs. horizontal/vertical mirror flips.
   * *Measures:* Mirror confusion error count, hesitation latency.
3. **🧠 Visual Sequential Memory (Corsi Block):**
   * *Mechanism:* 4 to 6 magical rune tiles illuminate in sequence with synchronized musical chords (*Do-Re-Mi*). Progress dots track inputs.
   * *Measures:* Working memory buffer span, sequence error rate.
4. **🧩 Pattern & Texture Match (Raven's Progressive Matrix):**
   * *Mechanism:* Incomplete texture sequences (Chevron waves, stripes, polka dots, concentric rings) requiring the child to choose the missing piece.
   * *Measures:* Rapid visual pattern closure, decision latency.
5. **🎵 Auditory Memory & Rhythm:**
   * *Mechanism:* Web Audio API synthesizes acoustic bell chords across distinct frequencies (High 659Hz, Mid 440Hz, Low 261Hz).
   * *Measures:* Auditory memory span, rhythm beat synchronization.
6. **🎙️ Voice Speech Task (NWRT):**
   * *Mechanism:* Mascot prompts an age-calibrated clinical pseudoword (*e.g., "Ba-Do"*, *"Ba-Lo-Ka"*, *"Em-Per-Fi-Dal"*); child speaks into microphone with real-time waveform animation.
   * *Measures:* Voice onset delay, pause/hesitation ratio, acoustic duration.

---

## 5. The 15 Standardized Extracted ML Features
Every gameplay session compiles into a clean 15-dimensional numerical vector:
1. `age`: Chronological age in years (5–14).
2. `vs_accuracy`: Visual search accuracy percentage (0–100%).
3. `vs_avg_rt_ms`: Mean visual search reaction time in milliseconds.
4. `vs_distractor_clicks`: Total misclicks on distractor symbols.
5. `sym_accuracy`: Symmetry detection accuracy percentage.
6. `sym_mirror_errors`: Count of confusing mirrored shapes for identical ones.
7. `sym_hesitation_ms`: Mean decision hesitation time on mirror pairs.
8. `vm_memory_span`: Maximum sequence length successfully reproduced.
9. `vm_error_rate`: Ratio of failed sequence attempts.
10. `pm_accuracy`: Pattern completion accuracy percentage.
11. `pm_decision_time_ms`: Decision latency for pattern analysis.
12. `aud_accuracy`: Auditory tone sequence accuracy percentage.
13. `aud_memory_span`: Maximum audio sequence length recalled.
14. `voice_hesitation_ratio`: Ratio of silence/pauses during speech.
15. `voice_speech_rate`: Estimated syllables spoken per second.

---

## 6. Technologies Used
* **Frontend:** React 19, Vite 6, Tailwind CSS 3.
* **Typography:** Google Font *Lexend* (specifically designed to reduce visual crowding and stress for dyslexic readers).
* **Audio Synthesis:** Web Audio API (native browser oscillator & gain nodes, zero audio download dependencies).
* **Cloud Infrastructure:** Google Cloud Firestore (NoSQL Document Store), Firebase Authentication.
* **Celebration & UX:** Canvas Confetti, Lucide Icons, tactile micro-animations.
