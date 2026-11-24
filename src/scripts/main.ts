const root = document.documentElement;
const body = document.body;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Theme preference: explicit light/dark or follow the operating system.
const themeToggle = document.querySelector<HTMLButtonElement>(".theme-toggle");
const themeOptions = document.querySelector<HTMLElement>(".theme-options");
const themeLoader = document.querySelector<HTMLElement>(".theme-loader");
const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const themeNames = { light: "LIGHT", dark: "DARK", system: "SYSTEM" } as const;
type ThemeMode = keyof typeof themeNames;
const readThemeMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem("pospolite-theme");
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  } catch { return "system"; }
};
let themeMode: ThemeMode = readThemeMode();
let themeTransitioning = false;
const resolvedTheme = (mode: ThemeMode): "light" | "dark" =>
  mode === "system" ? (systemTheme.matches ? "dark" : "light") : mode;
const paintTheme = (mode: ThemeMode): void => {
  const resolved = resolvedTheme(mode);
  root.dataset.themeMode = mode;
  root.dataset.theme = resolved;
  themeMeta?.setAttribute("content", resolved === "dark" ? "#101110" : "#f3f3ef");
  themeToggle?.querySelector<HTMLElement>(".theme-toggle-label")?.replaceChildren(mode.toUpperCase());
  const icon = themeToggle?.querySelector<HTMLElement>(".theme-toggle-icon");
  if (icon) icon.textContent = resolved === "dark" ? "◑" : "◐";
  themeOptions?.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === mode));
  });
};
paintTheme(themeMode);
const closeThemeOptions = (): void => {
  themeOptions?.setAttribute("hidden", "");
  themeToggle?.setAttribute("aria-expanded", "false");
};
const applyTheme = (nextMode: ThemeMode, animate = true): void => {
  if (themeTransitioning || (nextMode === themeMode && root.dataset.theme === resolvedTheme(nextMode))) return;
  themeMode = nextMode;
  try { localStorage.setItem("pospolite-theme", themeMode); } catch { /* Storage may be unavailable. */ }
  closeThemeOptions();
  if (!animate || reduceMotion || !themeLoader) { paintTheme(themeMode); requestProgressUpdate(); return; }
  themeTransitioning = true;
  const caption = themeLoader.querySelector<HTMLElement>(".theme-loader-caption");
  const track = themeLoader.querySelector<HTMLElement>(".loader-track");
  const trackFill = themeLoader.querySelector<HTMLElement>(".loader-track span");
  const previous = root.dataset.theme === "dark"
    ? { paper: "#101110", ink: "#f1f1eb", line: "#353731" }
    : { paper: "#f3f3ef", ink: "#111111", line: "#d4d4ce" };
  themeLoader.style.backgroundColor = previous.paper;
  themeLoader.style.color = previous.ink;
  if (track) track.style.backgroundColor = previous.line;
  if (trackFill) trackFill.style.backgroundColor = previous.ink;
  if (caption) caption.textContent = "RECONFIGURING INTERFACE";
  themeLoader.classList.add("is-active");
  window.setTimeout(() => {
    paintTheme(themeMode);
    requestProgressUpdate();
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
  if (themeToggle.getAttribute("aria-expanded") === "true") closeThemeOptions();
  else { themeOptions?.removeAttribute("hidden"); themeToggle.setAttribute("aria-expanded", "true"); }
});
themeOptions?.querySelectorAll<HTMLButtonElement>("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.themeChoice;
    if (choice === "light" || choice === "dark" || choice === "system") applyTheme(choice);
  });
});
document.addEventListener("pointerdown", (event: PointerEvent) => {
  if (!(event.target instanceof Element) || !event.target.closest(".theme-control")) closeThemeOptions();
});
document.addEventListener("keydown", (event: KeyboardEvent) => { if (event.key === "Escape") closeThemeOptions(); });
systemTheme.addEventListener("change", () => { if (themeMode === "system") applyTheme("system", false); });

// Loader: deliberate minimum display time with a safety timeout.
const loader = document.querySelector<HTMLElement>(".intro-loader");
const loaderStarted = performance.now();
const finishLoader = (): void => window.setTimeout(() => loader?.classList.add("is-finished"), Math.max(0, 2400 - (performance.now() - loaderStarted)));
if (reduceMotion) loader?.classList.add("is-finished");
else if (document.readyState === "complete") finishLoader();
else {
  window.addEventListener("load", finishLoader, { once: true });
  window.setTimeout(() => loader?.classList.add("is-finished"), 4500);
}

