const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

function app(saved = {}, search = '') {
  const storage = new Map(Object.entries(saved));
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', textContent: '', content: '', disabled: false,
      classList: { add() {}, remove() {} }, focus() {},
    });
    return elements.get(selector);
  };
  const context = vm.createContext({
    URL, URLSearchParams, Blob, console, setTimeout: () => {},
    location: { hash: '#home', search, href: 'http://localhost/' + search + '#home' },
    history: { replaceState() {} },
    window: { scrollY: 0, scrollTo() {}, addEventListener() {} },
    document: { baseURI:'http://localhost/', body:{dataset:{}}, documentElement: {}, querySelector: element, querySelectorAll: () => [] },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  });
  for (const file of ['curriculum.js', 'translations.js', 'i18n.js', 'config.js', 'launch.js', 'app.js']) {
    let source = fs.readFileSync(path.join(root, file), 'utf8');
    if (file === 'app.js') source = source.replace("window.addEventListener('hashchange',route);route();", '');
    vm.runInContext(source, context, { filename: file });
  }
  return { run: source => vm.runInContext(source, context), storage, elements };
}
const cjk = /[\u3400-\u9fff]/;

test('English covers every lesson field and preserves IDs, answers and references', () => {
  const a = app({}, '?lang=en');
  assert.equal(a.run('LESSONS.length'), 12);
  assert.equal(a.run('MODULES.length'), 6);
  assert.ok(!cjk.test(a.run('JSON.stringify([MODULES, LESSONS])')));
  assert.equal(a.run('LESSONS.every((l,i)=>l.type===LESSONS_ZH[i].type && l.correct===LESSONS_ZH[i].correct && l.source===LESSONS_ZH[i].source)'), true);
});

test('English views, controls and alternate experiment branches have no untranslated Chinese', () => {
  const a = app({}, '?lang=en');
  for (const view of ['home()', 'labs()', 'notebook()', 'resources()']) {
    assert.ok(!cjk.test(a.run(view)), view);
  }
  for (let i = 0; i < 12; i++) {
    a.run(`lessonId=${i}; params=defaults(LESSONS[lessonId].type)`);
    assert.ok(!cjk.test(a.run('lesson()')), 'lesson ' + i);
    assert.ok(!cjk.test(a.run('calculate(LESSONS[lessonId].type,params)')), 'output ' + i);
  }
  const branches = {
    roof: [{batch:256,bw:3000,compute:40}],
    kv: [{context:16384,batch:16,capacity:24}],
    gqa: [{heads:32,context:8192},{heads:1,context:8192}],
    pages: [{used:500,block:128,mode:'reserved'}],
    spec: [{alpha:0,k:8,draft:30},{alpha:100,k:8,draft:1}],
    parallel: ['TP','PP','DP'].map(mode=>({mode,gpus:1,bits:16})),
    training: ['SFT','DPO','PPO','GRPO'].map(algorithm=>({algorithm,fraction:70,speed:2})),
    capstone: [{heads:8,bits:16,batch:16,context:8192},{heads:8,bits:4,batch:1,context:4096}],
  };
  for (const [type, variants] of Object.entries(branches)) for (const p of variants) {
    const html = a.run(`calculate('${type}',${JSON.stringify(p)})`);
    assert.ok(!cjk.test(html), type);
    assert.ok(!/NaN|Infinity|undefined/.test(html), type);
  }
});

test('Language switching preserves parameters, quiz state, progress and original notes', () => {
  const a = app({}, '?lang=zh');
  a.run("active='lesson';lessonId=2;params={context:8192,batch:8,capacity:48};answer=0;passed=true;state.done=[2];state.notes={2:'我的笔记 / my own notes'};save();setLanguage('en')");
  assert.equal(a.run('params.batch'), 8);
  assert.equal(a.run('answer'), 0);
  assert.equal(a.run('passed'), true);
  assert.equal(a.run('state.notes[2]'), '我的笔记 / my own notes');
  assert.equal(a.run('state.done[0]'), 2);
  assert.equal(a.storage.get('infra-lab-language'), 'en');
  assert.equal(a.run('document.documentElement.lang'), 'en');
  a.run("setLanguage('zh')");
  assert.equal(a.run('LESSONS[2].title'), '长对话吃掉了多少显存？');
  assert.equal(a.run('params.batch'), 8);
  assert.equal(a.run('document.documentElement.lang'), 'zh-CN');
});

test('Preference persists; explicit locale links override it; invalid values are ignored', () => {
  assert.equal(app({'infra-lab-language':'en'}).run('lang'), 'en');
  assert.equal(app({'infra-lab-language':'en'}, '?lang=zh').run('lang'), 'zh');
  assert.equal(app({'infra-lab-language':'invalid'}, '?lang=bad').run('lang'), 'en');
});

test('Core numerical results are unchanged in both languages', () => {
  for (const lang of ['en','zh']) {
    const a = app({}, '?lang=' + lang);
    for (const [type, expected] of [['kv','4.00 GiB'],['gqa','1.00 GiB'],['training','1.54×']]) {
      assert.ok(a.run(`calculate('${type}',defaults('${type}'))`).includes(expected));
    }
    assert.ok(a.run("calculate('spec',{alpha:0,k:4,draft:30})").includes('0.29×'));
    assert.ok(a.run("calculate('capstone',{heads:8,bits:16,batch:16,context:8192})").includes(a.run("t('目标达成')")));
    assert.ok(a.run("calculate('capstone',{heads:8,bits:16,batch:1,context:4096})").includes(a.run("t('负载未达标')")));
  }
});


