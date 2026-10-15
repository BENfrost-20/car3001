'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {basePath,sitePath,relativeSitePath} = require('./lib/site');
const root = path.resolve(__dirname,'../dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.ico':'image/x-icon'};

http.createServer((req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400).end('Richiesta non valida'); return; }
  if (basePath && (pathname==='/' || pathname===basePath)) { res.writeHead(301,{Location:sitePath('/')}).end(); return; }
  let localPath;
  try { localPath=relativeSitePath(pathname); }
  catch { res.writeHead(404).end('Pagina non trovata'); return; }
  let file = path.resolve(root,`.${localPath}`);
  if (file!==root && !file.startsWith(root+path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) { res.writeHead(301,{Location:pathname+'/'}).end(); return; }
    file = path.join(file,'index.html');
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end('Pagina non trovata'); return; }
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Anteprima: http://127.0.0.1:${process.env.PORT||4173}${sitePath('/')}`));
