const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const config=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
if(Object.keys(config).some(key=>!['siteUrl','repositoryUrl'].includes(key)))throw new Error('Public config accepts only project URLs; identity and secret fields are not allowed.');
config.built=true;
if(process.env.SITE_URL)config.siteUrl=process.env.SITE_URL;
if(process.env.GITHUB_REPOSITORY)config.repositoryUrl='https://github.com/'+process.env.GITHUB_REPOSITORY;
for(const key of ['siteUrl','repositoryUrl'])if(config[key]){const u=new URL(config[key]);if(u.protocol!=='https:')throw new Error(key+' must use HTTPS');}
if(config.siteUrl)config.siteUrl=config.siteUrl.replace(/\/$/,'');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(path.join(out,'experiments'),{recursive:true});
for(const file of ['style.css','curriculum.js','translations.js','i18n.js','app.js','launch.js'])fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
fs.writeFileSync(path.join(out,'config.js'),'const SITE = '+JSON.stringify(config,null,2)+';\n');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Content versions keep deployed pages from reusing stale scripts or styles.
const crypto=require('node:crypto');
const template=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/(src|href)="([^"]+\.(?:js|css))"/g,(_,attr,file)=>{
 const version=crypto.createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex').slice(0,12);
 return `${attr}="${file}?v=${version}"`;
});
const pages=[
 {file:'index.html',title:'AI Infra Lab — Build AI systems intuition',desc:'Interactive AI infrastructure experiments for software engineers. No GPU, setup, or sign-up.',image:'social-home.png'},
 {file:'experiments/kv-cache.html',id:2,title:'The model fits. Does the conversation? — AI Infra Lab',desc:'Adjust context and concurrency. Watch KV cache consume GPU memory in this interactive teaching model.',image:'social-kv.png'},
 {file:'experiments/continuous-batching.html',id:7,title:'Why is this GPU slot waiting? — AI Infra Lab',desc:'Compare static and continuous batching. See how six requests share two decode slots.',image:'social-batch.png'},
 {file:'experiments/speculative-decoding.html',id:8,title:'More guesses. Always faster? — AI Infra Lab',desc:'Explore the tradeoff between acceptance rate and draft cost in speculative decoding.',image:'social-spec.png'}
];
for(const page of pages){
 let html=template.replace(/<title>.*?<\/title>/,`<title>${escape(page.title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(page.desc)}">`);
 if(page.id!==undefined)html=html.replace('<head>','<head><base href="../">').replace('<body>',`<body data-lesson="${page.id}">`);
 let tags=`<meta property="og:type" content="website"><meta property="og:site_name" content="AI Infra Lab"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.desc)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(page.title)}"><meta name="twitter:description" content="${escape(page.desc)}">`;
 if(config.siteUrl){const url=config.siteUrl+'/'+(page.file==='index.html'?'':page.file),image=config.siteUrl+'/assets/'+page.image+'?v='+crypto.createHash('sha256').update(fs.readFileSync(path.join(out,'assets',page.image))).digest('hex').slice(0,12);tags+=`<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(page.title)}"><meta name="twitter:image" content="${escape(image)}">`;}
 html=html.replace('</head>',tags+'</head>');fs.writeFileSync(path.join(out,page.file),html);
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
fs.writeFileSync(path.join(out,'404.html'),'<html lang="en"><meta charset="utf-8"><title>Not found — AI Infra Lab</title><h1>This experiment could not be found.</h1><p>Return to AI Infra Lab using your browser’s back button.</p></html>');
console.log('Built dist/ with '+pages.length+' entry pages.'+(config.siteUrl?' Canonical base: '+config.siteUrl:' Public URL not configured; canonical and image URLs omitted.'));
