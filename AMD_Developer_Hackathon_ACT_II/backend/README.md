# Frontend – Video Captioning Agent (Neo-Brutalist UI)

A **Vite + React** application that provides a bold, neo-brutalist interface for the multi‑agent video captioning system. Users can input multiple video URLs, select caption styles, and view AI‑generated captions in a playful, sticker‑like layout.

---

## 🎨 Design Philosophy

This frontend follows the **neo‑brutalist** aesthetic:

- Thick `4px` black borders on every element
- Hard offset shadows with zero blur
- Vibrant highlighter palette (Hot Red, Vivid Yellow, Soft Violet)
- Bold **Space Grotesk** typography (weights 700 & 900 only)
- Mechanical interactions: buttons press down, cards lift up, stickers rotate
- Halftone dot and grid textures for depth

---

## 🚀 Features

- **Landing Page** – introduces the product with playful animated elements
- **Agent Page** – the core workspace where you:
  - Paste multiple video URLs (one per line)
  - Choose caption styles (formal, sarcastic, tech‑humor, non‑tech humor)
  - Set an optional video duration
- **Live Agentic Flow** – visual step‑by‑step pipeline animation while processing
- **Multi‑Video Results** – results grouped per video, each with its own set of styled caption cards
- **Copy to Clipboard** – quick copy button on every caption
- **Fully Responsive** – adapts from desktop chaos to mobile order while keeping the neo‑brutalist identity

---

## 🧱 Tech Stack

| Category    | Technology                   |
| ----------- | ---------------------------- |
| Framework   | React 18 + Vite              |
| Styling     | Tailwind CSS                 |
| Icons       | Lucide React                 |
| Routing     | React Router DOM             |
| HTTP Client | Fetch API                    |
| Font        | Space Grotesk (Google Fonts) |

---

## 📁 Project Structure (frontend/src)

```
src/
├── assets/              # (optional images/illustrations)
├── components/          # (shared UI components if added later)
├── config/
│   └── api.js           # API base URL & endpoint definitions
├── pages/
│   ├── LandingPage.js   # Marketing/landing page
│   └── Agent.js         # Main agent workspace
├── App.jsx              # Route definitions
├── main.jsx             # Vite entry point
└── index.css            # Tailwind directives & global styles
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- The [backend server](https://github.com/your-org/video-captioning-backend) must be running on `http://localhost:3000` (or your configured `VITE_API_BASE_URL`)

### Installation

```bash
# Clone the repository
git clone <your-frontend-repo-url>
cd video-captioning-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_VERSION=v1
```

### Run Development Server

```bash
npm run dev
```

The app opens at **`http://localhost:5173`** by default.

---

## 🔌 Connecting to the Backend

All API calls are made through the `API_ENDPOINTS` object defined in `src/config/api.js`.  
The `Agent.js` page sends a `POST` request to `/api/v1/caption` with either a single `videoUrl` or an array of `videoUrls`.  
The backend returns caption results grouped by video URL, which the frontend displays with colour‑coded style badges and copy buttons.

---

## 🏗️ Building for Production

```bash
npm run build
```

The output goes into the `dist/` folder, ready to be served by any static server or deployed to Vercel/Netlify.

---

## 🧩 Design System & Customisation

All neo‑brutalist tokens are kept as Tailwind arbitrary values (`border-4 border-black`, `shadow-[8px_8px_0px_0px_#000]`, etc.) directly in components.  
To customise colours or spacing, edit the utility classes or add Tailwind config extensions.  
Be careful not to introduce:

- Soft shadows (`shadow-lg`, `shadow-md`)
- Rounded corners (`rounded-lg`, `rounded-xl`)
- Grey text (`text-gray-500`)
- Gradient backgrounds
- Slow transitions – keep them fast (`duration-100`, `duration-200`)

---

## 📄 Available Scripts

| Script            | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start Vite development server |
| `npm run build`   | Build for production          |
| `npm run preview` | Preview the production build  |

---

## 👤 Author

**Abhishek Rajput**

---

## 📝 License

MIT
