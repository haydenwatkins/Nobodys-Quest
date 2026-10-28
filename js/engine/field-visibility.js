/* Keep nearby engaged actors clear of the existing HUD and touch controls. */
"use strict";
(() => {
  function bounds(actor, player = false) {
    const def = player ? G.forms[G.state.formId] : actor.def;
    const m = G.spriteMetrics(def.sprite), scale = def.boss?.spriteScale || 1;
    const x = actor.x + (actor.hitKickX || 0), y = actor.y + (actor.hitKickY || 0);
    return { left: x - m.w * scale / 2 - 3, right: x + m.w * scale / 2 + 3,
      top: Math.min(y - m.h * scale - 3, player ? y : y - def.size - 16), bottom: y + 4 };
  }
  function union(a, b) {
    return { left: Math.min(a.left, b.left), right: Math.max(a.right, b.right),
      top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) };
  }
  G.fieldCamera = function () {
    const s = G.state, p = s.player;
    const normal = { x: G.util.clamp(p.x - G.W / 2, 0, Math.max(0, s.mapW * G.TILE - G.W)),
      y: G.util.clamp(p.y - G.H / 2 - 4, 0, Math.max(0, s.mapH * G.TILE - G.H)) };
    const boss = s.enemies.find(e => !e.dead && e.def.miniboss && e.bossEngaged);
    if (!boss) return normal;
    const safe = { left: 16, right: G.W - 16, top: 30, bottom: G.H - 18 };
    if (G.input.isTouch && !G.input.hasGamepad) {
      const game = document.getElementById('game').getBoundingClientRect();
      const controls = document.getElementById('btn-zone').getBoundingClientRect();
      if (game.width > 0 && controls.width > 0 && controls.top < game.top + game.height && controls.top + controls.height > game.top) {
        const left = (controls.left - game.left) * G.W / game.width;
        if (left > G.W / 2) safe.right = Math.min(safe.right, left - 8);
      }
    }
    let visible = bounds(p, true);
    for (const e of [boss, ...s.enemies.filter(e => G.guardianPropLive?.(e))]) {
      if (Math.hypot(e.x - p.x, e.y - p.y) > 112) continue;
      const next = union(visible, bounds(e));
      if (next.right - next.left <= safe.right - safe.left && next.bottom - next.top <= safe.bottom - safe.top) visible = next;
    }
    return { x: G.util.clamp(p.x - (safe.left + safe.right) / 2, visible.right - safe.right, visible.left - safe.left),
      y: G.util.clamp(p.y - (safe.top + safe.bottom) / 2 - G.spriteMetrics(G.forms[s.formId].sprite).h / 2,
        visible.bottom - safe.bottom, visible.top - safe.top) };
  };
})();
