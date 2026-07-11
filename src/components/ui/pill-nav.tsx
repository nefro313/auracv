"use client";

import React, { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { gsap } from "gsap";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo?: string;
  logoAlt?: string;
  /** Initials shown when no logo image is available. */
  logoText?: string;
  items: PillNavItem[];
  /** Trailing accent pill (e.g. a résumé link). External URLs open in a new
      tab; internal paths navigate in-app so loading states stream instantly. */
  cta?: { label: string; href: string };
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
}

const isExternalLink = (href: string) =>
  href.startsWith("http://") ||
  href.startsWith("https://") ||
  href.startsWith("//") ||
  href.startsWith("mailto:") ||
  href.startsWith("tel:") ||
  href.startsWith("#");

const isRouterLink = (href?: string) => !!href && !isExternalLink(href);

/* Atelier Paper defaults: ink track, parchment pills, parchment hover text. */
const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = "Logo",
  logoText = "•",
  items,
  cta,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#211B12",
  pillColor = "#FCFAF5",
  hoveredPillTextColor = "#FCFAF5",
  pillTextColor,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? "#211B12";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    activeHref ?? items[0]?.href
  );

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | HTMLElement | null>(null);

  /* GSAP: the expanding-circle hover effect on each pill. */
  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0
        );

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, { scale: 1, duration: 0.6, ease });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, { width: "auto", duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  /* Scroll-spy: light up the pill for whichever section is in view. */
  useEffect(() => {
    const sections = items
      .filter((i) => i.href.startsWith("#"))
      .map((i) => document.getElementById(i.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(`#${visible[0].target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: "top center",
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: "top center",
          onComplete: () => gsap.set(menu, { visibility: "hidden" }),
        });
      }
    }
  };

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
    ["--nav-h"]: "46px",
    ["--logo"]: "38px",
    ["--pill-pad-x"]: "18px",
    ["--pill-gap"]: "4px",
  } as React.CSSProperties;

  // Only external cta URLs (an uploaded resume PDF) leave the site in a new
  // tab; internal paths like /resume use client-side navigation.
  const ctaIsExternal = !!cta && /^https?:\/\//i.test(cta.href);

  const logoHref = items?.[0]?.href || "#";

  const LogoInner = logo ? (
    <img
      src={logo}
      alt={logoAlt}
      ref={logoImgRef}
      className="h-full w-full object-cover"
    />
  ) : (
    <span
      className="font-fraunces text-sm font-semibold"
      style={{ color: "var(--pill-bg)" }}
    >
      {logoText}
    </span>
  );

  const logoClasses =
    "inline-flex items-center justify-center overflow-hidden rounded-full ring-2 ring-white/70 shadow-[0_8px_24px_-10px_rgba(33,27,18,0.7)]";
  const logoStyle: React.CSSProperties = {
    width: "var(--nav-h)",
    height: "var(--nav-h)",
    background: "var(--base)",
  };

  return (
    <div className="fixed left-1/2 top-4 z-[1000] flex w-[calc(100%-1.5rem)] -translate-x-1/2 justify-center md:w-auto">
      <nav
        className={`flex w-full items-center justify-between gap-2 md:w-max md:justify-start ${className}`}
        aria-label="Primary"
        style={cssVars}
      >
        {/* Logo */}
        {isRouterLink(logoHref) ? (
          <NextLink
            href={logoHref}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={(el) => {
              logoRef.current = el;
            }}
            className={logoClasses}
            style={logoStyle}
          >
            {LogoInner}
          </NextLink>
        ) : (
          <a
            href={logoHref}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={(el) => {
              logoRef.current = el;
            }}
            className={logoClasses}
            style={logoStyle}
          >
            {LogoInner}
          </a>
        )}

        {/* Desktop pill group */}
        <div
          ref={navItemsRef}
          className="relative hidden items-center rounded-full md:flex"
          style={{ height: "var(--nav-h)", background: "var(--base)" }}
        >
          <ul
            role="menubar"
            className="m-0 flex h-full list-none items-stretch p-[4px]"
            style={{ gap: "var(--pill-gap)" }}
          >
            {items.map((item, i) => {
              const isActive = activeSection === item.href;

              /* Active section reads as a filled ink pill with light text. */
              const pillStyle: React.CSSProperties = {
                background: isActive ? "var(--base)" : "var(--pill-bg)",
                color: isActive ? "var(--hover-text)" : "var(--pill-text)",
                paddingLeft: "var(--pill-pad-x)",
                paddingRight: "var(--pill-pad-x)",
              };

              const PillContent = (
                <>
                  <span
                    className="hover-circle pointer-events-none absolute bottom-0 left-1/2 z-[1] block rounded-full"
                    style={{
                      background: "var(--base)",
                      willChange: "transform",
                      transform: "scale(0)",
                    }}
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative z-[2] inline-flex items-center leading-none">
                    <span
                      className="pill-label relative z-[2] inline-block leading-none"
                      style={{ willChange: "transform" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block leading-none"
                      style={{
                        color: "var(--hover-text)",
                        willChange: "transform, opacity",
                        opacity: 0,
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                </>
              );

              const basePillClasses =
                "relative box-border inline-flex h-full cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-0 font-outfit text-[13px] font-semibold uppercase leading-none tracking-[0.08em] no-underline";

              return (
                <li key={item.href} role="none" className="flex h-full">
                  {isRouterLink(item.href) ? (
                    <NextLink
                      role="menuitem"
                      href={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </NextLink>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={basePillClasses}
                      style={pillStyle}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Résumé CTA — aura accent pill (desktop) */}
        {cta && (
          <NextLink
            href={cta.href}
            target={ctaIsExternal ? "_blank" : undefined}
            rel={ctaIsExternal ? "noopener noreferrer" : undefined}
            className="hidden items-center gap-2 rounded-full px-5 font-outfit text-[13px] font-semibold uppercase tracking-[0.08em] text-parchment-50 shadow-[0_8px_24px_-10px_rgba(139,92,246,0.8)] transition-transform duration-300 hover:-translate-y-0.5 md:inline-flex"
            style={{
              height: "var(--nav-h)",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            }}
          >
            {cta.label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </NextLink>
        )}

        {/* Hamburger (mobile) */}
        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full border border-white/50 bg-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-md md:hidden"
          style={{
            width: "var(--nav-h)",
            height: "var(--nav-h)",
          }}
        >
          <span
            className="hamburger-line h-0.5 w-4 origin-center rounded"
            style={{ background: "var(--base)" }}
          />
          <span
            className="hamburger-line h-0.5 w-4 origin-center rounded"
            style={{ background: "var(--base)" }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        className="absolute left-0 right-0 top-[3.8em] origin-top rounded-[27px] border border-white/40 shadow-[0_18px_50px_-20px_rgba(33,27,18,0.45),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
        // Hidden from the first paint so the menu never flashes open on
        // reload (GSAP hides it in an effect, which only runs after paint —
        // this closes that gap). GSAP then owns visibility/opacity on toggle.
        style={{
          ...cssVars,
          background: "rgba(252, 250, 245, 0.6)",
          visibility: "hidden",
          opacity: 0,
        }}
      >
        <ul className="m-0 flex list-none flex-col gap-[4px] p-[4px]">
          {items.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-[50px] px-4 py-3 font-outfit text-[15px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200"
                  style={{
                    background: isActive ? "var(--base)" : "transparent",
                    color: isActive ? "var(--hover-text)" : "var(--pill-text)",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
          {cta && (
            <li>
              <NextLink
                href={cta.href}
                target={ctaIsExternal ? "_blank" : undefined}
                rel={ctaIsExternal ? "noopener noreferrer" : undefined}
                className="block rounded-[50px] px-4 py-3 text-center font-outfit text-[15px] font-semibold uppercase tracking-[0.06em] text-parchment-50"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cta.label}
              </NextLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
