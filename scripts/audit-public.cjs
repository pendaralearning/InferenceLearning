/* Release check for common private-data leaks and unexpected runtime dependencies. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const patterns=[
 ['private document URL',/https?:\/\/(?:docs|drive)[.]google[.]com/i],
 ['local home path',/(?:[/]Users[/]|[/]home[/]|[A-Z]:\\Users\\)/],
 ['personal email',/[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}/i],
 ['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
 ['credential',/\b(?:ghp_[a-zA-Z0-9]{30,}|github_pat_[a-zA-Z0-9_]{50,}|sk-[a-zA-Z0-9_-]{30,})\b/]
];
const issues=[];let count=0;
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,e.name),rel=path.relative(root,file);
 if(['.git','node_modules'].includes(e.name))continue;
 if(e.isDirectory()){walk(file);continue;}
 if(!/\.(?:js|cjs|json|md|txt|html|css|yml|py)$/.test(e.name))continue;
 // Third-party OFL documents contain their authors' public copyright contacts.
 if(rel.includes('assets/fonts/'))continue;
 const s=fs.readFileSync(file,'utf8');count++;
 for(const [label,re] of patterns)if(re.test(s))issues.push(`${rel}: ${label}`);
}}
walk(root);
const config=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
if(Object.keys(config).some(k=>!['siteUrl','repositoryUrl'].includes(k)))issues.push('Unexpected public identity/config field');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
if(/@import|https?:\/\//.test(css))issues.push('Runtime stylesheet has an external request');
for(const name of ['app.js','launch.js','i18n.js']){
 const s=fs.readFileSync(path.join(root,name),'utf8');
 if(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(s))issues.push(name+': unexpected network API');
}
if(issues.length){console.error(issues.join('\n'));process.exit(1);}
console.log(`Public-data checks passed for ${count} text files. Image pixels and public account metadata require the separate release review.`);
