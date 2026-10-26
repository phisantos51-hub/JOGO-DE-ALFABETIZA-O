// Geração das fases: posiciona robô, peças, distratores e pedras no tabuleiro
// e garante (por busca) que existe um caminho que coleta as peças na ordem.
const DIRECOES = {
  cima: { dx: 0, dy: -1, seta: '↑', nome: 'para cima' },
  baixo: { dx: 0, dy: 1, seta: '↓', nome: 'para baixo' },
  esquerda: { dx: -1, dy: 0, seta: '←', nome: 'para a esquerda' },
  direita: { dx: 1, dy: 0, seta: '→', nome: 'para a direita' },
};

// Gerador pseudoaleatório com semente: a mesma fase é sempre igual.
function mulberry32(semente) {
  return function () {
    semente |= 0;
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralhar(lista, rng) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const chave = (x, y) => x + ',' + y;

// Menor caminho (menos passos; em empate, menos curvas) de `inicio` até `alvo`,
// evitando as casas bloqueadas. Devolve a lista de direções ou null.
function menorCaminho(tamanho, inicio, alvo, bloqueadas, dirInicial) {
  const nomes = Object.keys(DIRECOES);
  const custo = new Map();
  const origem = new Map();
  const estado0 = chave(inicio.x, inicio.y) + '|' + dirInicial;
  custo.set(estado0, 0);
  const fila = [{ x: inicio.x, y: inicio.y, dir: dirInicial, c: 0 }];
  while (fila.length) {
    fila.sort((a, b) => a.c - b.c);
    const atual = fila.shift();
    const ek = chave(atual.x, atual.y) + '|' + atual.dir;
    if (atual.c > custo.get(ek)) continue;
    if (atual.x === alvo.x && atual.y === alvo.y) {
      const passos = [];
      let k = ek;
      while (origem.has(k)) {
        const o = origem.get(k);
        passos.unshift(o.dir);
        k = o.de;
      }
      return { passos, dirFinal: atual.dir };
    }
    for (const nome of nomes) {
      const d = DIRECOES[nome];
      const nx = atual.x + d.dx;
      const ny = atual.y + d.dy;
      if (nx < 0 || ny < 0 || nx >= tamanho || ny >= tamanho) continue;
      const ck = chave(nx, ny);
      if (bloqueadas.has(ck) && !(nx === alvo.x && ny === alvo.y)) continue;
      const nc = atual.c + 100 + (nome === atual.dir ? 0 : 1);
      const nk = ck + '|' + nome;
      if (!custo.has(nk) || nc < custo.get(nk)) {
        custo.set(nk, nc);
        origem.set(nk, { de: ek, dir: nome });
        fila.push({ x: nx, y: ny, dir: nome, c: nc });
      }
    }
  }
  return null;
}

// Quantos blocos uma boa solução usa. Com REPETIR, uma sequência de 3 ou
// mais setas iguais vira 2 blocos (repetir + seta).
function contarBlocosIdeais(passos, comRepetir) {
  if (!comRepetir) return passos.length;
  let total = 0;
  let i = 0;
  while (i < passos.length) {
    let j = i;
    while (j < passos.length && passos[j] === passos[i]) j++;
    const corrida = j - i;
    total += corrida <= 2 ? corrida : 2 * Math.ceil(corrida / 9);
    i = j;
  }
  return total;
}

function resolverFase(fase) {
  const bloqueadas = new Set();
  fase.pedras.forEach((p) => bloqueadas.add(chave(p.x, p.y)));
  fase.distratores.forEach((p) => bloqueadas.add(chave(p.x, p.y)));
  fase.alvos.forEach((p) => bloqueadas.add(chave(p.x, p.y)));
  let pos = fase.inicio;
  let dir = 'direita';
  const todos = [];
  for (const alvo of fase.alvos) {
    const r = menorCaminho(fase.tamanho, pos, alvo, bloqueadas, dir);
    if (!r) return null;
    todos.push(...r.passos);
    bloqueadas.delete(chave(alvo.x, alvo.y));
    pos = alvo;
    dir = r.dirFinal;
  }
  return todos;
}

function gerarFase(ano, indice) {
  const cfg = ANOS[ano];
  const item = cfg.palavras[indice];
  const tamanho = cfg.tamanho;
  const nPedras = cfg.pedras(indice);
  const nDistratores = cfg.distratores(indice);

  for (let tentativa = 0; tentativa < 2000; tentativa++) {
    const rng = mulberry32(ano * 10007 + indice * 101 + tentativa);
    const casas = [];
    for (let y = 0; y < tamanho; y++) for (let x = 0; x < tamanho; x++) casas.push({ x, y });
    const livres = embaralhar(casas, rng);

    const inicio = livres.pop();
    const alvos = item.pecas.map((texto, ordem) => ({ ...livres.pop(), texto, ordem }));

    // Distratores: primeiro as "pegadinhas" da palavra, depois peças avulsas.
    const pool = embaralhar(cfg.sobra, rng).filter((t) => !item.pecas.includes(t));
    const candidatos = [...(item.armadilhas || []), ...pool].filter((t) => !item.pecas.includes(t));
    const distratores = candidatos.slice(0, nDistratores).map((texto) => ({ ...livres.pop(), texto }));
    const pedras = [];
    for (let i = 0; i < nPedras; i++) pedras.push(livres.pop());

    const fase = { ano, indice, tamanho, inicio, alvos, distratores, pedras, item };
    const passos = resolverFase(fase);
    if (!passos) continue;
    // Evita fases curtas demais: exige ao menos 2 passos por peça.
    if (passos.length < item.pecas.length * 2) continue;

    fase.passosSolucao = passos;
    fase.blocosIdeais = contarBlocosIdeais(passos, cfg.repetir);
    fase.limiteBlocos = cfg.limiteBlocos ? fase.blocosIdeais + 4 : null;
    return fase;
  }
  throw new Error('Não consegui gerar a fase ' + ano + '-' + indice);
}

if (typeof module !== 'undefined') {
  module.exports = { DIRECOES, gerarFase, resolverFase, contarBlocosIdeais, mulberry32 };
}
