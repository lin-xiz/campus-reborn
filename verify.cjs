const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/';
const app=fs.readFileSync(root+'app.js','utf8');
const context=vm.createContext({localStorage:{getItem:()=>null},document:{querySelector:()=>({})},crypto:{},location:{href:'https://example.test/campus-reborn/'}});
for(const name of ['story.js','portraits.js','environments.js','ui.js'])vm.runInContext(fs.readFileSync(root+name,'utf8'),context);
vm.runInContext(app.slice(0,app.indexOf("document.addEventListener('submit'"))+'\nthis.api={ROLES,SCENES,SCENE_COUNT,STORY_VERSION,summarize,validRecord,validSession,publicRecord,randomRole,environment,home,setup,draw,scene,result,rebirth,statistics,reflections};',context);
const a=context.api,ids=Object.keys(a.ROLES),N=a.SCENE_COUNT;assert.equal(ids.length,6);assert(!ids.includes('student'));assert.equal(N,7);
for(const id of ids){assert.equal(a.SCENES[id].length,N);assert.equal(a.SCENES[id].map(s=>s.time).join(','),'06:30,08:00,10:00,12:30,15:30,18:30,21:00');for(const s of a.SCENES[id]){assert(s.intro.length>45);assert.equal(s.options.length,3);for(const o of s.options){assert(o.label&&o.detail&&o.result.length>20&&o.tag);}}}
for(const exclude of [null,...ids]){const pool=ids.filter(id=>id!==exclude);for(let i=0;i<pool.length;i++){assert.equal(a.randomRole(exclude,()=>i/pool.length),pool[i]);assert.equal(a.randomRole(exclude,()=>(i+.999)/pool.length),pool[i]);}}
assert(!a.home().includes('data-role='));assert(!a.setup().includes('type="radio"'));
let seed=5789;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed%3;};
let count=0;const endings=new Set();
for(const firstRole of ids)for(const secondRole of ids){if(firstRole===secondRole)continue;for(let trial=0;trial<30;trial++){
 const choices=Array.from({length:N*2},(_,i)=>({role:i<N?firstRole:secondRole,scene:i%N,option:random()}));
 const record={version:a.STORY_VERSION,id:'test-'+count,choices,reflection:'private reflection',action:'private action',shareReflection:false};
 assert(a.validRecord(record));assert.equal(a.publicRecord(record).reflection,'');assert.equal(a.publicRecord(record).action,'');assert(!('nickname' in a.publicRecord({...record,nickname:'private'})));
 const base={...record,firstRole,secondRole,nickname:'测试',expectation:'理解工作',round:1,scene:N-1,selected:null,view:'result'};assert(a.validSession(base));
 for(let i=0;i<N*2;i++){const s={...base,secondRole:i<N?null:secondRole,round:Math.floor(i/N),scene:i%N,selected:null,view:'scene',choices:choices.slice(0,i)};assert(a.validSession(s));s.selected=choices[i].option;s.choices=choices.slice(0,i+1);assert(a.validSession(s));}
 assert(a.validSession({...base,secondRole:null,round:0,scene:N-1,view:'rebirth',choices:choices.slice(0,N)}));
 for(const round of [0,1])assert(a.validSession({...base,secondRole:round?secondRole:null,round,scene:0,view:'draw',choices:choices.slice(0,round*N)}));
 assert(!a.validSession({...base,secondRole:firstRole}));assert(!a.validRecord({...record,choices:choices.slice(0,N*2-1)}));assert(!a.validRecord({...record,version:'campus-morning-v3'}));
 endings.add(a.summarize(choices).title);
 if(trial===0){vm.runInContext('session='+JSON.stringify(base),context);const html=a.result();assert(html.includes('人生目的')&&html.includes('人生态度')&&html.includes('人生价值'));assert(html.includes(a.SCENES[firstRole][0].options[choices[0].option].label));assert(!html.includes('undefined'));}
 count++;
}}
assert.equal(endings.size,4);
const sample={version:a.STORY_VERSION,id:'fixture-day',choices:Array.from({length:N*2},(_,i)=>({role:i<N?'canteen':'cleaner',scene:i%N,option:0})),reflection:'<img src=x onerror=alert(1)> 这是测试手记',action:'周三分工后征求反馈。',shareReflection:true};
vm.runInContext('records='+JSON.stringify([sample]),context);assert(a.statistics().includes('1 次 · 100%'));assert(a.statistics().includes('还没有这个身份的体验记录'));const html=a.reflections();assert(!html.includes('<img'));assert(html.includes('&lt;img'));

for(const id of ids)for(let scene=0;scene<N;scene++){vm.runInContext('session='+JSON.stringify({firstRole:id,secondRole:null,round:0,scene,choices:[],selected:null,nickname:'测试'}),context);assert(!a.scene().includes('undefined'));assert(a.environment(id,scene).includes(a.ROLES[id].name+'的场景'));if(scene===N-1)assert(a.environment(id,scene).includes('is-night'));}
console.log(`PASS: 6 roles / 42 scenes / 126 options; ${count} paths across all 30 ordered role pairs; 25,200 in-progress saves; both random reveal save states; random buckets and nonrepeat; all 4 endings; all 42 scenes render; private text excluded; imported text escaped.`);
