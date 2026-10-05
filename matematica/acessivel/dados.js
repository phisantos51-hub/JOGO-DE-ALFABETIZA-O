// Textos falados da Feira do Robô acessível: nomes das frutas, do dinheiro,
// números em braille e conversão do texto da tela para a fala.
// [singular, plural, gênero] — o gênero acerta "laranja solta" e "limão solto".
const FRUTAS = {
  '🍎': ['maçã', 'maçãs', 'f'], '🍌': ['banana', 'bananas', 'f'], '🍊': ['laranja', 'laranjas', 'f'],
  '🍓': ['morango', 'morangos', 'm'], '🍐': ['pera', 'peras', 'f'], '🥕': ['cenoura', 'cenouras', 'f'],
  '🍋': ['limão', 'limões', 'm'], '🥒': ['pepino', 'pepinos', 'm'], '🍅': ['tomate', 'tomates', 'm'],
  '🥚': ['ovo', 'ovos', 'm'], '🍍': ['abacaxi', 'abacaxis', 'm'], '🍉': ['melancia', 'melancias', 'f'],
  '🥬': ['alface', 'alfaces', 'f'], '🍈': ['melão', 'melões', 'm'], '🍇': ['uva', 'uvas', 'f'],
};

function nomeFruta(emoji, n) {
  const nomes = FRUTAS[emoji] || ['fruta', 'frutas'];
  return n === 1 ? nomes[0] : nomes[1];
}
function masculino(emoji) {
  return (FRUTAS[emoji] || [])[2] === 'm';
}
// "a laranja", "os limões"
function artigo(emoji, plural) {
  return (masculino(emoji) ? 'o' : 'a') + (plural ? 's' : '');
}
function umOuUma(emoji) {
  return masculino(emoji) ? 'um' : 'uma';
}
// "laranja solta", "limões soltos"
function solta(emoji, n) {
  return (masculino(emoji) ? 'solto' : 'solta') + (n === 1 ? '' : 's');
}
// "3 caixas", ou "nenhuma caixa" quando é zero
function quantosOuNenhum(n, um, varios, feminino = true) {
  return n ? quantidade(n, um, varios) : `${feminino ? 'nenhuma' : 'nenhum'} ${um}`;
}

// "3 laranjas", "1 limão"
function quantidade(n, um, varios) {
  return `${n} ${n === 1 ? um : varios}`;
}

function nomeDinheiro(centavos) {
  if (centavos >= 200) return `nota de ${centavos / 100} reais`;
  if (centavos === 100) return 'moeda de 1 real';
  return `moeda de ${centavos} centavos`;
}

function valorFalado(centavos) {
  const reais = Math.floor(centavos / 100);
  const cent = centavos % 100;
  const r = reais ? `${reais} ${reais === 1 ? 'real' : 'reais'}` : '';
  const c = cent ? `${cent} centavos` : '';
  return [r, c].filter(Boolean).join(' e ') || 'zero reais';
}

// Troca "R$ 3,50" por "3 reais e 50 centavos" e tira símbolos que a voz lê mal.
function paraFala(texto) {
  return texto
    .replace(/R\$ ?(\d+),(\d{2})/g, (_, r, c) => valorFalado(Number(r) * 100 + Number(c)))
    .replace(/−/g, ' menos ')
    .replace(/×/g, ' vezes ')
    .replace(/\+/g, ' mais ')
    .replace(/=/g, ' é igual a ')
    // Palavras em maiúsculas (MAIS, ÍMPAR) seriam soletradas pela voz.
    .replace(/\p{Lu}{2,}/gu, (p) => p.toLowerCase())
    .replace(/\s+/g, ' ')
    .trim();
}

// Braille: sinal de número (pontos 3, 4, 5, 6) e os algarismos (letras a a j).
const BRAILLE_DIGITOS = {
  1: [1], 2: [1, 2], 3: [1, 4], 4: [1, 4, 5], 5: [1, 5],
  6: [1, 2, 4], 7: [1, 2, 4, 5], 8: [1, 2, 5], 9: [2, 4], 0: [2, 4, 5],
};
const SINAL_NUMERO = [3, 4, 5, 6];

function celaBraille(pontos) {
  return String.fromCharCode(0x2800 + pontos.reduce((s, p) => s + (1 << (p - 1)), 0));
}
function numeroBraille(n) {
  return celaBraille(SINAL_NUMERO) + String(n).split('').map((d) => celaBraille(BRAILLE_DIGITOS[d])).join('');
}
function descreverPontos(pontos) {
  if (pontos.length === 1) return `ponto ${pontos[0]}`;
  return `pontos ${pontos.slice(0, -1).join(', ')} e ${pontos[pontos.length - 1]}`;
}
function brailleFalado(n) {
  const digitos = String(n).split('').map((d) => descreverPontos(BRAILLE_DIGITOS[d]));
  return `Em braille: sinal de número, ${descreverPontos(SINAL_NUMERO)}; depois ${digitos.join('; depois ')}.`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FRUTAS, nomeFruta, artigo, umOuUma, solta, quantosOuNenhum, quantidade, nomeDinheiro, valorFalado, paraFala, numeroBraille, brailleFalado, celaBraille };
}
