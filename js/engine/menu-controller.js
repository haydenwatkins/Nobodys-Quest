/* ============================================================
   MENU CONTROLLER — deterministic console navigation for DOM menus.

   Touch and pointer listeners remain native. A connected controller gets
   stable focus identity, beam-based directional movement, axis-aware analog
   scrolling, and explicit shoulder paging. Rebuilding a menu never guesses
   where focus used to be from its old numerical position.
   ============================================================ */

"use strict";

G.menuController = (() => {
  const DEFAULT_SELECTOR = "button:not(:disabled):not([data-controller-skip]), select:not(:disabled):not([data-controller-skip]), input:not(:disabled):not([data-controller-skip]), [tabindex]:not([tabindex='-1']):not([data-controller-skip])";
  const SCROLL_SPEED = 620;
  const KEY_FIELDS = [
    "navId", "tab", "menuSection", "menuRoute", "act", "formlabView", "rosterView", "formSelect",
    "loadoutSlot", "abilityDamage", "abilityStyle", "abilitySelect", "skinPreview", "atlasView", "mapNode",
    "pin", "become", "costume", "townProject", "travelRegion", "worldwakeRegion", "travelLandmark",
    "expeditionRoute", "expeditionDraft", "formEchoGuide", "legendGuide", "masteryForm", "saveSlot", "titleSettings",
  ];
  let focused = null;
  let lastTime = 0;

  function visible(element) {
    if (!element || element.hidden || element.disabled || element.getAttribute && element.getAttribute("aria-hidden") === "true") return false;
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

  function focusKey(element) {
    if (!element) return "";
    if (element.id) return `id:${element.id}`;
    const dataset = element.dataset || {};
    for (const field of KEY_FIELDS) if (dataset[field] !== undefined) return `${field}:${dataset[field]}`;
    const name = element.getAttribute && (element.getAttribute("name") || element.getAttribute("aria-label"));
    return name ? `name:${name}` : "";
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

  function snapshot(root, choices) {
    const list = elements(root, choices);
    const active = current(root, list);
    return { key: focusKey(active), index: active ? list.indexOf(active) : -1 };
  }

  function restore(root, memory, preferred, choices) {
    const list = elements(root, choices);
    if (!list.length) return false;
    let target = memory && memory.key ? list.find((element) => focusKey(element) === memory.key) : null;
    if (!target && memory && memory.index >= 0) target = list[Math.min(memory.index, list.length - 1)];
    return setFocus(root, target || (visible(preferred) && list.includes(preferred) ? preferred : list[0]));
  }

  function overlap(a0, a1, b0, b1) {
    return Math.min(a1, b1) - Math.max(a0, b0);
  }

  function box(rect) {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right === undefined ? rect.left + rect.width : rect.right,
      bottom: rect.bottom === undefined ? rect.top + rect.height : rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  function move(root, dx, dy, choices) {
    const list = elements(root, choices);
    if (!list.length) return false;
    const active = current(root, list);
    if (!active) return setFocus(root, list[0]);
    const from = box(active.getBoundingClientRect());
    const fx = from.left + from.width / 2;
    const fy = from.top + from.height / 2;
    let best = null;
    let bestScore = Infinity;
    const zone = dx && active.dataset && active.dataset.navZone;
    const candidates = zone ? list.filter((element) => element.dataset && element.dataset.navZone === zone) : list;
    for (const element of candidates) {
      if (element === active) continue;
      const rect = box(element.getBoundingClientRect());
      const ex = rect.left + rect.width / 2;
      const ey = rect.top + rect.height / 2;
      const centerAlong = dx ? (ex - fx) * dx : (ey - fy) * dy;
      if (centerAlong <= 2) continue;
      const primaryGap = dx > 0 ? rect.left - from.right : dx < 0 ? from.left - rect.right
        : dy > 0 ? rect.top - from.bottom : from.top - rect.bottom;
      const beamOverlap = dx ? overlap(from.top, from.bottom, rect.top, rect.bottom)
        : overlap(from.left, from.right, rect.left, rect.right);
      const across = dx ? Math.abs(ey - fy) : Math.abs(ex - fx);
      // Android/console-style focus search: stay inside the current visual row
      // or column whenever possible, then choose the smallest forward gap.
      const score = (beamOverlap >= -2 ? 0 : 10000) + Math.max(0, primaryGap) * 12 + across * 2 + centerAlong;
      if (score < bestScore) { best = element; bestScore = score; }
    }
    // No global wrap. Jumping from the bottom of a long page to a tab at the
    // top is much worse on a television than simply stopping at the edge.
    return best ? setFocus(root, best) : false;
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

  function canScroll(node, axis) {
    return axis === "x" ? (node.scrollWidth || 0) > (node.clientWidth || 0) + 2
      : (node.scrollHeight || 0) > (node.clientHeight || 0) + 2;
  }

  function scrollTarget(root, vector) {
    const axis = Math.abs(vector.x) > Math.abs(vector.y) ? "x" : "y";
    let node = focused && contains(root, focused) ? focused : root;
    while (node && contains(root, node)) {
      if (canScroll(node, axis)) return node;
      if (node === root) break;
      node = node.parentElement;
    }
    return canScroll(root, axis) ? root : null;
  }

  function analogScroll(root, dt) {
    const vector = G.input.menuScroll;
    if (!vector || Math.abs(vector.x) < 0.06 && Math.abs(vector.y) < 0.06) return false;
    const target = scrollTarget(root, vector);
    if (!target) return false;
    if (Math.abs(vector.x) > Math.abs(vector.y)) target.scrollLeft = (target.scrollLeft || 0) + vector.x * SCROLL_SPEED * dt;
    else target.scrollTop = (target.scrollTop || 0) + vector.y * SCROLL_SPEED * dt;
    return true;
  }

  function update(root, options, dt) {
    if (!root || !G.input.hasGamepad) {
      if (root && root.classList) root.classList.remove("controller-active");
      return false;
    }
    const opts = options || {};
    const choices = opts.elements;
    if (root.classList) root.classList.add("controller-active");
    const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const frameDt = Math.min(.05, Math.max(0, dt || (lastTime ? (now - lastTime) / 1000 : .016)));
    lastTime = now;
    if (!current(root, choices) && opts.autoFocus !== false) focusDefault(root, opts.preferred, choices);
    analogScroll(opts.scrollRoot || root, frameDt);

    if (G.input.tapped("back")) { if (opts.onBack) opts.onBack(); return true; }
    if (G.input.tapped("pageLeft")) {
      if (opts.onPageLeft) opts.onPageLeft(); else move(root, -1, 0, choices);
      return true;
    }
    if (G.input.tapped("pageRight")) {
      if (opts.onPageRight) opts.onPageRight(); else move(root, 1, 0, choices);
      return true;
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
    if (root && root.classList) root.classList.remove("controller-active");
    lastTime = 0;
  }

  return { elements, current, focusKey, snapshot, restore, setFocus, focusDefault, move, update, reset };
})();
