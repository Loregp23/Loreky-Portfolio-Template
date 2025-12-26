// ==========================================================================
// 1. INTERSECTIONOBSERVER CONFIGURATION
// ==========================================================================

/**
 * Observer options control WHEN the callback fires.
 *
 * 📐 UNDERSTANDING THE OPTIONS:
 *
 * root: The element to use as the viewport for checking visibility.
 *       - null = browser viewport (most common)
 *       - element = custom scroll container
 *
 * rootMargin: Expands or shrinks the root's bounding box.
 *       - Format: "top right bottom left" (like CSS margin)
 *       - Negative values shrink the detection area
 *       - "0px 0px -10% 0px" means: trigger when element is 10% INTO the viewport
 *         (not at the very edge, which feels more natural)
 *
 * threshold: What percentage of the element must be visible to trigger.
 *       - 0 = trigger as soon as 1 pixel is visible
 *       - 0.1 = trigger when 10% is visible
 *       - 1.0 = trigger only when 100% visible
 *       - [0, 0.5, 1] = trigger at multiple thresholds
 */
const observerOptions = {
  root: null, // Use the browser viewport
  rootMargin: "0px 0px -10% 0px", // Trigger 10% before fully visible
  threshold: 0.1, // Need 10% visibility to trigger
};

/**
 * CALLBACK: Single-element reveals
 *
 * This function is called by IntersectionObserver whenever an observed
 * element's intersection state changes.
 *
 * @param {IntersectionObserverEntry[]} entries - Array of intersection events
 * @param {IntersectionObserver} observer - The observer instance (for cleanup)
 *
 * 📐 WHAT'S IN AN ENTRY?
 * - entry.isIntersecting: boolean - is element currently visible?
 * - entry.intersectionRatio: number - how much is visible (0-1)
 * - entry.target: Element - the DOM element being observed
 * - entry.boundingClientRect: DOMRect - element's position/size
 */
const revealOnScroll = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add class that triggers CSS transition (see style.css)
      entry.target.classList.add("visible");

      // 🎯 PERFORMANCE OPTIMIZATION: Stop observing after reveal
      // Once an element is revealed, we don't need to watch it anymore.
      // This reduces work for the observer and prevents re-triggering.
      observer.unobserve(entry.target);
    }
  });
};

/**
 * CALLBACK: Staggered container reveals
 *
 * Same pattern, but adds 'revealed' class to containers.
 * CSS handles the staggered animation of children via transition-delay.
 */
const revealStaggered = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    }
  });
};

/**
 * CREATE OBSERVER INSTANCES
 *
 * We create two separate observers because they add different classes.
 * You could use one observer with logic to determine which class to add,
 * but separate observers are clearer and more maintainable.
 */
const singleObserver = new IntersectionObserver(
  revealOnScroll,
  observerOptions
);
const staggerObserver = new IntersectionObserver(
  revealStaggered,
  observerOptions
);

// ==========================================================================
// 2. INITIALIZE OBSERVERS
// ==========================================================================

/**
 * Main initialization function for scroll animations.
 *
 * 🎓 KEY CONCEPT: PROGRESSIVE ENHANCEMENT
 * We check for reduced motion FIRST, before setting up any animations.
 * This ensures users who need reduced motion get a good experience immediately.
 *
 * 📐 THE FLOW:
 * 1. Check if user prefers reduced motion
 * 2. If yes → make everything visible immediately, skip animations
 * 3. If no → set up observers to trigger animations on scroll
 */
