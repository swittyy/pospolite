(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Theme preference: explicit light/dark or follow the operating system.
  const themeToggle = document.querySelector(".theme-toggle");
  const themeOptions = document.querySelector(".theme-options");
  const themeLoader = document.querySelector(".theme-loader");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const themeNames = { light: "LIGHT", dark: "DARK", system: "SYSTEM" };
  const readThemeMode = () => {
    try {
      const saved = localStorage.getItem("pospolite-theme");
      return ["light", "dark", "system"].includes(saved) ? saved : "system";
    } catch { return "system"; }
  };
  let themeMode = readThemeMode();
  let themeTransitioning = false;
  const resolvedTheme = (mode) => mode === "system" ? (systemTheme.matches ? "dark" : "light") : mode;
  const paintTheme = (mode) => {
    const resolved = resolvedTheme(mode);
    root.dataset.themeMode = mode;
    root.dataset.theme = resolved;
    if (themeMeta) themeMeta.setAttribute("content", resolved === "dark" ? "#101110" : "#f3f3ef");
    if (themeToggle) {
      themeToggle.querySelector(".theme-toggle-label").textContent = themeNames[mode];
      themeToggle.querySelector(".theme-toggle-icon").textContent = resolved === "dark" ? "◑" : "◐";
    }
    themeOptions?.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === mode));
    });
  };
  paintTheme(themeMode);
  const closeThemeOptions = () => {
    themeOptions?.setAttribute("hidden", "");
    themeToggle?.setAttribute("aria-expanded", "false");
  };
  const applyTheme = (nextMode, animate = true) => {
    if (!["light", "dark", "system"].includes(nextMode) || themeTransitioning) return;
    if (nextMode === themeMode && root.dataset.theme === resolvedTheme(nextMode)) return;
    themeMode = nextMode;
    try { localStorage.setItem("pospolite-theme", themeMode); } catch { /* Storage may be unavailable. */ }
    closeThemeOptions();
    if (!animate || reduceMotion || !themeLoader) {
      paintTheme(themeMode);
      requestProgressUpdate();
      return;
    }
    themeTransitioning = true;
    const caption = themeLoader.querySelector(".theme-loader-caption");
    const track = themeLoader.querySelector(".loader-track");
    const trackFill = themeLoader.querySelector(".loader-track span");
    const previousTheme = root.dataset.theme;
    const previousColors = previousTheme === "dark"
      ? { paper: "#101110", ink: "#f1f1eb", line: "#353731" }
      : { paper: "#f3f3ef", ink: "#111111", line: "#d4d4ce" };

    // Freeze the loader in the outgoing palette while the page changes underneath it.
    themeLoader.style.backgroundColor = previousColors.paper;
    themeLoader.style.color = previousColors.ink;
    if (track) track.style.backgroundColor = previousColors.line;
    if (trackFill) trackFill.style.backgroundColor = previousColors.ink;
    if (caption) caption.textContent = "RECONFIGURING INTERFACE";
    themeLoader.classList.add("is-active");

    window.setTimeout(() => {
      paintTheme(themeMode);
      requestProgressUpdate();

      // Let the new theme settle completely before revealing the page.
      window.setTimeout(() => {
        themeLoader.classList.remove("is-active");
        window.setTimeout(() => {
          themeLoader.style.backgroundColor = "";
          themeLoader.style.color = "";
          if (track) track.style.backgroundColor = "";
          if (trackFill) trackFill.style.backgroundColor = "";
          themeTransitioning = false;
          if (caption) caption.textContent = "SWITCHING INTERFACE";
        }, 320);
      }, 400);
    }, 1500);
  };
  themeToggle?.addEventListener("click", () => {
    const isOpen = themeToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeThemeOptions();
    else {
      themeOptions?.removeAttribute("hidden");
      themeToggle.setAttribute("aria-expanded", "true");
    }
  });
  themeOptions?.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest?.(".theme-control")) closeThemeOptions();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeThemeOptions();
  });
  const onSystemThemeChange = () => {
    if (themeMode === "system") applyTheme("system");
  };
  systemTheme.addEventListener?.("change", onSystemThemeChange);


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