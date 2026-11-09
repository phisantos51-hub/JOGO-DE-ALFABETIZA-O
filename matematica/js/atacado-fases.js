// =====================================================================
// ATACADO DO ROBÔ: fases de multiplicação e divisão (só para o 3º ano).
// Alinhadas ao Currículo da Cidade de São Paulo (Matemática, 3º ano).
//
// O robô agora também vende por atacado: monta cestas, caixas e pacotes
// com quantidades iguais e reparte as mercadorias entre os clientes.
//
// ---------------------------------------------------------------------
// COMO ACRESCENTAR UMA FASE NOVA
// ---------------------------------------------------------------------
// 1. Copie uma linha parecida com a que você quer (do mesmo "tipo").
// 2. Cole no lugar onde ela deve aparecer na lista "fases" (a ordem da
//    lista é a ordem das fases no jogo) e troque os números e o texto.
// 3. Confira se o texto do "pedido" fala dos mesmos números da fase.
// 4. Rode o teste para ver se está tudo certo:  node testes/matematica.test.js
//
// Campos que toda fase tem:
//   tipo     – o jeito de jogar (veja a lista abaixo)
//   icone    – desenho do botão da fase
//   cliente  – desenho do cliente que faz o pedido
//   pedido   – o que o cliente pede (aparece em letras grandes)
//   fruta    – a fruta usada (veja as frutas que têm nome na versão
//              acessível em ../acessivel/dados.js)
//
// Como a criança responde:
//   opcoes: [7, 10, 12]  – cartões com números para arrastar (a resposta
//                          certa precisa estar na lista)
//   digitar: true        – a criança digita o número ou usa os botões − e +.
//                          Nessas fases, mexer nas frutas é só uma ajuda:
//                          dá para responder direto, sem arrastar tudo.
//
// Tipos de fase:
//   montar     – encher grupos iguais (cestas, caixas, pacotes, pratos)
//                e dizer o total.  grupos × porGrupo
//                recipiente: 'cesta' | 'caixa' | 'pacote' | 'prato'
//                modelo: true  → o 1º grupo já vem pronto (dobro, triplo)
//                nome: 'dobro' | 'triplo'  → escreve "o dobro de 4"
//   parcelas   – grupos já prontos; completar a soma de parcelas iguais
//                e a multiplicação (3 + 3 + 3 + 3 = 4 × 3)
//   retangulo  – arrumar fileiras na banca (linhas e colunas)
//   contas     – lista de contas, cada uma com o desenho ao lado.
//                Ex.: contas: ['3 × 2', '12 ÷ 4']  (use × e ÷)
//   repartir   – repartir o monte, um a um, entre grupos (clientes,
//                cestas, pratos).  total ÷ grupos
//                parte: true → fala em metade, terça parte, quarta
//                              parte, quinta parte ou décima parte
//                rodada: true → mostra o botão "Dar 1 para cada"
//                Se o total não der certinho, o que sobra fica fora
//                das cestas e a criança diz também quanto sobrou.
//   cabem      – quantas caixas dá para montar: total ÷ porCaixa
//   relacao    – a multiplicação pronta (4 × 3 = 12) e as duas
//                divisões da mesma "família" (12 ÷ 3 e 12 ÷ 4)
// =====================================================================
const ATACADO = {
  titulo: 'Atacado do Robô',
  subtitulo: 'Multiplicação e divisão',
  descricao: 'O robô agora também vende por atacado: monta cestas, caixas e pacotes com quantidades iguais e reparte as mercadorias entre os clientes.',
  cor: '#7c3aed',
  // Só aparece dentro do 3º ano.
  ano: 3,
  fases: [
    // ---------- MULTIPLICAÇÃO ----------
    // Grupos iguais
    { tipo: 'montar', icone: '🧺', cliente: '👩', pedido: 'Monte 3 cestas com 2 laranjas em cada uma.', fruta: '🍊', recipiente: 'cesta', grupos: 3, porGrupo: 2, opcoes: [5, 6, 8] },
    { tipo: 'montar', icone: '🍊', cliente: '👴', pedido: 'Monte 4 cestas com 3 laranjas em cada uma.', fruta: '🍊', recipiente: 'cesta', grupos: 4, porGrupo: 3, opcoes: [7, 12, 15] },
    // Adição de parcelas iguais
    { tipo: 'parcelas', icone: '➕', cliente: '👨', pedido: 'O robô montou 4 pacotes com 3 peras. Complete a soma e a multiplicação.', fruta: '🍐', recipiente: 'pacote', grupos: 4, porGrupo: 3, opcoes: [3, 4, 7, 12] },
    // Organização retangular
    { tipo: 'retangulo', icone: '🍎', cliente: '👧', pedido: 'Arrume as maçãs na banca: 3 fileiras com 5 maçãs.', fruta: '🍎', linhas: 3, colunas: 5, opcoes: [8, 15, 20] },
    { tipo: 'retangulo', icone: '🟩', cliente: '🧑', pedido: 'Arrume as laranjas na banca: 4 fileiras com 6 laranjas.', fruta: '🍊', linhas: 4, colunas: 6, digitar: true },
    // Dobro e triplo
    { tipo: 'montar', icone: '✌️', cliente: '👦', pedido: 'O cliente levou 4 bananas. Hoje ele quer o dobro de bananas.', fruta: '🍌', recipiente: 'prato', grupos: 2, porGrupo: 4, modelo: true, nome: 'dobro', opcoes: [6, 8, 10] },
    { tipo: 'montar', icone: '🥉', cliente: '👵', pedido: 'A cliente levou 5 morangos. Hoje ela quer o triplo de morangos.', fruta: '🍓', recipiente: 'prato', grupos: 3, porGrupo: 5, modelo: true, nome: 'triplo', opcoes: [10, 15, 20] },
    // Tabuadas do 2, 3, 4, 5 e 10
    { tipo: 'contas', icone: '2️⃣', cliente: '👩‍🦱', pedido: 'Tabuada do 2 e do 10: quantas frutas em cada pedido?', fruta: '🍐', contas: ['3 × 2', '6 × 2', '4 × 10', '7 × 10'], digitar: true },
    { tipo: 'contas', icone: '5️⃣', cliente: '👨', pedido: 'Tabuada do 3, do 4 e do 5: quantas frutas em cada pedido?', fruta: '🍋', contas: ['4 × 3', '7 × 3', '5 × 4', '6 × 5'], digitar: true },

    // ---------- DIVISÃO ----------
    // Repartir igualmente (só divisões exatas)
    { tipo: 'repartir', icone: '🤝', cliente: '👧', pedido: 'Reparta 8 morangos igualmente entre 2 clientes.', fruta: '🍓', total: 8, grupos: 2, recipiente: 'cliente', opcoes: [3, 4, 6] },
    { tipo: 'repartir', icone: '🍓', cliente: '👵', pedido: 'Reparta 12 morangos igualmente entre 3 clientes.', fruta: '🍓', total: 12, grupos: 3, recipiente: 'cliente', opcoes: [3, 4, 9] },
    // Quantas vezes cabe
    { tipo: 'cabem', icone: '🥚', cliente: '👨', pedido: 'Tenho 20 ovos e cada caixa leva 5. Quantas caixas consigo montar?', fruta: '🥚', total: 20, porCaixa: 5, opcoes: [4, 5, 15] },
    // Metade, terça parte, quarta parte, quinta parte e décima parte
    { tipo: 'repartir', icone: '½', cliente: '👦', pedido: 'O cliente quer a metade de 10 bananas. Reparta em 2 pratos iguais.', fruta: '🍌', total: 10, grupos: 2, recipiente: 'prato', parte: true, opcoes: [2, 5, 8] },
    { tipo: 'repartir', icone: '⅓', cliente: '👩', pedido: 'A cliente quer a terça parte de 12 peras. Reparta em 3 pratos iguais.', fruta: '🍐', total: 12, grupos: 3, recipiente: 'prato', parte: true, rodada: true, opcoes: [3, 4, 9] },
    { tipo: 'repartir', icone: '¼', cliente: '🧑', pedido: 'O cliente quer a quarta parte de 16 maçãs. Reparta em 4 pratos iguais.', fruta: '🍎', total: 16, grupos: 4, recipiente: 'prato', parte: true, rodada: true, digitar: true },
    { tipo: 'repartir', icone: '🖐️', cliente: '👴', pedido: 'O cliente quer a quinta parte de 15 limões. Reparta em 5 pratos iguais.', fruta: '🍋', total: 15, grupos: 5, recipiente: 'prato', parte: true, rodada: true, digitar: true },
    { tipo: 'repartir', icone: '🔟', cliente: '👧', pedido: 'A cliente quer a décima parte de 30 uvas. Reparta em 10 pratos iguais.', fruta: '🍇', total: 30, grupos: 10, recipiente: 'prato', parte: true, rodada: true, digitar: true },

    // ---------- MULTIPLICAÇÃO E DIVISÃO JUNTAS ----------
    { tipo: 'relacao', icone: '🔁', cliente: '👩‍🦱', pedido: 'O robô montou 4 cestas com 3 maçãs: 4 × 3 = 12. Agora descubra as divisões.', fruta: '🍎', grupos: 4, porGrupo: 3, digitar: true },
    { tipo: 'contas', icone: '✖️', cliente: '👨', pedido: 'Multiplicação e divisão: resolva as contas do atacado.', fruta: '🍊', contas: ['5 × 4', '20 ÷ 4', '3 × 10', '30 ÷ 3'], digitar: true },
    // Última fase: divisão que sobra (primeiro contato)
    { tipo: 'repartir', icone: '🏆', cliente: '👵', pedido: 'Reparta 13 laranjas em 4 cestas, com a mesma quantidade em cada. O que não der para repartir fica fora das cestas.', fruta: '🍊', total: 13, grupos: 4, recipiente: 'cesta', rodada: true, opcoes: [1, 3, 4, 9] },
  ],
};

if (typeof module !== 'undefined' && module.exports) module.exports = { ATACADO };
