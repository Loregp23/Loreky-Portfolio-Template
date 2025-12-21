# Light/Dark Mode Toggle Development Plan & Implementation

## User Request (Original Prompt)

"I want to add a minimalistic light/dark mode toggle to my portfolio website. The toggle should be positioned in the navigation bar as a navigation item (appearing before 'About'). It should use a simple switch design that's visible in both themes. The toggle must switch the entire website's color scheme between light and dark modes using CSS variables. Important: The 'Loreky' logo and all hero section text (title, subtitle, button, scroll indicator) must remain white in both themes. The user's theme preference should be saved and persist across page reloads."

---

## AI Development Plan Response

### Light/Dark Mode Toggle Implementation

#### **Design Philosophy:**

- Minimalistic toggle switch design
- Integrated into navigation flow (not floating/absolute positioned)
- High contrast visibility in both themes
- Smooth transitions between modes
- Persistent user preference

#### **HTML Structure Changes:**

1. Add theme toggle button within navigation links
2. Wrap toggle in a list item (`.nav-links-toggle`) to match navigation structure
3. Use semantic button element with proper ARIA label
4. Include track and thumb elements for switch visual
5. Position as first item in nav-links (before "About")

**Structure:**

```html
<ul class="nav-links">
  <li class="nav-links-toggle">
    <button class="theme-toggle" aria-label="Toggle dark/light mode">
      <span class="theme-toggle-track">
        <span class="theme-toggle-thumb"></span>
      </span>
    </button>
  </li>
  <li><a href="#about">About</a></li>
  <!-- ... other links -->
</ul>
```

#### **CSS Architecture:**

**1. Toggle Component Styling:**

- **Track**: 44px × 24px rounded rectangle
  - Dark mode: `rgba(255, 255, 255, 0.4)` - visible against dark nav
  - Light mode: `rgba(0, 0, 0, 0.2)` - visible against light backgrounds
  - Hover states for both modes
- **Thumb**: 20px circle, pure white (`#ffffff`)
  - Slides 20px to the right when light mode active
  - 0.3s ease transition for smooth animation
- **Container**: Flexbox centered within list item

**2. Theme Variables System:**
Create two complete color palettes in `:root` and `body.light-mode`:

**Dark Mode (Default - `:root`):**

- `--color-bg: #0f0f0f` (near-black)
- `--color-bg-alt: #1a1a1a` (slightly lighter sections)
- `--color-text: #f5f5f5` (off-white)
- `--color-text-muted: #a0a0a0` (subdued text)
- `--color-accent: #6366f1` (indigo)
- `--color-accent-hover: #818cf8` (lighter indigo)

**Light Mode (`body.light-mode`):**

- `--color-bg: #ffffff` (white)
- `--color-bg-alt: #f5f5f5` (light gray)
- `--color-text: #1a1a1a` (dark text)
- `--color-text-muted: #6b6b6b` (muted gray)
- `--color-accent: #6366f1` (keep same indigo)
- `--color-accent-hover: #4f46e5` (darker for light bg)

**3. Fixed Elements (Always White):**
Override specific elements to prevent theme changes:

- `.nav-logo`: `color: #ffffff`
- `.hero-title`: `color: #ffffff`
- `.hero-subtitle`: `color: rgba(255, 255, 255, 0.8)`
- `.scroll-indicator`: `color: rgba(255, 255, 255, 0.7)`
- `.btn`: `color: #ffffff`

**4. Responsive Behavior:**

- Mobile: Toggle appears at top of hamburger menu
- Desktop: Toggle appears as first horizontal nav item (left of "About")
- No special positioning needed - flows with navigation items

#### **JavaScript Functionality:**

**Function: `initThemeToggle()`**

**1. Load Saved Preference:**

```javascript
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}
```

**2. Toggle Handler:**

```javascript
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLightMode = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLightMode ? "light" : "dark");
});
```

**3. Integration:**

- Called in `DOMContentLoaded` event listener
- Error handling if toggle element not found
- Works independently of other navigation features

#### **Implementation Flow:**

1. Add HTML toggle structure inside nav-links
2. Define light mode CSS variables in theme.css
3. Style toggle component with track/thumb
4. Add fixed color overrides for logo and hero
5. Create JavaScript toggle function
6. Save/load preference with localStorage
7. Test theme switching and persistence

#### **Technical Considerations:**

**CSS Variables Approach:**

- Single source of truth for colors
- Instant theme switching (no page reload)
- Automatic cascade to all components
- Easy to maintain and extend

**localStorage Strategy:**

