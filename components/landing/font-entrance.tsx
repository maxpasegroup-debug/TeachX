"use client";

import { useEffect } from "react";

const MAIN_SELECTOR = [
  "main h1:not(.tx-in)",
  "main h2:not(.tx-in)",
  "main h3",
  "main p:not(.tx-in)",
  "main li",
  "main summary",
  "main .tx-world-more",
  "main .tx-final-btn",
  "main .tx-float",
  "main a.tx-pill",
  "main a.tx-ghost",
  "main a.tx-public-pill",
  "main a.tx-public-ghost",
  "main a.tx-public-final-btn",
  "main .tx-role > span",
].join(",");

const HEADER_SELECTOR = ".tx-public-header .tx-nav-link, .tx-public-header .tx-public-pill, .tx-public-header .tx-public-ghost";

export function FontEntrance() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";
    const mainNodes = [...document.querySelectorAll<HTMLElement>(MAIN_SELECTOR)].filter((el) => !el.closest(".tx-in, .tx-public-footer"));
    const headerNodes = [...document.querySelectorAll<HTMLElement>(HEADER_SELECTOR)];

    if (reduce) {
      [...mainNodes, ...headerNodes].forEach((el) => el.classList.add("is-in"));
      return;
    }

    let batch: HTMLElement[] = [];
    let timer = 0;
    let observer: IntersectionObserver | null = null;
    let watch: MutationObserver | null = null;

    const flush = () => {
      const group = batch;
      batch = [];
      group.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index, 10) * 0.07}s`;
        el.classList.add("is-in");
      });
    };

    const queue = (el: HTMLElement) => {
      if (el.classList.contains("is-in") || batch.includes(el)) return;
      batch.push(el);
      window.clearTimeout(timer);
      timer = window.setTimeout(flush, 40);
    };

    const start = () => {
      headerNodes.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.045}s`;
        el.classList.add("is-in");
      });
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          queue(entry.target as HTMLElement);
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
      mainNodes.forEach((node) => observer?.observe(node));
    };

    if (document.documentElement.dataset.hero === "ready") start();
    else {
      watch = new MutationObserver(() => {
        if (document.documentElement.dataset.hero !== "ready") return;
        watch?.disconnect();
        start();
      });
      watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-hero"] });
    }

    return () => {
      observer?.disconnect();
      watch?.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
