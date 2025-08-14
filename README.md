# Saturn Ring Particle Animation

A beautiful particle animation library inspired by Saturn's rings. Built with HTML5 Canvas, it creates real-time animated Saturn rings with realistic physics.

![Saturn Ring Animation](https://via.placeholder.com/800x400/000000/FFFFFF?text=Saturn+Ring+Animation)

## Features

- 🪐 **Realistic Saturn Rings**: Physics-based rotation speeds approximating Kepler's laws
- 🎨 **Fully Customizable**: Adjust colors, sizes, particle counts, rotation speeds, and more
- 📱 **Responsive Design**: Automatic scaling based on screen size
- ⚡ **High Performance**: Efficient rendering and animation processing
- 🎯 **Rich API**: Complete JavaScript API for dynamic configuration
- 💬 **Text Display**: Show two lines of text in the center of the rings
- ✨ **Smooth Animations**: Beautiful fade-in effects and organic movement

## Demo

[Live Demo](https://your-github-username.github.io/saturn-ring-animation/)

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <canvas id="canvas"></canvas>
    <script src="particle-animation.js"></script>
    <script>
        // 基本設定
        ParticleRingAPI.setCanvasSize(800, 600);
        ParticleRingAPI.setText('Hello', 'World');
        ParticleRingAPI.showText();
    </script>
</body>
</html>
```

## API Reference

### Basic Controls

```javascript
// Animation controls
ParticleRingAPI.start();           // Start animation
ParticleRingAPI.stop();            // Stop animation
ParticleRingAPI.pause();           // Pause animation
ParticleRingAPI.resume();          // Resume animation
ParticleRingAPI.togglePause();     // Toggle pause/resume

// Rotation speed
ParticleRingAPI.setRotationSpeed(0.005);  // Fast
ParticleRingAPI.setRotationSpeed(0.001);  // Slow

// Pattern changes
ParticleRingAPI.setPattern(0);     // Circular rotation
ParticleRingAPI.setPattern(1);     // Elliptical rotation
ParticleRingAPI.setPattern(2);     // Spiral rotation
ParticleRingAPI.setPattern(3);     // Multi-orbit
```

### Canvas Size Settings

```javascript
// Basic size settings
ParticleRingAPI.setCanvasSize(800, 600);        // Fixed size
ParticleRingAPI.setCanvasWidth(1000);           // Width only
ParticleRingAPI.setCanvasHeight(800);           // Height only

// Screen size ratio
ParticleRingAPI.setCanvasSizeRatio(0.8, 0.8);   // 80% of screen

// Convenient presets
ParticleRingAPI.setFullscreen();                // Fullscreen
ParticleRingAPI.setSquare(600);                 // Square
ParticleRingAPI.setCanvasSizeWithAspectRatio(800, 16/9); // Aspect ratio

// Auto-resize control
ParticleRingAPI.setAutoResize(true);            // Enable
ParticleRingAPI.setAutoResize(false);           // Disable
```

### Ring Settings

```javascript
// Ring dimensions
ParticleRingAPI.setInnerRadius(200);            // Inner radius
ParticleRingAPI.setRingWidth(25);               // Ring width

// Ring structure
ParticleRingAPI.setRingGaps([0, 15, 30, 50, 75, 105, 140, 180, 225]);

// Scaling control
ParticleRingAPI.setScaling(true);               // Enable auto-scaling
ParticleRingAPI.setBaseSize(800);               // Base size
```

### Particle Settings

```javascript
// Basic particle count control
ParticleRingAPI.setParticleDensity(2.0);        // Density (multiplier)

// Advanced particle count control
ParticleRingAPI.setParticleCountMode('density'); // Density-based
ParticleRingAPI.setParticleCountMode('absolute'); // Absolute count
ParticleRingAPI.setParticleCountMode('perRing');  // Per-ring individual

// Detailed particle count settings
ParticleRingAPI.setBaseParticleCount(30, 7);     // Base 30, +7 per outer ring
ParticleRingAPI.setParticleMultiplier(3.0);      // Multiply all by 3
ParticleRingAPI.setAbsoluteParticleCount(500);   // Set total to 500

// Individual ring settings
ParticleRingAPI.setParticleCountPerRing([20, 35, 50, 65, 80, 95, 110, 125]);

// Particle size
ParticleRingAPI.setParticleSize(0.5, 2.5);      // Min 0.5, Max 2.5

// Color settings
ParticleRingAPI.setColors([
    '#ffffff', '#aaccff', '#ffddaa', '#ccffcc'
]);
```

### Connection Lines

```javascript
// Connection line control
ParticleRingAPI.setConnections(true, 50, 0.1);  // Enable, distance 50, opacity 0.1
ParticleRingAPI.setConnections(false);          // Disable
```

### Text Display

```javascript
// Text settings
ParticleRingAPI.setText('Saturn', 'Rings');     // Two-line text
ParticleRingAPI.setText('Hello');               // Single-line text

// Display control
ParticleRingAPI.showText();                     // Show
ParticleRingAPI.hideText();                     // Hide

// Font size (ratio to screen size)
ParticleRingAPI.setTextSize(0.1, 0.06);        // Line 1: 10%, Line 2: 6%
```

### Presets

```javascript
// Standard presets
ParticleRingAPI.updateConfig(ParticleRingAPI.presets.saturn());   // Saturn style
ParticleRingAPI.updateConfig(ParticleRingAPI.presets.galaxy());   // Galaxy style
ParticleRingAPI.updateConfig(ParticleRingAPI.presets.nebula());   // Nebula style

// Particle count presets
ParticleRingAPI.updateConfig(ParticleRingAPI.presets.minimal());  // Minimal
ParticleRingAPI.updateConfig(ParticleRingAPI.presets.dense());    // High density

// Custom preset
ParticleRingAPI.updateConfig(ParticleRingAPI.presets.custom([15, 25, 40, 60]));
```

### Information Retrieval

```javascript
// Get current configuration
const config = ParticleRingAPI.getConfig();
console.log(config);

// Get canvas size
const size = ParticleRingAPI.getCanvasSize();
console.log(`Width: ${size.width}, Height: ${size.height}`);

// Get particle counts
const totalCount = ParticleRingAPI.getCurrentParticleCount();
const perRing = ParticleRingAPI.getParticleCountPerRing();
```

## Usage Examples

### Basic Saturn Rings

```javascript
ParticleRingAPI.setCanvasSize(800, 600);
ParticleRingAPI.setParticleDensity(2.0);
ParticleRingAPI.setText('Saturn', 'Beautiful Rings');
ParticleRingAPI.showText();
```

### High Quality Settings

```javascript
ParticleRingAPI.setCanvasSize(1200, 900);
ParticleRingAPI.setParticleCountMode('density');
ParticleRingAPI.setBaseParticleCount(40, 12);
ParticleRingAPI.setParticleMultiplier(4.0);
ParticleRingAPI.setConnections(true, 50, 0.1);
```

### Mobile-Friendly Lightweight Settings

```javascript
ParticleRingAPI.setCanvasSize(375, 667);
ParticleRingAPI.setAbsoluteParticleCount(200);
ParticleRingAPI.setConnections(false);
```

### Custom Colors and Sizes

```javascript
ParticleRingAPI.setColors(['#ff6b9d', '#c44569', '#f8b500', '#feca57']);
ParticleRingAPI.setParticleSize(1.0, 4.0);
ParticleRingAPI.setInnerRadius(150);
ParticleRingAPI.setRingWidth(30);
```

## Performance Optimization

### Recommended Settings

| Device | Particle Density | Total Particles | Connection Lines |
|--------|------------------|-----------------|------------------|
| Smartphone | 0.5-1.0 | 100-300 | Disabled |
| Tablet | 1.0-2.0 | 300-600 | Lightweight |
| PC | 2.0-4.0 | 600-1500 | Enabled |
| High-end PC | 4.0+ | 1500+ | High Quality |

### Performance Monitoring

```javascript
// Check current particle count
console.log('Particle count:', ParticleRingAPI.getCurrentParticleCount());

// Monitor FPS (check in browser developer tools)
// Reduce particle count if FPS drops below 60
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License

## Contributing

Pull requests and issue reports are welcome.

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Author

[Your Name](https://github.com/your-username)

## Changelog

### v1.0.0
- Initial release
- Basic Saturn ring animation
- JavaScript API
- Text display functionality
- Responsive design