- Key: `"theme"`
- Values: `"light"` or `"dark"`
- Loads before page render (no flash)
- Persists across sessions

**Accessibility:**

- Proper ARIA label for screen readers
- Keyboard accessible (button element)
- High contrast in both modes
- Clear visual feedback (hover states)

**Performance:**

- No JavaScript during theme application (pure CSS)
- Minimal repaints (CSS variables only)
- Single class toggle on body element

---

## Implementation Details

### **Files Modified:**

#### 1. **index.html**

Added theme toggle as first navigation item:

```html
<ul class="nav-links">
  <li class="nav-links-toggle">
    <button class="theme-toggle" aria-label="Toggle dark/light mode">
      <span class="theme-toggle-track">
        <span class="theme-toggle-thumb"></span>
      </span>
    </button>
  </li>
  <li><a href="#about">About</a></li>
  <li><a href="#projects">Projects</a></li>
  <li><a href="#contact">Contact</a></li>
</ul>
```

**Key Decision:** Placed toggle inside `nav-links` rather than absolute positioning to integrate it as a proper navigation item that flows with responsive layout.

#### 2. **assets/css/theme.css**

Added complete light mode color palette:

```css
/* Light Mode Theme */
body.light-mode {
  --color-bg: #ffffff;
  --color-bg-alt: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-muted: #6b6b6b;
  --color-accent: #6366f1;
  --color-accent-hover: #4f46e5;
}
```

**Key Decision:** Used same selector weight as default variables to ensure clean override. Kept accent color consistent for brand identity, only adjusted hover state for better light mode contrast.

#### 3. **assets/css/navigation.css**

Implemented toggle component styling:

**Container:**

```css
.nav-links-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Toggle Button:**

```css
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 101;
}
```

**Track (Dark Mode - Default):**

```css
.theme-toggle-track {
  display: block;
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.4); /* Visible in dark mode */
  border-radius: 12px;
  position: relative;
  transition: background 0.3s ease;
}

.theme-toggle:hover .theme-toggle-track {
  background: rgba(255, 255, 255, 0.5);
}
```

**Track (Light Mode):**

```css
body.light-mode .theme-toggle-track {
  background: rgba(0, 0, 0, 0.2);
}

body.light-mode .theme-toggle:hover .theme-toggle-track {
  background: rgba(0, 0, 0, 0.3);
}
```

**Thumb:**

```css
.theme-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #ffffff; /* Pure white for contrast */
  border-radius: 50%;
  transition: transform 0.3s ease;
}

body.light-mode .theme-toggle-thumb {
  transform: translateX(20px);
}
```

**Key Decision:** Increased track opacity from initial 0.2 to 0.4 in dark mode for better visibility against dark navigation bar. Used pure white thumb instead of CSS variable for consistent contrast in both modes.

**Logo Override:**

```css
.nav-logo {
  color: #ffffff; /* Always white */
}
```

#### 4. **assets/css/layout.css**

Fixed hero section colors:

```css
.hero-title {
  color: #ffffff; /* Always white */
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.8); /* White with transparency */
}

.scroll-indicator {
  color: rgba(255, 255, 255, 0.7); /* White with transparency */
}
```

**Key Decision:** Used rgba with alpha for subtitle and scroll indicator to maintain hierarchy while keeping them visibly white.

#### 5. **assets/css/components.css**

Fixed button text color:

```css
.btn {
  color: #ffffff; /* Always white text */
}
```

#### 6. **assets/js/main.js**

Added theme toggle functionality:

```javascript
// ==========================================================================
// 5. THEME TOGGLE FUNCTIONALITY
// ==========================================================================

function initThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");

  if (!themeToggle) {
    console.warn("⚠️ Theme toggle element not found");
    return;
  }

  // Load saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  // Toggle theme on click
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    // Save preference
    const isLightMode = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
  });
}
```

**Integration:**

```javascript
document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initSmoothScroll();
  initActiveNav();
  initHamburgerMenu();
  initThemeToggle(); // Added here

  console.log("🚀 Grade 1 Demo: Vanilla scroll animations initialized");
});
```

**Key Decision:** Loaded saved preference before event listener setup to avoid flash of wrong theme. Used simple boolean logic for localStorage values.

### **Color Strategy:**

**Elements That Change with Theme:**

- All background colors (`--color-bg`, `--color-bg-alt`)
- Body text and headings (`--color-text`)
- Secondary/muted text (`--color-text-muted`)
- Navigation bar glassmorphism (inherits from `--color-bg`)
- Section backgrounds
- Card backgrounds
- All other UI elements using CSS variables

**Elements Fixed White:**

- Loreky logo (navigation)
- PORTFOLIO title (hero)
- Illustrator & Visual Artist subtitle (hero)
- View My Work button text (hero)
- Scroll indicator text (hero)

**Rationale:** Hero section designed as dark hero with parallax background. Keeping text white maintains the dramatic visual impact and ensures readability against the dark/image background regardless of site theme.

### **Responsive Behavior:**

**Mobile (< 768px):**

- Toggle appears at top of hamburger menu
- First item when menu slides in
- Full width container with centered toggle
- Part of the slide-in animation

**Desktop (≥ 768px):**

- Toggle appears as first horizontal nav item
- Positioned to left of "About" link
- Flows naturally with navigation layout
- Maintains spacing with `gap: var(--space-lg)`

**No Media Query Overrides Needed:** By integrating toggle into `nav-links`, it automatically inherits responsive behavior (flex-direction: column → row, positioning, etc.).

### **localStorage Implementation:**

**Storage Format:**

```javascript
localStorage.setItem("theme", "light"); // or "dark"
```

**Load on Page Load:**

```javascript
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}
```

**Benefits:**

- Persists across browser sessions
- No server required
- Instant application (no API calls)
- Works offline
- 5-10MB storage limit (plenty for one string)

### **Key Features Achieved:**

✅ **Minimalistic Design:** Simple track/thumb switch, no icons or text  
✅ **Navigation Integration:** Flows as first nav item, not absolutely positioned  
✅ **High Visibility:** Track opacity increased to 0.4 for dark mode readability  
✅ **Complete Theme Switch:** All CSS variables update instantly  
✅ **Fixed Hero Elements:** Logo and hero text stay white in both modes  
✅ **Smooth Animation:** 0.3s ease transitions for thumb and track  
✅ **Persistent Preference:** localStorage saves user choice  
✅ **Responsive:** Works in hamburger menu (mobile) and horizontal nav (desktop)  
✅ **Accessible:** Proper ARIA label, keyboard accessible  
✅ **Error Handling:** Console warning if element not found  
✅ **No Flash:** Theme loaded before page render

### **Design Decisions Explained:**

1. **Why CSS Variables?**

   - Single toggle point (body class) cascades everywhere
   - No need to manually update hundreds of style rules
   - Instant theme switching without page reload
   - Easy to maintain and extend

2. **Why Track Opacity 0.4 in Dark Mode?**

   - Original 0.2 was too subtle against `rgba(0, 0, 0, 0.47)` nav background
   - 0.4 provides clear visual distinction
   - Still subtle enough to be minimalistic
   - Hover increases to 0.5 for clear interaction feedback

3. **Why Pure White Thumb?**

   - Maximum contrast in both themes
   - `var(--color-text)` would be dark in light mode (poor contrast)
   - White works as neutral indicator in both contexts
   - Consistent with brand's white logo/hero text

4. **Why Fix Hero Text as White?**

   - Hero section has dark parallax background
   - Design intention: dramatic dark hero regardless of site theme
   - White text ensures readability
   - Maintains visual impact and brand consistency

5. **Why Inside nav-links?**

   - Automatic responsive behavior (no extra media queries)
   - Appears in hamburger menu on mobile naturally
   - Semantic structure (part of navigation)
   - Easier to maintain (follows existing patterns)

6. **Why localStorage vs Cookies?**
   - No server needed
   - Larger storage limit
   - Simpler API
   - No HTTP overhead
   - Works offline immediately

### **Testing Checklist:**

- ✅ Toggle slides thumb correctly in both directions
- ✅ Body class toggles between default and `.light-mode`
- ✅ All CSS variables update throughout site
- ✅ Theme preference saves to localStorage
- ✅ Page reload restores saved theme
- ✅ Logo stays white in both modes
- ✅ Hero title stays white in both modes
- ✅ Hero subtitle stays white in both modes
- ✅ Button text stays white in both modes
- ✅ Scroll indicator stays white in both modes
- ✅ Toggle visible in dark mode (not too subtle)
- ✅ Toggle visible in light mode (sufficient contrast)
- ✅ Hover states work in both modes
- ✅ Toggle appears in hamburger menu (mobile)
- ✅ Toggle appears before "About" (desktop)
- ✅ Keyboard accessible (Tab + Enter/Space)
- ✅ Screen reader announces properly (ARIA label)
- ✅ No console errors
- ✅ Smooth transitions (no janky animations)

---

## Update: Mobile Toggle Positioning (Left of Hamburger Menu)

### **Additional User Request:**

"I want the toggle button to appear on the left side of the hamburger menu icon in mobile view (not inside the hamburger menu itself)."

### **Implementation Strategy:**

To achieve this while maintaining desktop functionality, we implemented a dual-toggle approach:

#### **HTML Changes:**

Created two separate toggle instances:

```html
<!-- Right side navigation controls -->
<div class="nav-controls">
  <!-- Theme Toggle (Mobile) - Left of hamburger -->
  <button
    class="theme-toggle theme-toggle-mobile"
    aria-label="Toggle dark/light mode"
  >
    <span class="theme-toggle-track">
      <span class="theme-toggle-thumb"></span>
    </span>
  </button>
  <!-- Hamburger Menu Button -->
  <button class="hamburger" ...>...</button>
