# Sensor Monitor PWA

A Progressive Web App for monitoring sensor values in real-time.

## Features

- 📱 Works on iPhone, Android, and desktop browsers
- 🔄 Auto-refresh every 30 seconds
- 💾 Offline support with service worker
- 🎨 Native app-like UI matching iOS SensorDisplay
- 📊 Displays Azart and Brama sensor groups (voltage A, B, C)
- ⚡ Fast loading with cached data
- 🔃 Pull-to-refresh on mobile

## Setup

### 1. Create Icons

Create the following icon files in the `/icons` folder:

- `icon-192.png` (192×192px)
- `icon-512.png` (512×512px)
- `apple-touch-icon.png` (180×180px)

You can generate these from a single high-res image using online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 2. Configure Backend

Edit `app.js` and update the Firebase URL:

```javascript
const CONFIG = {
    FIREBASE_URL: 'https://YOUR-PROJECT.firebasedatabase.app/sensorDisplay/latest.json',
    FIREBASE_AUTH_TOKEN: null, // Add auth token if needed
    AUTO_REFRESH_INTERVAL: 30000
};
```

### 3. Deploy

Deploy all files to a web server with HTTPS:

**Option 1: Firebase Hosting (recommended)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project, set public directory to 'pwa'
firebase deploy
```

**Option 2: GitHub Pages**
1. Create a GitHub repository
2. Push all files to the repo
3. Enable GitHub Pages in Settings
4. Access at https://username.github.io/repo-name/

**Option 3: Netlify/Vercel**
1. Sign up at netlify.com or vercel.com
2. Drag and drop the `pwa` folder
3. Get your URL

**Option 4: Local testing**
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Then visit http://localhost:8000
```

### 4. Install on iPhone

1. Open the deployed URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The app icon appears on your home screen

The app will work offline and auto-update when online.

## File Structure

```
pwa/
├── index.html          # Main HTML structure
├── styles.css          # All styling (matches iOS app design)
├── app.js              # JavaScript logic (API calls, auto-refresh)
├── manifest.json       # PWA manifest (icons, colors, display mode)
├── sw.js              # Service worker (offline support)
├── README.md          # This file
└── icons/             # App icons
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png
```

## Customization

### Change Colors

Edit `styles.css`:
- Background: `#0A0E21`
- Azart accent: `#FFC107` (yellow)
- Brama accent: `#1E88E5` (blue)

### Change Refresh Interval

Edit `app.js`:
```javascript
AUTO_REFRESH_INTERVAL: 30000  // milliseconds (30s)
```

### Switch to JSONBin

Edit `app.js`:
```javascript
const CONFIG = {
    API_URL: 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID/latest',
    API_KEY: 'YOUR_API_KEY',
    // ...
};

// Update fetchLatestData() to use JSONBin headers
```

## Browser Support

- ✅ iOS Safari 11.3+
- ✅ Chrome/Edge (desktop and mobile)
- ✅ Firefox (desktop and mobile)
- ✅ Samsung Internet
- ⚠️ Opera Mini (limited)

## Troubleshooting

### App doesn't update
- Clear browser cache
- Uninstall and reinstall the PWA
- Check service worker in DevTools → Application → Service Workers

### Icons not showing
- Ensure icons exist in `/icons` folder
- Check file names match manifest.json
- Icons must be served over HTTPS

### Firebase connection fails
- Verify Firebase URL in app.js
- Check Firebase Realtime Database rules
- Ensure database returns JSON at `/sensorDisplay/latest`

### Can't install on iPhone
- Must use Safari (not Chrome/Firefox)
- Site must be served over HTTPS
- Check manifest.json is valid JSON

## License

MIT
