import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('/build/campus-portrait-gpt6-astra-pro-mcp-colabdev'),port=4196;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.glb':'model/gltf-binary','.zip':'application/zip','.gz':'application/gzip','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end('Method not allowed');}
 let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(url==='/')url='/index.html';
 if(url.split('/').some(s=>s.startsWith('.'))){res.writeHead(403);return res.end('Forbidden');}
 const file=path.resolve(root,'.'+url);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
 const info=await fsp.stat(file);if(!info.isFile()){res.writeHead(404);return res.end('Not found');}
 const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':info.size,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':url.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-store'};
 res.writeHead(200,headers);if(req.method==='HEAD')return res.end();fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:400,{'Content-Type':'text/plain'});res.end(e.code==='ENOENT'?'Not found':'Invalid request');}});
server.listen(port,'0.0.0.0',()=>console.log(`Project-only static preview: http://127.0.0.1:${port}`));
process.on('SIGTERM',()=>server.close());
