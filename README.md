# 💕 Wedding Journey Web UI

A beautiful web application to share your wedding journey with friends and family.

## Features

- **Timeline**: Display your relationship milestones and important events
- **Gallery**: Share photos from your engagement, wedding, and honeymoon
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Interactive UI**: Smooth animations and hover effects for an engaging experience

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with animations

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/ripe5196/books.git
cd books
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Project Structure

```
src/
├── components/
│   ├── Timeline.jsx    - Timeline component with events
│   └── Gallery.jsx     - Photo gallery with modal view
├── styles/
│   ├── Timeline.css    - Timeline styling
│   └── Gallery.css     - Gallery styling
├── App.jsx             - Main app component
├── App.css             - App styling
├── index.css           - Global styles
└── main.jsx            - App entry point
```

## Customization

### Adding Events to Timeline

Edit `src/components/Timeline.jsx` and modify the `useState` initial state:

```javascript
const [events, setEvents] = useState([
  { id: 1, title: 'Your Event', date: 'YYYY-MM-DD', description: 'Event description' },
  // Add more events...
])
```

### Adding Photos to Gallery

Edit `src/components/Gallery.jsx` and modify the `useState` initial state:

```javascript
const [photos, setPhotos] = useState([
  { id: 1, src: 'your-image-url', caption: 'Photo caption' },
  // Add more photos...
])
```

## Colors & Theming

The app uses a beautiful purple gradient. To customize colors, edit:
- `src/index.css` - Global background gradient
- `src/App.css` - Header and tab styling
- `src/styles/Timeline.css` - Timeline colors
- `src/styles/Gallery.css` - Gallery colors

## License

This project is open source and available under the MIT License.

## Made with ❤️

Perfect for sharing your special day with loved ones!