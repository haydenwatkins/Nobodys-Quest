/* Small living-road animals: connected wings/limbs, no floating glow stamps. */
"use strict";
(() => {
  const A = G.authoredPixelArt, art = G.wildlifeArt = {};
  const colors = {k:'#35424b',a:'#64727c',b:'#9baab1',c:'#d2ddd7',d:'#fff1d3',e:'#edbd75',f:'#a77752',g:'#d59d75',h:'#f3c4a0',i:'#547965',j:'#8eaf75',l:'#d0d69b',m:'#7c668e',n:'#ad94ba',o:'#dac7dc',p:'#b67170',q:'#eaa598',r:'#a1c7c5',s:'#648e9b',t:'#e8d78c'};
  const make = (id, draw) => art[id] = A.compactSprite(A.authored(24,20,colors,draw));
  const eye = (g,x,y) => {g.rect(x,y,2,3,'k');g.put(x,y,'d');};
  function moth(g,f,ember) {
    const spread = f%2 ? 0 : 2, light=ember?'h':'o', wing=ember?'g':'n';
    for(const side of [-1,1]) {
      g.ellipse(12+side*(4+spread),8,4+spread,5,'k');
      g.ellipse(12+side*(4+spread),8,3+spread,4,wing);
      g.ellipse(12+side*(4+spread),7,2+spread,2,light);
      g.ellipse(12+side*4,13,3,3,'k');g.ellipse(12+side*4,13,2,2,light);
    }
    g.line(11,7,9,3,'k',1);g.line(13,7,15,3,'k',1);
    g.ellipse(12,10,2,6,'k');g.line(12,8,12,14,ember?'e':'d',1);
    g.put(12,7,'d');
  }
  make('butterfly',(g,f)=>moth(g,f,false));
  make('embermoth',(g,f)=>moth(g,f,true));
  function bird(g,f,snow) {
    const lift=f%2?1:-2;
    g.poly([[5,11],[2,8+lift],[3,6+lift],[12,9],[20,7+lift],[22,9+lift],[19,13],[8,14]],'k');
    g.poly([[5,10],[4,8+lift],[11,10],[19,9+lift],[20,10+lift],[17,12],[8,12]],snow?'r':'b');
    g.ellipse(12,12,5,4,'k');g.ellipse(12,11,4,3,snow?'c':'b');
    g.ellipse(14,12,3,2,'d');g.ellipse(17,9,3,3,'k');g.ellipse(17,9,2,2,snow?'d':'c');
    g.poly([[20,9],[23,10],[20,11]],'e');eye(g,17,8);
    g.line(8,13,4,15,'a',2);g.put(11,16,'e');g.put(14,16,'e');
  }
  make('bird',(g,f)=>bird(g,f,false));
  make('snowbird',(g,f)=>bird(g,f,true));
  make('firefly',(g,f)=>{
    g.ellipse(8,8+f%2,4,3,'k');g.ellipse(8,8+f%2,3,2,'c');
    g.ellipse(16,8+f%2,4,3,'k');g.ellipse(16,8+f%2,3,2,'c');
    g.ellipse(12,12,4,5,'k');g.ellipse(12,12,3,4,'j');
    g.ellipse(12,14,2,2,f%2?'d':'t');g.ellipse(12,7,3,3,'k');
    g.ellipse(12,7,2,2,'a');g.put(11,6,'d');g.line(10,5,8,3,'a',1);g.line(14,5,16,3,'a',1);
  });
  make('rabbit',(g,f)=>{
    const hop=f===1?1:0;
    g.ellipse(7,13-hop,4,3,'k');g.ellipse(6,12-hop,3,2,'d');
    g.ellipse(13,12-hop,7,5,'k');g.ellipse(13,11-hop,6,4,'g');
    g.ellipse(12,13-hop,4,2,'h');g.ellipse(16,10-hop,5,4,'k');g.ellipse(16,10-hop,4,3,'h');
    g.ellipse(14,5-hop,2,5,'k');g.ellipse(14,5-hop,1,3,'q');
    g.ellipse(18,4-hop,2,4,'k');g.ellipse(18,4-hop,1,3,'q');
    eye(g,18,9-hop);g.put(21,12-hop,'p');
    g.ellipse(10-(f===3?1:0),16,3,1,'f');g.ellipse(17+(f===1?1:0),16,3,1,'f');
  });
  make('frog',(g,f)=>{
    const lift=f===1?1:0;
    for(const x of [5,19]) {g.ellipse(x,14-lift,4,3,'k');g.ellipse(x,14-lift,3,2,'j');g.line(x-2,17,x+2,17,'i',1);}
    g.ellipse(12,12-lift,7,5,'k');g.ellipse(12,11-lift,6,4,'j');g.ellipse(12,14-lift,4,2,'l');
    for(const x of [8,16]) {g.ellipse(x,7-lift,3,3,'k');g.ellipse(x,7-lift,2,2,'l');eye(g,x,6-lift);}
    g.line(10,12-lift,14,12-lift,'i',1);g.put(8,12-lift,'d');
  });
  make('dragonfly',(g,f)=>{
    const lift=f%2;
    for(const side of [-1,1]) {g.ellipse(12+side*5,7-lift,5,2,'k');g.ellipse(12+side*5,7-lift,4,1,'c');g.ellipse(12+side*4,11+lift,4,2,'k');g.ellipse(12+side*4,11+lift,3,1,'r');}
    g.line(12,5,12,17,'k',3);g.line(12,8,12,16,'s',1);g.put(12,12,'r');g.put(12,15,'r');
    g.ellipse(12,5,3,3,'k');g.ellipse(12,5,2,2,'r');g.put(11,4,'d');g.put(13,4,'d');
  });
  make('bat',(g,f)=>{
    const lift=f%2?-1:2;
    for(const side of [-1,1]) {const x=n=>12+side*n;g.poly([[x(1),9],[x(8),5+lift],[x(11),7+lift],[x(9),13],[x(6),11],[x(4),14]],'k');g.poly([[x(3),9],[x(8),7+lift],[x(9),8+lift],[x(8),11],[x(6),10],[x(4),12]],'n');g.line(x(3),9,x(7),10,'m',1);}
    g.ellipse(12,12,3,5,'k');g.ellipse(12,12,2,4,'m');
    g.poly([[8,8],[8,3],[11,6],[13,6],[16,3],[16,9]],'k');
    g.ellipse(12,8,4,3,'k');g.ellipse(12,8,3,2,'n');g.put(10,8,'d');g.put(14,8,'d');g.put(12,10,'p');
  });
  make('crab',(g,f)=>{
    for(const side of [-1,1]) {for(const y of [12,15])g.line(12+side*5,y,12+side*(9-f%2),y+2,'k',1);g.line(12+side*5,10,12+side*9,7,'p',2);g.ellipse(12+side*8,6+f%2,3,3,'k');g.ellipse(12+side*8,6+f%2,2,2,'g');g.put(12+side*8,4+f%2,'d');}
    g.ellipse(12,12,7,4,'k');g.ellipse(12,11,6,3,'q');g.ellipse(10,10,3,1,'h');
    for(const x of [9,15]) {g.line(x,8,x,5,'k',2);g.put(x,5,'d');}g.line(11,13,13,13,'p',1);
  });
  make('fish',(g,f)=>{
    g.poly([[8,9],[2,5+f%2],[2,14-f%2],[8,11]],'k');g.poly([[7,9],[4,7],[4,12],[7,11]],'s');
    g.poly([[10,8],[12,4],[15,8]],'s');g.ellipse(14,10,7,4,'k');g.ellipse(14,10,6,3,'r');
    g.line(10,9,17,9,'c',1);g.ellipse(13,12,3,1,'s');eye(g,18,8);g.put(21,10,'d');
  });
  make('spirit',(g,f)=>{
    // A friendly carried seed with an attached leaf, rather than a square halo.
    g.line(12,7,12,3,'i',1);g.poly([[12,3],[15,0],[19,1],[17,4],[13,5]],'i');g.line(14,3,17,2,'j',1);
    g.ellipse(12,11,6,7,'k');g.ellipse(12,10,5,6,'s');g.ellipse(11,10,4,5,'r');
    g.ellipse(10,8,2,2,'c');eye(g,9,10);eye(g,14,10);g.line(11,14,13,14,'s',1);
    g.ellipse(7,14+f%2,2,2,'r');g.ellipse(17,14-f%2,2,2,'r');
  });
})();