// Reveal sections as they enter and leave the viewport.
const revealTargets = document.querySelectorAll<HTMLElement>(".intro-content, .section-heading, .category-card, .product-card, .manifesto-inner, .about-grid, .contact-strip");
if (reduceMotion || !("IntersectionObserver" in window)) revealTargets.forEach((item) => item.classList.add("is-visible"));
else {
  body.classList.add("motion-ready");
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)), { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  revealTargets.forEach((item) => { item.classList.add("reveal-target"); observer.observe(item); });
}

// Scroll progress and contrast adaptation.
const progress = document.querySelector<HTMLElement>(".scroll-progress");
let scrollTicking = false;
const getSurfaceColor = (): "light" | "dark" => {
  for (const element of document.elementsFromPoint(Math.round(window.innerWidth / 2), 3)) {
    if (element === progress || element.closest(".scroll-progress")) continue;
    const match = getComputedStyle(element).backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) continue;
    const [r, g, b] = match.slice(1).map(Number);
    if (r === 0 && g === 0 && b === 0) continue;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.48 ? "light" : "dark";
  }
  return "dark";
};
const updateProgress = (): void => {
  const maxScroll = root.scrollHeight - window.innerHeight;
  const amount = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progress?.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, amount))));
  progress?.classList.toggle("on-dark", getSurfaceColor() === "light");
  scrollTicking = false;
};
function requestProgressUpdate(): void {
  if (!scrollTicking) { scrollTicking = true; window.requestAnimationFrame(updateProgress); }
}
window.addEventListener("scroll", requestProgressUpdate, { passive: true });
window.addEventListener("resize", requestProgressUpdate, { passive: true });
updateProgress();

if (!reduceMotion && finePointer) {
  document.querySelectorAll<HTMLElement>(".magnetic").forEach((element) => {
    let rect: DOMRect | undefined;
    element.addEventListener("pointerenter", () => { rect = element.getBoundingClientRect(); });
    element.addEventListener("pointermove", (event: PointerEvent) => {
      rect ??= element.getBoundingClientRect();
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;
      element.style.setProperty("--mag-x", (dx * 0.1).toFixed(1) + "px");
      element.style.setProperty("--mag-y", (dy * 0.12).toFixed(1) + "px");
    });
    element.addEventListener("pointerleave", () => {
      rect = undefined;
      element.style.setProperty("--mag-x", "0px");
      element.style.setProperty("--mag-y", "0px");
    });
  });
  const cursor = document.querySelector<HTMLElement>(".custom-cursor");
  const cursorDot = document.querySelector<HTMLElement>(".custom-cursor-dot");
  if (cursor && cursorDot) {
    body.classList.add("cursor-ready");
    let x = -100, y = -100, frame = 0;
    const paintCursor = (): void => {
      const position = `translate3d(${x}px, ${y}px, 0)`;
      cursor.style.transform = position + " translate(-50%, -50%)";
      cursorDot.style.transform = position + " translate(-50%, -50%)";
      frame = 0;
    };
    window.addEventListener("pointermove", (event: PointerEvent) => {
      x = event.clientX; y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paintCursor);
    }, { passive: true });
    document.querySelectorAll<HTMLElement>("a, button, [role='button']").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
      element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
    });
  }
}

// Accessible mobile navigation.
const siteHeader = document.querySelector<HTMLElement>(".site-header");
const menuToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const primaryNavigation = document.querySelector<HTMLElement>("#primary-navigation");
if (siteHeader && menuToggle && primaryNavigation) {
  const closeMenu = (): void => {
    siteHeader.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
  };
  menuToggle.addEventListener("click", () => {
    const open = siteHeader.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });
  primaryNavigation.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event: KeyboardEvent) => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("pointerdown", (event: PointerEvent) => {
    if (event.target instanceof Node && !siteHeader.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMenu(); }, { passive: true });
}

// Hero index follows the section currently in view.
const indexLinks = [...document.querySelectorAll<HTMLAnchorElement>("[data-section-link]")];
const indexSections = indexLinks.map((link) => document.getElementById(link.dataset.sectionLink ?? "")).filter((section): section is HTMLElement => section instanceof HTMLElement);
if (indexLinks.length && indexSections.length && "IntersectionObserver" in window) {
  const setActiveIndex = (activeId: string): void => indexLinks.forEach((link) => {
    const active = link.dataset.sectionLink === activeId;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const indexObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) setActiveIndex(visible[0].target.id);
  }, { rootMargin: "-24% 0px -52% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75] });
  indexSections.forEach((section) => indexObserver.observe(section));
  indexLinks.forEach((link) => link.addEventListener("click", () => setActiveIndex(link.dataset.sectionLink ?? "")));
}
document.addEventListener("visibilitychange", () => body.classList.toggle("page-hidden", document.hidden));