test('Share links round-trip parameters for all lessons, never notes or progress', () => {
 const a=app({},'?lang=en');
 a.run("state.notes={2:'PRIVATE_NOTE'};state.done=[2]");
 for(let i=0;i<12;i++){
  const url=a.run(`experimentUrl(${i},defaults(LESSONS[${i}].type))`);
  assert.ok(!url.includes('PRIVATE_NOTE'));assert.ok(url.includes('lang=en'));
  const hash=new URL(url).hash.slice(1).split('?')[1];
  assert.equal(a.run(`JSON.stringify(readParams(LESSONS[${i}].type,${JSON.stringify(hash)}))`),a.run(`JSON.stringify(defaults(LESSONS[${i}].type))`));
 }
 assert.equal(a.run("readParams('kv','batch=Infinity&context=-1&capacity=25').batch"),1);
 assert.equal(a.run("readParams('kv','batch=2.5&context=513&capacity=80').context"),8192);
 assert.equal(a.run("readParams('kv','batch=3&context=16384&capacity=80').capacity"),80);
 assert.equal(a.run("readParams('batch','policy=<script>').policy"),'continuous');
});

test('Capstone completion requires the quiz AND the original capacity/load goal',()=>{
 const a=app();a.run("lessonId=11;passed=true;params=defaults('capstone')");
 assert.equal(a.run('canComplete()'),false);
 a.run('params.heads=8');assert.equal(a.run('canComplete()'),true);
 a.run('params.batch=1');assert.equal(a.run('canComplete()'),false);
 a.run('params.batch=16;passed=false');assert.equal(a.run('canComplete()'),false);
});

test('Nonempty notes render safely in both languages',()=>{
 const a=app();a.run("state.notes={2:'<script>alert(1)</script> 中文 notes'}");
 assert.ok(a.run('notebook()').includes('&lt;script&gt;'));
 a.run("lang='zh';refreshLanguage()");assert.ok(a.run('notebook()').includes('中文 notes'));
});

test('First-token accounting: one output needs no subsequent decode; each extra token adds one TPOT',()=>{
 const a=app({},'?lang=en');
 const one=a.run("calculate('phase',{prompt:2048,output:1})");
 assert.ok(one.includes('122.9 ms'));assert.ok(one.includes('0.12 s'));assert.ok(one.includes('<b>N/A</b>'));
 assert.ok(one.includes('0.0 ms'));assert.ok(!one.includes('<b>10 ms</b>'));
 const standard=a.run("calculate('phase',{prompt:2048,output:128})");
 assert.ok(standard.includes('1.39 s'));assert.ok(standard.includes('1270.0 ms'));
 assert.equal(a.run("readParams('phase','output=1').output"),1);
});

test('Independent numerical fixtures cover all twelve teaching models',()=>{
 const a=app({},'?lang=en');
 const fixtures=[
  ['roof',{batch:1,bw:1500,compute:120},['9.33 ms','Memory']],
  ['roof',{batch:256,bw:1500,compute:120},['29.87 ms','Compute']],
  ['kv',{context:8192,batch:3,capacity:24},['12.00 GiB','27.44 GiB','Over capacity']],
  ['gqa',{heads:8,context:8192},['1.00 GiB','4×']],
  ['pages',{used:500,block:16,mode:'paged'},['512','2.3%','256.0 MiB']],
  ['pages',{used:500,block:16,mode:'reserved'},['2048','75.6%','1024.0 MiB']],
  ['flash',{n:2048,tile:64},['8.0 MiB','8.0 KiB','1024']],
  ['quant',{bits:4,value:4},['3.26 GiB','4.0000','0.00000']],
  ['batch',{policy:'static',long:12},['22 steps','68.2%']],
  ['batch',{policy:'continuous',long:12},['15 steps','100.0%']],
  ['spec',{alpha:100,k:4,draft:10},['5.00','2.78×']],
  ['spec',{alpha:0,k:4,draft:10},['1.00','0.56×']],
  ['parallel',{mode:'TP',gpus:4,bits:16},['32.6 GiB']],
  ['parallel',{mode:'DP',gpus:4,bits:16},['130.4 GiB']],
  ['training',{algorithm:'GRPO',fraction:70,speed:2},['1.54×','35.0%']],
  ['capstone',{heads:8,bits:16,batch:16,context:8192},['33.84 GiB','16.00 GiB','Goal met']],
 ];
 for(const [type,p,expected] of fixtures){const html=a.run(`calculate('${type}',${JSON.stringify(p)})`);for(const value of expected)assert.ok(html.includes(value),`${type}: ${value}`);}
});

test('Scheduling preserves every request and never improves utilization beyond 100%',()=>{
 const a=app();
 for(let n=8;n<=20;n++)for(const policy of ['static','continuous']){
  const sim=JSON.parse(a.run(`JSON.stringify(schedule('${policy}',${n}))`));
  const flat=sim.rows.flat(),lengths=[3,n,4,2,6,3];
  lengths.forEach((len,i)=>assert.equal(flat.filter(id=>id===i+1).length,len));
  assert.equal(sim.work,n+18); // 3 + n + 4 + 2 + 6 + 3 = n + 18
  assert.ok(sim.work<=2*sim.steps);
  if(policy==='static')assert.equal(sim.steps,n+10);
 }
});
