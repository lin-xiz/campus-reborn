const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/';
const app=fs.readFileSync(root+'app.js','utf8');
const context=vm.createContext({localStorage:{getItem:()=>null},document:{querySelector:()=>({})},crypto:{},location:{href:'https://example.test/campus-reborn/'}});
for(const name of ['story.js','portraits.js','ui.js'])vm.runInContext(fs.readFileSync(root+name,'utf8'),context);
vm.runInContext(app.slice(0,app.indexOf("document.addEventListener('submit'"))+'\nthis.api={ROLES,SCENES,SCENE_COUNT,STORY_VERSION,summarize,validRecord,validSession,publicRecord,scene,result,rebirth,statistics,reflections};',context);
const a=context.api,ids=Object.keys(a.ROLES);assert.equal(ids.length,6);assert(!ids.includes('student'));assert.equal(a.SCENE_COUNT,5);
for(const id of ids){assert.equal(a.SCENES[id].length,5);for(const s of a.SCENES[id]){assert(/^0[6789]:|^10:/.test(s.time));assert(s.intro.length>45);assert.equal(s.options.length,3);for(const o of s.options){assert(o.label&&o.detail&&o.result.length>20&&o.tag);}}}
let seed=5789;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed%3;};
let count=0;const endings=new Set();
for(const firstRole of ids)for(const secondRole of ids){if(firstRole===secondRole)continue;for(let trial=0;trial<30;trial++){
 const choices=Array.from({length:10},(_,i)=>({role:i<5?firstRole:secondRole,scene:i%5,option:random()}));
 const record={version:a.STORY_VERSION,id:'test-'+count,choices,reflection:'private reflection',action:'private action',shareReflection:false};
 assert(a.validRecord(record));assert.equal(a.publicRecord(record).reflection,'');assert.equal(a.publicRecord(record).action,'');assert(!('nickname' in a.publicRecord({...record,nickname:'private'})));
 const base={...record,firstRole,secondRole,nickname:'测试',expectation:'理解工作',round:1,scene:4,selected:null,view:'result'};assert(a.validSession(base));
 for(let i=0;i<10;i++){const s={...base,secondRole:i<5?null:secondRole,round:Math.floor(i/5),scene:i%5,selected:null,view:'scene',choices:choices.slice(0,i)};assert(a.validSession(s));s.selected=choices[i].option;s.choices=choices.slice(0,i+1);assert(a.validSession(s));}
 assert(a.validSession({...base,secondRole:null,round:0,scene:4,view:'rebirth',choices:choices.slice(0,5)}));
 assert(!a.validSession({...base,secondRole:firstRole}));assert(!a.validRecord({...record,choices:choices.slice(0,9)}));
 endings.add(a.summarize(choices).title);
 if(trial===0){vm.runInContext('session='+JSON.stringify(base),context);const html=a.result();assert(html.includes('人生目的')&&html.includes('人生态度')&&html.includes('人生价值'));assert(html.includes(a.SCENES[firstRole][0].options[choices[0].option].label));assert(!html.includes('undefined'));}
 count++;
}}
assert.equal(endings.size,4);
const sample={version:a.STORY_VERSION,id:'fixture-morning',choices:Array.from({length:10},(_,i)=>({role:i<5?'canteen':'cleaner',scene:i%5,option:0})),reflection:'<img src=x onerror=alert(1)> 这是测试手记',action:'周三分工后征求反馈。',shareReflection:true};
vm.runInContext('records='+JSON.stringify([sample]),context);assert(a.statistics().includes('1 次 · 100%'));assert(a.statistics().includes('还没有这个身份的体验记录'));const html=a.reflections();assert(!html.includes('<img'));assert(html.includes('&lt;img'));

console.log(`PASS: 6 roles / 30 scenes / 90 choices; ${count} deterministic paths across all 30 ordered role pairs; 18,000 valid in-progress save states; all 4 endings reachable; result references selected options; per-role denominators; malformed data rejected; private text excluded; imported text escaped.`);
