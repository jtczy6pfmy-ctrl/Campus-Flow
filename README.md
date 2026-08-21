# Campus Flow 🎓

**Campus Flow** is a lightweight, offline-capable Progressive Web Application (PWA) designed for real-time student tracking, check-in scanning, roster management, and transcript record archiving.

Built with plain HTML5, modern CSS, and vanilla JavaScript—no heavy frameworks or external dependencies required.

---

## 🚀 Key Features

* **Real-Time Active Roster:** Add, check in, check out, or withdraw students seamlessly.
* **Hardware ID Scanner Integration:** Built-in listener for USB/Bluetooth RFID tap readers and barcode scanners, as well as manual ID lookup.
* **End-of-Year Batch Graduation:** Transition senior classes to graduate status in a single click.
* **Alumni & Transcript Archives:** Search historical student records and render printable official transcripts directly from the browser.
* **Offline First (PWA):** Service worker dynamic caching ensures the app functions completely offline without internet access.
* **Local Persistence:** Uses `localStorage` for zero-configuration, browser-native data persistence.

---

## 📁 Repository Structure

```text
Campus-Flow/
├── index.html              # Main application shell & layout views
├── manifest.json           # Web App Manifest for PWA installation
├── service-worker.js       # Offline caching controller
├── students.js             # Active roster state & modal form logic
├── css/
│   ├── styles.css          # Design tokens, reset, and core layout grid
│   └── components.css      # Tables, modal dialogs, status badges, & transcripts
├── js/
│   ├── app.js              # Tab navigation & service worker registration
│   ├── archive.js          # Graduate search & transcript rendering
│   └── scanner.js          # Hardware scanner listener & manual lookup
└── assets/
    └── favicon.ico         # App favicon & shortcut branding