function initScrollAnimations() {
  /**
   * CHECK FOR REDUCED MOTION PREFERENCE
   *
   * window.matchMedia() is like CSS media queries, but in JavaScript!
   * It returns a MediaQueryList object with a .matches boolean property.
   *
   * This respects the user's OS-level accessibility settings:
   * - macOS: System Preferences → Accessibility → Display → Reduce motion
   * - Windows: Settings → Ease of Access → Display → Show animations
   * - iOS: Settings → Accessibility → Motion → Reduce Motion
   *
   * ⚠️ IMPORTANT: Always check this BEFORE initializing animations!
   */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    /**
     * GRACEFUL DEGRADATION FOR REDUCED MOTION
     *
     * Instead of animations, we immediately show all content.
     * Users get the same information, just without the motion.
     *
     * This is NOT about removing features — it's about providing
     * an equivalent experience for users who need it.
     */
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      el.classList.add("visible");
    });
    document.querySelectorAll("[data-reveal-stagger]").forEach((el) => {
      el.classList.add("revealed");
    });
    return; // Exit early — no observers needed
  }

  /**
   * OBSERVE ELEMENTS FOR SCROLL-TRIGGERED ANIMATIONS
   *
   * querySelectorAll returns a NodeList (array-like).
   * forEach loops through each element and tells the observer to watch it.
   *
   * Once observed, the callback (revealOnScroll) will fire when the
   * element enters the viewport according to our observerOptions.
   */

  // Single element reveals (e.g., headings, paragraphs)
  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    singleObserver.observe(el);
  });

  // Staggered container reveals (e.g., skill grids, project cards)
  document.querySelectorAll("[data-reveal-stagger]").forEach((el) => {
    staggerObserver.observe(el);
  });
}

// ==========================================================================
// 3. SMOOTH SCROLL FOR ANCHOR LINKS
// ==========================================================================

/**
 * Enhanced smooth scrolling for in-page navigation.
 *
 * 🎓 WHY NOT JUST USE CSS scroll-behavior: smooth?
 * CSS smooth scrolling works great, but it has limitations:
 * 1. Can't account for fixed header height
 * 2. Can't update URL without page jump
 * 3. Less control over timing/easing
 *
 * This JavaScript approach gives us full control while still being simple.
 *
 * 📐 THE PATTERN:
 * 1. Find all links starting with "#" (anchor links)
 * 2. On click, prevent default jump behavior
 * 3. Calculate target position accounting for fixed nav height
 * 4. Smoothly scroll to that position
 * 5. Update URL for bookmarking/sharing
 */
function initSmoothScroll() {
  // Select all anchor links (href starts with "#")
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");

      // Ignore links that are just "#" (often used for JavaScript triggers)
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        // Prevent the default "jump to anchor" behavior
        e.preventDefault();

        /**
         * CALCULATE SCROLL POSITION
         *
         * We need to account for the fixed navigation bar, otherwise
         * the target would be hidden behind it.
         *
         * getBoundingClientRect().top = distance from viewport top
         * window.scrollY = how far page is already scrolled
         * navHeight = height of fixed nav to offset
         */
        const navHeight = document.querySelector(".nav")?.offsetHeight || 0;
        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - navHeight;

        /**
         * SCROLL WITH SMOOTH BEHAVIOR
         *
         * window.scrollTo() with behavior: 'smooth' animates the scroll.
         * This is supported in all modern browsers.
         *
         * Note: CSS scroll-behavior: smooth on <html> provides a fallback
         * for browsers where this JS might fail.
         */
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        /**
         * UPDATE URL WITHOUT PAGE RELOAD
         *
         * history.pushState() changes the URL in the address bar
         * without triggering a page reload or scroll jump.
         *
         * This means:
         * - Users can bookmark specific sections
         * - Sharing the URL goes to the right section
         * - Back button works as expected
         */
        history.pushState(null, "", targetId);
      }
    });
  });
}

// ==========================================================================
// 4. ACTIVE NAVIGATION STATE
// ==========================================================================

