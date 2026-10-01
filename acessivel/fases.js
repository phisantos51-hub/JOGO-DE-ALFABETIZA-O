// Fases da versão acessível: geração do tabuleiro, simulação do programa
// e frases que descrevem posições em linguagem simples.

const DIRECOES = {
  cima: { dx: 0, dy: -1, nome: 'cima', seta: '↑' },
  baixo: { dx: 0, dy: 1, nome: 'baixo', seta: '↓' },
  esquerda: { dx: -1, dy: 0, nome: 'esquerda', seta: '←' },
  direita: { dx: 1, dy: 0, nome: 'direita', seta: '→' },
};

// Lista única de fases, na ordem em que o aluno joga.
const FASES = [];
ETAPAS.forEach((etapa, e) => {
  etapa.palavras.forEach((item, i) => FASES.push({ etapa: e, indice: i }));
});

function mulberry32(semente) {
  return function () {
    semente |= 0;
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const chave = (x, y) => x + ',' + y;

// Monta a fase andando um caminho sem repetir casas: cada peça fica no fim
// de um trecho de 1 ou 2 passos. Assim sempre existe solução curta.
function gerarFase(numero, modo) {
  const { etapa: e, indice } = FASES[numero];
  const etapa = ETAPAS[e];
  const item = etapa.palavras[indice];
  const pecas = etapa.soLetras ? item.letras : item[modo];
  const segundaMetade = indice >= Math.floor(etapa.palavras.length / 2);
  const tamanho = segundaMetade && etapa.tamanhoFinal ? etapa.tamanhoFinal : etapa.tamanho;
  const nDistratores = segundaMetade && etapa.distratoresFinal !== undefined ? etapa.distratoresFinal : etapa.distratores;
  const [minPassos, maxPassos] = etapa.passosPorPeca;
  const nomes = Object.keys(DIRECOES);

  for (let tentativa = 0; tentativa < 5000; tentativa++) {
    const rng = mulberry32(numero * 7919 + (modo === 'letras' ? 0 : 104729) + tentativa);
    const sorteio = (n) => Math.floor(rng() * n);
    const inicio = { x: sorteio(tamanho), y: sorteio(tamanho) };
    const usadas = new Set([chave(inicio.x, inicio.y)]);
    const passos = [];
    const alvos = [];
    let x = inicio.x;
    let y = inicio.y;
    let ok = true;

    for (const texto of pecas) {
      const trecho = minPassos + sorteio(maxPassos - minPassos + 1);
      for (let p = 0; p < trecho && ok; p++) {
        const opcoes = nomes.filter((n) => {
          const nx = x + DIRECOES[n].dx;
          const ny = y + DIRECOES[n].dy;
          return nx >= 0 && ny >= 0 && nx < tamanho && ny < tamanho && !usadas.has(chave(nx, ny));
        });
        if (!opcoes.length) { ok = false; break; }
        const dir = opcoes[sorteio(opcoes.length)];
        x += DIRECOES[dir].dx;
        y += DIRECOES[dir].dy;
        usadas.add(chave(x, y));
        passos.push(dir);
      }
      if (!ok) break;
      alvos.push({ x, y, texto });
    }
    if (!ok) continue;

    const livres = [];
    for (let yy = 0; yy < tamanho; yy++) {
      for (let xx = 0; xx < tamanho; xx++) if (!usadas.has(chave(xx, yy))) livres.push({ x: xx, y: yy });
    }
    if (livres.length < nDistratores) continue;
    const sobras = SOBRAS[etapa.soLetras ? 'letras' : modo].filter((t) => !pecas.includes(t));
    const distratores = [];
    for (let d = 0; d < nDistratores; d++) {
      const casa = livres.splice(sorteio(livres.length), 1)[0];
      distratores.push({ ...casa, texto: sobras[sorteio(sobras.length)] });
    }

    return { numero, etapa: e, item, pecas, tamanho, inicio, alvos, distratores, solucao: passos };
  }
  throw new Error('Não consegui gerar a fase ' + numero);
}

// Executa o programa de uma vez e devolve tudo o que aconteceu, passo a passo.
// Eventos: 'andou', 'pegou', 'parede', 'errada', 'venceu', 'acabou'.
function simular(fase, programa) {
  const estado = { x: fase.inicio.x, y: fase.inicio.y, coletadas: 0, pegas: new Set() };
  const eventos = [];
  for (let i = 0; i < programa.length; i++) {
    const d = DIRECOES[programa[i]];
    const nx = estado.x + d.dx;
    const ny = estado.y + d.dy;
    if (nx < 0 || ny < 0 || nx >= fase.tamanho || ny >= fase.tamanho) {
      eventos.push({ tipo: 'parede', comando: i, dir: programa[i] });
      return { estado, eventos, fim: 'parede', comando: i };
    }
    estado.x = nx;
    estado.y = ny;
    eventos.push({ tipo: 'andou', comando: i, dir: programa[i], x: nx, y: ny });
    const peca = pecaEm(fase, estado, nx, ny);
    if (peca) {
      const precisa = fase.pecas[estado.coletadas];
      if (peca.texto !== precisa) {
        eventos.push({ tipo: 'errada', comando: i, texto: peca.texto, precisa });
        return { estado, eventos, fim: 'errada', comando: i };
      }
      estado.pegas.add(peca.id);
      estado.coletadas++;
      eventos.push({ tipo: 'pegou', comando: i, texto: peca.texto, id: peca.id });
      if (estado.coletadas === fase.pecas.length) {
        eventos.push({ tipo: 'venceu', comando: i });
        return { estado, eventos, fim: 'venceu', comando: i };
      }
    }
  }
  eventos.push({ tipo: 'acabou' });
  return { estado, eventos, fim: 'acabou', comando: programa.length };
}

function pecaEm(fase, estado, x, y) {
  const a = fase.alvos.findIndex((p, i) => p.x === x && p.y === y && !estado.pegas.has('a' + i));
  if (a >= 0) return { id: 'a' + a, texto: fase.alvos[a].texto };
  const d = fase.distratores.findIndex((p) => p.x === x && p.y === y);
  if (d >= 0) return { id: 'd' + d, texto: fase.distratores[d].texto };
  return null;
}

// ---------- Frases em linguagem simples ----------
const NUMEROS = ['zero', 'uma', 'duas', 'três', 'quatro'];

function casas(n) {
  return `${NUMEROS[n] || n} ${n === 1 ? 'casa' : 'casas'}`;
}

// "duas casas à direita e uma casa para baixo do robô"
function descreverDistancia(dx, dy) {
  const partes = [];
  if (dx > 0) partes.push(`${casas(dx)} à direita`);
  if (dx < 0) partes.push(`${casas(-dx)} à esquerda`);
  if (dy < 0) partes.push(`${casas(-dy)} para cima`);
  if (dy > 0) partes.push(`${casas(dy)} para baixo`);
  return partes.join(' e ');
}

function descreverParedes(tamanho, x, y) {
  const lados = [];
  if (y === 0) lados.push('em cima');
  if (y === tamanho - 1) lados.push('embaixo');
  if (x === 0) lados.push('à esquerda');
  if (x === tamanho - 1) lados.push('à direita');
  if (!lados.length) return 'Não tem parede encostada no robô.';
  const lista = lados.length === 1 ? lados[0] : lados.slice(0, -1).join(', ') + ' e ' + lados[lados.length - 1];
  return `Tem parede ${lista} do robô.`;
}

function descreverPontos(pontos) {
  if (pontos.length === 1) return `ponto ${pontos[0]}`;
  return `pontos ${pontos.slice(0, -1).join(', ')} e ${pontos[pontos.length - 1]}`;
}

// Caractere braille Unicode, para mostrar na tela.
function caractereBraille(letra) {
  const pontos = BRAILLE[letra];
  if (!pontos) return '';
  return String.fromCharCode(0x2800 + pontos.reduce((s, p) => s + (1 << (p - 1)), 0));
}

if (typeof module !== 'undefined') {
  module.exports = {
    DIRECOES, FASES, gerarFase, simular, descreverDistancia, descreverParedes, descreverPontos, caractereBraille,
  };
}
