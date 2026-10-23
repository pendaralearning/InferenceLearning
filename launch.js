/* Public entry points and sharing. Notes and progress never enter shared URLs. */
const copy=(zh,en)=>lang==='zh'?zh:en;
const FEATURED=[
  {id:2,slug:'kv-cache',name:'KV cache',zh:'模型放得下，对话呢？',en:'The model fits. Does the conversation?',descZh:'拉长上下文，看看显存去哪了。',descEn:'Grow the context. Watch memory disappear.',tag:'MEMORY'},
  {id:7,slug:'continuous-batching',name:'Continuous batching',zh:'空着的 GPU 槽位，在等谁？',en:'Why is this GPU slot waiting?',descZh:'换一种调度方式，让空槽接住下一个请求。',descEn:'Change the scheduler. Put idle slots back to work.',tag:'SCHEDULING'},
  {id:8,slug:'speculative-decoding',name:'Speculative decoding',zh:'多猜几个 token，一定更快？',en:'More guesses. Always faster?',descZh:'找到草拟成本超过收益的那个拐点。',descEn:'Find the point where drafting costs more than it saves.',tag:'LATENCY'}
];
const PARAM_RULES={
 phase:{prompt:[256,8192,256],output:[1,512,1]},roof:{batch:[1,256,1],bw:[500,3000,100],compute:[40,240,20]},
 kv:{context:[512,16384,512],batch:[1,16,1],capacity:{values:[24,48,80]}},gqa:{heads:{values:[32,8,4,1]},context:[512,16384,512]},
 pages:{used:[32,2048,4],block:{values:[8,16,64,128]},mode:{values:['reserved','paged']}},flash:{n:{values:[512,1024,2048,4096,8192]},tile:{values:[32,64,128]}},
 quant:{bits:{values:[16,8,4]},value:[-4,4,.05]},batch:{policy:{values:['static','continuous']},long:[8,20,1]},
 spec:{alpha:[0,100,5],k:[1,8,1],draft:[1,30,1]},parallel:{mode:{values:['TP','PP','DP']},gpus:{values:[1,2,4,8]},bits:{values:[16,8,4]}},
 training:{algorithm:{values:['SFT','DPO','PPO','GRPO']},fraction:[0,100,5],speed:[1,5,.25]},
 capstone:{heads:{values:[32,8,4]},bits:{values:[16,8,4]},batch:[1,32,1],context:{values:[4096,8192,16384]}}
};
function readParams(type,search){
 const p=defaults(type),values=new URLSearchParams(search);
 for(const [key,rule] of Object.entries(PARAM_RULES[type])){
  const raw=values.get(key);if(raw===null||raw.trim()==='')continue;
  if(!Array.isArray(rule)){const valid=rule.values.find(v=>String(v)===raw);if(valid!==undefined)p[key]=valid;}
  else {const value=Number(raw),[min,max,step]=rule;if(Number.isFinite(value)&&value>=min&&value<=max&&Math.abs((value-min)/step-Math.round((value-min)/step))<1e-7)p[key]=value;}
 }
 return p;
}
function encodedParams(type,p){const q=new URLSearchParams();for(const key of Object.keys(PARAM_RULES[type]))q.set(key,p[key]);return q.toString();}
function canComplete(){if(!passed)return false;if(lessonId!==11)return true;const p=params;return p.batch>=16&&p.context>=8192&&7e9*p.bits/8/(2**30)+2*32*p.heads*128*p.context*p.batch*2/(2**30)+4.8<=48;}
let quickParams={context:8192,batch:1,capacity:24};
function home(){return `
<section class="launch-hero">
 <div class="launch-intro"><div class="eyebrow"><span class="dot"></span> FOR SOFTWARE ENGINEERS</div>
 <h1>${copy('用实验，理解','Build intuition for')}<br><em>AI systems.</em></h1>
 <p>${copy('你懂缓存、队列和分布式系统。现在，看看这些直觉如何迁移到 LLM 推理。','You know caches, queues, and distributed systems. See how that intuition carries over to LLM inference.')}</p>
 <div class="launch-promise">${copy('无需 GPU · 无需安装 · 无需注册','No GPU. No setup. No sign-up.')}</div>
 <a class="btn primary" href="#lesson/2">${copy('深入显存实验 ↗','Explore the memory lab ↗')}</a>
 <a class="launch-secondary" href="#labs">${copy('浏览全部 12 个实验 →','Browse all 12 experiments →')}</a>
 <div class="author-line">${copy('中英双语 · 浏览器内实验','Bilingual · Browser-based experiments')}</div></div>
 <section class="quick-lab" aria-label="${copy('即时显存实验','Quick memory experiment')}">
  <div class="quick-top"><span>01 / TRY IT IN 30 SECONDS</span><span class="live-dot">${copy('可交互','INTERACTIVE')}</span></div>
  <h2>${copy('模型放得下。对话呢？','The model fits.<br> Does the conversation?')}</h2>
  <p>${copy('7B 模型 · FP16 · 24 GiB GPU','7B model · FP16 · 24 GiB GPU')}</p>
  <div class="quick-controls">
   <label for="quick-context">${copy('上下文长度','Context length')}<output id="quick-context-value"></output></label><input id="quick-context" type="range" min="512" max="16384" step="512" value="${quickParams.context}">
   <label for="quick-batch">${copy('并发序列','Concurrent sequences')}<output id="quick-batch-value"></output></label><input id="quick-batch" type="range" min="1" max="16" step="1" value="${quickParams.batch}">
  </div><div id="quick-output" aria-live="polite"></div>
  <div class="quick-hint">${copy('试试把并发从 1 调到 3。','Try moving concurrency from 1 to 3.')}</div>
  <button class="text-button" id="quick-open">${copy('带着这些参数深入实验 →','Open the full lab with these parameters →')}</button>
  <small>${copy('教学模型：32 层、32 KV heads、128 head dim；FP16 KV；预留 10% 显存。不模拟吞吐或延迟。','Teaching model: 32 layers, 32 KV heads, head dim 128, FP16 KV, 10% memory reserve. No throughput or latency prediction.')}</small>
 </section>
</section>
<section class="featured-section"><div class="section-heading"><div><div class="eyebrow">THREE QUESTIONS. THREE EXPERIMENTS.</div><h2>${copy('从一个让你好奇的问题开始。','Start with a question that bothers you.')}</h2></div><span class="small-muted">${copy('随时进入，按自己的节奏探索','Jump in. Explore at your own pace.')}</span></div>
<div class="featured-grid">${FEATURED.map((f,i)=>`<a class="featured-card" href="#lesson/${f.id}"><div class="card-top"><span>0${i+1} / ${f.tag}</span><span>↗</span></div><h3>${copy(f.zh,f.en)}</h3><p>${copy(f.descZh,f.descEn)}</p><div class="featured-bottom">${f.name}<span>→</span></div></a>`).join('')}</div></section>
<section class="learning-strip"><div><div class="eyebrow">GO FROM INTUITION TO ENGINEERING JUDGMENT</div><h2>${copy('12 个实验，一条学习路线。','12 experiments. One learning path.')}</h2><p>${copy('显存 → 数据搬运 → 调度 → 多 GPU → 容量规划。每节都有公式、假设、知识检验和私人笔记。','Memory → data movement → scheduling → multiple GPUs → capacity planning. Each lesson includes formulas, assumptions, a knowledge check, and private notes.')}</p></div><a class="btn" href="#lesson/${nextLesson()}">${state.done.length?copy('继续学习 →','Continue learning →'):copy('从基础开始 →','Start with the foundations →')}</a></section>
<div class="path-grid compact-path">${MODULES.map((m,i)=>`<button class="path-card" data-module="${i}"><span class="module-index">0${i+1}</span><h3>${m.title}</h3><p>${m.desc}</p><span class="small-muted">${m.ids.filter(id=>state.done.includes(id)).length}/2 ${copy('已完成','complete')} →</span></button>`).join('')}</div>
<section class="public-note"><p>${copy('这些实验帮助你建立直觉；它们不是实测 benchmark。真实系统仍需要 profiling、压测与质量评估。','These experiments build intuition. They are teaching simulations, not measured benchmarks. Real systems still need profiling, load testing, and quality evaluation.')}</p><a href="#resources">${copy('项目、来源与纠错 →','About, sources & corrections →')}</a></section>`;}
function updateQuick(){
 const kv=2*32*32*128*quickParams.context*quickParams.batch*2/(2**30),w=14e9/(2**30),reserve=2.4,total=w+kv+reserve,fit=total<=24;
 $('#quick-context-value').textContent=quickParams.context.toLocaleString()+' tokens';$('#quick-batch-value').textContent=quickParams.batch;
 $('#quick-output').innerHTML=`<div class="quick-result"><div><strong>${kv.toFixed(2)}<small> GiB</small></strong><span>KV CACHE</span></div><div class="fit-state ${fit?'':'over'}">${fit?copy('容量可行','Fits in memory'):copy('容量超限','Over capacity')}<small>${total.toFixed(2)} / 24 GiB</small></div></div><div class="memory-stack" role="img" aria-label="${copy('权重','Weights')} ${w.toFixed(2)} GiB, KV ${kv.toFixed(2)} GiB, ${copy('预留','reserve')} 2.4 GiB"><i style="width:${w/24*100}%"></i><i style="width:${kv/24*100}%"></i><i style="width:10%"></i></div><div class="memory-key"><span>■ ${copy('权重','Weights')} 13.04</span><span>■ KV ${kv.toFixed(2)}</span><span>■ ${copy('预留','Reserve')} 2.40 GiB</span></div>`;
}
function shareControls(){return `<div class="share-controls"><span>${copy('把这次发现分享出去','Share what you discovered')}</span><div><button class="btn" id="copy-link">${copy('复制参数链接','Copy experiment link')}</button><button class="btn" id="download-card">${copy('下载结果卡片 ↓','Download result card ↓')}</button><button class="text-button" id="report-issue">${copy('发现问题？','Found an issue?')}</button></div></div>`;}
function publicBase(){
 if(SITE.siteUrl)return new URL(SITE.siteUrl.replace(/\/$/,'')+'/');
 return new URL('.',document.baseURI||location.href);
}
function experimentUrl(id,p){
 const f=FEATURED.find(f=>f.id===id),url=new URL(f&&SITE.built?'experiments/'+f.slug+'.html':'index.html',publicBase());
 url.searchParams.set('lang',lang);url.hash='lesson/'+id+'?'+encodedParams(LESSONS[id].type,p);return url.href;
}
function isPublicUrl(url){try{const u=new URL(url);return /^https?:$/.test(u.protocol)&&!['localhost','127.0.0.1','[::1]'].includes(u.hostname)}catch{return false}}
async function copyLink(){const url=experimentUrl(lessonId,params);try{await navigator.clipboard.writeText(url);toast(isPublicUrl(url)?copy('参数链接已复制','Experiment link copied'):copy('本地预览链接已复制；上线后才能对外分享','Local preview link copied; publish before sharing publicly'));}catch{showCopyDialog(copy('复制实验链接','Copy experiment link'),url)}}
function showCopyDialog(title,value){
 let dialog=$('#share-dialog');if(dialog)dialog.remove();dialog=document.createElement('dialog');dialog.id='share-dialog';dialog.className='share-dialog';dialog.innerHTML=`<form method="dialog"><h2>${esc(title)}</h2><textarea readonly aria-label="${esc(title)}">${esc(value)}</textarea><button class="btn primary">${copy('关闭','Close')}</button></form>`;document.body.append(dialog);dialog.showModal();dialog.querySelector('textarea').select();
}
function reportIssue(){
 const report=`Experiment: ${LESSONS[lessonId].en}\nParameters: ${encodedParams(LESSONS[lessonId].type,params)}\nLink: ${experimentUrl(lessonId,params)}\n\nExpected:\n\nObserved:\n\nSource / reference:\n`;
 if(SITE.repositoryUrl){const url=new URL(SITE.repositoryUrl.replace(/\/$/,'')+'/issues/new');url.searchParams.set('title','Content correction: '+LESSONS[lessonId].en);url.searchParams.set('body',report);window.open(url.href,'_blank','noopener,noreferrer');}
 else showCopyDialog(copy('复制纠错信息','Copy correction details'),report);
}
function aboutBlock(){return `<section class="about-block"><div><div class="eyebrow">ABOUT INFRA LAB</div><h2>${copy('把系统知识变成能动手的实验。','Make systems concepts tangible.')}</h2><p>${copy('Infra Lab 是面向软件工程师的 AI 基础设施学习项目。用熟悉的工程概念作桥梁，通过调参、观察和检验建立直觉。','Infra Lab is an AI infrastructure learning project for software engineers. Familiar engineering concepts bridge the gap: change a parameter, observe the result, test your understanding.')}</p><p>${copy('进度和笔记只保存在此浏览器。分享链接只包含实验参数与语言，不包含笔记。本站不嵌入分析追踪；托管服务可能记录访问日志。字体随站点提供，阅读外部论文需点击链接。','Progress and notes stay in this browser. Shared links include settings and language, never notes. No analytics are embedded; the hosting service may keep access logs. Fonts are served with the site. External papers open only when you follow their links.')}</p></div><div><h3>${copy('发现错误或有建议？','Found a mistake or have an idea?')}</h3><p>${copy('在实验中选择“发现问题？”，即可生成包含参数的纠错信息。','Use “Found an issue?” inside an experiment to prepare a correction with its parameters.')}</p>${SITE.repositoryUrl?`<a class="btn" href="${esc(SITE.repositoryUrl)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`:''}<a class="concept" href="assets/THIRD_PARTY_NOTICES.txt">${copy('素材来源与字体许可 ↗','Asset sources & font licenses ↗')}</a></div></section>`;}
function bindLaunch(){
 const skip=$('.skip-link');if(skip)skip.onclick=e=>{e.preventDefault();$('#main-content').focus();$('#main-content').scrollIntoView();};
 if(active==='home'){
  for(const key of ['context','batch'])$('#quick-'+key).oninput=e=>{quickParams[key]=Number(e.target.value);updateQuick()};
  $('#quick-open').onclick=()=>go('lesson/2?'+encodedParams('kv',quickParams));updateQuick();
 }
 if(active==='lesson'){$('#copy-link').onclick=copyLink;$('#download-card').onclick=downloadCard;$('#report-issue').onclick=reportIssue;}
 if(active==='resources'){$('.content').insertAdjacentHTML('afterbegin',aboutBlock());}
}
function wrapCanvas(ctx,text,x,y,maxWidth,lineHeight,maxLines=6){
 let line='',lines=0;const words=lang==='zh'?Array.from(text):text.split(' ');const gap=lang==='zh'?'':' ';
 for(const word of words){const candidate=line?line+gap+word:word;if(ctx.measureText(candidate).width>maxWidth&&line){ctx.fillText(line,x,y);y+=lineHeight;lines++;line=word;if(lines>=maxLines-1){break}}else line=candidate;}
 ctx.fillText(line,x,y);return y+lineHeight;
}
async function downloadCard(){
 try{
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#191f1c';ctx.fillRect(0,0,1200,675);ctx.fillStyle='#b6d5a1';ctx.font='20px "DM Sans", sans-serif';ctx.fillText('INFRA LAB / '+LESSONS[lessonId].en.toUpperCase(),54,56);
  ctx.fillStyle='#fffefa';ctx.font='bold 38px "DM Sans", sans-serif';wrapCanvas(ctx,LESSONS[lessonId].title,54,120,1092,46,2);
  ctx.fillStyle='#bdc8b5';ctx.font='19px monospace';wrapCanvas(ctx,encodedParams(LESSONS[lessonId].type,params).replaceAll('&','  ·  '),54,215,1092,28,2);
  const resultNodes=Array.from(document.querySelectorAll('#lab-output .result'));
  resultNodes.slice(0,3).forEach((node,i)=>{const x=54+i*368;ctx.fillStyle='#b6d5a1';ctx.font='bold 39px "DM Sans", sans-serif';ctx.fillText(node.querySelector('b').textContent,x,330,340);ctx.fillStyle='#bdc8b5';ctx.font='18px "DM Sans", sans-serif';wrapCanvas(ctx,node.querySelector('span').textContent,x,367,330,24,2);});
  ctx.fillStyle='#fffefa';ctx.font='23px "DM Sans", sans-serif';wrapCanvas(ctx,$('#lab-output .lab-insight').textContent,54,440,1092,33,3);
  ctx.fillStyle='#dfaf8e';ctx.font='17px "DM Sans", sans-serif';ctx.fillText(copy('教学模拟 · 非实测 benchmark · 公式和假设见实验页面','Teaching simulation · Not a measured benchmark · See lab for assumptions'),54,585);
  ctx.fillStyle='#9eac92';ctx.font='17px "DM Sans", sans-serif';const base=publicBase();ctx.fillText('Infra Lab  /  '+(isPublicUrl(base.href)?base.host+base.pathname:copy('本地预览','Local preview')),54,627,1092);
  canvas.toBlob(blob=>{if(!blob){toast(copy('无法生成卡片，请重试','Could not create card. Please retry.'));return}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='infra-lab-'+LESSONS[lessonId].type+'-'+lang+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);toast(copy('结果卡片已下载','Result card downloaded'));},'image/png');
 }catch{toast(copy('无法生成卡片，请重试','Could not create card. Please retry.'))}
}
