#!/usr/bin/env node
// Fresh Chromium contexts with animation paused. CPU throttling is a simulation,
// not a claim about a physical iPad, Android device or TV.
// Usage: node tools/measure-startup.cjs [baseURL] [baselineGitRef]
// A baseline ref replaces only form-art-hd.js, keeping the rest of this build.
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(require.resolve('playwright', {
  paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || 'node_modules'],
}));
const baseURL = process.argv[2] || 'http://127.0.0.1:8000/';
const baseline = process.argv[3] && execFileSync('git', ['show', `${process.argv[3]}:js/data/form-art-hd.js`], {
  cwd: path.resolve(__dirname, '..'), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
});

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox'],
  });
  try {
    const records = [];
    for (const rate of [1, 4]) for (let run = 0; run < 3; run++) for (const version of baseline ? ['baseline', 'current'] : ['current']) {
      const context = await browser.newContext({
        viewport: { width: 667, height: 375 }, hasTouch: true,
      });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      if (version === 'baseline') await page.route('**/js/data/form-art-hd.js?*', route =>
        route.fulfill({ contentType: 'text/javascript', body: baseline }));
      await page.addInitScript(() => {
        window.requestAnimationFrame = () => 1;
        window.cancelAnimationFrame = () => {};
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Performance.enable');
      await cdp.send('Emulation.setCPUThrottlingRate', { rate });
      await page.goto(baseURL);
      await page.waitForFunction(() => typeof G !== 'undefined' && G.state?.player);
      const metrics = Object.fromEntries((await cdp.send('Performance.getMetrics'))
        .metrics.map(metric => [metric.name, metric.value]));
      const timing = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return { domReadyMs: navigation.domContentLoadedEventEnd, loadMs: navigation.loadEventEnd };
      });
      assert.deepEqual(errors, []);
      records.push({ version, rate, run, scriptMs: metrics.ScriptDuration * 1000,
        taskMs: metrics.TaskDuration * 1000, ...timing });
      await context.close();
    }
    console.log(JSON.stringify(records, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
