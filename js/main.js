(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Loader stays for a deliberate minimum time, but never blocks a slow page forever.
  const loader = document.querySelector(".intro-loader");
  const loaderStarted = performance.now();
  let pageLoaded = document.readyState === "complete";
  const finishLoader = () => {
    const elapsed = performance.now() - loaderStarted;
    const wait = Math.max(0, 2400 - elapsed);
    window.setTimeout(() => loader?.classList.add("is-finished"), wait);
  };
  if (reduceMotion) {
    loader?.classList.add("is-finished");
  } else if (pageLoaded) {
    finishLoader();
  } else {
    window.addEventListener("load", () => {
      pageLoaded = true;
      finishLoader();
    }, { once: true });
    window.setTimeout(() => loader?.classList.add("is-finished"), 4500);
  }

  // Bidirectional section reveal. One observer handles every target.
  const revealTargets = document.querySelectorAll(
    ".intro-content, .section-heading, .category-card, .manifesto-inner, .about-grid, .contact-strip"
  );
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((item) => item.classList.add("is-visible"));
  } else {
    body.classList.add("motion-ready");
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
    revealTargets.forEach((item) => {
      item.classList.add("reveal-target");
      revealObserver.observe(item);
    });
  }

  // Scroll progress: update once per frame and switch contrast over dark surfaces.
  const progress = document.querySelector(".scroll-progress");
  let scrollTicking = false;
  const getSurfaceColor = () => {
    const candidates = document.elementsFromPoint(Math.round(window.innerWidth / 2), 3);
    for (const element of candidates) {
      if (element === progress || element.closest?.(".scroll-progress")) continue;
      const color = getComputedStyle(element).backgroundColor;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) continue;
      const [, r, g, b] = match.map(Number);
      if (r === 0 && g === 0 && b === 0) continue;
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return luminance < 0.48 ? "light" : "dark";
    }
    return "dark";
  };
  const updateProgress = () => {
    const maxScroll = root.scrollHeight - window.innerHeight;
    const amount = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress?.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, amount))));
    progress?.classList.toggle("on-dark", getSurfaceColor() === "light");
    scrollTicking = false;
  };
  const requestProgressUpdate = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateProgress);
    }
  };
  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate, { passive: true });
  updateProgress();

  if (!reduceMotion && finePointer) {
    // Magnetic buttons: small movement, no layout reads on every pointer event.
    document.querySelectorAll(".magnetic").forEach((element) => {
      let rect;
      element.addEventListener("pointerenter", () => { rect = element.getBoundingClientRect(); });
      element.addEventListener("pointermove", (event) => {
        if (!rect) rect = element.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        element.style.setProperty("--mag-x", (dx * 0.10).toFixed(1) + "px");
        element.style.setProperty("--mag-y", (dy * 0.12).toFixed(1) + "px");
      });
      element.addEventListener("pointerleave", () => {
        rect = null;
        element.style.setProperty("--mag-x", "0px");
        element.style.setProperty("--mag-y", "0px");
      });
    });

    // Custom cursor uses transforms instead of left/top layout updates.
    const cursor = document.querySelector(".custom-cursor");
    const cursorDot = document.querySelector(".custom-cursor-dot");
    if (cursor && cursorDot) {
      body.classList.add("cursor-ready");
      let pointerX = -100;
      let pointerY = -100;
      let cursorFrame = 0;
      const paintCursor = () => {
        const position = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
        cursor.style.transform = position + " translate(-50%, -50%)";
        cursorDot.style.transform = position + " translate(-50%, -50%)";
        cursorFrame = 0;
      };
      window.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!cursorFrame) cursorFrame = window.requestAnimationFrame(paintCursor);
      }, { passive: true });
      document.querySelectorAll("a, button, [role='button']").forEach((element) => {
        element.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
        element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
      });
    }
  }

  // Accessible mobile navigation: toggle, close on selection, Escape, or outside tap.
  const siteHeader = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNavigation = document.querySelector("#primary-navigation");
  if (siteHeader && menuToggle && primaryNavigation) {
    const closeMenu = () => {
      siteHeader.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Открыть меню");
    };
    menuToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    });
    primaryNavigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!siteHeader.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    }, { passive: true });
  }

  // Pause decorative infinite animations when the tab is not visible.
  document.addEventListener("visibilitychange", () => {
    body.classList.toggle("page-hidden", document.hidden);
  });
})();