// Conteúdo da versão acessível: fases em três etapas e tabela braille.
// Cada palavra tem a divisão em letras e em sílabas; o professor escolhe
// no menu qual das duas o aluno vai usar.

const ETAPAS = [
  {
    nome: 'Etapa 1: primeiros passos',
    explicacao: 'Uma ou duas setas para pegar letras.',
    tamanho: 3,
    passosPorPeca: [1, 1],
    distratores: 0,
    // No aquecimento as peças são sempre letras, mesmo no modo sílabas.
    soLetras: true,
    palavras: [
      { palavra: 'A', letras: ['A'], silabas: ['A'], dica: 'a letra A' },
      { palavra: 'OI', letras: ['O', 'I'], silabas: ['O', 'I'], dica: 'oi, como quem diz olá' },
      { palavra: 'EU', letras: ['E', 'U'], silabas: ['E', 'U'], dica: 'eu, eu mesmo' },
      { palavra: 'AI', letras: ['A', 'I'], silabas: ['A', 'I'], dica: 'ai, quando alguma coisa dói' },
      { palavra: 'PÉ', letras: ['P', 'É'], silabas: ['P', 'É'], dica: 'pé, o pé de andar' },
    ],
  },
  {
    nome: 'Etapa 2: palavras de duas sílabas',
    explicacao: 'Palavras curtas, com duas sílabas.',
    tamanho: 3,
    tamanhoFinal: 4,
    passosPorPeca: [1, 2],
    distratores: 0,
    distratoresFinal: 1,
    palavras: [
      { palavra: 'BOLA', letras: ['B', 'O', 'L', 'A'], silabas: ['BO', 'LA'], dica: 'bola de jogar futebol' },
      { palavra: 'CASA', letras: ['C', 'A', 'S', 'A'], silabas: ['CA', 'SA'], dica: 'casa, onde a gente mora' },
      { palavra: 'SAPO', letras: ['S', 'A', 'P', 'O'], silabas: ['SA', 'PO'], dica: 'sapo, que pula e faz croac' },
      { palavra: 'GATO', letras: ['G', 'A', 'T', 'O'], silabas: ['GA', 'TO'], dica: 'gato, que faz miau' },
      { palavra: 'LUVA', letras: ['L', 'U', 'V', 'A'], silabas: ['LU', 'VA'], dica: 'luva, de esquentar a mão' },
      { palavra: 'DEDO', letras: ['D', 'E', 'D', 'O'], silabas: ['DE', 'DO'], dica: 'dedo da mão' },
    ],
  },
  {
    nome: 'Etapa 3: palavras de três sílabas',
    explicacao: 'Palavras maiores, com três sílabas.',
    tamanho: 4,
    passosPorPeca: [1, 2],
    distratores: 1,
    distratoresFinal: 2,
    palavras: [
      { palavra: 'BONECA', letras: ['B', 'O', 'N', 'E', 'C', 'A'], silabas: ['BO', 'NE', 'CA'], dica: 'boneca de brincar' },
      { palavra: 'SAPATO', letras: ['S', 'A', 'P', 'A', 'T', 'O'], silabas: ['SA', 'PA', 'TO'], dica: 'sapato de calçar' },
      { palavra: 'MACACO', letras: ['M', 'A', 'C', 'A', 'C', 'O'], silabas: ['MA', 'CA', 'CO'], dica: 'macaco, que pula nos galhos' },
      { palavra: 'PIPOCA', letras: ['P', 'I', 'P', 'O', 'C', 'A'], silabas: ['PI', 'PO', 'CA'], dica: 'pipoca, que estoura na panela' },
      { palavra: 'CAVALO', letras: ['C', 'A', 'V', 'A', 'L', 'O'], silabas: ['CA', 'VA', 'LO'], dica: 'cavalo, que faz pocotó' },
      { palavra: 'BANANA', letras: ['B', 'A', 'N', 'A', 'N', 'A'], silabas: ['BA', 'NA', 'NA'], dica: 'banana, a fruta amarela' },
    ],
  },
];

// Peças que podem aparecer para confundir (nunca iguais às da palavra).
const SOBRAS = {
  letras: ['E', 'I', 'U', 'M', 'R', 'F', 'J', 'Z'],
  silabas: ['FU', 'JE', 'RI', 'ZE', 'MU', 'FI'],
};

// Pontos braille (Grafia Braille para a Língua Portuguesa).
const BRAILLE = {
  A: [1], B: [1, 2], C: [1, 4], D: [1, 4, 5], E: [1, 5], F: [1, 2, 4], G: [1, 2, 4, 5],
  H: [1, 2, 5], I: [2, 4], J: [2, 4, 5], K: [1, 3], L: [1, 2, 3], M: [1, 3, 4],
  N: [1, 3, 4, 5], O: [1, 3, 5], P: [1, 2, 3, 4], Q: [1, 2, 3, 4, 5], R: [1, 2, 3, 5],
  S: [2, 3, 4], T: [2, 3, 4, 5], U: [1, 3, 6], V: [1, 2, 3, 6], W: [2, 4, 5, 6],
  X: [1, 3, 4, 6], Y: [1, 3, 4, 5, 6], Z: [1, 3, 5, 6],
  Á: [1, 2, 3, 5, 6], É: [1, 2, 3, 4, 5, 6], Í: [3, 4], Ó: [3, 4, 6], Ú: [2, 3, 4, 5, 6],
  À: [1, 2, 4, 6], Â: [1, 6], Ê: [1, 2, 6], Ô: [1, 4, 5, 6], Ã: [3, 4, 5], Õ: [2, 4, 6],
  Ç: [1, 2, 3, 4, 6],
};

// Nome falado de cada letra.
const NOMES_LETRAS = {
  A: 'á', B: 'bê', C: 'cê', D: 'dê', E: 'é', F: 'éfe', G: 'gê', H: 'agá', I: 'i', J: 'jota',
  K: 'cá', L: 'éle', M: 'ême', N: 'êne', O: 'ó', P: 'pê', Q: 'quê', R: 'érre', S: 'ésse',
  T: 'tê', U: 'u', V: 'vê', W: 'dáblio', X: 'xis', Y: 'ípsilon', Z: 'zê',
  É: 'é com acento agudo', Á: 'á com acento agudo', Ó: 'ó com acento agudo', Ç: 'cê cedilha',
};

if (typeof module !== 'undefined') module.exports = { ETAPAS, SOBRAS, BRAILLE, NOMES_LETRAS };
