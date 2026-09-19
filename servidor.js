#!/usr/bin/env node
/* servidor.js — servidor local do Órbita do Saber. Sem dependências: só Node.js.

   Um navegador não consegue gravar num arquivo .js do disco, então este servidor
   faz isso: serve o jogo e regrava o ranking.js a cada placar novo.

   Uso:
     node servidor.js                     abre em http://localhost:8080
     PORT=3000 node servidor.js           outra porta
     HOST=0.0.0.0 node servidor.js        deixa a turma acessar pela rede
   No PowerShell:  $env:PORT=3000; node servidor.js
*/
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PASTA = __dirname;
const ARQ_RANKING = path.join(PASTA, "ranking.js");
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "127.0.0.1";
const LIMITE = 10;            // posições do ranking
const MAX_CORPO = 64*1024;    // maior POST aceito, em bytes

/* Só arquivos da pasta do jogo, e só destes tipos */
const TIPOS = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".png":"image/png", ".svg":"image/svg+xml", ".ico":"image/x-icon",
  ".txt":"text/plain; charset=utf-8"
};

const CABECALHO =
`/* ranking.js — as 10 melhores partidas do Órbita do Saber.

   O jogo lê este arquivo do mesmo jeito que lê o perguntas.js. Quando o jogo é
   aberto pelo servidor (node servidor.js), cada placar novo é gravado aqui
   automaticamente, então não precisa editar à mão.
   Para zerar o ranking, deixe a lista vazia: var RANKING = [];

   Cada item: n = iniciais, s = pontos, w = onda, a = precisão %, q = provas, d = data. */
`;

/* Aceita só o formato esperado; qualquer outra coisa é descartada */
function limpar(x){
  if(!x || typeof x !== "object") return null;
  const n = String(x.n || "").toUpperCase().replace(/[^A-Z0-9]/g, "").padEnd(3, "A").slice(0, 3);
  const s = Math.floor(Number(x.s)), w = Math.floor(Number(x.w));
  if(!Number.isFinite(s) || s < 0 || s > 1e12) return null;
  if(!Number.isFinite(w) || w < 1 || w > 9999) return null;
  const a = Math.min(100, Math.max(0, Math.floor(Number(x.a)) || 0));
  const q = /^\d{1,4}\/\d{1,4}$/.test(String(x.q)) ? String(x.q) : "0/0";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(x.d)) ? String(x.d) : "";
  return { n, s, w, a, q, d };
}

const chave = r => [r.n, r.s, r.w, r.a, r.q, r.d].join("|");

/* Junta listas sem repetir, ordena por pontos e corta no limite */
function mesclar(...listas){
  const vistos = new Set(), todos = [];
  for(const lista of listas){
    for(const r of lista){
      const k = chave(r);
      if(!vistos.has(k)){ vistos.add(k); todos.push(r); }
    }
  }
  return todos.sort((x, y) => y.s - x.s).slice(0, LIMITE);
}

/* Lê o ranking.js executando-o num contexto isolado, então aceita o arquivo
   mesmo que alguém o tenha editado à mão com comentários ou vírgula sobrando */
function lerRanking(){
  try{
    const src = fs.readFileSync(ARQ_RANKING, "utf8");
    const r = vm.runInNewContext(src + "\n;typeof RANKING !== 'undefined' ? RANKING : []", {}, { timeout:1000 });
    return Array.isArray(r) ? r.map(limpar).filter(Boolean) : [];
  }catch(e){
    return [];
  }
}

/* Grava por arquivo temporário + renomear, para nunca deixar o ranking pela metade */
function gravarRanking(lista){
  const itens = lista.map(r => "  " + JSON.stringify(r)).join(",\n");
  const corpo = CABECALHO + "var RANKING = [" + (itens ? "\n" + itens + "\n" : "") + "];\n";
  const tmp = ARQ_RANKING + ".tmp";
  try{
    fs.writeFileSync(tmp, corpo, "utf8");
    fs.renameSync(tmp, ARQ_RANKING);
  }catch(e){
    try{ fs.unlinkSync(tmp); }catch(_){}
    fs.writeFileSync(ARQ_RANKING, corpo, "utf8");     // alguns sistemas de arquivos não deixam renomear por cima
  }
}

