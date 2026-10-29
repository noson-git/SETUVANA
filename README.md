# SETUVANA (ସେତୁବନ)
## Smart Rural Tourism, Offline-First Homestay Booking & AI Connectivity Platform
**Every Village Connected to Opportunity**

---

### Overview
**SETUVANA** connects indigenous tribal and rural homestays in Odisha with travellers, even when mobile internet connectivity is weak or completely absent. Operating across Kandhamal, Koraput, Rayagada, Mayurbhanj, Bargarh, and Puri, SETUVANA addresses the OSFIC problem statement by bridging digital booking systems with real-world telecommunications channels (automated voice calls and SMS for basic keypad phones) and village coordinator desks.

---

### Architecture & Key Features

1. **Trilingual First-Class Localization:**
   - **ଓଡ଼ିଆ (Odia):** Fully supported across all public, operational, coordinator, and admin views with Noto Sans Oriya typography.
   - **English:** International and pan-India traveller discovery.
   - **हिन्दी (Hindi):** Domestic accessibility.

2. **Three Connectivity Modes:**
   - **Mode A (Online):** Full real-time synchronization, live Gemini API integration, and maps.
   - **Mode B (Weak / Intermittent):** Low-data mode, lightweight cards, automated queueing, and bounded retries.
   - **Mode C (Offline / No Internet):** PWA service worker shell caching, IndexedDB local persistence (`homestays`, `bookings`, `arrival_packs`, `offline_queue`), offline booking drafts with explicit safety banners: *"Saved on this device. This request has not yet reached the host."*, and plain-text walking/driving directions.

3. **SmartCall Telephony & Keypad Phone Simulator:**
   - Automated outbound voice calls and matching SMS in the host's preferred language (Odia/Hindi/English).
   - Working keypad simulation with authentic Web Audio DTMF synthesis (keys 1 to 4):
     - **Press 1:** Accept booking (revalidates inventory atomically and confirms).
     - **Press 2:** Decline booking request.
     - **Press 3:** Escalate to Village Coordinator callback task.
     - **Press 4:** Repeat booking details.
   - Server adapter for Indian telecom providers (Exotel) with webhook handlers, idempotency keys, and bounded retry policy.

4. **Google Workspace & Calendar Integration:**
   - Firebase Auth client-side OAuth provider with `https://www.googleapis.com/auth/calendar.events`.
   - Direct Google Calendar API sync for confirmed booking stays, check-in times, and reminders.
   - Offline `.ics` calendar file generator for zero-connectivity situations.
   - Travel notes & packing checklists for Google Keep.

5. **Gemini AI Suite:**
   - **`gemini-3.8-flash`:** Grounded traveller companion.
   - **Google Search Grounding:** Real-time weather, road advisories, and seasonal Odisha tribal festivals (`{ googleSearch: {} }`).
   - **Google Maps Grounding:** Geographic transit hubs, railway stations, and terrain guidance (`{ googleMaps: {} }`).
   - **`gemini-4-argon` (High Thinking):** Deep reasoning route planner with `thinkingLevel: ThinkingLevel.HIGH` for multi-day tribal circuits.
   - **`gemini-3-pro-image-preview`:** High-quality image generation with affordances for **1K**, **2K**, and **4K** resolutions.
   - **`gemini-nano-banana-2.1`:** Cultural art creation and image editing (Saura wall murals).
   - **`gemini-3.8-flash-tts`:** Text-to-speech voice generation for audio greetings and keypad call prompts.

6. **Four Roles in One Unified Platform:**
   - **Traveller:** Search, filter (water, sanitation, pickup, verification), booking, arrival pack download, calendar sync.
   - **Homestay Host:** Simple dashboard, room rates, availability calendar, notification logs, keypad simulator.
   - **Village Coordinator:** Assigned host management, callback queue, unanswered call escalation, manual in-person/phone booking entry, daily printable register.
   - **Administrator & Tourism Partner:** Bookability Passport auditing, impact statistics, audit logs, and CSV exports.

---

### Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Injected by AI Studio secret manager for server-side Gemini SDK calls |
| `APP_URL` | Cloud Run service URL for app hosting |

---

### Testing & Simulation Suite
Open the **Connectivity Test Lab** from the header indicator to simulate:
- Good connectivity, Weak connectivity, and Offline mode.
- Booking concurrency conflicts.
- Missed phone calls and bounded retries.
- Delayed SMS delivery.
- Coordinator escalation workflows.
