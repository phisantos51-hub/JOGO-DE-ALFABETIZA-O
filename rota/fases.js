// Rota Digital — fases do Bairro da Programação.
//
// Cada fase é um desenho da cidade feito com letras, uma linha por fila:
//   .  rua livre            C  carro (onde ele começa)
//   D  destino da missão    O  obra 🚧 (não passa)
//   K  cone (não passa)     X  prédio (não passa)
//   S  semáforo 🚦 (só no 3º ano: passa depois do bloco SE vermelho, ESPERE)
// "destino" escolhe a figura do lugar de chegada (veja DESTINOS abaixo).
// Depois de mudar este arquivo, rode: node testes/rota.test.js

var DESTINOS = {
  escola: { emoji: '🏫', nome: 'Escola' },
  padaria: { emoji: '🥖', nome: 'Padaria' },
  praca: { emoji: '⛲', nome: 'Praça' },
  biblioteca: { emoji: '📚', nome: 'Biblioteca' },
  mercado: { emoji: '🛒', nome: 'Mercado' },
  casa: { emoji: '🏠', nome: 'Casa da vovó' },
  parque: { emoji: '🎡', nome: 'Parque' },
  hospital: { emoji: '🏥', nome: 'Posto de saúde' },
  museu: { emoji: '🏛️', nome: 'Museu' },
  zoologico: { emoji: '🦒', nome: 'Zoológico' },
};

// O que cada ano pode usar na Programação.
var REGRAS_PROGRAMACAO = {
  1: { repetir: false, espere: false, limite: false },
  2: { repetir: true, espere: false, limite: false },
  3: { repetir: true, espere: true, limite: true },
};

var FASES_PROGRAMACAO = {
  1: [
    { destino: 'escola', mapa: ['.....', 'C..D.', '.....'] },
    { destino: 'padaria', mapa: ['..C..', '.....', '.....', '..D..'] },
    { destino: 'praca', mapa: ['C....', '.....', '...D.'] },
    { destino: 'biblioteca', mapa: ['.....', 'C.O.D', '.....'] },
    { destino: 'mercado', mapa: ['...D.', '.X...', '.X...', 'CX...'] },
    { destino: 'casa', mapa: ['C.K..', '..K.D', '.....'] },
    { destino: 'parque', mapa: ['.....', 'D.O.C', '.....'] },
    { destino: 'hospital', mapa: ['C.O..', '..O.K', '....D'] },
  ],
  2: [
    {
      destino: 'escola',
      mapa: ['......', 'C....D', '......'],
      aviso: 'Novidade: o bloco 🔁 REPETIR repete o bloco que vem logo depois dele. Clique no número para mudar quantas vezes!',
    },
    { destino: 'padaria', mapa: ['C.....', '......', '......', '......', '.....D'] },
    { destino: 'praca', mapa: ['D.....', 'X.X.X.', '......', 'X.X.X.', '.....C'] },
    { destino: 'biblioteca', mapa: ['C...O.', '......', '....O.', '.KKKKD', '......'] },
    { destino: 'mercado', mapa: ['C.....', 'OOOOO.', '......', '.OOOOO', '.....D'] },
    { destino: 'casa', mapa: ['...C..', '.OOOO.', '.O..O.', '.O.DO.', '.O....'] },
    { destino: 'parque', mapa: ['D....O', '.....O', 'OOOO..', '......', 'C.....'] },
    { destino: 'museu', mapa: ['C.O...', '..O.O.', '..O.O.', '....O.', 'OOO..D'] },
  ],
  3: [
    {
      destino: 'escola',
      mapa: ['C......', 'XXXXXX.', '.......', '.XXXXXX', '......D'],
      aviso: 'Desafio: agora há um limite de blocos. Use o 🔁 REPETIR para economizar!',
    },
    {
      destino: 'padaria',
      mapa: ['XXXXXXX', 'C..S..D', 'XXXXXXX'],
      aviso: 'Novidade: o semáforo 🚦 muda de cor. Antes de passar por ele, use o bloco 🚦 SE vermelho, ESPERE.',
    },
    { destino: 'praca', mapa: ['C...XXX', 'XXX.XXX', 'XXXS...', 'XXX.XXX', 'XXX...D'] },
    { destino: 'biblioteca', mapa: ['D.....X', 'XXXXX.X', 'C..S...', 'XXXXXXX'] },
    { destino: 'mercado', mapa: ['C..XXXX', 'XX.XXXX', 'XX.S..O', 'XXXXX.X', 'D..S...'] },
    { destino: 'hospital', mapa: ['C.X....', '..X.XX.', '..S.XXD', 'XXX.XXX', 'XXX....'] },
    { destino: 'zoologico', mapa: ['C.S....', 'XXXXXX.', 'D......', 'XXXXXXK', '.......'] },
    { destino: 'museu', mapa: ['C......', 'XXXXX.X', '...S...', '.XXXXXX', '..S...D'] },
  ],
};

