/* Rounded storybook lettering; world labels share the sharp HUD canvas. */
"use strict";
(() => {
  const family = '"Nunito", "Trebuchet MS", sans-serif';
  let worldContext = null, labels = [], worldClip = null;
  function transform(ctx,m,scale) {
    const factor=scale/(G.renderScale||1);
    ctx.setTransform(m.a*factor,m.b*factor,m.c*factor,m.d*factor,m.e*factor,m.f*factor);
  }
  G.text = {
    family,
    font: (size, weight = 600) => `${weight} ${size}px ${family}`,
    beginWorldFrame(ctx) { worldContext = ctx; labels = []; worldClip = null; },
    setWorldClip(ctx,bounds) {
      if(ctx===worldContext)worldClip=bounds?{bounds,transform:ctx.getTransform()}:null;
    },
    paintWorldLabels(ctx, scale) {
      ctx.save();
      const opacity = G.state?.zoneTransition ? 0 : 1 - Math.min(1, (G.state?.mapReveal || 0) / .32);
      for (const label of labels) {
        if(label.clip){
          ctx.save();transform(ctx,label.clip.transform,scale);const b=label.clip.bounds;
          ctx.beginPath();ctx.rect(b.left,b.top,b.right-b.left,b.bottom-b.top);ctx.clip();
        }
        transform(ctx,label.transform,scale);
        ctx.font = label.font; ctx.fillStyle = label.color; ctx.globalAlpha = label.alpha * opacity;
        ctx.textAlign = label.align; ctx.textBaseline = label.baseline;
        ctx.fillText(...label.args);
        if(label.clip)ctx.restore();
      }
      ctx.restore(); worldContext = null; labels = []; worldClip = null;
    },
  };
  G.drawWorldText = (ctx, ...args) => {
    if (ctx !== worldContext) { ctx.fillText(...args); return; }
    // Capture the real camera/rotation and opacity without altering world art.
    labels.push({args, transform:ctx.getTransform(), font:ctx.font, color:ctx.fillStyle,
      alpha:ctx.globalAlpha, align:ctx.textAlign, baseline:ctx.textBaseline,clip:worldClip});
  };
})();
