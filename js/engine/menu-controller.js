/* ============================================================
   MENU CONTROLLER — one focus/scroll system for every DOM menu.

   Touch and pointer listeners stay on the real buttons. This layer only
   translates the abstract actions produced by input.js into console-style
   focus, activation, and scrolling while a gamepad is connected.
   ============================================================ */

"use strict";

G.menuController = (() => {
  const DEFAULT_SELECTOR = "button:not(:disabled), select:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex='-1'])";
  const SCROLL_SPEED = 760;
  let focused = null;
  let lastTime = 0;

  function visible(element) {
    if (!element || element.hidden || element.disabled) return false;
    const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
    return !rect || rect.width > 0 && rect.height > 0;
  }

  function elements(root, supplied) {
    const list = typeof supplied === "function" ? supplied()
      : supplied ? Array.from(supplied)
      : Array.from(root.querySelectorAll(DEFAULT_SELECTOR));
    return list.filter(visible);
  }

  function contains(root, element) {
    if (!root || !element) return false;
    return root === element || !root.contains || root.contains(element);
  }

  function setFocus(root, element) {
    if (!visible(element) || !contains(root, element)) return false;
    if (focused && focused !== element && focused.classList) focused.classList.remove("controller-focus");
    focused = element;
    if (focused.classList) focused.classList.add("controller-focus");
    if (focused.focus) {
      try { focused.focus({ preventScroll: true }); } catch (error) { focused.focus(); }
    }
    if (focused.scrollIntoView) focused.scrollIntoView({ block: "nearest", inline: "nearest" });
    return true;
  }

  function current(root, choices) {
    const list = elements(root, choices);
    if (focused && list.includes(focused)) return focused;
    if (typeof document !== "undefined" && list.includes(document.activeElement)) {
      setFocus(root, document.activeElement);
      return focused;
    }
    return null;
  }

  function focusDefault(root, preferred, choices) {
    const list = elements(root, choices);
    const target = visible(preferred) && list.includes(preferred) ? preferred : list[0];
    return setFocus(root, target);
  }

  function move(root, dx, dy, choices) {
    const list = elements(root, choices);
    if (!list.length) return false;
    const active = current(root, list);
    if (!active) return setFocus(root, list[0]);
    const from = active.getBoundingClientRect();
    const fx = from.left + from.width / 2;
    const fy = from.top + from.height / 2;
    let best = null;
    let bestScore = Infinity;
    for (const element of list) {
      if (element === active) continue;
      const rect = element.getBoundingClientRect();
      const ex = rect.left + rect.width / 2;
      const ey = rect.top + rect.height / 2;
      const along = dx ? (ex - fx) * dx : (ey - fy) * dy;
      if (along <= 2) continue;
      const across = dx ? Math.abs(ey - fy) : Math.abs(ex - fx);
      const score = along * 3 + across + Math.max(0, across - along * 1.5) * 4;
      if (score < bestScore) { best = element; bestScore = score; }
    }
    // At an edge, wrap to the opposite side while favoring the same row or
    // column. This prevents focus from becoming trapped on TV.
    if (!best) {
      best = list.reduce((choice, element) => {
        if (element === active) return choice;
        const rect = element.getBoundingClientRect();
        const ex = rect.left + rect.width / 2;
        const ey = rect.top + rect.height / 2;
        const edge = dx ? ex * dx : ey * dy;
        const across = dx ? Math.abs(ey - fy) : Math.abs(ex - fx);
        const score = edge + across * 2;
        return !choice || score < choice.score ? { element, score } : choice;
      }, null)?.element;
    }
    return setFocus(root, best);
  }

  function adjustField(root, direction, choices) {
    const element = current(root, choices);
    if (!element || element.tagName !== "SELECT") return false;
    const count = element.options && element.options.length || 0;
    if (!count) return true;
    element.selectedIndex = (element.selectedIndex + direction + count) % count;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function scrollTarget(root) {
    let node = focused;
    while (node && contains(root, node)) {
      if ((node.scrollHeight || 0) > (node.clientHeight || 0) + 2 ||
          (node.scrollWidth || 0) > (node.clientWidth || 0) + 2) return node;
      if (node === root) break;
      node = node.parentElement;
    }
    return root;
  }

  function analogScroll(root, dt) {
    const vector = G.input.menuScroll;
    if (!vector || Math.abs(vector.x) < 0.02 && Math.abs(vector.y) < 0.02) return false;
    const target = scrollTarget(root);
    if (!target) return false;
    target.scrollLeft = (target.scrollLeft || 0) + vector.x * SCROLL_SPEED * dt;
    target.scrollTop = (target.scrollTop || 0) + vector.y * SCROLL_SPEED * dt;
    return true;
  }

  function update(root, options, dt) {
    if (!root || !G.input.hasGamepad) return false;
    const opts = options || {};
    const choices = opts.elements;
    const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const frameDt = Math.min(.05, Math.max(0, dt || (lastTime ? (now - lastTime) / 1000 : .016)));
    lastTime = now;
    if (!current(root, choices) && opts.autoFocus !== false) focusDefault(root, opts.preferred, choices);
    analogScroll(opts.scrollRoot || root, frameDt);

    if (G.input.tapped("back")) { if (opts.onBack) opts.onBack(); return true; }
    if (G.input.tapped("pageLeft")) {
      if (opts.onPageLeft) opts.onPageLeft(); else move(root, -1, 0, choices);
    }
    if (G.input.tapped("pageRight")) {
      if (opts.onPageRight) opts.onPageRight(); else move(root, 1, 0, choices);
    }
    if (G.input.tapped("menuUp")) move(root, 0, -1, choices);
    if (G.input.tapped("menuDown")) move(root, 0, 1, choices);
    if (G.input.tapped("menuLeft") && !adjustField(root, -1, choices)) move(root, -1, 0, choices);
    if (G.input.tapped("menuRight") && !adjustField(root, 1, choices)) move(root, 1, 0, choices);
    if (G.input.tapped("confirm")) {
      const active = current(root, choices);
      if (!active) focusDefault(root, opts.preferred, choices);
      else if (!adjustField(root, 1, choices) && active.click) active.click();
    }
    return true;
  }

  function reset(root) {
    if (focused && (!root || contains(root, focused)) && focused.classList) focused.classList.remove("controller-focus");
    if (!root || contains(root, focused)) focused = null;
    lastTime = 0;
  }

  return { elements, current, setFocus, focusDefault, move, update, reset };
})();