/**
 * Highlight the nav link corresponding to the currently visible section.
 *
 * 🎓 UX PRINCIPLE: LOCATION AWARENESS
 * Users should always know where they are in the page. Highlighting the
 * active nav link provides this feedback without requiring user action.
 *
 * 📐 THE APPROACH:
 * We use IntersectionObserver again! But with different rootMargin settings
 * that define a "detection zone" in the middle of the viewport.
 *
 * rootMargin: '-50% 0px -50% 0px' means:
 * - Shrink the detection area by 50% from top AND bottom
 * - This creates a narrow band in the middle of the viewport
 * - Only the section crossing this band is considered "active"
 */
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observerOptions = {
    root: null,
    rootMargin: "-50% 0px -50% 0px", // Detect section in middle of viewport
    threshold: 0, // Trigger as soon as ANY part enters
  };

  /**
   * NAV HIGHLIGHT OBSERVER
   *
   * When a section enters our detection zone (middle of viewport),
   * we find the corresponding nav link and highlight it.
   */
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");

        // Update all nav links: highlight matching, reset others
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, observerOptions);

  // Observe all sections with IDs
  sections.forEach((section) => navObserver.observe(section));
}

// ==========================================================================
// 4. HAMBURGER MENU FUNCTIONALITY
// ==========================================================================

/**
 * Initialize hamburger menu for mobile navigation.
 *
 * 🎓 WHAT THIS DOES:
 * - Toggles mobile menu visibility when hamburger button is clicked
 * - Animates hamburger icon to X when menu is open
 * - Closes menu when a navigation link is clicked
 * - Accessible with proper ARIA attributes
 *
 * 📐 HOW IT WORKS:
 * 1. Click hamburger → toggle 'active' class on button and menu
 * 2. CSS handles the sliding animation and icon transformation
 * 3. Click any nav link → close the menu automatically
 */
function initHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const navLinkItems = document.querySelectorAll(".nav-links a");

  if (!hamburger || !navLinks) {
    console.warn("⚠️ Hamburger menu elements not found");
    return;
  }

  /**
   * Toggle menu open/closed
   */
  hamburger.addEventListener("click", () => {
    const isExpanded = hamburger.getAttribute("aria-expanded") === "true";

    // Toggle active classes
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");

    // Update ARIA attribute for accessibility
    hamburger.setAttribute("aria-expanded", !isExpanded);
  });

  /**
   * Close menu when clicking any navigation link
   * This provides better UX - menu closes after selection
   */
  navLinkItems.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// ==========================================================================
// 5. THEME TOGGLE FUNCTIONALITY
// ==========================================================================

/**
 * Initialize theme toggle for light/dark mode switching.
 *
 * 🎓 WHAT THIS DOES:
 * - Toggles light/dark mode when button is clicked
 * - Saves preference to localStorage
 * - Loads saved preference on page load
 * - Smooth transition between themes via CSS variables
 *
 * 📐 HOW IT WORKS:
 * 1. Click toggle → add/remove 'light-mode' class on body
 * 2. CSS variables in theme.css update automatically
 * 3. Preference saved to localStorage for persistence
 */
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

// ==========================================================================
// 6. INITIALIZATION
// ==========================================================================

/**
 * DOMContentLoaded: The safe time to run DOM-manipulating JavaScript.
 *
 * 🎓 WHY DOMContentLoaded?
 * - Fires when HTML is fully parsed (DOM is ready)
 * - Doesn't wait for images/stylesheets to load (that's 'load' event)
 * - Safe to query and manipulate DOM elements
 *
 * If your script is in <head> without 'defer', this is essential.
 * If your script is at end of <body> or has 'defer', it's optional but good practice.
 */
document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initSmoothScroll();
  initActiveNav();
  initHamburgerMenu();
  initThemeToggle();

  console.log("🚀 Grade 1 Demo: Vanilla scroll animations initialized");
});

// ==========================================================================
// 7. CLEANUP (FOR SPA ENVIRONMENTS)
// ==========================================================================

