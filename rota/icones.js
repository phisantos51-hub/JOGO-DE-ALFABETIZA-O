// Rota Digital — desenhos (SVG) usados no jogo. Funcionam sem internet.
// Nas perguntas, escreva o nome de um desenho daqui (por exemplo 'tablet')
// no campo img. Se o nome não existir aqui, o texto aparece como emoji.

var ICONES = {
  // ---------- Aparelhos e periféricos ----------
  computador: '<rect x="6" y="6" width="52" height="36" rx="4" fill="#37474f"/><rect x="10" y="10" width="44" height="28" fill="#4fc3f7"/><path d="M14 34l10-12 8 8 6-5 12 9z" fill="#81c784"/><rect x="28" y="42" width="8" height="8" fill="#607d8b"/><rect x="16" y="50" width="32" height="6" rx="3" fill="#455a64"/>',
  notebook: '<rect x="12" y="10" width="40" height="30" rx="3" fill="#37474f"/><rect x="15" y="13" width="34" height="24" fill="#81d4fa"/><path d="M2 42h60l-5 10H7z" fill="#90a4ae"/><rect x="26" y="45" width="12" height="3" rx="1" fill="#546e7a"/>',
  tablet: '<rect x="6" y="8" width="52" height="48" rx="6" fill="#263238"/><rect x="11" y="13" width="42" height="34" fill="#a5d6a7"/><circle cx="22" cy="24" r="4" fill="#fff176"/><path d="M11 47l14-14 10 9 6-5 12 10z" fill="#43a047"/><circle cx="32" cy="51.5" r="2" fill="#90a4ae"/>',
  celular: '<rect x="20" y="4" width="24" height="56" rx="5" fill="#263238"/><rect x="23" y="10" width="18" height="40" fill="#ffcc80"/><rect x="26" y="14" width="5" height="5" rx="1" fill="#e53935"/><rect x="33" y="14" width="5" height="5" rx="1" fill="#1e88e5"/><rect x="26" y="21" width="5" height="5" rx="1" fill="#43a047"/><rect x="33" y="21" width="5" height="5" rx="1" fill="#8e24aa"/><rect x="28" y="6" width="8" height="2" rx="1" fill="#546e7a"/><circle cx="32" cy="55" r="2.2" fill="#90a4ae"/>',
  mouse: '<path d="M32 10C32 4 40 3 46 3" stroke="#455a64" stroke-width="3" fill="none"/><rect x="18" y="10" width="28" height="46" rx="14" fill="#eceff1" stroke="#455a64" stroke-width="3"/><line x1="32" y1="10" x2="32" y2="28" stroke="#455a64" stroke-width="3"/><line x1="18" y1="28" x2="46" y2="28" stroke="#455a64" stroke-width="3"/><rect x="30" y="14" width="4" height="9" rx="2" fill="#ef5350"/>',
  teclado: '<rect x="2" y="18" width="60" height="32" rx="4" fill="#546e7a"/>' +
    [0, 1].map(function (l) { return [0, 1, 2, 3, 4, 5].map(function (c) { return '<rect x="' + (7 + c * 9) + '" y="' + (22 + l * 8) + '" width="7" height="6" rx="1" fill="#eceff1"/>'; }).join(''); }).join('') +
    '<rect x="16" y="39" width="32" height="7" rx="1" fill="#eceff1"/>',
  fone: '<path d="M12 38V30a20 20 0 0 1 40 0v8" fill="none" stroke="#5e35b1" stroke-width="6"/><rect x="5" y="32" width="14" height="22" rx="6" fill="#7e57c2"/><rect x="45" y="32" width="14" height="22" rx="6" fill="#7e57c2"/>',
  impressora: '<rect x="18" y="4" width="28" height="18" fill="#fff" stroke="#90a4ae" stroke-width="2"/><rect x="4" y="20" width="56" height="26" rx="4" fill="#607d8b"/><circle cx="51" cy="28" r="3" fill="#66bb6a"/><rect x="15" y="38" width="34" height="22" fill="#fff" stroke="#90a4ae" stroke-width="2"/><line x1="20" y1="45" x2="44" y2="45" stroke="#42a5f5" stroke-width="3"/><line x1="20" y1="52" x2="38" y2="52" stroke="#42a5f5" stroke-width="3"/>',
  pendrive: '<rect x="23" y="3" width="18" height="15" fill="#cfd8dc" stroke="#78909c" stroke-width="2"/><rect x="27" y="7" width="4" height="4" fill="#78909c"/><rect x="33" y="7" width="4" height="4" fill="#78909c"/><rect x="18" y="18" width="28" height="42" rx="6" fill="#e53935"/><circle cx="32" cy="49" r="4" fill="#ffcdd2"/>',

  // ---------- Ícones de ações ----------
  salvar: '<rect x="6" y="6" width="52" height="52" rx="5" fill="#1e88e5"/><rect x="17" y="6" width="28" height="18" fill="#e3f2fd"/><rect x="36" y="9" width="6" height="12" fill="#1e88e5"/><rect x="14" y="34" width="36" height="24" fill="#fff"/><line x1="19" y1="42" x2="45" y2="42" stroke="#90caf9" stroke-width="3"/><line x1="19" y1="50" x2="45" y2="50" stroke="#90caf9" stroke-width="3"/>',
  apagar: '<rect x="26" y="4" width="12" height="7" rx="2" fill="#b71c1c"/><rect x="8" y="10" width="48" height="8" rx="3" fill="#c62828"/><path d="M13 20h38l-4 38H17z" fill="#e53935"/><line x1="24" y1="27" x2="25" y2="51" stroke="#ffcdd2" stroke-width="3"/><line x1="32" y1="27" x2="32" y2="51" stroke="#ffcdd2" stroke-width="3"/><line x1="40" y1="27" x2="39" y2="51" stroke="#ffcdd2" stroke-width="3"/>',
  voltar: '<circle cx="32" cy="32" r="28" fill="#43a047"/><path d="M48 32H18M30 18L16 32l14 14" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
  pesquisar: '<circle cx="26" cy="26" r="17" fill="#e1f5fe" stroke="#0277bd" stroke-width="6"/><line x1="39" y1="39" x2="57" y2="57" stroke="#0277bd" stroke-width="9" stroke-linecap="round"/>',
  som: '<path d="M6 23h12l15-13v44L18 41H6z" fill="#fb8c00"/><path d="M41 22a13 13 0 0 1 0 20" stroke="#fb8c00" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M48 13a25 25 0 0 1 0 38" stroke="#fb8c00" stroke-width="5" fill="none" stroke-linecap="round"/>',
  camera: '<rect x="20" y="8" width="20" height="12" rx="3" fill="#37474f"/><rect x="4" y="16" width="56" height="40" rx="7" fill="#455a64"/><circle cx="32" cy="36" r="13" fill="#b3e5fc" stroke="#eceff1" stroke-width="5"/><circle cx="50" cy="25" r="3" fill="#ffeb3b"/>',
  imprimir: null, // igual à impressora (definido abaixo)

  // ---------- Tipos de mídia ----------
  texto: '<path d="M12 3h28l13 13v45H12z" fill="#fff" stroke="#1565c0" stroke-width="3" stroke-linejoin="round"/><path d="M40 3v13h13" fill="#bbdefb" stroke="#1565c0" stroke-width="3" stroke-linejoin="round"/><line x1="19" y1="27" x2="46" y2="27" stroke="#1565c0" stroke-width="3"/><line x1="19" y1="35" x2="46" y2="35" stroke="#1565c0" stroke-width="3"/><line x1="19" y1="43" x2="46" y2="43" stroke="#1565c0" stroke-width="3"/><line x1="19" y1="51" x2="36" y2="51" stroke="#1565c0" stroke-width="3"/>',
  foto: '<rect x="3" y="9" width="58" height="46" rx="4" fill="#fff" stroke="#6d4c41" stroke-width="3"/><rect x="8" y="14" width="48" height="36" fill="#81d4fa"/><circle cx="20" cy="25" r="5" fill="#ffeb3b"/><path d="M8 50l17-19 12 12 7-6 12 13z" fill="#43a047"/>',
  video: '<rect x="3" y="11" width="58" height="42" rx="8" fill="#e53935"/><path d="M26 21l17 11-17 11z" fill="#fff"/>',
  audio: '<circle cx="32" cy="32" r="29" fill="#8e24aa"/><path d="M26 44V18l18-5v26" stroke="#fff" stroke-width="4" fill="none"/><circle cx="21" cy="44" r="6" fill="#fff"/><circle cx="39" cy="39" r="6" fill="#fff"/>',
  jogo: '<path d="M14 18h36a11 11 0 0 1 11 10l2 16a7 7 0 0 1-12 5l-7-8H20l-7 8a7 7 0 0 1-12-5l2-16a11 11 0 0 1 11-10z" fill="#3949ab"/><rect x="13" y="28" width="14" height="5" fill="#fff"/><rect x="17.5" y="23.5" width="5" height="14" fill="#fff"/><circle cx="43" cy="27" r="3.5" fill="#ffeb3b"/><circle cx="50" cy="34" r="3.5" fill="#ef5350"/>',
  email: '<rect x="3" y="13" width="58" height="40" rx="4" fill="#fff" stroke="#00897b" stroke-width="3"/><path d="M5 15l27 21 27-21" fill="none" stroke="#00897b" stroke-width="3" stroke-linejoin="round"/><circle cx="51" cy="45" r="9" fill="#00897b"/><text x="51" y="49.5" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle" font-family="Arial">@</text>',

  // ---------- Peças da cidade ----------
  cone: '<path d="M32 6l15 46H17z" fill="#ff6d00"/><path d="M27.5 20h9l2.3 7H25.2z" fill="#fff"/><path d="M23 34h18l2.3 7H20.7z" fill="#fff"/><rect x="10" y="50" width="44" height="8" rx="2" fill="#e65100"/>',
  obra: '<rect x="6" y="18" width="52" height="16" fill="#fff"/><path d="M6 18h10l-10 16zM22 18h10l-10 16h-10zM38 18h10l-10 16h-10zM54 18h4v16h-14z" fill="#f4511e"/><rect x="10" y="34" width="5" height="22" fill="#5d4037"/><rect x="49" y="34" width="5" height="22" fill="#5d4037"/><circle cx="12" cy="12" r="5" fill="#ffca28"/><circle cx="52" cy="12" r="5" fill="#ffca28"/>',
  predio: '<rect x="12" y="6" width="40" height="54" fill="#8d6e63"/>' +
    [0, 1, 2, 3].map(function (l) { return [0, 1, 2].map(function (c) { return '<rect x="' + (17 + c * 11) + '" y="' + (11 + l * 11) + '" width="8" height="7" fill="#fff59d"/>'; }).join(''); }).join('') +
    '<rect x="27" y="48" width="10" height="12" fill="#4e342e"/>',
};
ICONES.imprimir = ICONES.impressora;