function responder(res, codigo, texto){
  res.writeHead(codigo, { "Content-Type":"text/plain; charset=utf-8" });
  res.end(texto);
}
function json(res, codigo, obj){
  res.writeHead(codigo, { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store" });
  res.end(JSON.stringify(obj));
}

function receber(req, res){
  if(!String(req.headers["content-type"] || "").startsWith("application/json"))
    return responder(res, 415, "Envie application/json");
  const origem = req.headers.origin;
  if(origem && origem !== "http://" + req.headers.host)
    return responder(res, 403, "Origem não permitida");

  let corpo = "", estourou = false;
  req.on("data", pedaco => {
    corpo += pedaco;
    if(corpo.length > MAX_CORPO){ estourou = true; responder(res, 413, "Corpo grande demais"); req.destroy(); }
  });
  req.on("end", () => {
    if(estourou) return;
    let recebido;
    try{ recebido = JSON.parse(corpo); }catch(e){ return responder(res, 400, "JSON inválido"); }
    if(!Array.isArray(recebido)) return responder(res, 400, "Esperava uma lista");
    const novos = recebido.slice(0, 50).map(limpar).filter(Boolean);
    const lista = mesclar(lerRanking(), novos);        // mescla: dois jogadores ao mesmo tempo não se apagam
    try{ gravarRanking(lista); }
    catch(e){ console.error("Falha ao gravar ranking.js:", e.message); return responder(res, 500, "Não foi possível gravar o ranking.js"); }
    json(res, 200, lista);
  });
}

function estatico(pathname, req, res){
  let nome;
  try{ nome = decodeURIComponent(pathname); }catch(e){ return responder(res, 400, "Endereço inválido"); }
  if(nome === "/") nome = "/orbita-do-saber.html";
  nome = nome.slice(1);
  // só arquivos soltos na pasta do jogo: nada de subpastas, "..", arquivos ocultos ou .git
  if(!nome || /[\\/\0]/.test(nome) || nome.startsWith(".")) return responder(res, 404, "Não encontrado");
  const tipo = TIPOS[path.extname(nome).toLowerCase()];
  if(!tipo) return responder(res, 404, "Não encontrado");
  fs.readFile(path.join(PASTA, nome), (erro, dados) => {
    if(erro) return responder(res, 404, "Não encontrado");
    res.writeHead(200, { "Content-Type":tipo, "Cache-Control":"no-store" });
    res.end(req.method === "HEAD" ? undefined : dados);
  });
}

const servidor = http.createServer((req, res) => {
  let url;
  try{ url = new URL(req.url, "http://localhost"); }catch(e){ return responder(res, 400, "Requisição inválida"); }

  if(url.pathname === "/api/ranking"){
    if(req.method === "GET") return json(res, 200, lerRanking());
    if(req.method === "POST") return receber(req, res);
    res.setHeader("Allow", "GET, POST");
    return responder(res, 405, "Método não permitido");
  }
  if(req.method !== "GET" && req.method !== "HEAD") return responder(res, 405, "Método não permitido");
  estatico(url.pathname, req, res);
});

servidor.on("error", e => {
  console.error(e.code === "EADDRINUSE"
    ? "A porta " + PORT + " já está em uso. Tente outra: PORT=3000 node servidor.js"
    : e.message);
  process.exit(1);
});

if(!fs.existsSync(ARQ_RANKING)) gravarRanking([]);
servidor.listen(PORT, HOST, () => {
  console.log("Órbita do Saber rodando em http://" + (HOST === "0.0.0.0" ? "localhost" : HOST) + ":" + PORT);
  console.log("O ranking é gravado em " + ARQ_RANKING);
  if(HOST === "0.0.0.0") console.log("Aberto para a rede: a turma acessa pelo IP desta máquina, porta " + PORT + ".");
  console.log("Ctrl+C para parar.");
});
