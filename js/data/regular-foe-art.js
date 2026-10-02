/* Early road foes: independent bodies in the original footprints and cadence. */
"use strict";
(() => {
  const A=G.authoredPixelArt, colors={k:'#35414a',a:'#596c70',b:'#859c96',c:'#bbcbc0',d:'#f5edd2',e:'#e9bc78',f:'#846354',g:'#ba8364',h:'#edb797',i:'#477a69',j:'#7cae85',l:'#b9d7a1',m:'#6a597e',n:'#9c84ad',o:'#d7bdd8',p:'#a66979',q:'#e5a8ab',r:'#567f91',s:'#91b9bf',t:'#cde2db'};
  const eye=(g,x,y)=>{g.rect(x,y,2,3,'k');g.put(x,y,'d');};
  const art={};
  function make(id,w,h,draw) {
    const dense=A.authored(w*2,h*2,colors,draw);
    // Keep the existing two-beat movement clock, including borrowed/rival foes.
    dense.frames=dense.frames.slice(0,2);
    dense.animations={idle:[0],walk:[0,1],attack:[1]};
    art[id]=A.compactSprite(dense);
  }
  make('slime',12,8,(g,f)=>{
    const cy=9+f,rx=10+f;
    g.ellipse(12,cy,rx,6-f,'k');g.ellipse(12,cy-1,rx-1,5-f,'i');
    g.ellipse(10,cy-2,7,3,'j');g.ellipse(7,cy-3,2,1,'l');
    g.ellipse(12,cy+2,5,2,'s');eye(g,8,cy-2);eye(g,15,cy-2);
    g.line(11,cy+2,13,cy+2,'i',1);g.put(6,cy+1,'q');g.put(18,cy+1,'q');
    g.line(11,4,12,1,'i',1);g.poly([[12,2],[15,0],[19,2],[15,4]],'j');
  });
  make('bat',14,8,(g,f)=>{
    const y=f?5:2;
    for(const side of [-1,1]) {const x=n=>14+side*n;
      g.poly([[x(2),8],[x(9),y],[x(13),y+2],[x(11),11],[x(7),9],[x(4),12]],'k');
      g.poly([[x(3),8],[x(9),y+2],[x(11),y+3],[x(10),9],[x(7),8],[x(4),10]],'n');
      g.line(x(3),8,x(9),y+3,'m',1);
    }
    g.ellipse(14,10,4,5,'k');g.ellipse(14,10,3,4,'m');
    g.poly([[10,7],[10,1],[13,4],[15,4],[18,1],[18,7]],'k');
    g.ellipse(14,7,5,4,'k');g.ellipse(14,7,4,3,'n');eye(g,11,6);eye(g,16,6);
    g.put(14,10,'p');g.put(12,12,'d');g.put(16,12,'d');
  });
  make('bones',12,14,(g,f)=>{
    // A sewn road scout with a small button-like bone face and attached cape.
    for(const [x,dx]of [[8,-f],[16,f]]) {g.line(x,21,x+dx,25,'b',2);g.ellipse(x+dx,26,3,1,'k');g.line(x+dx-1,25,x+dx+1,25,'c',1);}
    g.poly([[6,13],[18,13],[21,23],[3,23]],'k');g.poly([[7,14],[17,14],[19,21],[5,21]],'r');
    g.rect(8,15,9,7,'a');g.line(9,16,15,16,'c',1);g.line(9,19,15,19,'c',1);g.rect(11,20,3,4,'d');
    for(const [x,dx]of [[6,-1],[18,1]]) {g.line(x,15,x+dx*2,19+f,'b',2);g.ellipse(x+dx*2,20+f,2,2,'d');}
    g.ellipse(12,8,8,7,'k');g.ellipse(12,7,7,6,'c');g.ellipse(11,6,5,4,'d');
    g.ellipse(8,8,2,2,'k');g.ellipse(16,8,2,2,'k');g.put(8,7,'t');g.put(16,7,'t');
    g.rect(11,11,3,2,'b');g.put(12,12,'k');g.line(7,13,17,13,'c',1);
  });
  make('wisp',10,11,(g,f)=>{
    const bob=f;
    g.poly([[2,14+bob],[3,7+bob],[7,2+bob],[13,2+bob],[17,7+bob],[18,16+bob],[14,19+bob],[10,17+bob],[6,20]],'k');
    g.poly([[4,14+bob],[5,8+bob],[8,4+bob],[12,4+bob],[15,8+bob],[16,15+bob],[13,17+bob],[10,15+bob],[6,17+bob]],'n');
    g.ellipse(10,10+bob,5,5,'o');g.line(5,6+bob,10,4+bob,'d',1);
    eye(g,6,9+bob);eye(g,12,9+bob);g.line(9,14+bob,11,14+bob,'m',1);
    g.line(3,15+bob,1,17+bob,'n',2);g.line(17,15+bob,19,17+bob,'n',2);
    g.line(7,17+bob,7,18+bob,'d',1);g.line(13,16+bob,13,17+bob,'d',1);
  });
  make('brute',18,16,(g,f)=>{
    const step=f?1:0;
    for(const [x,dx]of [[12,-step],[24,step]]) {g.rect(x-3+dx,24,7,6,'k');g.rect(x-2+dx,25,5,4,'a');g.line(x-2+dx,29,x+2+dx,29,'b',1);}
    g.ellipse(18,20,11,9,'k');g.ellipse(18,19,10,8,'g');g.ellipse(17,17,8,5,'h');
    for(const side of [-1,1]) {g.ellipse(18+side*11,18+f,5,7,'k');g.ellipse(18+side*11,18+f,4,6,'g');g.line(18+side*11-2,18+f,18+side*11+2,18+f,'h',1);}
    g.poly([[11,15],[25,15],[26,26],[18,28],[10,26]],'a');g.poly([[13,17],[23,17],[23,24],[18,25],[13,24]],'r');
    g.line(14,19,22,19,'s',1);g.rect(17,21,3,3,'e');
    g.ellipse(18,9,9,8,'k');g.ellipse(18,8,8,7,'g');g.ellipse(17,6,6,4,'h');
    g.poly([[11,4],[13,1],[15,3]],'f');g.poly([[21,3],[24,1],[25,5]],'f');
    eye(g,13,7);eye(g,21,7);g.ellipse(18,11,4,2,'h');g.line(16,12,20,12,'f',1);g.put(12,11,'q');g.put(24,11,'q');
  });
  make('thornling',10,9,(g,f)=>{
    g.line(8,12,6-f,16,'f',2);g.line(12,12,15+f,16,'f',2);
    g.ellipse(10,10,7,6,'k');g.ellipse(10,9,6,5,'i');g.ellipse(9,8,4,3,'j');
    g.line(10,4,10,1,'i',2);g.poly([[10,3],[3,1],[4,5],[9,6]],'j');g.poly([[10,3],[16,0],[17,4],[11,6]],'l');
    eye(g,6,8);eye(g,12,8);g.ellipse(10,12,3,2,'k');g.ellipse(10,12,2,1,'e');
    g.line(3,10,1,12+f,'i',2);g.line(17,10,19,12-f,'i',2);g.put(6,12,'l');g.put(15,11,'l');
  });
  make('pebblebeast',12,10,(g,f)=>{
    for(const [x,dx]of [[7,-f],[17,f]]) {g.rect(x-2+dx,15,5,4,'k');g.line(x-1+dx,17,x+1+dx,17,'b',1);}
    g.poly([[2,14],[3,6],[8,2],[16,2],[21,6],[22,14],[18,17],[6,17]],'k');
    g.poly([[4,13],[5,7],[9,4],[15,4],[19,7],[20,13],[17,15],[7,15]],'b');
    g.poly([[5,7],[9,4],[15,4],[17,7],[13,9],[7,9]],'c');g.line(7,12,10,12,'a',1);g.line(17,6,16,10,'a',1);
    g.ellipse(6,5,3,2,'i');g.ellipse(16,4,3,2,'j');g.put(6,4,'l');
    eye(g,7,9);eye(g,15,9);g.line(11,13,13,13,'a',1);g.put(6,12,'q');g.put(18,12,'q');
  });
  make('shade',10,9,(g,f)=>{
    // A compact stitched hood, with a joined hem instead of loose spikes.
    g.poly([[2,13],[3,6],[7,1],[13,1],[17,6],[18,14],[15,17],[10,15],[5,17]],'k');
    g.poly([[4,12],[5,7],[8,3],[12,3],[15,7],[16,13],[13,15],[10,13],[6,15]],'m');
    g.ellipse(10,9,5,4,'a');g.ellipse(10,9,4,3,'r');eye(g,6,8);eye(g,12,8);
    g.line(8,12,12,12,'a',1);g.line(7,4,10,3,'n',1);g.line(6,14,7,15,'o',1);g.line(13,14,14,15,'o',1);
    g.line(3,11,1,13+f,'n',2);g.line(17,11,19,13-f,'n',2);
  });
  for(const [id,sprite] of Object.entries(art)) G.enemies[id].sprite=sprite;
  G.regularFoeArtIds=Object.keys(art);
})();
