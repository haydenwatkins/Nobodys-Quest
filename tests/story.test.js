"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ console, Math, Date, Map, Set, window: { matchMedia: () => ({ matches: false }) } });
function run(file, suffix = "") {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8") + suffix, context, { filename: file });
}

run("js/engine/core.js", ";this.G=G;");
const G = context.G;
let chapter = 0;
const dialogue = [];
const banners = [];
let saves = 0;
G.ui = {
  dialogue(speaker, text, options) { dialogue.push({ speaker, text, options }); },
  banner(title, text) { banners.push({ title, text }); },
};
G.saveGame = () => { saves++; };
G.storyChapter = () => chapter;
G.forms = { nobody: { quests: [{ id: "n1" }, { id: "n2" }] }, rat: { name: "Rat" }, god: { name: "God" } };
G.formOrder = ["nobody", "rat", "god"];
G.questsDone = [];
G.formReady = () => false;
G.formLevel = () => 5;
G.unlockedForms = () => ["nobody", "rat"];
G.state = {
  story: null, items: [], stars: 0, claimedForms: [],
  worldwake: { marks: [], discovered: [], favorsDone: [] }, town: { residents: 2 },
};
run("js/engine/story.js");

assert.equal(G.STORY_CHAPTERS.length, 6, "the campaign should have a complete six-act structure");
for (const act of G.STORY_CHAPTERS) {
  assert.ok(act.thesis.length > 35, `${act.title} needs a thematic premise`);
  assert.ok(act.summary.length > 45, `${act.title} needs a useful recap`);
  assert.ok(act.scene.length >= 4, `${act.title} needs a deliberate chapter scene`);
}

let goal = G.storyGoal();
assert.equal(goal.chapter, 0);
assert.match(goal.objective, /Nobody's mastery quests/);
assert.equal(goal.progress.total, 2);
G.formReady = (id) => id === "rat";
goal = G.storyGoal();
assert.equal(goal.guide, "echo");
assert.match(goal.objective, /watch for the shape it leaves behind/,
  "the opening story should teach the in-world form meeting instead of a menu claim");
G.formReady = () => false;
G.beginStorySession(null);
assert.ok(banners[0].title.includes("ACT 1"), "a new adventure should open with its prologue");
assert.equal(dialogue.length, 4, "the opening scene should breathe across four readable boxes");
assert.ok(G.state.story.prologueSeen);

chapter = 3;
G.state.stars = 24;
G.state.worldwake.marks = ["sky"];
goal = G.storyGoal();
assert.equal(goal.mapId, "hangingGardens");
assert.match(goal.objective, /Old Mason/);
G.storyCheck();
assert.ok(G.state.story.seenChapters.includes(3), "crossing an act boundary should play its new scene");

chapter = 5;
G.state.items.push("god-spark");
goal = G.storyGoal();
assert.equal(goal.complete, true);
assert.match(goal.reason, /collection of lessons/);
G.storyCheck();
assert.ok(dialogue.some((line) => line.text.includes("choosing hero")), "the ending should correct the prophecy");
assert.ok(saves > 0, "story milestones should persist immediately");

console.log("story tests passed");