// Desenho de um ícone pelo nome; se não houver desenho, mostra o texto como emoji.
function icone(nome, classe) {
  var c = classe ? ' class="' + classe + '"' : '';
  if (ICONES[nome]) {
    return '<svg' + c + ' viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + ICONES[nome] + '</svg>';
  }
  return '<span' + (classe ? ' class="' + classe + ' emoji"' : ' class="emoji"') + ' aria-hidden="true">' + (nome || '') + '</span>';
}

// Carrinho visto de cima, apontando para a direita.
function desenhoCarro(cor) {
  return '<svg viewBox="0 0 80 52" aria-hidden="true" focusable="false">' +
    '<rect x="12" y="0" width="16" height="8" rx="3" fill="#212121"/><rect x="52" y="0" width="16" height="8" rx="3" fill="#212121"/>' +
    '<rect x="12" y="44" width="16" height="8" rx="3" fill="#212121"/><rect x="52" y="44" width="16" height="8" rx="3" fill="#212121"/>' +
    '<rect x="3" y="5" width="74" height="42" rx="13" fill="' + cor + '" stroke="#1a1a1a" stroke-width="3"/>' +
    '<rect x="45" y="11" width="15" height="30" rx="5" fill="#bbdefb" stroke="#1a1a1a" stroke-width="2"/>' +
    '<rect x="13" y="13" width="11" height="26" rx="4" fill="#bbdefb" stroke="#1a1a1a" stroke-width="2"/>' +
    '<rect x="27" y="14" width="15" height="24" rx="3" fill="#fff" opacity=".35"/>' +
    '<circle cx="73" cy="14" r="3.5" fill="#fff176"/><circle cx="73" cy="38" r="3.5" fill="#fff176"/></svg>';
}

// Semáforo com a luz acesa (vermelha em cima, verde embaixo).
function desenhoSemaforo(vermelho) {
  return '<svg viewBox="0 0 40 64" aria-hidden="true" focusable="false">' +
    '<rect x="6" y="2" width="28" height="60" rx="7" fill="#212121" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="20" cy="17" r="9" fill="' + (vermelho ? '#ff1744' : '#4a1c1c') + '"/>' +
    '<circle cx="20" cy="47" r="9" fill="' + (vermelho ? '#1b3d1f' : '#00e676') + '"/></svg>';
}

if (typeof module !== 'undefined') module.exports = { ICONES: ICONES };
