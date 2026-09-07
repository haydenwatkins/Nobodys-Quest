import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveMove,contact,MOVESETS} from '../battle.mjs';
import {DialogueText,portrait} from '../dialogue.mjs';
const origin={x:0,z:0,yaw:0};
test('blade fans, lance lanes and hammer impact disks select different targets',()=>{
 const blade=resolveMove('runner','shear'),lance=resolveMove('runner','pike'),hammer=resolveMove('runner','maul');
 assert.equal(contact(blade,origin,{x:2,z:2}).hit,true);
 assert.equal(contact(lance,origin,{x:2,z:2}).hit,false);
 assert.equal(contact(hammer,origin,{x:2,z:2}).hit,true);
 assert.equal(contact(hammer,origin,{x:0,z:7}).hit,false);
 assert.equal(contact(lance,origin,{x:0,z:7}).hit,true);
 for(const move of [blade,lance,hammer])assert.equal(contact(move,origin,{x:0,z:-2}).hit,false);
});
test('lance tip precision requires a hit and grants the stated damage bonus',()=>{
 const move=resolveMove('runner','pike');
 const close=contact(move,origin,{x:0,z:2}),tip=contact(move,origin,{x:0,z:6});
 assert.equal(close.precise,false);assert.equal(tip.precise,true);assert.equal(tip.damage,close.damage*1.4);
 assert.equal(contact(move,origin,{x:3,z:6}).precise,false);
});
test('move chains differ in timing and an additional form can use a different length chain',()=>{
 assert.ok(resolveMove('runner','maul',2).windup>resolveMove('runner','shear',2).windup);
 const forms={testform:{weapons:{claw:'testset'}}},sets={testset:{chain:MOVESETS.edge.chain.slice(0,2),vent:MOVESETS.edge.vent}};
 assert.equal(resolveMove('testform','claw',2,false,forms,sets).name,'Draw cut');
 assert.equal(resolveMove('testform','claw',0,false,forms,sets).chainLength,2);
 assert.throws(()=>resolveMove('missing','claw'));
});
test('dialogue reveals progressively, can skip, and honors reduced motion',()=>{
 const text=new DialogueText();text.set('A long enough sentence for a conversation.',10);
 assert.equal(text.visible(10),'');assert.equal(text.complete(10.1),false);
 text.reveal();assert.equal(text.complete(10.1),true);
 text.set('Next line',11,true);assert.equal(text.visible(11),'Next line');
 assert.notEqual(portrait('Sera Vale'),portrait('Iona Rusk'));
 assert.equal(portrait('<script>').includes('<script>'),false);
});
