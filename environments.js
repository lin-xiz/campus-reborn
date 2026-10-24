'use strict';
// Original vector environments. Every role has its own workplace; evening scenes
// show the transition into personal life, instead of implying a 14-hour shift.
function environment(role,index=0){
 const hour=Number(SCENES[role][index].time.slice(0,2)),night=hour>=21,dusk=hour>=18;
 const sky=night?'#334b68':dusk?'#efb08f':hour>=12?'#bed9d6':'#f0dcae';
 const wall=night?'#b2ada0':'#eee6d5',wood='#a78562',ink='#5d7469',light='#fff2c7';
 const rect=(x,y,w,h,fill,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
 const line=(d,color=ink,width=3)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const books=(x,y,n=8)=>Array.from({length:n},(_,i)=>rect(x+i*17,y-(i%3)*5,12,40+(i%3)*5,['#b87963','#8eaa95','#dfb975','#849eab'][i%4],2)).join('');
 const plant=(x,y)=>`<g transform="translate(${x} ${y})">${line('M0 0v-78','#7d9173',4)}<g fill="#779a83"><ellipse cx="-15" cy="-70" rx="24" ry="10" transform="rotate(25 -15 -70)"/><ellipse cx="16" cy="-52" rx="25" ry="11" transform="rotate(-32 16 -52)"/><ellipse cx="-14" cy="-32" rx="22" ry="10" transform="rotate(25 -14 -32)"/></g><path d="M-22-7h44l-7 41h-30Z" fill="#c49b72"/></g>`;
 const windowArt=`${rect(570,40,310,159,'#faf3df',5)}${rect(578,48,294,143,sky)}${night?'<circle cx="823" cy="78" r="17" fill="#fff2c3"/><circle cx="830" cy="72" r="16" fill="#334b68"/>':'<circle cx="813" cy="89" r="29" fill="#fff2c5"/>'}<path d="M578 167q42-37 86-10 39-52 86-10 63-42 122-10v54H578Z" fill="${night?'#526b70':'#a4b79b'}"/>${rect(662,119,71,72,night?'#69777a':'#c0bda3')}${rect(647,113,100,9,'#8a9c8c')}${[0,1,2].map(i=>rect(673+i*18,132,9,17,night?light:'#e7e4c9')).join('')}${line('M730 44v147M573 122h304','#faf3df',7)}`;
 const frame=(x,y,w,h,label)=>`${rect(x,y,w,h,'#fcf7e9',5)}${rect(x+6,y+6,w-12,h-12,'#d7dfcd',3)}<text x="${x+w/2}" y="${y+h/2+5}" text-anchor="middle" fill="${ink}" font-size="15" letter-spacing="3">${label}</text>`;
 const room=`${rect(0,0,960,320,wall)}${rect(0,231,960,89,night?'#8c8f80':'#cabd9f')}${line('M0 231h960','#b3b29b',2)}${windowArt}`;
 const desk=`${rect(390,217,470,19,wood,5)}${rect(413,236,15,84,wood)}${rect(820,236,15,84,wood)}`;
 let scene='',label='',personX=185,personY=91;
 if(night){
  label='家中 · 一天的回望';
  scene=`${frame(60,46,220,101,'明天，继续生长')}${rect(51,216,229,68,'#8eaa97',18)}${rect(67,199,73,52,'#b4c2a4',9)}${rect(180,203,77,46,'#dfc29a',9)}${desk}${rect(550,201,130,10,'#efe9d6',3)}${line('M615 187v28','#a58c67',4)}<path d="M563 186q25-17 52-6 26-11 53 6v23q-27-13-53-4-27-9-52 4Z" fill="#fbf4dc"/>${line('M615 180v25','#b6aa8a',2)}${line('M779 217v-91h-25','#637d71',7)}<path d="m730 126 15-31h29l17 31Z" fill="#e7c179"/><path d="m731 126-40 91h134l-37-91" fill="${light}" opacity=".28"/>${plant(910,230)}`;
  personX=303;personY=101;
 }else if(dusk&&role!=='librarian'){
  label={canteen:'下班后 · 家中的晚饭',cleaner:'下班后 · 社区的傍晚',counselor:'下班后 · 生活与答疑边界',professor:'离开实验楼 · 生活的约定',lecturer:'下课后 · 自己的时间'}[role];
  scene=`${frame(62,48,238,102,role==='cleaner'?'生活，也有自己的歌':'给生活留一点时间')}${rect(53,217,231,63,'#9db098',17)}${rect(73,199,77,51,'#dac397',9)}${desk}${rect(550,205,118,10,'#e9dcc2',4)}<ellipse cx="716" cy="213" rx="32" ry="8" fill="#efe6cf"/><path d="M693 197h47q-2 24-23 24-21 0-24-24Z" fill="#c98b70"/>${books(465,177,3)}${plant(908,231)}`;
  personX=305;personY=100;
 }else if(role==='canteen'){
  label=index>=3?'第一食堂 · 收档与交接':'第一食堂 · 热气里的窗口';
  scene=`${frame(51,40,253,71,'今日供应 · 小份可选')}${rect(53,132,241,75,'#c9cdb5',5)}${rect(63,143,220,8,'#fcf7e8')}${rect(63,175,220,8,'#fcf7e8')}${rect(0,224,960,31,'#f7edd7')}${rect(0,255,960,65,'#9aaf9e')}${rect(324,165,190,59,wood,12)}${rect(319,159,200,10,'#cba56b',5)}${line('M337 177h163M337 190h163M337 203h163','#ddb980',3)}${line('M354 144q-14-16 0-29m39 29q-14-16 0-29m40 29q-14-16 0-29','#fffcf0',4)}${[0,1,2].map(i=>`<ellipse cx="${615+i*79}" cy="213" rx="33" ry="8" fill="#faf3df"/><path d="M${586+i*79} 192h58q-5 27-29 27t-29-27" fill="#c8b995"/>`).join('')}<path d="M860 224v-67q0-14 15-14t15 14" fill="none" stroke="#718e80" stroke-width="7"/>`;
  personX=190;personY=51;
 }else if(role==='cleaner'){
  label='公共教学楼 · 走廊与门厅';
  scene=`${rect(49,34,187,226,'#a3b1a2',3)}${rect(64,49,157,204,'#dbded0')}${rect(81,65,124,80,sky)}${rect(186,172,9,26,'#b09a6e',3)}${frame(275,46,207,62,'教学楼 · 请慢行')}${line('M240 231 185 320M430 231 410 320M630 231 650 320M840 231 910 320M0 283h960','#e4ddc7',2)}${rect(605,248,196,15,'#899a8e',6)}${plant(900,219)}<path d="m433 204-28 83h64l-22-83Z" fill="#e2b96d"/><path d="m433 215-18 57h44l-17-57Z" fill="#eed29c"/><text x="438" y="260" text-anchor="middle" fill="#85654e" font-size="15">!</text>${line('M523 123 487 279','#9f815d',7)}${rect(467,277,63,9,'#86a69c',3)}${rect(530,240,38,45,'#91aaa1',8)}${line('M536 242q14-29 26 0','#657e73',3)}`;
  personX=264;personY=89;
 }else if(role==='counselor'){
  label=dusk?'下班后 · 个人生活与答疑边界':'学生事务中心 · 一次认真倾听';
  scene=`${frame(44,37,265,67,dusk?'让支持持续可达':'先听一听你的需要')}${rect(56,158,158,88,'#a7b99e',15)}${rect(71,145,126,63,'#b9c6ad',13)}${desk}${rect(475,149,107,64,'#6b867c',6)}${rect(482,155,93,50,'#cee0d0',3)}${rect(518,213,20,5,ink)}${rect(678,204,73,13,'#dcaf8c',2)}${rect(683,196,73,8,'#efe7d2',2)}${plant(905,230)}${rect(798,191,27,26,'#c18b78',5)}`;
  personX=258;personY=93;
 }else if(role==='professor'&&![1,2].includes(index)){
  label='实验楼 · 研究与求证';
  scene=`${rect(43,33,307,132,'#668074',4)}${line('M70 134h247M76 133V57M92 119l37-13 32 5 36-31 35 8 44-26','#e8e3c9',2)}<circle cx="197" cy="80" r="8" fill="none" stroke="#e9bd76" stroke-width="2"/><text x="289" y="76" fill="#f3dbab" font-size="25">?</text>${rect(420,226,471,19,'#7b978c',4)}${rect(442,245,417,75,'#c1caba')}${line('M650 245v75','#9aaea2',3)}${rect(711,163,122,59,'#5e776e',5)}${rect(718,170,108,45,'#d8e3cd',2)}${line('M730 203h17l10-17 13 13 14-24 11 13 18-5','#9a9d65',3)}${line('M513 150v72m-25 0h75M511 168q50-7 39 41','#5d7469',7)}${rect(502,145,20,23,'#b0bfa9',3)}<path d="M594 169v31l-15 19h51l-17-19v-31" fill="#dee6d4" stroke="#829b8e" stroke-width="3"/><path d="m586 211-4 6h44l-6-6Z" fill="#b4bf89"/>`;
  personX=242;personY=85;
 }else if(role==='lecturer'||role==='professor'){
  label='公共教学楼 · 课堂与共同备课';
  scene=`${rect(36,28,475,151,'#ad9d73',3)}${rect(44,36,459,135,'#648275',2)}<text x="78" y="78" fill="#f1ebce" font-size="22" letter-spacing="8">从问题出发</text>${line('M79 98h184m-184 18h122M319 78h132m-132 24h95','#c5d2b8',2)}<circle cx="342" cy="139" r="14" fill="none" stroke="#e7d396" stroke-width="2"/>${line('M358 139h42m0 0-7-5m7 5-7 5','#e7d396',2)}${rect(403,218,102,80,wood)}${rect(392,208,124,13,'#b79c73',3)}${[0,1,2].map(i=>`${rect(541+i*135,248,116,12,'#b49569',4)}${rect(551+i*135,260,7,60,wood)}${rect(639+i*135,260,7,60,wood)}`).join('')}`;
  personX=218;personY=81;
 }else{
  label=dusk?'图书馆 · 晚班交接':'图书馆 · 书架与公共空间';
  scene=`${rect(39,31,345,220,wood,3)}${[0,1,2].map(i=>`${rect(50,42+i*66,323,58,'#e1d4b7')}${books(65,59+i*66,17)}`).join('')}${frame(420,43,114,52,'阅 · 共享')}${desk}${books(686,176,5)}${rect(553,200,78,15,'#a4b5a0',2)}${rect(561,192,78,8,'#faf2dd',2)}${plant(912,233)}`;
  personX=344;personY=83;
 }
 const person=portrait(role,night||(dusk&&role!=='librarian')).replace('<svg viewBox=','<svg x="'+personX+'" y="'+personY+'" width="180" height="210" viewBox=');
 return `<figure class="environment ${night?'is-night':dusk?'is-dusk':''}"><svg viewBox="0 0 960 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${ROLES[role].name}的场景：${label}">${room}${scene}${person}<path d="M0 0h960v320H0Z" fill="none" stroke="#fff8e7" stroke-opacity=".3" stroke-width="2"/></svg><figcaption><span>${night?'☾':dusk?'◒':'☀'} ${SCENES[role][index].time}</span>${label}</figcaption></figure>`;
}
