/* ============================================================
   FORM ECHOES — a completed form challenge becomes a moment in
   the world, not a button in a menu.

   The next defeated enemy (or the treasure that completed the
   challenge) leaves the form behind as a persistent apparition.
   Nobody must step away, return, listen, and choose to carry it.
   ============================================================ */

"use strict";

(function () {
  const ECHO_COLOR = "#d9a7ff";
  const ARM_DISTANCE = 30;
  const MEET_DISTANCE = 18;

  function validEcho(raw) {
    if (!raw || !G.forms[raw.formId] || G.forms[raw.formId].invalid) return null;
    if (G.formUnlocked && G.formUnlocked(raw.formId)) return null;
    const mapId = G.maps && G.maps[raw.mapId] ? raw.mapId : null;
    const x = Number(raw.x), y = Number(raw.y);
    if (!mapId || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    return {
      formId: raw.formId,
      mapId,
      x,
      y,
      source: ["battle", "victory", "treasure", "legacy"].includes(raw.source) ? raw.source : "battle",
      needsLeave: raw.needsLeave !== false,
      interacting: false,
    };
  }

  G.normalizeFormEchoes = function (saved) {
    const claimed = new Set((G.state && G.state.claimedForms) || []);
    const seen = new Set();
    const result = [];
    for (const raw of Array.isArray(saved) ? saved : []) {
      const echo = validEcho(raw);
      if (!echo || claimed.has(echo.formId) || seen.has(echo.formId)) continue;
      seen.add(echo.formId);
      result.push(echo);
    }
    return result;
  };

  function echoes() {
    if (!Array.isArray(G.state.formEchoes)) G.state.formEchoes = [];
    return G.state.formEchoes;
  }

  G.formEchoFor = function (formId) {
    return echoes().find((echo) => echo.formId === formId) || null;
  };

  G.formEchoesHere = function () {
    if (!G.state) return [];
    return echoes().filter((echo) => echo.mapId === G.state.mapId);
  };

  G.currentFormEcho = function () {
    if (!G.state || !G.state.player) return null;
    const here = G.formEchoesHere();
    here.sort((a, b) => G.util.dist(G.state.player.x, G.state.player.y, a.x, a.y) -
      G.util.dist(G.state.player.x, G.state.player.y, b.x, b.y));
    return here[0] || null;
  };

  G.readyFormsWithoutEcho = function () {
    return (G.formOrder || []).filter((id) => G.formReady(id) && !G.formEchoFor(id));
  };

  function safePoint(x, y) {
    const p = G.state.player;
    const spots = [
      [x, y], [x + 16, y], [x - 16, y], [x, y + 16], [x, y - 16],
      [x + 16, y + 16], [x - 16, y + 16], [p.x + 24, p.y], [p.x - 24, p.y], [p.x, p.y + 24],
    ];
    for (const spot of spots) {
      if (!G.world || !G.world.isSafeSpawn || G.world.isSafeSpawn(spot[0], spot[1]))
        return { x: spot[0], y: spot[1] };
    }
    return { x: p.x, y: p.y };
  }

  G.leaveReadyFormEchoAt = function (x, y, source) {
    if (!G.state || !G.state.player || !G.state.mapId) return false;
    const formId = G.readyFormsWithoutEcho()[0];
    if (!formId) return false;
    const point = safePoint(Number(x) || G.state.player.x, Number(y) || G.state.player.y);
    const echo = {
      formId,
      mapId: G.state.mapId,
      x: point.x,
      y: point.y,
      source: source || "battle",
      needsLeave: G.util.dist(G.state.player.x, G.state.player.y, point.x, point.y) < ARM_DISTANCE,
      interacting: false,
    };
    echoes().push(echo);
    if (G.sfx && G.sfx.play) G.sfx.play("unlock");
    if (G.spawnFx) {
      G.spawnFx({ kind: "ring", x: echo.x, y: echo.y - 7, color: ECHO_COLOR, dur: 0.8 });
      G.spawnFx({ kind: "puff", x: echo.x, y: echo.y - 6, color: ECHO_COLOR, dur: 0.55 });
    }
    if (G.saveGame) G.saveGame();
    return echo;
  };

  G.seedLegacyFormEcho = function () {
    if (!G.state || echoes().length || !G.readyFormsWithoutEcho().length) return false;
    const p = G.state.player;
    return G.leaveReadyFormEchoAt(p.x + 28, p.y, "legacy");
  };

  G.formEchoDescription = function (form) {
    if (!form) return "This shape has not found its name yet.";
    const basic = G.abilities && G.abilities[form.basic];
    const damage = basic && G.DAMAGE_TYPES && G.DAMAGE_TYPES[basic.type];
    const pace = form.speed >= 100 ? "swift" : form.speed <= 70 ? "sturdy and deliberate" : "balanced";
    const style = basic && basic.style === "projectile" ? "ranged"
      : basic && basic.style === "dash" ? "mobile"
        : basic && basic.style === "area" ? "crowd-control"
          : basic && basic.style === "chain" ? "target-linking" : "close-range";
    const attack = basic ? `${basic.icon || ""} ${basic.name}`.trim() : "Its basic attack";
    return `${form.name} is a ${pace}, ${style} form. ${attack} deals ${damage ? `${damage.icon} ${damage.name}` : "direct"} damage. ` +
      `${form.passive.name}: ${form.passive.description}`;
  };

  function discoveryLine(echo, form) {
    if (echo.source === "treasure") return `The treasure is open, but ${form.name} was hidden deeper than the prize. Its shape is waiting for you.`;
    if (echo.source === "victory") return `${form.name} stands in the silence after the guardian. The victory left an answer behind.`;
    if (echo.source === "legacy") return `A lesson you finished long ago has finally taken shape. ${form.name} has been waiting to meet you.`;
    return `The enemy is gone. ${form.name} remains — not as a trophy, but as another way to face the world.`;
  }

  function completeEcho(echo) {
    if (!G.state || !echo) return;
    G.state.formEchoes = echoes().filter((entry) => entry !== echo && entry.formId !== echo.formId);
    G.claimForm(echo.formId, { worldEcho: true, x: echo.x, y: echo.y });
  }

  function beginEcho(echo) {
    if (!echo || echo.interacting) return;
    echo.interacting = true;
    const form = G.forms[echo.formId];
    if (!G.ui || !G.ui.dialogue) {
      completeEcho(echo);
      return;
    }
    G.sfx.play("unlock");
    G.state.hitStop = Math.max(G.state.hitStop || 0, 0.12);
    G.ui.dialogue("✦ FORM ECHO", discoveryLine(echo, form), { accent: ECHO_COLOR });
    G.ui.dialogue(`${form.icon} ${form.name.toUpperCase()}`, `${form.tagline} ${G.formEchoDescription(form)}`, { accent: ECHO_COLOR });
    G.ui.dialogue("◇ NOBODY", `I don't have to become ${form.name} forever. I only have to carry what it knows.`, {
      accent: "#f4f4f4",
      onClose: () => completeEcho(echo),
    });
  }

  G.updateFormEcho = function () {
    const echo = G.currentFormEcho();
    if (!echo || echo.interacting || !G.state.player || (G.ui && (G.ui.dialogueOpen || G.ui.menuOpen))) return;
    const distance = G.util.dist(G.state.player.x, G.state.player.y, echo.x, echo.y);
    if (echo.needsLeave) {
      if (distance >= ARM_DISTANCE) {
        echo.needsLeave = false;
        if (G.saveGame) G.saveGame();
      }
      return;
    }
    if (distance <= MEET_DISTANCE) beginEcho(echo);
  };

  G.guideToFormEcho = function (formId) {
    const echo = G.formEchoFor(formId);
    if (!echo) {
      const form = G.forms[formId];
      if (G.ui && G.ui.toast) G.ui.toast(`${form ? form.icon : "✦"} Win a battle and watch what it leaves behind.`, 3.2);
      return false;
    }
    G.formEchoGuide = { formId, until: (G.state.time || 0) + 18 };
    return G.requestGuidance ? G.requestGuidance(false) : true;
  };

  G.guidedFormEcho = function () {
    const guide = G.formEchoGuide;
    if (!guide || (G.state.time || 0) > guide.until) return null;
    return G.formEchoFor(guide.formId);
  };

  G.drawFormEcho = function (ctx, echo) {
    const form = echo && G.forms[echo.formId];
    if (!form) return;
    const t = (G.state.time || 0) * 2.4;
    const bob = Math.sin(t) * 2;
    ctx.save();
    ctx.globalAlpha = 0.16 + (Math.sin(t * 1.7) + 1) * 0.04;
    ctx.fillStyle = ECHO_COLOR;
    ctx.beginPath();
    ctx.ellipse(echo.x, echo.y + 1, 15 + Math.sin(t) * 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.22;
    G.drawSprite(ctx, form.sprite, 0, echo.x - 2, echo.y - 3 + bob, false, 1);
    ctx.globalAlpha = 0.82;
    G.drawSprite(ctx, form.sprite, Math.floor(t) % form.sprite.frames.length, echo.x, echo.y - 4 + bob, false, 1);
    ctx.globalAlpha = 0.75 + Math.sin(t * 2) * 0.15;
    ctx.fillStyle = "#fff3ff";
    ctx.font = "7px monospace";
    ctx.textAlign = "center";
    ctx.fillText(echo.needsLeave ? "✦" : "…", echo.x, echo.y - 25 + bob);
    ctx.restore();
  };
})();
