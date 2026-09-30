/* Two marsh relatives with distinct silhouettes: a springy little frog and
   a broad, flower-crowned queen. Existing four-pose timing/footprints remain. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const colors={k:'#253b3c',a:'#3b6260',b:'#5a956e',c:'#91be82',d:'#c1dc9c',e:'#fff0bd',f:'#e5b86d',g:'#fff9e2',h:'#dc93a4',i:'#825e81',j:'#375042',l:'#719e91',m:'#eacf88',n:'#344246'};
  function eye(g,x,y,rx,ry){
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y,rx-1,ry-1,'c');
    g.ellipse(x,y,rx-2,ry-2,'d');g.rect(x-1,y-1,3,4,'n');g.put(x-1,y-1,'g');
  }
  function frog(g,f){
    const lift=f===2?-1:0,s=f===1?1:f===3?-1:0,cx=17,cy=17+lift;
    for(const [x,sign]of [[7,-1],[27,1]]){
      g.ellipse(x+sign*s,cy+4,5,4,'k');g.ellipse(x+sign*s,cy+3,4,3,'b');
      g.line(x-3,cy+6,x+3,cy+6,'c',1);
    }
    g.ellipse(cx,cy,12,7,'k');g.ellipse(cx,cy-1,11,6,'b');g.ellipse(cx-2,cy-2,9,4,'c');
    g.ellipse(cx,cy+2,6,3,'d');
    eye(g,10,9+lift,5,6);eye(g,24,9+lift,5,6);
    g.line(12,cy,22,cy,'a',1);g.put(11,cy-1,'a');g.put(23,cy-1,'a');
    g.line(7,cy-2,9,cy-2,'h',1);g.line(25,cy-2,27,cy-2,'h',1);
    for(const [x,y]of [[6,14],[28,14],[9,20],[25,20]])g.put(x,y+lift,'l');
    if(f===2){g.line(19,cy,28,cy-2,'k',3);g.line(19,cy,28,cy-2,'h',1);g.ellipse(30,cy-2,2,2,'h');g.put(30,cy-3,'g');}
    else {g.line(13,cy+1,21,cy+1,'c',1);g.put(17,cy+2,'a');}
    g.line(12-s,cy+3,12-s,cy+6,'k',1);g.line(22+s,cy+3,22+s,cy+6,'k',1);
  }
  function queen(g,f){
    const s=f===1?1:f===3?-1:0,lift=f===2?-2:0,cx=26,cy=24+lift;
    for(const [x,sign]of [[9,-1],[43,1]]){
      g.ellipse(x+sign*s,cy+8,7,4,'k');g.ellipse(x+sign*s,cy+7,6,3,'b');g.line(x-4,cy+9,x+4,cy+9,'c',1);
    }
    g.ellipse(cx,cy,19,11,'k');g.ellipse(cx,cy-1,18,10,'b');g.ellipse(cx-3,cy-3,15,7,'c');
    g.ellipse(cx,cy+3,12,5,'d');g.line(cx-7,cy+6,cx+7,cy+6,'e',1);
    eye(g,15,15+lift,7,8);eye(g,37,15+lift,7,8);
    g.ellipse(11,cy-1,3,2,'h');g.ellipse(41,cy-1,3,2,'h');
    g.line(19,cy+1,33,cy+1,'a',1);g.line(21,cy+2,31,cy+2,'c',1);
    // Petal collar frames the face without swallowing it.
    for(const x of [15,22,30,37]){g.ellipse(x,cy+6,3,2,'i');g.ellipse(x,cy+5,2,1,'h');}
    for(const x of [16,36]){g.line(x,cy+5,x,cy+10,'a',2);g.put(x,cy+8,'m');}
    // Tiny water-lily crown: warm metal, pink enamel and a bright jewel.
    g.poly([[18,9+lift],[17,3+lift],[22,6+lift],[26,3+lift],[30,6+lift],[35,3+lift],[34,9+lift]],'k');
    g.poly([[20,8+lift],[19,5+lift],[23,7+lift],[26,3+lift],[29,7+lift],[33,5+lift],[32,8+lift]],'f');
    g.line(20,8+lift,32,8+lift,'e',1);g.put(26,6+lift,'h');g.put(25,5+lift,'g');
    if(f===2){g.line(cx,cy+1,cx+3,cy+8,'k',3);g.line(cx,cy+1,cx+3,cy+8,'h',1);g.ellipse(cx+3,cy+10,3,2,'h');g.put(cx+2,cy+9,'g');}
    for(const [x,y]of [[7,25],[44,26],[11,29],[40,29]])g.put(x,y+lift,'l');
  }
  G.forms.frog.sprite=A.compactSprite(A.authored(34,26,colors,frog));
  G.enemies.mireQueen.sprite=A.compactSprite(A.authored(52,38,colors,queen));
})();
