# PWA Setup Instructions

Your app is now configured as a Progressive Web App (PWA) and optimized for iPhone 15!

## Generate Icons

1. Open the icon generator in your browser:
   - Navigate to `http://localhost:3000/generate-icons.html` (or your dev server URL)
   - Click "Download All Icons" button
   - The following files will be downloaded:
     - `apple-touch-icon.png` (180x180)
     - `icon-192.png` (192x192)
     - `icon-512.png` (512x512)

2. Move the downloaded icons to the `public` folder (they should already be there if downloaded correctly)

## Install on iPhone 15 (Safari)

1. Open Safari on your iPhone 15
2. Navigate to your app's URL
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Customize the name if desired and tap "Add"

The app will now:
- ✅ Appear on your home screen with a custom icon
- ✅ Open in fullscreen mode (no Safari UI)
- ✅ Have a custom splash screen
- ✅ Respect iPhone notch safe areas
- ✅ Work like a native app
- ✅ Support gesture navigation

## Features Enabled

### Mobile Optimizations
- Responsive design for iPhone 15 (6.1" screen)
- Safe area insets for notch/Dynamic Island
- Touch-friendly buttons (minimum 44px touch targets)
- Disabled pull-to-refresh
- Smooth scrolling with momentum
- No text selection highlights on tap

### PWA Features
- Standalone display mode (fullscreen)
- Custom app name: "SnowLeopard"
- Theme color: Lime green (#84cc16)
- Portrait orientation lock
- Works offline-ready structure

## Manifest Details

The app includes a Web App Manifest (`public/manifest.json`) with:
- App name and description
- Icon definitions
- Display preferences
- Theme colors
- Orientation settings

## Testing

To test PWA features:
1. Make sure you've generated and placed the icon files
2. Start your development server: `npm run dev`
3. Open on iPhone 15 in Safari
4. Install to home screen
5. Launch from home screen icon

The app should open in fullscreen mode and behave like a native app!

## Troubleshooting

### Icons not showing
- Make sure PNG files are generated and in `/public` folder
- Clear Safari cache
- Remove and re-add to home screen

### App not fullscreen
- Check that manifest.json is accessible at `/manifest.json`
- Verify meta tags in the app layout
- Try hard refresh on iPhone

### Safe area issues
- Safe areas are automatically handled via CSS
- The notch/Dynamic Island won't overlap content

## Next Steps (Optional)

For production, consider:
- Adding a service worker for offline functionality
- Implementing push notifications
- Adding app screenshots to manifest
- Creating launch/splash screen images
