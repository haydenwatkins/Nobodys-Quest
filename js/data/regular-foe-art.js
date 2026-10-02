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
  make('tideCrab',15,10,(g,f)=>{
    for(const side of [-1,1]) {
      const x=n=>15+side*n;
      for(const [n,y] of [[6,13],[7,16]]) {g.line(x(n),y,x(11+f),y+2,'k',2);g.line(x(n),y,x(10+f),y+1,'g',1);}
      g.line(x(5),11,x(10),7+f,'k',3);g.line(x(5),11,x(10),7+f,'p',2);
      g.ellipse(x(11),5+f,3,4,'k');g.ellipse(x(11),5+f,2,3,'h');g.line(x(10),2+f,x(11),5+f,'p',1);
    }
    g.ellipse(15,12,9,6,'k');g.ellipse(15,11,8,5,'p');g.ellipse(14,9,6,3,'q');
    g.line(10,6,10,3,'k',2);g.line(20,6,20,3,'k',2);eye(g,9,3);eye(g,19,3);
    g.line(13,13,17,13,'k',1);g.put(8,11,'d');g.put(22,11,'d');
    g.line(11,8,14,6,'h',1);g.line(16,6,19,8,'h',1);
  });
  make('starMote',13,11,(g,f)=>{
    // A joined night-seed flower: petals belong to a visible living body.
    const y=11+f;
    for(const [x,dy,rx,ry] of [[13,-7,3,4],[6,-3,4,3],[20,-3,4,3],[8,5,3,4],[18,5,3,4]]) {
      g.ellipse(x,y+dy,rx,ry,'k');g.ellipse(x,y+dy,rx-1,ry-1,'e');
      g.line(x-1,y+dy-1,x+1,y+dy-1,'d',1);
    }
    g.ellipse(13,y,7,6,'k');g.ellipse(13,y,6,5,'r');g.ellipse(12,y-1,4,3,'s');
    eye(g,9,y-2);eye(g,15,y-2);g.ellipse(13,y+3,2,1,'m');
    g.put(7,y+2,'q');g.put(19,y+2,'q');g.put(12,y-4,'t');
  });
  make('sunHopper',14,10,(g,f)=>{
    // Warm meadow hopper with folded haunches and a connected antenna pair.
    for(const side of [-1,1]) {const x=n=>14+side*n;
      g.line(x(5),11,x(10),13-f,'k',3);g.line(x(10),13-f,x(7+f),17,'k',2);
      g.line(x(5),11,x(10),13-f,'g',2);g.line(x(10),13-f,x(7+f),17,'e',1);
      g.line(x(7+f),17,x(11+f),17,'k',2);
    }
    g.ellipse(14,12,7,6,'k');g.ellipse(14,11,6,5,'g');g.ellipse(13,10,4,3,'e');
    g.line(10,4,8,1,'k',1);g.line(18,4,20,1,'k',1);
    g.ellipse(14,7,7,5,'k');g.ellipse(14,7,6,4,'e');g.ellipse(13,5,4,2,'d');
    eye(g,10,6);eye(g,16,6);g.line(13,10,15,10,'f',1);g.put(8,9,'q');g.put(20,9,'q');
    g.line(10,12,8,14+f,'h',2);g.line(18,12,20,14-f,'h',2);
  });
  make('loomling',13,10,(g,f)=>{
    // Four joined leg pairs and a soft silk abdomen, without loose thread stamps.
    for(const side of [-1,1]) {const x=n=>13+side*n;
      for(const [n,y] of [[8,7],[10,10],[10,14],[8,17]]) {
        g.line(x(4),11,x(n),y+f,'k',2);g.line(x(n),y+f,x(n+2),y+2+f,'k',2);
        g.line(x(4),11,x(n),y+f,'n',1);g.line(x(n),y+f,x(n+2),y+2+f,'n',1);
      }
    }
    g.ellipse(13,10,7,8,'k');g.ellipse(13,9,6,7,'m');g.ellipse(12,7,4,4,'n');
    g.ellipse(13,13,6,5,'k');g.ellipse(13,12,5,4,'o');eye(g,9,11);eye(g,15,11);
    g.line(12,16,14,16,'m',1);g.put(8,15,'q');g.put(18,15,'q');g.line(11,5,15,5,'d',1);
  });
  make('mirageSkater',12,10,(g,f)=>{
    // A sand-glass gecko with a curled tail and broad, joined skating toes.
    g.line(10,11,5,12+f,'k',3);g.line(5,12+f,2,9+f,'k',2);g.line(2,9+f,3,6+f,'k',2);
    g.line(10,11,5,12+f,'s',2);g.line(5,12+f,2,9+f,'s',1);
    for(const [x,dx]of [[10,-f],[18,f]]) {g.line(x,13,x+dx-1,17,'k',2);g.line(x,13,x+dx-1,17,'r',1);g.line(x+dx-3,18,x+dx+1,18,'t',1);}
    g.ellipse(13,11,7,5,'k');g.ellipse(13,10,6,4,'r');g.ellipse(12,9,4,2,'s');
    g.ellipse(16,6,7,5,'k');g.ellipse(16,6,6,4,'e');g.ellipse(15,4,4,2,'d');
    eye(g,12,5);eye(g,18,5);g.line(15,9,19,9,'f',1);g.put(10,8,'q');g.put(21,8,'q');
    g.line(15,11,13,14-f,'s',2);g.put(8,9,'t');
  });
  make('bellMoth',14,10,(g,f)=>{
    for(const side of [-1,1]) {const x=n=>14+side*n;
      g.poly([[x(2),10],[x(9),f?4:1],[x(13),f?6:3],[x(12),11],[x(8),15],[x(4),13]],'k');
      g.poly([[x(3),10],[x(9),f?6:3],[x(11),f?7:5],[x(10),11],[x(8),13],[x(4),12]],'s');
      g.ellipse(x(8),9,3,3,'d');g.line(x(7),12,x(10),12,'e',1);g.put(x(8),13,'e');
    }
    g.ellipse(14,13,4,6,'k');g.ellipse(14,12,3,5,'g');g.line(12,14,16,14,'e',1);
    g.line(11,5,9,1,'k',1);g.line(17,5,19,1,'k',1);
    g.ellipse(14,8,5,5,'k');g.ellipse(14,7,4,4,'d');eye(g,11,7);eye(g,15,7);g.put(14,11,'h');
  });
  make('cairnWalker',14,12,(g,f)=>{
    for(const [x,dx]of [[9,-f],[19,f]]) {g.rect(x-3+dx,18,6,5,'k');g.rect(x-2+dx,19,4,3,'a');g.line(x-2+dx,22,x+1+dx,22,'c',1);}
    g.ellipse(14,15,11,6,'k');g.ellipse(14,14,10,5,'a');g.ellipse(12,12,7,3,'b');
    g.line(8,13,5,16,'c',1);g.line(20,14,23,15,'b',1);g.line(12,17,16,17,'i',2);
    g.ellipse(14,7,9,7,'k');g.ellipse(14,7,8,6,'b');g.ellipse(12,5,6,3,'c');
    eye(g,9,7);eye(g,17,7);g.line(13,11,15,11,'a',1);g.put(7,10,'q');g.put(21,10,'q');
    g.ellipse(10,2,3,1,'j');g.line(19,2,20,5,'a',1);g.put(9,1,'l');g.line(4,15,2,17,'b',2);g.line(24,15,26,17,'b',2);
  });
  for(const [id,sprite] of Object.entries(art)) G.enemies[id].sprite=sprite;
  G.regularFoeArtIds=Object.keys(art);
})();
