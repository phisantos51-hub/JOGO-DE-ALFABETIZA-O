// Fases da Feira do Robô, por ano, alinhadas ao Currículo da Cidade de São Paulo
// (Matemática, Ciclo de Alfabetização). Os valores em dinheiro estão em centavos.
//
// Tipos de fase:
//   sacola    – colocar na sacola a quantidade pedida (soltas, caixas de 10, engradados de 100)
//   quantos   – contar (ou juntar grupos) e escolher o número certo
//   comparar  – pôr a estrela na cesta com MAIS / MENOS, ou em IGUAIS
//   sequencia – completar a fila de caixotes numerados
//   valor     – escrever o número em centenas, dezenas e unidades
//   parimpar  – separar números em PAR e ÍMPAR
//   dinheiro  – pagar ou dar troco com cédulas e moedas
//   grupos    – montar cestas com a mesma quantidade (ideia de multiplicação)
const ANOS = {
  1: {
    titulo: '1º ano',
    subtitulo: 'Contar e juntar',
    descricao: 'Contagem até 30, número e quantidade, mais e menos, juntar e tirar até 10.',
    cor: '#ff7a1a',
    caixaAlta: true,
    fases: [
      { tipo: 'sacola', icone: '🍎', cliente: '👵', pedido: 'Quero 3 maçãs.', fruta: '🍎', alvo: 3, unidades: ['solta'] },
      { tipo: 'quantos', icone: '🍌', cliente: '👦', pedido: 'Quantas bananas tem na caixa?', grupos: [{ fruta: '🍌', n: 6 }], opcoes: [5, 6, 8] },
      { tipo: 'sacola', icone: '🍊', cliente: '👩', pedido: 'Quero 7 laranjas.', fruta: '🍊', alvo: 7, unidades: ['solta'] },
      { tipo: 'comparar', icone: '🍓', cliente: '👧', pedido: 'Qual cesta tem MAIS morangos?', pergunta: 'mais', a: { fruta: '🍓', n: 5 }, b: { fruta: '🍓', n: 8 } },
      { tipo: 'quantos', icone: '🍐', cliente: '👴', pedido: 'Junte as maçãs e as peras. Quantas frutas ao todo?', grupos: [{ fruta: '🍎', n: 3 }, { fruta: '🍐', n: 4 }], opcoes: [6, 7, 8] },
      { tipo: 'sacola', icone: '🥕', cliente: '🧑', pedido: 'Quero 12 cenouras.', fruta: '🥕', alvo: 12, unidades: ['solta'] },
      { tipo: 'comparar', icone: '🍋', cliente: '👩‍🦱', pedido: 'Qual cesta tem MENOS limões?', pergunta: 'menos', a: { fruta: '🍋', n: 9 }, b: { fruta: '🍋', n: 9 } },
      { tipo: 'quantos', icone: '🥒', cliente: '👨', pedido: 'Junte os pepinos. Quantos ao todo?', grupos: [{ fruta: '🥒', n: 6 }, { fruta: '🥒', n: 4 }], opcoes: [9, 10, 11] },
      { tipo: 'quantos', icone: '🍅', cliente: '👵', pedido: 'Quantos tomates tem na caixa?', grupos: [{ fruta: '🍅', n: 18 }], opcoes: [16, 18, 20] },
      { tipo: 'sacola', icone: '🥚', cliente: '👩', pedido: 'Quero 30 ovos.', fruta: '🥚', alvo: 30, unidades: ['solta'] },
      // Fases 11 a 20: mais contagem, comparação, juntar e separar (tirar) até 10, sequência até 20.
      { tipo: 'sacola', icone: '🍌', cliente: '👦', pedido: 'Quero 9 bananas.', fruta: '🍌', alvo: 9, unidades: ['solta'] },
      { tipo: 'quantos', icone: '🍓', cliente: '👵', pedido: 'Quantos morangos tem na caixa?', grupos: [{ fruta: '🍓', n: 13 }], opcoes: [12, 13, 15] },
      { tipo: 'comparar', icone: '🍐', cliente: '👨', pedido: 'Qual cesta tem MAIS peras?', pergunta: 'mais', a: { fruta: '🍐', n: 7 }, b: { fruta: '🍐', n: 4 } },
      { tipo: 'quantos', icone: '🍋', cliente: '👧', pedido: 'Junte as laranjas e os limões. Quantas frutas ao todo?', grupos: [{ fruta: '🍊', n: 2 }, { fruta: '🍋', n: 5 }], opcoes: [6, 7, 9] },
      { tipo: 'sacola', icone: '➖', cliente: '👴', pedido: 'A sacola tem 8 maçãs. Tire 3.', conta: '8 − 3', fruta: '🍎', inicial: 8, alvo: 5, unidades: ['solta'] },
      { tipo: 'sequencia', icone: '🔢', cliente: '🧑', pedido: 'Complete a fila de caixotes.', itens: [11, 12, 13, 14, 15, 16], lacunas: [2, 4], extras: [10, 17] },
      { tipo: 'comparar', icone: '🥕', cliente: '👩‍🦱', pedido: 'Qual cesta tem MENOS cenouras?', pergunta: 'menos', a: { fruta: '🥕', n: 10 }, b: { fruta: '🥕', n: 6 } },
      { tipo: 'quantos', icone: '🥚', cliente: '👩', pedido: 'Quantos ovos tem na caixa?', grupos: [{ fruta: '🥚', n: 24 }], opcoes: [22, 24, 25] },
      { tipo: 'sacola', icone: '🍅', cliente: '👦', pedido: 'A sacola tem 10 tomates. Tire 4.', conta: '10 − 4', fruta: '🍅', inicial: 10, alvo: 6, unidades: ['solta'] },
      { tipo: 'sacola', icone: '🏆', cliente: '👵', pedido: 'Quero 27 morangos.', fruta: '🍓', alvo: 27, unidades: ['solta'] },
    ],
  },
  2: {
    titulo: '2º ano',
    subtitulo: 'Dezenas e contas',
    descricao: 'Caixas de 10, adição e subtração até 100, sequência, par e ímpar.',
    cor: '#2f7de1',
    fases: [
      { tipo: 'sacola', icone: '📦', cliente: '👨', pedido: 'Quero 23 laranjas.', fruta: '🍊', alvo: 23, unidades: ['caixa', 'solta'] },
      { tipo: 'sequencia', icone: '🔢', cliente: '👧', pedido: 'Complete a fila de caixotes.', itens: [21, 22, 23, 24, 25, 26], lacunas: [2, 4], extras: [20, 27] },
      { tipo: 'parimpar', icone: '👟', cliente: '👦', pedido: 'Separe os números em PAR e ÍMPAR.', numeros: [4, 7, 10, 13, 16, 9] },
      { tipo: 'sacola', icone: '➕', cliente: '👵', pedido: 'A sacola tem 15 maçãs. Coloque mais 12.', conta: '15 + 12', fruta: '🍎', inicial: 15, alvo: 27, unidades: ['caixa', 'solta'] },
      { tipo: 'sacola', icone: '🍌', cliente: '🧑', pedido: 'Quero 50 bananas.', fruta: '🍌', alvo: 50, unidades: ['caixa', 'solta'] },
      { tipo: 'sequencia', icone: '🔟', cliente: '👩', pedido: 'Os caixotes vão de 10 em 10. Complete!', itens: [10, 20, 30, 40, 50, 60], lacunas: [2, 4], extras: [35, 70] },
      { tipo: 'sacola', icone: '➖', cliente: '👴', pedido: 'A sacola tem 36 peras. Tire 14.', conta: '36 − 14', fruta: '🍐', inicial: 36, alvo: 22, unidades: ['caixa', 'solta'] },
      { tipo: 'parimpar', icone: '🧦', cliente: '👧', pedido: 'Separe os números em PAR e ÍMPAR.', numeros: [21, 34, 45, 50, 67, 88] },
      { tipo: 'sacola', icone: '✂️', cliente: '👩‍🦱', pedido: 'A sacola tem 52 limões. Tire 18.', conta: '52 − 18', fruta: '🍋', inicial: 52, alvo: 34, unidades: ['caixa', 'solta'], abrir: true },
      { tipo: 'sacola', icone: '🍅', cliente: '👨', pedido: 'A sacola tem 47 tomates. Coloque mais 36.', conta: '47 + 36', fruta: '🍅', inicial: 47, alvo: 83, unidades: ['caixa', 'solta'] },
      // Fases 11 a 20: mais dezenas e unidades, adição e subtração até 100, sequências e par ou ímpar.
      { tipo: 'sacola', icone: '🍊', cliente: '👩', pedido: 'Quero 38 laranjas.', fruta: '🍊', alvo: 38, unidades: ['caixa', 'solta'] },
      { tipo: 'sequencia', icone: '2️⃣', cliente: '👦', pedido: 'Os caixotes vão de 2 em 2. Complete!', itens: [12, 14, 16, 18, 20, 22], lacunas: [2, 4], extras: [17, 23] },
      { tipo: 'parimpar', icone: '👟', cliente: '👵', pedido: 'Separe os números em PAR e ÍMPAR.', numeros: [8, 11, 15, 20, 23, 26] },
      { tipo: 'sacola', icone: '➕', cliente: '🧑', pedido: 'A sacola tem 24 bananas. Coloque mais 15.', conta: '24 + 15', fruta: '🍌', inicial: 24, alvo: 39, unidades: ['caixa', 'solta'] },
      { tipo: 'sequencia', icone: '5️⃣', cliente: '👧', pedido: 'Os caixotes vão de 5 em 5. Complete!', itens: [25, 30, 35, 40, 45, 50], lacunas: [2, 4], extras: [36, 55] },
      { tipo: 'sacola', icone: '➖', cliente: '👴', pedido: 'A sacola tem 58 peras. Tire 23.', conta: '58 − 23', fruta: '🍐', inicial: 58, alvo: 35, unidades: ['caixa', 'solta'] },
      { tipo: 'sacola', icone: '✂️', cliente: '👩‍🦱', pedido: 'A sacola tem 43 tomates. Tire 17.', conta: '43 − 17', fruta: '🍅', inicial: 43, alvo: 26, unidades: ['caixa', 'solta'], abrir: true },
      { tipo: 'parimpar', icone: '🧦', cliente: '👨', pedido: 'Separe os números em PAR e ÍMPAR.', numeros: [32, 47, 54, 69, 76, 91] },
      { tipo: 'sacola', icone: '🍎', cliente: '👦', pedido: 'A sacola tem 58 maçãs. Coloque mais 27.', conta: '58 + 27', fruta: '🍎', inicial: 58, alvo: 85, unidades: ['caixa', 'solta'] },
      { tipo: 'sacola', icone: '💯', cliente: '👵', pedido: 'Quero 100 morangos.', fruta: '🍓', alvo: 100, unidades: ['caixa', 'solta'] },
    ],
  },
  3: {
    titulo: '3º ano',
    subtitulo: 'Centenas e dinheiro',
    descricao: 'Centena, dezena e unidade, troco, grupos iguais, cédulas e moedas. Fases 11 a 20: desafios do troco.',
    cor: '#1f9d55',
    fases: [
      { tipo: 'sacola', icone: '🧺', cliente: '👨', pedido: 'Quero 134 laranjas.', fruta: '🍊', alvo: 134, unidades: ['engradado', 'caixa', 'solta'] },
      { tipo: 'valor', icone: '💯', cliente: '👧', pedido: 'Quantas maçãs tem na barraca? Escreva o número.', fruta: '🍎', c: 2, d: 4, u: 5 },
      { tipo: 'dinheiro', icone: '🍍', cliente: '👩', pedido: 'Pague o abacaxi.', produtos: [{ emoji: '🍍', nome: 'abacaxi', preco: 1700 }], caixa: [100, 200, 500, 1000, 2000] },
      { tipo: 'grupos', icone: '🧺', cliente: '👴', pedido: 'Monte 4 cestas com 3 maçãs em cada uma.', fruta: '🍎', cestas: 4, porCesta: 3, opcoes: [7, 10, 12] },
      { tipo: 'dinheiro', icone: '🍉', cliente: '👦', pedido: 'A melancia custa R$ 7,00. O cliente pagou com R$ 10,00. Dê o troco.', produtos: [{ emoji: '🍉', nome: 'melancia', preco: 700 }], pago: 1000, caixa: [100, 200, 500] },
      { tipo: 'sacola', icone: '🥚', cliente: '👵', pedido: 'Quero 306 ovos.', fruta: '🥚', alvo: 306, unidades: ['engradado', 'caixa', 'solta'] },
      { tipo: 'grupos', icone: '🍐', cliente: '🧑', pedido: 'Monte 3 cestas com 5 peras em cada uma.', fruta: '🍐', cestas: 3, porCesta: 5, opcoes: [8, 15, 18] },
      { tipo: 'dinheiro', icone: '🥬', cliente: '👩‍🦱', pedido: 'A alface custa R$ 3,50. O cliente pagou com R$ 5,00. Dê o troco.', produtos: [{ emoji: '🥬', nome: 'alface', preco: 350 }], pago: 500, caixa: [10, 25, 50, 100] },
      { tipo: 'valor', icone: '🔢', cliente: '👨', pedido: 'Quantas laranjas tem na barraca? Escreva o número.', fruta: '🍊', c: 3, d: 1, u: 8 },
      { tipo: 'dinheiro', icone: '🛒', cliente: '👧', pedido: 'O cliente comprou melão e uvas e pagou com R$ 50,00. Dê o troco.', produtos: [{ emoji: '🍈', nome: 'melão', preco: 1200 }, { emoji: '🍇', nome: 'uvas', preco: 600 }], pago: 5000, caixa: [100, 200, 500, 1000, 2000] },
      // Desafios do troco: some as compras e depois descubra o troco.
      // Começa com reais inteiros, passa para três produtos e termina com centavos.
      { tipo: 'dinheiro', icone: '🍌', cliente: '👵', pedido: 'A cliente comprou bananas e laranjas e pagou com R$ 10,00. Dê o troco.', produtos: [{ emoji: '🍌', nome: 'bananas', preco: 400 }, { emoji: '🍊', nome: 'laranjas', preco: 300 }], pago: 1000, caixa: [100, 200, 500] },
      { tipo: 'dinheiro', icone: '🍍', cliente: '👨', pedido: 'O cliente comprou abacaxi e morangos e pagou com R$ 20,00. Dê o troco.', produtos: [{ emoji: '🍍', nome: 'abacaxi', preco: 800 }, { emoji: '🍓', nome: 'morangos', preco: 500 }], pago: 2000, caixa: [100, 200, 500, 1000] },
      { tipo: 'dinheiro', icone: '🍉', cliente: '👩', pedido: 'A cliente comprou melancia e limões e pagou com R$ 20,00. Dê o troco.', produtos: [{ emoji: '🍉', nome: 'melancia', preco: 1500 }, { emoji: '🍋', nome: 'limões', preco: 400 }], pago: 2000, caixa: [100, 200, 500, 1000] },
      { tipo: 'dinheiro', icone: '🥚', cliente: '🧑', pedido: 'O cliente comprou ovos e melão e pagou com R$ 50,00. Dê o troco.', produtos: [{ emoji: '🥚', nome: 'ovos', preco: 1200 }, { emoji: '🍈', nome: 'melão', preco: 900 }], pago: 5000, caixa: [100, 200, 500, 1000, 2000] },
      { tipo: 'dinheiro', icone: '🧺', cliente: '👴', pedido: 'O cliente comprou maçãs, peras e bananas e pagou com R$ 50,00. Dê o troco.', produtos: [{ emoji: '🍎', nome: 'maçãs', preco: 600 }, { emoji: '🍐', nome: 'peras', preco: 700 }, { emoji: '🍌', nome: 'bananas', preco: 500 }], pago: 5000, caixa: [100, 200, 500, 1000, 2000] },
      { tipo: 'dinheiro', icone: '🛍️', cliente: '👩‍🦱', pedido: 'A cliente comprou melancia, abacaxi e cenouras e pagou com R$ 100,00. Dê o troco.', produtos: [{ emoji: '🍉', nome: 'melancia', preco: 2300 }, { emoji: '🍍', nome: 'abacaxi', preco: 900 }, { emoji: '🥕', nome: 'cenouras', preco: 600 }], pago: 10000, caixa: [100, 200, 500, 1000, 2000, 5000] },
      { tipo: 'dinheiro', icone: '🥕', cliente: '👦', pedido: 'O cliente comprou cenouras e tomates e pagou com R$ 10,00. Dê o troco.', produtos: [{ emoji: '🥕', nome: 'cenouras', preco: 350 }, { emoji: '🍅', nome: 'tomates', preco: 450 }], pago: 1000, caixa: [25, 50, 100, 200] },
      { tipo: 'dinheiro', icone: '🥬', cliente: '👵', pedido: 'A cliente comprou alface e pepinos e pagou com R$ 10,00. Dê o troco.', produtos: [{ emoji: '🥬', nome: 'alface', preco: 250 }, { emoji: '🥒', nome: 'pepinos', preco: 325 }], pago: 1000, caixa: [25, 50, 100, 200] },
      { tipo: 'dinheiro', icone: '🍇', cliente: '👧', pedido: 'A cliente comprou uvas, morangos e laranjas e pagou com R$ 20,00. Dê o troco.', produtos: [{ emoji: '🍇', nome: 'uvas', preco: 725 }, { emoji: '🍓', nome: 'morangos', preco: 650 }, { emoji: '🍊', nome: 'laranjas', preco: 400 }], pago: 2000, caixa: [25, 50, 100, 200] },
      { tipo: 'dinheiro', icone: '🏆', cliente: '👨', pedido: 'O cliente comprou melão, ovos e maçãs e pagou com R$ 50,00. Dê o troco.', produtos: [{ emoji: '🍈', nome: 'melão', preco: 1350 }, { emoji: '🥚', nome: 'ovos', preco: 1175 }, { emoji: '🍎', nome: 'maçãs', preco: 850 }], pago: 5000, caixa: [25, 50, 100, 200, 500, 1000] },
    ],
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = { ANOS };