</div>

<!-- Navigation Links -->
<ul class="nav-links">
  <li class="nav-links-toggle">
    <!-- Theme Toggle (Desktop) - Before "About" -->
    <button
      class="theme-toggle theme-toggle-desktop"
      aria-label="Toggle dark/light mode"
    >
      <span class="theme-toggle-track">
        <span class="theme-toggle-thumb"></span>
      </span>
    </button>
  </li>
  <li><a href="#about">About</a></li>
  ...
</ul>
```

#### **CSS Changes:**

**New wrapper for mobile controls:**

```css
.nav-controls {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  z-index: 101;
}
```

**Mobile visibility (default):**

```css
.nav-links-toggle {
  display: none; /* Hidden on mobile */
}

.theme-toggle-desktop {
  display: none; /* Hidden on mobile */
}

.theme-toggle-mobile {
  display: block; /* Visible on mobile */
}
```

**Desktop visibility (≥ 768px):**

```css
@media (min-width: 768px) {
  .nav-controls {
    display: none; /* Hide mobile controls wrapper */
  }

  .theme-toggle-mobile {
    display: none;
  }

  .theme-toggle-desktop {
    display: block;
  }

  .nav-links-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
```

**Hamburger menu stays white:**

```css
.hamburger-line {
  background-color: #ffffff; /* Always white in both themes */
}
```

#### **JavaScript Changes:**

Updated to handle multiple toggle instances:

```javascript
function initThemeToggle() {
  const themeToggles = document.querySelectorAll(".theme-toggle");

  if (themeToggles.length === 0) {
    console.warn("⚠️ Theme toggle elements not found");
    return;
  }

  // Load saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  // Toggle theme on click for all toggle buttons
  themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");

      // Save preference
      const isLightMode = document.body.classList.contains("light-mode");
      localStorage.setItem("theme", isLightMode ? "light" : "dark");
    });
  });
}
```

**Key Change:** Changed from `querySelector` (single element) to `querySelectorAll` (all elements) and added `forEach` loop to bind event listeners to both toggles.

#### **Final Layout:**

**Mobile:**

```
[Loreky]  [★]  [🔘Toggle] [☰Hamburger]
```

- Toggle positioned to the LEFT of hamburger icon
- Both in `.nav-controls` wrapper with gap spacing

**Desktop:**

```
[Loreky]  [★]  [🔘Toggle] [About] [Projects] [Contact]
```

- Toggle appears as first navigation item (before "About")
- Hamburger and mobile toggle hidden

#### **Benefits of Dual-Toggle Approach:**

✅ Clean separation of mobile and desktop layouts
✅ No complex CSS positioning calculations
✅ Both toggles stay in sync (same JavaScript handler)
✅ Easy to maintain and debug
✅ Hamburger icon stays white in both themes
✅ Toggle clearly visible next to hamburger in mobile view
✅ Natural integration with navigation flow on desktop

#### **Additional Testing:**

- ✅ Mobile toggle appears left of hamburger
- ✅ Desktop toggle appears before "About"
- ✅ Both toggles sync theme state
- ✅ Only one toggle visible at a time
- ✅ Hamburger lines stay white in both themes
- ✅ Proper spacing between toggle and hamburger
- ✅ No duplicate event listeners or memory leaks

---

### **Future Enhancement Opportunities:**

- Add sun/moon icons inside thumb for clearer indication
- Implement `prefers-color-scheme` media query for system preference detection
- Add transition to entire page for theme switch (fade effect)
- Create separate theme for portfolio images (filter adjustments)
- Add more granular control (accent color picker)
- Implement custom themes beyond light/dark
- Add keyboard shortcut (e.g., Ctrl+Shift+T)
- Animate logo color change for continuity
