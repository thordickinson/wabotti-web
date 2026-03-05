# Design System & Brand Identity

This document defines the visual standards for the **Wabotti** application application, centered around a modern, trustworthy, and professional aesthetic.

---

## 🎨 Color Palette

The brand color is **Wabotti Indigo** (`#471ca8`), a deep, rich purple that signifies innovation and stability. We pair this with cool-toned **Slate** neutrals.

### Primary Colors (Indigo)

Used for primary actions, active states, and brand highlights.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `primary-50` | `#f4f1fa` | Backgrounds, very subtle tints |
| `primary-100` | `#e8e4f5` | Hover backgrounds |
| `primary-200` | `#d2c8eb` | Borders, subtle accents |
| `primary-300` | `#b5a0df` | |
| `primary-400` | `#9674d2` | Focus rings, light accents |
| `primary-500` | `#7a4cc3` | |
| `primary-600` | `#6230b0` | Hover states for primary buttons |
| **`primary-700`** | **`#471ca8`** | **Base Brand Color** |
| `primary-800` | `#3c198a` | Active states |
| `primary-900` | `#321570` | Dark mode backgrounds |
| `primary-950` | `#1e0a4a` | Deep dark mode details |

### Neutrals (Slate)

Used for text, borders, and general UI structure. Matches the cool tone of the primary color.

| Token | Hex | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| `neutral-50` | `#f8fafc` | `slate-50` | App Bkg (Light) |
| `neutral-100` | `#f1f5f9` | `slate-100` | Panels / Cards |
| `neutral-200` | `#e2e8f0` | `slate-200` | Borders |
| `neutral-500` | `#64748b` | `slate-500` | Secondary Text |
| `neutral-900` | `#0f172a` | `slate-900` | Primary Text |
| `neutral-950` | `#020617` | `slate-950` | App Bkg (Dark) |

### Semantic Colors

Functional colors for status and feedback.

| Type | Color Family | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Success** | Emerald | `#10b981` | Completed, Valid, On-track |
| **Warning** | Amber | `#f59e0b` | Pending, Attention required |
| **Error** | Rose | `#f43f5e` | Failed, Destructive actions |
| **Info** | Sky | `#0ea5e9` | Information, Help |

---

## typography

- **Font Family:** `Inter` (Sans-serif) for UI text.
- **Headings:** `Inter` (Bold/Semibold).

---

## UI Components (shadcn/ui)

We utilize **shadcn/ui** components customized with our CSS variables.

- **Radius:** `0.5rem` (Rounded-md) default.
- **Shadows:** Soft, diffused shadows for depth.

---

## 📐 Layout Patterns

To ensure visual consistency across the dashboard, use the following patterns.

### 1. Data Display: Cards vs Lists

**Standard: Use Cards for Lists**
Instead of simple lists or traditional tables for high-level items, use **Cards**.
- **Container:** Grid layout (responsive).
- **Content:** Title, description, key metadata, and status badge.
- **Actions:** Primary action (e.g. "Manage") as a button or clickable card area.

### 2. Form & Action Placement

**Standard: No Floating Buttons**
Action buttons should be anchored within their context.

- **Forms:** Save/Cancel buttons belong **inside** the card footer or aligned at the bottom of the form container.
- **Page Header:** Global page actions (e.g., "Create New") belong in the **Page Header**, aligned right.
- **Card Actions:** Actions specific to an item belong inside that item's card.

**Avoid:** Sticky/floating action buttons that obscure content.

### 3. Page Structure

```
+------------------------------------------------------+
|  [Page Header]                                       |
|  Title                      [Primary Action Button]  |
+------------------------------------------------------+
|                                                      |
|  [Content Area]                                      |
|  +------------------+  +------------------+          |
|  | Card             |  | Card             |          |
|  | [Action Btn]     |  | [Action Btn]     |          |
|  +------------------+  +------------------+          |
|                                                      |
+------------------------------------------------------+
```

---

## � Page Header Patterns

**Component: `DashboardHeader`**

All dashboard pages should use the standardized `DashboardHeader` component for consistency.

### Basic Usage (List Pages)

```tsx
<DashboardHeader title="Servicios" />
```

**Result:**
- Sidebar toggle button
- Separator
- Page title

### Detail/Edit Pages

```tsx
<DashboardHeader 
    title="Editar: Profesional"
    backHref="/dashboard/services/team"
>
    <Button onClick={handleSave}>Guardar cambios</Button>
</DashboardHeader>
```

**Result:**
- Sidebar toggle button
- Separator
- Back button (arrow)
- Separator
- Page title (flex-1, takes remaining space)
- Action buttons (children)

### Header Structure

```
+----------------------------------------------------------------+
| [☰] | [←] | Page Title                    [Action Buttons]   |
+----------------------------------------------------------------+
```

**Order (left to right):**
1. Sidebar toggle (hamburger menu)
2. Separator
3. Back button (if `backHref` provided)
4. Separator (if back button exists)
5. Title (flex-1)
6. Action buttons (children)

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string?` | Page title |
| `backHref` | `string?` | URL for back navigation (shows arrow button) |
| `children` | `ReactNode?` | Action buttons or other controls |

---

## �🖱️ Card Interaction Pattern

**Standard: Clickable Cards for Navigation**

All list views (services, professionals, facilities, locations, customers, etc.) should follow this interaction pattern for consistency:

### Card as Navigation Element

Cards representing items in a list should be **fully clickable** and navigate to the item's detail/edit page.

```tsx
<Card
    className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
    onClick={() => router.push(`/dashboard/items/${item.id}`)}
>
    {/* Card content */}
</Card>
```

**Visual Feedback:**
- `cursor-pointer` - Shows hand cursor on hover
- `hover:border-primary/50` - Subtle border color change
- `hover:shadow-sm` - Light shadow on hover
- Title text color change: `group-hover:text-primary` (requires `group` class on Card)

### Secondary Actions

Action buttons within cards (delete, toggle visibility, etc.) must prevent navigation:

```tsx
<Button
    onClick={(e) => {
        e.stopPropagation(); // Prevent card click
        handleAction();
    }}
>
    Action
</Button>
```

**For AlertDialogs:**
```tsx
<AlertDialogTrigger asChild>
    <Button onClick={(e) => e.stopPropagation()}>
        Delete
    </Button>
</AlertDialogTrigger>
<AlertDialogContent onClick={(e) => e.stopPropagation()}>
    {/* Dialog content */}
</AlertDialogContent>
```

### Implementation Checklist

When creating a list view:
- [ ] Add `cursor-pointer` to Card
- [ ] Add `onClick` handler that navigates to detail page
- [ ] Add hover effects (`hover:border-primary/50`, `hover:shadow-sm`)
- [ ] Add `group` class to Card for nested hover effects
- [ ] Add `group-hover:text-primary` to title
- [ ] Ensure all secondary action buttons use `e.stopPropagation()`
- [ ] Test that clicking card navigates, but action buttons don't

### Anti-patterns

❌ **Don't:**
- Use separate "Edit" buttons as the primary way to access detail pages
- Make only the title clickable
- Use hover effects that are too aggressive (large shadows, color shifts)
- Forget `stopPropagation` on action buttons

✅ **Do:**
- Make the entire card clickable
- Use subtle, professional hover effects
- Provide clear visual feedback
- Keep action buttons minimal and clearly separated

---

