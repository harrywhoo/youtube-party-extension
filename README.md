# YouTube Party Extension

A Chrome extension that enables synchronized YouTube video watching with friends in real-time. Create or join rooms to watch videos together with automatic playback synchronization.

## Features

- **Room-based Sessions**: Create private rooms with unique codes for friends to join
- **Real-time Sync**: Automatic synchronization of play, pause, and seek actions
- **Video Navigation**: Synchronized video changes when users navigate to different videos
- **Multi-user Support**: Multiple users can watch together in the same room
- **Instant Updates**: Real-time updates when users join or leave rooms

## Architecture

This project uses a **monorepo structure** with two main components:

### Client (Chrome Extension)
- **Technology**: React + TypeScript + Vite + Tailwind CSS
- **Structure**: Manifest v3 extension with popup, background service worker, and content script
- **Communication**: Uses Chrome extension messaging API and Socket.io for real-time updates

### Server (Backend)
- **Technology**: Node.js + Express + Socket.io
- **Features**: Room management, user tracking, and real-time event broadcasting
- **Storage**: In-memory state management with automatic cleanup

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm
- Google Chrome browser

### 1. Clone the Repository
```bash
git clone <repository-url>
cd youtube-party-extension
```

### 2. Setup Server
```bash
cd server
npm install
npm run dev  # Development with auto-restart
# OR
npm start    # Production mode
```
Server will run on `http://localhost:8080`

### 3. Setup Client (Extension)
```bash
cd client
npm install
npm run build  # Build extension for loading
```

### 4. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" 
4. Select the `client/dist/` folder
5. The extension icon should appear in your toolbar
