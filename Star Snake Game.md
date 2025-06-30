# Star Snake Game

A modern, polished web-based implementation of the classic Snake game with a star theme. Built with vanilla JavaScript, HTML5 Canvas, and CSS3 for optimal performance and compatibility.

## Features

### 🎮 Gameplay
- **Classic Snake Mechanics**: Control a growing snake to eat food and avoid collisions
- **Star Theme**: Beautiful golden star food items with particle effects
- **Progressive Difficulty**: Game becomes more challenging as the snake grows
- **Score System**: Real-time scoring with persistent high score storage

### 🎨 Visual Design
- **Modern UI**: Gradient backgrounds, smooth animations, and polished styling
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Particle Effects**: Visual feedback when eating food
- **Smooth Graphics**: High-quality snake rendering with gradients and shadows

### 🎵 Audio
- **Sound Effects**: Audio feedback for eating food and game over events
- **Web Audio API**: Modern browser-compatible audio system
- **Graceful Fallback**: Game works perfectly even when audio is not supported

### 🎯 Controls
- **Keyboard**: Arrow keys or WASD for movement
- **Touch**: Swipe gestures for mobile devices
- **Game Controls**: Space to pause/resume, Escape for menu navigation
- **Accessibility**: Focus indicators and keyboard navigation support

### 📱 Mobile Optimization
- **Touch Controls**: Intuitive swipe gestures
- **Responsive Layout**: Adapts to different screen sizes
- **Performance**: Optimized for mobile browsers
- **Viewport**: Proper mobile viewport configuration

## Technical Architecture

### 🏗️ Modular Design
The game is built using a modular, object-oriented architecture for maintainability and scalability:

- **StarSnakeGame**: Main game controller and state manager
- **Snake**: Snake entity with movement and collision logic
- **Food**: Food generation and positioning system
- **AudioManager**: Sound effects and audio handling
- **InputHandler**: Keyboard and touch input processing
- **Renderer**: Canvas rendering and visual effects
- **ParticleSystem**: Visual effects and animations

### 🔧 Configuration System
Centralized configuration object for easy customization:
```javascript
const CONFIG = {
    GRID_SIZE: 20,
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 400,
    GAME_SPEED: 150,
    INITIAL_SNAKE_LENGTH: 3,
    POINTS_PER_FOOD: 10,
    SOUND_ENABLED: true
};
```

### 🎮 State Management
Robust state management system with clear game states:
- `MENU`: Main menu screen
- `PLAYING`: Active gameplay
- `PAUSED`: Game paused
- `GAME_OVER`: Game over screen

### 💾 Data Persistence
- **Local Storage**: High scores are automatically saved and persist between sessions
- **Cross-Session**: Game remembers your best performance

## File Structure

```
star-snake-game/
├── index.html          # Main HTML file with UI structure
├── game.js             # Complete game logic and classes
├── README.md           # This documentation file
└── screenshots/        # Game screenshots (auto-generated)
```

## Browser Compatibility

### ✅ Supported Browsers
- **Chrome**: 60+ (recommended)
- **Firefox**: 55+
- **Safari**: 11+
- **Edge**: 79+
- **Mobile Safari**: iOS 11+
- **Chrome Mobile**: Android 7+

### 🔧 Required Features
- HTML5 Canvas support
- ES6 Classes and modules
- CSS3 Flexbox and Grid
- Web Audio API (optional, graceful fallback)
- Local Storage API

## Performance Optimizations

### 🚀 Rendering
- **RequestAnimationFrame**: Smooth 60fps rendering
- **Efficient Canvas Operations**: Minimal redraws and optimized graphics
- **Particle System**: Lightweight particle effects with automatic cleanup

### 💻 Memory Management
- **Object Pooling**: Efficient particle management
- **Event Cleanup**: Proper event listener management
- **Garbage Collection**: Minimal object creation during gameplay

### 📱 Mobile Performance
- **Touch Debouncing**: Prevents accidental multiple inputs
- **Viewport Optimization**: Efficient mobile rendering
- **Battery Friendly**: Optimized update loops

## Customization Guide

### 🎨 Visual Customization
Modify the CSS variables in `index.html` to change colors, fonts, and styling:
```css
:root {
    --primary-color: #FFD700;
    --secondary-color: #FFA500;
    --background-gradient: linear-gradient(135deg, #1e3c72, #2a5298);
}
```

### ⚙️ Game Settings
Adjust game parameters in the `CONFIG` object in `game.js`:
```javascript
const CONFIG = {
    GRID_SIZE: 20,        // Size of each grid cell
    GAME_SPEED: 150,      // Lower = faster game
    POINTS_PER_FOOD: 10,  // Score per food item
    // ... other settings
};
```

### 🎵 Audio Settings
Enable/disable sound effects:
```javascript
const CONFIG = {
    SOUND_ENABLED: true,  // Set to false to disable audio
};
```

## Development Setup

### 🛠️ Local Development
1. Clone or download the game files
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

### 🌐 Web Server (Optional)
For development with a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

### 🚀 Deployment
The game is a static web application and can be deployed to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Traditional web hosting
- CDN services

## Troubleshooting

### 🐛 Common Issues

**Game not starting:**
- Ensure JavaScript is enabled in your browser
- Check browser console for error messages
- Verify all files are in the same directory

**Audio not working:**
- Some browsers require user interaction before playing audio
- Check if audio is muted in browser or system
- Audio gracefully falls back if not supported

**Touch controls not responsive:**
- Ensure you're swiping with sufficient distance
- Try refreshing the page
- Check if touch events are supported

**Performance issues:**
- Close other browser tabs
- Ensure hardware acceleration is enabled
- Try a different browser

### 📊 Browser Console
Open browser developer tools (F12) to see detailed error messages and performance information.

## Contributing

### 🤝 How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across different browsers
5. Submit a pull request

### 🎯 Areas for Improvement
- Additional game modes (speed mode, obstacles)
- Power-ups and special food items
- Multiplayer functionality
- Advanced graphics and animations
- Leaderboard system
- Achievement system

## License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as needed.

## Credits

- **Game Design**: Inspired by the classic Snake game
- **Star Theme**: Original visual design
- **Audio**: Web Audio API implementation
- **Mobile Support**: Touch gesture implementation

---

**Enjoy playing Star Snake Game!** 🐍⭐