/**
 * Cleanup function for Single Page Application (SPA) routing.
 *
 * 🎓 WHY IS CLEANUP IMPORTANT?
 * In SPAs (React, Vue, etc.), pages don't fully reload when navigating.
 * If you don't disconnect observers, they keep watching elements that
 * may have been removed, causing memory leaks and bugs.
 *
 * 📐 WHEN TO CALL THIS:
 * - Before navigating away from this page in an SPA
 * - In React: useEffect cleanup function
 * - In Vue: onUnmounted lifecycle hook
 *
 * For traditional multi-page sites, this isn't needed (page reload cleans up).
 */
window.cleanupScrollObservers = () => {
  singleObserver.disconnect(); // Stop observing all elements
  staggerObserver.disconnect();
  console.log("🧹 Observers cleaned up");
};

// ==========================================================================
// HERO BACKGROUND CAROUSEL
// ==========================================================================

/**
 * HERO CAROUSEL
 *
 * Automatically cycles through background images in the hero section.
 * Transitions are smooth using CSS opacity animations.
 */
function initHeroCarousel() {
  const slides = document.querySelectorAll(".carousel-slide");

  // Exit if no slides found
  if (slides.length === 0) {
    console.log("⚠️ No carousel slides found");
    return;
  }

  console.log(`🎠 Carousel initialized with ${slides.length} slides`);

  let currentSlide = 0;
  const slideInterval = 3000; // Change image every 3 seconds

  function nextSlide() {
    // Remove active class from current slide
    slides[currentSlide].classList.remove("active");

    // Move to next slide (loop back to 0 if at the end)
    currentSlide = (currentSlide + 1) % slides.length;

    // Add active class to new slide
    slides[currentSlide].classList.add("active");

    console.log(`🎠 Switched to slide ${currentSlide + 1}`);
  }

  // Start the carousel
  setInterval(nextSlide, slideInterval);
  console.log(`✅ Carousel running (interval: ${slideInterval}ms)`);
}

// Initialize carousel when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroCarousel);
} else {
  initHeroCarousel();
}

// ==========================================================================
// PROJECTS CAROUSEL (Illustration)
// This section manages the main projects carousel in the Illustration section.
// HOW IT WORKS:
// - Tracks the current visible project card (currentIndex)
// - Handles left/right arrow clicks to move between cards
// - Updates indicator dots to reflect the active card
// - Supports keyboard navigation (arrow keys)
// - Adds touch/swipe support for mobile devices
// - Uses CSS transforms for smooth sliding transitions
// - Prevents rapid clicks with an animation lock (isAnimating)
// ==========================================================================

function initProjectsCarousel() {
  // Scope to the first Projects carousel inside the #projects section
  const projectsSection = document.querySelector("#projects");
  if (!projectsSection) return;

  const projectsCarousel = projectsSection.querySelector(
    ".projects-carousel:not(.projects-carousel-comic):not(.projects-carousel-editorial)"
  );
  if (!projectsCarousel) return;

  const track = projectsCarousel.querySelector(".carousel-track");
  const leftArrow = projectsCarousel.querySelector(".carousel-arrow-left");
  const rightArrow = projectsCarousel.querySelector(".carousel-arrow-right");
  const indicators = projectsSection.querySelectorAll(
    ".carousel-indicators .indicator"
  );

  if (!track || !leftArrow || !rightArrow) return;

  let currentIndex = 0;
  let isAnimating = false;
  const totalCards = track.querySelectorAll(".project-carousel-card").length;

  function updateCarousel() {
    if (isAnimating) return;
    isAnimating = true;

    // Use transform for hardware acceleration
    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

    // Update indicators efficiently
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });

    // Reset animation lock after transition
    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }

  function nextSlide() {
    if (isAnimating) return;
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
  }

  function prevSlide() {
    if (isAnimating) return;
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
  }

  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    currentIndex = index;
    updateCarousel();
  }

  // Event listeners with passive for better scroll performance
  rightArrow.addEventListener("click", nextSlide);
  leftArrow.addEventListener("click", prevSlide);

  // Indicator click events
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  // Keyboard navigation with debounce
  let keyTimeout;
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      clearTimeout(keyTimeout);
      keyTimeout = setTimeout(() => {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
      }, 50);
    }
  });

  // Optimized touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  let isSwiping = false;

  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!isSwiping) return;
      touchEndX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      if (!isSwiping) return;
      handleSwipe();
      isSwiping = false;
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 75;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
}

