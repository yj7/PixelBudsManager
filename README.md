# Pixel Buds Manager (Unofficial)

> **⚠️ Disclaimer: Unofficial Package**
> This is an **unofficial** third-party macOS menu bar utility for Google Pixel Buds. It is not affiliated with, endorsed by, or sponsored by Google LLC. All product names, logos, and brands are property of their respective owners.

A lightweight, native-feeling macOS menu bar application that wraps the official [Google Pixel Buds web companion](https://mypixelbuds.google.com/). It adds native Web Bluetooth support with a custom device picker to seamlessly bypass macOS Bluetooth limitations inside Electron.

## Features
- **Menu Bar Integration**: Quick access to your Pixel Buds settings straight from your Mac's menu bar.
- **Web Bluetooth Support**: Fixes the issue where standard web wrappers fail to trigger the macOS Bluetooth permission prompts.
- **Custom Device Picker**: A dedicated, native floating window to scan and select your Pixel Buds, circumventing strict Content Security Policies on the official website.

## Installation & Build Instructions

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd BudsManager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm start
   ```

4. **Build the standalone macOS Application:**
   ```bash
   npm run build
   ```
   *The compiled `.app` bundle will be generated in the `dist/mac-arm64/` directory.*

## Technology Stack
- [Electron](https://www.electronjs.org/)
- [Menubar](https://github.com/maxogden/menubar)
- [Electron-Builder](https://www.electron.build/)

## License
MIT License
