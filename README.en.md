
<div align="center">
  English | <a href="./README.md">简体中文</a>
</div>

# HomePage - Modern New Tab Extension

Clean · Beautiful · Fully Local · Customizable Browser Start Page

A personal project: a pure frontend new tab / start page for modern browsers (Edge/Chrome).  
No data collection, privacy-first, no ads.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/volzhang/HomePage/blob/main/LICENSE)
[![Vite](https://img.shields.io/badge/built%20with-Vite-%23646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

![Screenshot-Desktop.png](screenshots/Screenshot-Desktop.png)

## ✨ Features

- 🚀 **Clean & Minimal** — No data uploads, no ads, only essential requests (e.g. wallpapers/icons)
- 🎨 **Highly Customizable** — Customize wallpapers, tile layout (shortcuts), and default search engine
- 💾 **Seamless Cross-Device** — One-click JSON export/import for easy backup and migration
- 🌍 **Bilingual Support** — Supports English and Simplified Chinese

## Tech Stack & Current Status

- Vite + TypeScript  
- React  
- TailwindCSS + shadcn/ui  
- Zustand (being gradually replaced) + idb-keyval (compatible with legacy localforage IndexedDB data)

The project is undergoing a low-level refactor to reduce third-party dependencies and improve long-term maintainability.

State management is being migrated from Zustand to a custom Signal-based framework, currently about 90% complete.

UI components are being progressively replaced with custom implementations, while preserving the existing visual style and user experience.

## Try It Now

Instant experience 👉 **[https://volzhang.com](https://volzhang.com)**  

Or install directly in Edge 👉 **[Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/%E4%B8%BB%E9%A1%B5/gblipikohcegedalbnljafomaadhdjdp)**

## Install as Unpacked Extension (Developer Mode)

For Edge / Chrome:

1. Download the `dist` folder from this repository  
2. Open Edge → Extensions → Turn on “Developer mode”  
3. Click “Load unpacked” → Select the `dist` folder  
4. Find the extension (named “Home Page” or “主页”) in “From other sources” and enable it  

**Note:** Disable any other new tab / start page replacement extensions to avoid conflicts.

## 🗺️ Roadmap

The project is still in its early stage. Here are the planned features (roughly prioritized):

- 🌙 Dark/Light mode + themes + custom UI text colors  
- 🔍 Search enhancements: Add custom engines manually + search local tiles + advanced search modes  
- ⚙️ Tile icons: Auto-fetch favicons from mainstream websites or use pre-stored icons  
- 💡 Useful local widgets, e.g., todo list, sticky notes  
- 📱 Mobile / tablet adaptation (responsive layout)  

## Welcome Feedback

Feel free to suggest features you want most in [Issues](https://github.com/volzhang/HomePage/issues).  
I'll adjust priorities based on your feedback～

Made with ❤️ by volzhang  
If you like it, a star ⭐ would be greatly appreciated!  
Any suggestions or issues? Open an [Issue](https://github.com/volzhang/HomePage/issues) anytime.
