# A.I. Chat (Nexus AI)

An AI Chat application inspired by ChatGPT, Claude, and Gemini. Built with a modern **Next.js 16 (React 19)** frontend and a **Laravel 11 REST API** backend, featuring real-time multimodal intelligence, file uploads, chain-of-thought reasoning accordions, and model selection.

---

## ✨ Features

- **Multi-Model Intelligence**:
  - **Ling 3.1 Flash (OpenCode)**: 560B MoE hybrid reasoning model
  - **Claude 3.7 Sonnet**: Deep hybrid reasoning and coding
  - **Gemini 2.5 Flash / Pro**: Google multimodal speedster with long context
  - **GPT-4o Omni**: Multimodal vision & reasoning
  - **DeepSeek R1**: Open-weights deep chain-of-thought
- **Sidebar & History**:
  - Categorized conversation history (*Pinned, Today, Yesterday, Older*)
  - Real-time search filter across conversations
  - Pin, rename, and delete conversations
  - Collapsible responsive sidebar
- **Rich Chat Interface**:
  - **Chain-of-Thought Accordion**: Expandable *"Thought for Xs"* reasoning steps
  - **Syntax-Highlighted Code Blocks**: Auto-formatted code with copy button
  - **Multimodal File Uploads**: Image previews (lightbox modal), PDF, and document support
  - **Voice Dictation**: Web Speech API speech-to-text
  - **Web Grounding Toggle**: Search the web for real-time data
  - **Export & Share**: Download chats as Markdown or generate shareable snapshots
- **Full-Stack Architecture**:
  - **Frontend**: Next.js 16, React 19, Tailwind CSS, Lucide Icons, Turbopack
  - **Backend**: Laravel 11 with CORS enabled, RESTful chat streaming and file upload endpoints

---

## 🚀 Getting Started

### 1. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend (Laravel API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

API runs on [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## ⚙️ Configuration & Live Models

You can configure models directly via the **Settings (`⚙️`)** menu in the UI:
- **OpenCode Zen / Ling 3.1 Flash**: Set your OpenCode API key or connect via local headless server.
- **Google Gemini**: Enter your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **OpenAI / OpenRouter**: Supply custom keys for GPT-4o or Claude models.
- **Laravel Backend**: Toggle routing through `http://127.0.0.1:8000/api`.

---

## 📄 License
MIT License