var DIRECOES = {
  cima: { dx: 0, dy: -1, seta: '⬆️', nome: 'cima', angulo: -90 },
  baixo: { dx: 0, dy: 1, seta: '⬇️', nome: 'baixo', angulo: 90 },
  esquerda: { dx: -1, dy: 0, seta: '⬅️', nome: 'esquerda', angulo: 180 },
  direita: { dx: 1, dy: 0, seta: '➡️', nome: 'direita', angulo: 0 },
};
var MAX_REPETIR = 6;

// Transforma o desenho em dados: tamanho, início, destino e o que há em cada casa.
function lerMapa(fase) {
  var linhas = fase.mapa;
  var mapa = { linhas: linhas.length, colunas: linhas[0].length, inicio: null, destino: null, semaforos: [] };
  mapa.casas = linhas.map(function (linha, y) {
    return linha.split('').map(function (c, x) {
      if (c === 'C') { mapa.inicio = { x: x, y: y }; return '.'; }
      if (c === 'D') { mapa.destino = { x: x, y: y }; return '.'; }
      if (c === 'S') mapa.semaforos.push({ x: x, y: y });
      return c;
    });
  });
  return mapa;
}

function dentro(mapa, x, y) {
  return x >= 0 && y >= 0 && x < mapa.colunas && y < mapa.linhas;
}

function bloqueada(mapa, x, y) {
  var c = mapa.casas[y][x];
  return c === 'O' || c === 'K' || c === 'X';
}

// Menor número de blocos que leva o carro ao destino (busca de custo mínimo).
// Regras iguais às do jogo: REPETIR + bloco conta 2 blocos; para entrar num
// semáforo, o bloco anterior precisa ser o SE vermelho, ESPERE, por isso
// numa repetição só o primeiro passo pode entrar num semáforo.
function blocosIdeais(mapa, regras) {
  var chave = function (x, y, conferiu) { return x + ',' + y + ',' + (conferiu ? 1 : 0); };
  var custo = {};
  var fila = [{ x: mapa.inicio.x, y: mapa.inicio.y, conferiu: false, c: 0 }];
  custo[chave(mapa.inicio.x, mapa.inicio.y, false)] = 0;
  function tentar(x, y, conferiu, c) {
    var k = chave(x, y, conferiu);
    if (custo[k] === undefined || c < custo[k]) {
      custo[k] = c;
      fila.push({ x: x, y: y, conferiu: conferiu, c: c });
    }
  }
  while (fila.length) {
    fila.sort(function (a, b) { return a.c - b.c; });
    var e = fila.shift();
    if (e.c > custo[chave(e.x, e.y, e.conferiu)]) continue;
    if (e.x === mapa.destino.x && e.y === mapa.destino.y) return e.c;
    if (regras.espere && !e.conferiu) tentar(e.x, e.y, true, e.c + 1);
    var maxPassos = regras.repetir ? MAX_REPETIR : 1;
    Object.keys(DIRECOES).forEach(function (nome) {
      var d = DIRECOES[nome];
      var x = e.x, y = e.y;
      for (var passo = 1; passo <= maxPassos; passo++) {
        x += d.dx; y += d.dy;
        if (!dentro(mapa, x, y) || bloqueada(mapa, x, y)) break;
        if (mapa.casas[y][x] === 'S' && !(passo === 1 && e.conferiu)) break;
        tentar(x, y, false, e.c + Math.min(passo, 2));
      }
    });
  }
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = { DESTINOS: DESTINOS, REGRAS_PROGRAMACAO: REGRAS_PROGRAMACAO, FASES_PROGRAMACAO: FASES_PROGRAMACAO, DIRECOES: DIRECOES, MAX_REPETIR: MAX_REPETIR, lerMapa: lerMapa, blocosIdeais: blocosIdeais, bloqueada: bloqueada };
}
