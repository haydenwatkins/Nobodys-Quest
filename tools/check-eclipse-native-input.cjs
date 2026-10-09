#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs');
const r=runtime(),{G}=r;G.state.claimedForms.push('knight');G.setForm('knight');r.load('emberRidge');r.drain();const e=G.state.enemies.find(e=>e.id==='eclipseKnight');G.state.enemies=[e];G.state.bossCutscene=null;
Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPendingAction:'charge',bossTelegraphT:1.1});Object.assign(G.state.player,{x:e.x-20,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100});let parries=0;G.events.on('parry',()=>parries++);r.taps.add('b');for(let i=0;i<12;i++){r.step(.025);r.drain();}
assert.equal(e.eclipseCounters,1);assert.equal(e.hp,42);assert.equal(e.ward.hp,6);assert.equal(G.state.player.mana,0);assert.ok(G.state.player.x>e.x-20);assert.equal(parries,0);assert.equal(G.state.player.damageTaken,0);
console.log('PASS native Shield Advance at zero mana: real advance, shield ring, intact ward, no invented parry credit');
