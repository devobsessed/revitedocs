---
title: Theming
description: Customize the look and feel of your docs
---

ReviteDocs supports customization through component slots and CSS.

## Dark Mode

Dark mode is built-in and toggles automatically based on user preference. Users can also toggle manually using the theme button in the header.

The theme persists across sessions using localStorage.

## Component Slots

Override default components by creating files in `.revitedocs/theme/`:

### Available Slots

| Slot | File | Purpose |
|------|------|---------|
| Header | `Header.tsx` | Site header with navigation |
| Footer | `Footer.tsx` | Site footer |
| Sidebar | `Sidebar.tsx` | Left sidebar navigation |
| Layout | `Layout.tsx` | Main layout wrapper |
| NotFound | `NotFound.tsx` | 404 page |

### Example: Custom Header

Create `.revitedocs/theme/Header.tsx`:

```tsx
import type { HeaderProps } from 'revitedocs/components'

export default function Header({ 
  title, 
  nav, 
  theme, 
  onThemeToggle,
  onSearchOpen 
}: HeaderProps) {
  return (
    <header className="h-16 border-b flex items-center px-6">
      <div className="font-bold text-xl">{title}</div>
      
      <nav className="ml-auto flex gap-4">
        {nav.map((item) => (
          <a key={item.link} href={item.link}>
            {item.text}
          </a>
        ))}
      </nav>
      
      <button onClick={onSearchOpen}>Search</button>
      <button onClick={onThemeToggle}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
```

### Example: Custom Footer

Create `.revitedocs/theme/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="border-t py-8 text-center text-gray-500">
      <p>Built with ReviteDocs</p>
      <p>© {new Date().getFullYear()} My Company</p>
    </footer>
  )
}
```

## CSS Customization

### Using Tailwind

ReviteDocs uses Tailwind CSS. Add custom styles in your config:

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
      },
    },
  },
}
```

### Custom CSS

Create a custom stylesheet and import it in your layout slot:

```css
/* custom.css */
.prose h1 {
  color: var(--primary-color);
}

.sidebar-link:hover {
  background: var(--hover-bg);
}
```

## Logo

Add a custom logo in the header:

```typescript
// .revitedocs/config.ts
export default defineConfig({
  theme: {
    logo: '/logo.svg', // Place in public folder
  },
})
```

