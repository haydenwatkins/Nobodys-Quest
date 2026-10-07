/* Speaker identity is shared by every dialogue style. NPC portraits recompose
   the authored head over a bust, preserving the face without carrying props. */
"use strict";
(() => {
  const A = G.authoredPixelArt;
  G.dialoguePortraits = {};
  for (const [id, npc] of Object.entries(G.NPCS)) {
    const source = npc.sprite.hd || npc.sprite, rows = source.frames[0];
    const quay = id.startsWith("quay"), x0 = quay ? 8 : 5;
    const y0 = id === "quayPip" ? 12 : id === "quayMara" ? 3 : 0;
    const height = id === "quayBaker" ? 27 : 25;
    const portrait = A.compactSprite(A.authored(64, 64, { ...source.palette }, g => {
      g.poly([[4, 63], [8, 53], [21, 47], [43, 47], [56, 53], [60, 63]], "k");
      g.poly([[7, 63], [10, 55], [22, 49], [42, 49], [54, 55], [57, 63]], "c");
      const collar = { pebble: "e", parcel: "a", pending: "j", errata: "t", alias: "t", probably: "t", quayMara: "t", quayPip: "q" }[id] || "d";
      g.poly([[20, 49], [31, 55], [43, 49], [38, 60], [26, 60]], collar);
      if (id === "moss" || id === "quayBaker") g.rect(22, 54, 21, 10, "d");
      else if (id === "provisional") {
        g.poly([[27, 53], [37, 53], [39, 63], [25, 63]], "t");
        g.line(28, 53, 28, 59, "o", 1); g.line(28, 59, 33, 61, "o", 1); g.line(33, 61, 37, 57, "o", 1);
      } else if (id === "pending") {
        g.ellipse(13, 56, 7, 4, "i"); g.ellipse(51, 56, 7, 4, "i");
      } else if (id === "probably") { g.ellipse(32, 57, 3, 3, "a"); g.ellipse(33, 56, 2, 2, "o"); }
      else if (id === "mayorMaybe") { g.poly([[25, 54], [39, 54], [41, 63], [23, 63]], "b"); g.rect(31, 57, 2, 2, "a"); }
      else g.line(32, 57, 32, 63, "a", 2);
      for (let sy = 0; sy < height; sy++) for (let sx = 0; sx < 26; sx++) {
        const pixel = rows[y0 + sy]?.[x0 + sx];
        // Pending's blade belongs to his world pose, not to his face.
        if (id === "pending" && sx >= 24 && sy >= 17) continue;
        if ((id === "quayBaker" || id === "quayPip") && sx >= 25 && sy >= 19) continue;
        if (pixel && pixel !== "." && pixel !== " ") g.rect(6 + sx * 2, 2 + sy * 2, 2, 2, pixel);
      }
    }));
    portrait.portraitOf = id;
    G.dialoguePortraits[id] = portrait;
  }

  const aliases = { ERRATA: "errata", PARCEL: "parcel", "SER PENDING": "pending", BRINDLE: "quayBaker", MOSS: "moss", PROVISIONAL: "provisional", "PEBBLE NOTICES": "pebble" };
  function clean(speaker) { return String(speaker || "").toUpperCase().replace(/^[^A-Z0-9]+/, "").replace(/[^A-Z0-9]+$/, "").trim(); }
  function matches(name, alias) { return name === alias || name.startsWith(alias + " ·") || (alias === "PARCEL" && name.startsWith(alias + ",")); }
  G.resolveDialogueSpeaker = speaker => {
    const name = clean(speaker);
    for (const [alias, id] of Object.entries(aliases)) if (matches(name, alias))
      return { kind: "npc", id, name: G.NPCS[id].name, sprite: G.dialoguePortraits[id] };
    for (const [id, npc] of Object.entries(G.NPCS)) if (matches(name, npc.name.toUpperCase()))
      return { kind: "npc", id, name: npc.name, sprite: G.dialoguePortraits[id] };
    if (matches(name, "THE LAST WORLDBEARER")) return { kind: "guardian", id: "lastWorldbearer", name: G.enemies.lastWorldbearer.name, sprite: G.enemies.lastWorldbearer.sprite };
    for (const [id, form] of Object.entries(G.forms)) if (matches(name, form.name.toUpperCase()))
      return { kind: "form", id, name: form.name, sprite: form.sprite };
    for (const [id, foe] of Object.entries(G.enemies)) if (foe.miniboss &&
      [foe.name.toUpperCase(), "THE " + foe.name.toUpperCase().replace(/^THE /, ""),
       foe.boss?.domain ? "WORLDBEARER OF " + foe.boss.domain.toUpperCase() : ""].filter(Boolean)
       .some(alias => matches(name, alias) || name === alias + " — PHASE II" || name === alias + " — PHASE III"))
      return { kind: "guardian", id, name: foe.name, sprite: foe.sprite };
    return { kind: "narration", id: null, name: String(speaker || ""), sprite: null };
  };

  G.drawDialoguePortrait = (c, speaker, x, y, size) => {
    const identity = G.resolveDialogueSpeaker(speaker);
    c.save();
    if (identity.sprite) {
      const metrics = G.spriteMetrics(identity.sprite), scale = Math.min(size / metrics.w, size / metrics.h);
      G.drawSprite(c, identity.sprite, 0, x + size / 2, y + (size + metrics.h * scale) / 2, false, scale);
    } else {
      // A little open journal is a neutral narration/object treatment. Unknown
      // headings never borrow a character's face or imply somebody spoke them.
      c.fillStyle = "#795e4e"; c.fillRect(x + 5, y + size / 2 - 9, size - 10, 20);
      c.fillStyle = "#e9d7ad"; c.fillRect(x + 7, y + size / 2 - 7, size / 2 - 8, 16);
      c.fillRect(x + size / 2 + 1, y + size / 2 - 7, size / 2 - 8, 16);
      c.fillStyle = "#a18a68";
      for (const side of [0, 1]) for (let i = 0; i < 3; i++)
        c.fillRect(x + 10 + side * (size / 2 - 2), y + size / 2 - 3 + i * 4, size / 2 - 14, 1);
    }
    c.restore();
    return identity;
  };
})();
