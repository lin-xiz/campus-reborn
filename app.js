'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SESSION_KEY='another-day-morning-session-v3', RECORDS_KEY='another-day-morning-records-v3';
let storageAvailable=true;
function read(key,def){try{return JSON.parse(localStorage.getItem(key))??def;}catch{return def;}}
function write(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true;}catch{storageAvailable=false;return false;}}
function validChoice(c){return c&&Object.hasOwn(ROLES,c.role)&&Number.isInteger(c.scene)&&c.scene>=0&&c.scene<SCENE_COUNT&&Number.isInteger(c.option)&&c.option>=0&&c.option<3;}
function validSequence(choices,first,second){return choices.every((c,i)=>validChoice(c)&&c.scene===i%SCENE_COUNT&&c.role===(i<SCENE_COUNT?first:second));}
function validRecord(r){return r&&r.version===STORY_VERSION&&typeof r.id==='string'&&/^[\w-]{1,80}$/.test(r.id)&&Array.isArray(r.choices)&&r.choices.length===SCENE_COUNT*2&&r.choices[0]?.role!==r.choices[SCENE_COUNT]?.role&&validSequence(r.choices,r.choices[0]?.role,r.choices[SCENE_COUNT]?.role)&&typeof r.reflection==='string'&&r.reflection.length<=800&&typeof r.action==='string'&&r.action.length<=300&&typeof r.shareReflection==='boolean';}
function validSession(s){
 if(!s||s.version!==STORY_VERSION||typeof s.id!=='string'||!/^[\w-]{1,80}$/.test(s.id)||typeof s.nickname!=='string'||s.nickname.length>20||typeof s.expectation!=='string'||s.expectation.length>100||!Object.hasOwn(ROLES,s.firstRole)||!(s.secondRole===null||(Object.hasOwn(ROLES,s.secondRole)&&s.secondRole!==s.firstRole))||!['draw','scene','rebirth','result'].includes(s.view)||!Array.isArray(s.choices)||!validSequence(s.choices,s.firstRole,s.secondRole)||![0,1].includes(s.round)||!Number.isInteger(s.scene)||s.scene<0||s.scene>=SCENE_COUNT||!(s.selected===null||(Number.isInteger(s.selected)&&s.selected>=0&&s.selected<3))||typeof s.reflection!=='string'||s.reflection.length>800||typeof s.action!=='string'||s.action.length>300||typeof s.shareReflection!=='boolean')return false;
 if(s.round===1&&!s.secondRole)return false;if(s.round===0&&s.secondRole!==null)return false;
 const n=s.choices.length;
 if(s.view==='draw')return n===0&&s.round===0&&s.scene===0&&s.selected===null;
 if(s.view==='rebirth')return n===SCENE_COUNT&&s.round===0&&s.scene===SCENE_COUNT-1&&s.selected===null;
 if(s.view==='result')return n===SCENE_COUNT*2&&s.round===1&&s.scene===SCENE_COUNT-1&&s.selected===null;
 return n===s.round*SCENE_COUNT+s.scene+(s.selected===null?0:1)&&(s.selected===null||s.choices[n-1].option===s.selected);
}
const saved=read(SESSION_KEY,null);let session=validSession(saved)?saved:null;
let records=read(RECORDS_KEY,[]);records=Array.isArray(records)?records.filter(validRecord).slice(-1000):[];
let view='home',teacherTab='guide',timer,selectedDraft='';
const app=$('#app'),uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const currentRole=()=>session.round===0?session.firstRole:session.secondRole;
const optionFor=c=>SCENES[c.role][c.scene].options[c.option];
function persist(){if(session)write(SESSION_KEY,session);}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),4500);}
function go(v){view=v;render();window.scrollTo({top:0,behavior:'instant'});app.focus({preventScroll:true});}
function render(){app.innerHTML=`<div class="fade">${({home,setup,draw,scene,rebirth,result,teacher}[view]||home)()}</div>`;document.querySelectorAll('nav [data-action]').forEach(b=>b.classList.toggle('active',b.dataset.action===(view==='teacher'?'teacher':'home')));}
function ensureRecord(){if(session?.view!=='result')return;const r={version:STORY_VERSION,id:session.id,choices:session.choices.map(c=>({...c})),reflection:session.reflection,action:session.action,shareReflection:session.shareReflection};records=records.filter(x=>x.id!==r.id);records.push(r);records=records.slice(-1000);write(RECORDS_KEY,records);}
function saveJournal(){if(session?.view!=='result')return;session.reflection=$('#reflection')?.value.slice(0,800)??session.reflection;session.action=$('#action-plan')?.value.slice(0,300)??session.action;session.shareReflection=$('#share-reflection')?.checked??session.shareReflection;persist();ensureRecord();}
function publicRecord(r){return{version:r.version,id:r.id,choices:r.choices.map(c=>({...c})),reflection:r.shareReflection?r.reflection:'',action:r.shareReflection?r.action:'',shareReflection:r.shareReflection};}
function download(list,name){const blob=new Blob([JSON.stringify({format:STORY_VERSION,records:list.map(publicRecord)},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);}
document.addEventListener('submit',e=>{
 if(e.target.id!=='start-form')return;e.preventDefault();const role=new FormData(e.target).get('identity');if(!Object.hasOwn(ROLES,role)){toast('先选一个想体验的身份。');return;}
 session={version:STORY_VERSION,id:uid(),nickname:$('#nickname').value.trim()||'旅人',expectation:$('#expectation').value,firstRole:role,secondRole:null,round:0,scene:0,selected:null,choices:[],reflection:'',action:'',shareReflection:false,view:'draw'};persist();go('draw');if(!storageAvailable)toast('浏览器无法保存进度，请在当前页面完成后导出。');
});
document.addEventListener('input',e=>{if(['reflection','action-plan'].includes(e.target.id))saveJournal();});
document.addEventListener('change',e=>{if(e.target.id==='share-reflection')saveJournal();if(e.target.name==='identity'){selectedDraft=e.target.value;document.querySelectorAll('.role-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));}});
document.addEventListener('click',async e=>{
 const target=e.target.closest('[data-action]');if(!target||target.disabled)return;const action=target.dataset.action;
 if(action==='home'){e.preventDefault();go('home');return;}
 if(action==='setup'){selectedDraft=target.dataset.role||'';go('setup');return;}
 if(action==='resume'&&session){go(session.view);return;}
 if(action==='teacher'){go('teacher');return;}
 if(action==='teacher-tab'){teacherTab=target.dataset.tab;render();return;}
 if(action==='random'){const ids=Object.keys(ROLES),id=ids[Math.floor(Math.random()*ids.length)];selectedDraft=id;document.querySelectorAll('[name="identity"]').forEach(input=>input.checked=input.value===id);document.querySelectorAll('.role-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));toast(`这次，试试成为${ROLES[id].name}。`);return;}
 if(action==='begin'&&session?.view==='draw'){session.view='scene';persist();go('scene');return;}
 if(action==='choose'&&view==='scene'&&session.selected===null){const option=Number(target.dataset.choice);if(!Number.isInteger(option)||option<0||option>2)return;session.selected=option;session.choices.push({role:currentRole(),scene:session.scene,option});persist();render();$('#consequence').focus({preventScroll:true});$('#consequence').scrollIntoView({behavior:'smooth',block:'nearest'});return;}
 if(action==='next'&&view==='scene'&&session.selected!==null){session.selected=null;if(session.scene<SCENE_COUNT-1)session.scene++;else session.view=session.round===0?'rebirth':'result';persist();if(session.view==='result')ensureRecord();go(session.view);return;}
 if(action==='reborn'&&session?.view==='rebirth'){const role=target.dataset.role;if(!Object.hasOwn(ROLES,role)||role===session.firstRole)return;session.secondRole=role;session.round=1;session.scene=0;session.view='scene';persist();go('scene');return;}
 if(action==='save-journal'){saveJournal();toast(storageAvailable?'手记和行动计划已保存在这台设备。':'存储暂不可用，请立即导出。');return;}
 if(action==='export-own'){saveJournal();download(records.filter(r=>r.id===session.id),'另一天-清晨体验记录.json');return;}
 if(action==='export-all'){download(records,'另一天-清晨课堂汇总.json');return;}
 if(action==='import'){$('#import-file').click();return;}
 if(action==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('此浏览器暂不支持全屏，请使用浏览器全屏菜单。');}return;}
 if(action==='copy-link'){try{await navigator.clipboard.writeText(location.href.split('#')[0]);toast('游戏链接已复制，可以发给同学。');}catch{$('#share-url').focus();$('#share-url').select();toast('请复制已选中的网址。');}return;}
 if(action==='close'){$('#modal').close();return;}
 if(action==='about'){$('#modal-content').innerHTML='<span class="eyebrow">ABOUT ANOTHER DAY</span><h2>一个清晨，六种人生。</h2><p>自由选择食堂阿姨、保洁人员、辅导员、教授、讲师或图书管理员，经历五个情境，再选择另一种身份重生。共三十个情境，每局完成十次选择。</p><p>人物与故事均为虚构。每个角色有自己的连续早晨；跨角色体验展示同一校园的不同工作，不把所有职业写成同一事件。</p><p>选择会产生即时叙事反馈，结尾结合实际经历讨论人生目的、人生态度、人生价值。不提供品德排名，不把一次选择当成人格判断。</p><p>进度与手记仅存放在当前浏览器。匿名导出不含昵称或出发想法；只有主动勾选分享后才包含手记和行动计划。课堂汇总采用手动导入，不支持实时联网收集或老师同步控制。</p><p>此清晨新版使用独立的数据格式，旧版夜间故事记录不混入新版统计。没有账号、广告或分析脚本，托管服务可能按自己的政策记录访问日志。</p>';$('#modal').showModal();}
});
$('#import-file').addEventListener('change',async e=>{let added=0,duplicates=0,failed=0;for(const file of Array.from(e.target.files||[])){try{if(file.size>2000000)throw Error();const data=JSON.parse(await file.text());if(data.format!==STORY_VERSION||!Array.isArray(data.records)||data.records.length>1000||!data.records.every(validRecord))throw Error();const known=new Set(records.map(r=>r.id));const incoming=[];for(const r of data.records){if(known.has(r.id)){duplicates++;continue;}known.add(r.id);incoming.push(publicRecord(r));}if(records.length+incoming.length>1000)throw Error();records.push(...incoming);added+=incoming.length;}catch{failed++;}}write(RECORDS_KEY,records);e.target.value='';teacherTab='stats';go('teacher');toast(`导入 ${added} 条，重复 ${duplicates} 条${failed?`；${failed} 个文件未导入，请检查是否为清晨新版记录或已达1000条上限`:''}${storageAvailable?'':'；存储不可用，请导出备份'}`);});
render();
