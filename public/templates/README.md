# Wabotti Site Templates - Developer Guide

Welcome to the Wabotti Template Engine. This system is designed to separate **Logic/Data (The Engine)** from **Design (The Theme)**, allowing developers to create stunning, distinct templates while reusing the core functionality.

## Architecture Overview

All templates live in `public/templates/[template-name]/index.html`. 
The architecture consists of two main JavaScript objects defined in the template:

1.  **`Theme`**: Handles ONE thing — **HTML String Generation**. It takes data (props) and returns HTML strings. It knows *nothing* about fetching data or browser APIs.
2.  **`Engine`**: Handles ONE thing — **Execution Logic**. It fetches data, calls the Theme renderers, interacts with the DOM (injecting HTML), and initializes imperative libraries (Leaflet Maps, Sliders, etc.).

## Creating a New Template

To create a new template, you simply execute `cp -r public/templates/default public/templates/my-new-template` and modify the `Theme` object in `index.html`.

### The `Theme` Object

The `Theme` object must define a `renderers` dictionary. Each key corresponds to a block type (e.g., `hero`, `features`).

```javascript
const Theme = {
    name: 'My Custom Theme',
    
    // Optional helper for common logic
    getBgClass: (context) => {
        return context.index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
    },

    renderers: {
        
        // 1. Hero Block
        hero: (props, context) => {
            // props: { title, subtitle, ctaText, ctaLink, backgroundImage, alignment }
            // context: { data, index, blockId }
            return `
                <div class="hero-section">
                    <h1>${props.title}</h1>
                    ...
                </div>
            `;
        },

        // 2. Features Block
        features: (props, context) => {
            // props: { title, description, columns, items: [{ title, description, icon }] }
            return `...`;
        },

        // ... Implement other blocks (content, testimonials, gallery, services, faq, team, contact, location-social)
    }
};
```

## Available Block Types & Props

| Block Type | Description | Key Props |
| :--- | :--- | :--- |
| **`hero`** | Hero section with optional background image. | `title`, `subtitle`, `ctaText`, `ctaLink`, `backgroundImage`, `alignment` |
| **`features`** | Grid of feature cards with icons. | `title`, `description`, `columns` (number), `items` (array) |
| **`content`** | Simple rich text content block. | `title`, `content` (HTML string), `alignment` |
| **`testimonials`** | Customer reviews. | `title`, `source` ('database' \| 'manual'), `items` |
| **`gallery`** | Grid of images. | `title`, `description`, `images` (array of URLs), `columns` |
| **`services`** | List of services with booking button. | `title`, `showPrice` (boolean). **Data Source**: `context.data.company.services` |
| **`team`** | Grid of professional profiles. | `title`, `description`. **Data Source**: `context.data.company.resources` |
| **`contact`** | Simple contact info section. | `title`, `subtitle` |
| **`location-social`** | Location info, map placeholder, and social links. | `title`, `description`. **Data**: `context.data.company.locations` & `social` |

## The `Engine` Object (Core)

You generally **do not need to modify** the `Engine` object unless you are adding new global functionality.

### Engine Responsibilities:
1.  **Hydration**: Reads `window.TEMPLATE_DATA` and populates global UI (Navbar, Footer, SEO Meta).
2.  **Rendering**: Iterates through `data.blocks`, looks up the correct renderer in `Theme.renderers`, and injects the resulting HTML into `#blocks-container`.
3.  **Context**: Passes a `context` object to every renderer containing:
    *   `data`: The full global data object.
    *   `index`: The index of the current block (useful for alternating colors).
    *   `blockId`: Unique ID of the block.
4.  **Post-Processing**: After HTML injection, the Engine initializes interactive elements like Leaflet Maps.

## Styling

The default template uses **TailwindCSS** via CDN for rapid prototyping. You are free to:
-   Change the `tailwind.config` in the `<head>`.
-   Add custom CSS in `style.css` (or inline `<style>`).
-   Replace Tailwind entirely with another framework (Bootstrap, Bulma, custom CSS).

## Testing

To test your template locally:
1.  Ensure you have a site configured in your database using your template path (e.g., `my-new-template`).
2.  Visit the site URL (e.g. `http://localhost:3000` via middleware routing).
3.  The `Engine` will log "Hydrating with..." to the console if it's working.