// Initialize projects carousel when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectsCarousel);
} else {
  initProjectsCarousel();
}

// ==========================================================================
// COMIC CAROUSEL
// This section manages the carousel for comic projects.
// HOW IT WORKS:
// - Maintains the current comic card index (currentIndex)
// - Listens for left/right arrow clicks to change cards
// - Updates indicator dots for the active comic
// - Supports touch/swipe gestures for mobile navigation
// - Uses CSS transforms for smooth horizontal movement
// - Prevents overlapping transitions with an animation lock
// ==========================================================================

function initComicCarousel() {
  const track = document.querySelector(".carousel-track-comic");
  const leftArrow = document.querySelector(".carousel-arrow-left-comic");
  const rightArrow = document.querySelector(".carousel-arrow-right-comic");
  const indicators = document.querySelectorAll(".indicator-comic");

  if (!track || !leftArrow || !rightArrow) return;

  let currentIndex = 0;
  let isAnimating = false;
  const totalCards = track.querySelectorAll(".project-carousel-card").length;

  function updateCarousel() {
    if (isAnimating) return;
    isAnimating = true;

    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });

    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }

  function nextSlide() {
    if (isAnimating) return;
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
  }

  function prevSlide() {
    if (isAnimating) return;
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
  }

  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    currentIndex = index;
    updateCarousel();
  }

  rightArrow.addEventListener("click", nextSlide);
  leftArrow.addEventListener("click", prevSlide);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  let touchStartX = 0;
  let touchEndX = 0;
  let isSwiping = false;

  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!isSwiping) return;
      touchEndX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      if (!isSwiping) return;
      handleSwipe();
      isSwiping = false;
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 75;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
}

// Initialize comic carousel when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initComicCarousel);
} else {
  initComicCarousel();
}

// ==========================================================================
// EDITORIAL CAROUSEL
// This section manages the carousel for editorial illustration projects.
// HOW IT WORKS:
// - Tracks which editorial card is currently shown (currentIndex)
// - Handles left/right arrow and indicator clicks to change cards
// - Updates indicator dots to show the active editorial project
// - Adds touch/swipe support for mobile users
// - Uses CSS transforms for smooth slide transitions
// - Prevents multiple transitions at once with an animation lock
// ==========================================================================

function initEditorialCarousel() {
  const track = document.querySelector(".carousel-track-editorial");
  const leftArrow = document.querySelector(".carousel-arrow-left-editorial");
  const rightArrow = document.querySelector(".carousel-arrow-right-editorial");
  const indicators = document.querySelectorAll(".indicator-editorial");

  if (!track || !leftArrow || !rightArrow) return;

  let currentIndex = 0;
  let isAnimating = false;
  const totalCards = track.querySelectorAll(".project-carousel-card").length;

  function updateCarousel() {
    if (isAnimating) return;
    isAnimating = true;

    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });

    setTimeout(() => {
      isAnimating = false;
    }, 400);
  }

  function nextSlide() {
    if (isAnimating) return;
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
  }

  function prevSlide() {
    if (isAnimating) return;
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
  }

  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    currentIndex = index;
    updateCarousel();
  }

  rightArrow.addEventListener("click", nextSlide);
  leftArrow.addEventListener("click", prevSlide);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => goToSlide(index));
  });

  let touchStartX = 0;
  let touchEndX = 0;
  let isSwiping = false;

  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!isSwiping) return;
      touchEndX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      if (!isSwiping) return;
      handleSwipe();
      isSwiping = false;
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 75;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
}

// Initialize editorial carousel when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEditorialCarousel);
} else {
  initEditorialCarousel();
}
