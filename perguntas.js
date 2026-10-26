/* =====================================================================
   ROTA DIGITAL — PERGUNTAS E SITUAÇÕES
   =====================================================================
   Este arquivo guarda:
     • TICS ........ as perguntas do Bairro das TICs (Loja de Tecnologia)
     • CIDADANIA ... as situações do Bairro da Cidadania Digital (placas)

   Cada um tem uma lista para o 1º, o 2º e o 3º ano. O jogo junta as
   perguntas de 3 em 3 para formar as missões (veja ITENS_POR_MISSAO).
   Se você acrescentar 3 perguntas num ano, aparece uma missão nova.

   ---------------------------------------------------------------------
   COMO ACRESCENTAR UMA PERGUNTA
   ---------------------------------------------------------------------
   1. Encontre a lista do ano (por exemplo  TICS ... 2: [ ).
   2. Copie um dos modelos abaixo e cole antes do ]  que fecha a lista.
   3. Troque os textos. Mantenha as aspas simples ' ' e as vírgulas.
   4. Salve o arquivo e recarregue o jogo no navegador (tecla F5).

   Dica: se precisar usar apóstrofo no texto, escreva \' (ex.: 'd\'água').

   No 1º ano o jogo mostra tudo em LETRA MAIÚSCULA sozinho;
   pode escrever normalmente.

   O campo  img  pode ser:
     • o nome de um desenho do jogo:
         computador, notebook, tablet, celular, mouse, teclado, fone,
         impressora, pendrive, salvar, imprimir, apagar, voltar,
         pesquisar, som, camera, texto, foto, video, audio, jogo, email
     • ou qualquer emoji, por exemplo '🐶' ou '🎨'.

   MODELO 1 — ESCOLHER A RESPOSTA (2 ou 3 opções, só uma certa):

    {
      tipo: 'escolha',
      pergunta: 'Qual destes serve para ouvir?',
      opcoes: [
        { img: 'fone', texto: 'Fone de ouvido', certa: true },
        { img: 'mouse', texto: 'Mouse', dica: 'O mouse serve para clicar.' },
        { img: 'teclado', texto: 'Teclado' },
      ],
      explicacao: 'O fone leva o som só para os seus ouvidos.',
    },

   • certa: true  marca a opção certa (só uma por pergunta).
   • dica (opcional) aparece quando a criança escolhe aquela opção errada.
   • explicacao aparece quando a criança acerta.
   • placa (opcional) é o emoji que aparece em cima da pergunta.

   MODELO 2 — ARRASTAR CADA ITEM ATÉ O LUGAR CERTO (só no Bairro das TICs):

    {
      tipo: 'arrastar',
      pergunta: 'Leve cada aparelho até o que ele faz.',
      lugares: [
        { id: 'ouvir', img: '👂', texto: 'Ouvir' },
        { id: 'escrever', img: '✏️', texto: 'Escrever' },
      ],
      itens: [
        { img: 'fone', texto: 'Fone de ouvido', lugar: 'ouvir' },
        { img: 'teclado', texto: 'Teclado', lugar: 'escrever' },
      ],
      explicacao: 'Cada aparelho tem o seu trabalho.',
    },

   • Cada lugar tem um id (uma palavra, sem espaço).
   • Em cada item, lugar diz o id do lugar certo.
   • Use de 2 a 4 lugares e de 2 a 5 itens.

   As situações da CIDADANIA usam o MODELO 1 (escolha). Nelas, a dica de
   cada opção errada deve ser curta e acolhedora: explica o porquê, sem
   dar bronca.

   Para conferir se não ficou nenhum erro de digitação, quem tiver o
   Node.js pode rodar:  node testes/rota.test.js
   ===================================================================== */

var ITENS_POR_MISSAO = 3;

/* =====================================================================
   BAIRRO DAS TICs — Loja de Tecnologia
   ===================================================================== */
var TICS = {
  // ---------- 1º ano: aparelhos, periféricos e para que servem ----------
  1: [
    {
      tipo: 'escolha',
      pergunta: 'Qual é o mouse?',
      opcoes: [
        { img: 'mouse', texto: 'Mouse', certa: true },
        { img: 'teclado', texto: 'Teclado', dica: 'Esse é o teclado. Ele tem letras.' },
        { img: 'pendrive', texto: 'Pen drive', dica: 'Esse é o pen drive. Ele guarda arquivos.' },
      ],
      explicacao: 'O mouse cabe na mão. Com ele, a gente aponta e clica.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual é o teclado?',
      opcoes: [
        { img: 'impressora', texto: 'Impressora', dica: 'Essa é a impressora. Ela põe no papel.' },
        { img: 'teclado', texto: 'Teclado', certa: true },
        { img: 'tablet', texto: 'Tablet', dica: 'Esse é o tablet. A gente toca na tela.' },
      ],
      explicacao: 'O teclado tem letras e números. Com ele, a gente escreve.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual serve para ouvir sem atrapalhar os colegas?',
      opcoes: [
        { img: 'mouse', texto: 'Mouse', dica: 'O mouse serve para clicar.' },
        { img: 'impressora', texto: 'Impressora', dica: 'A impressora não faz som para você ouvir.' },
        { img: 'fone', texto: 'Fone de ouvido', certa: true },
      ],
      explicacao: 'O fone de ouvido leva o som só para os seus ouvidos.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Leve cada aparelho até o que ele faz.',
      lugares: [
        { id: 'clicar', img: '👆', texto: 'Clicar' },
        { id: 'escrever', img: '✏️', texto: 'Escrever' },
        { id: 'ouvir', img: '👂', texto: 'Ouvir' },
        { id: 'papel', img: '📄', texto: 'Pôr no papel' },
      ],
      itens: [
        { img: 'mouse', texto: 'Mouse', lugar: 'clicar' },
        { img: 'teclado', texto: 'Teclado', lugar: 'escrever' },
        { img: 'fone', texto: 'Fone', lugar: 'ouvir' },
        { img: 'impressora', texto: 'Impressora', lugar: 'papel' },
      ],
      explicacao: 'Cada aparelho tem o seu trabalho. Juntos, eles ajudam a gente a usar o computador.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual é o tablet?',
      opcoes: [
        { img: 'tablet', texto: 'Tablet', certa: true },
        { img: 'computador', texto: 'Computador', dica: 'Esse é o computador de mesa.' },
        { img: 'fone', texto: 'Fone', dica: 'Esse é o fone de ouvido.' },
      ],
      explicacao: 'O tablet é uma tela grande. A gente usa tocando com o dedo.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual é o celular?',
      opcoes: [
        { img: 'notebook', texto: 'Notebook', dica: 'Esse é o notebook. Ele abre e fecha.' },
        { img: 'celular', texto: 'Celular', certa: true },
        { img: 'mouse', texto: 'Mouse', dica: 'Esse é o mouse.' },
      ],
      explicacao: 'O celular é pequeno e cabe no bolso. Serve para ligar, mandar mensagem e muito mais.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual é o notebook?',
      opcoes: [
        { img: 'computador', texto: 'Computador', dica: 'Esse fica parado na mesa.' },
        { img: 'impressora', texto: 'Impressora', dica: 'Essa é a impressora.' },
        { img: 'notebook', texto: 'Notebook', certa: true },
      ],
      explicacao: 'O notebook é um computador que fecha. Dá para levar de um lugar para outro.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual guarda arquivos, como desenhos e textos?',
      opcoes: [
        { img: 'pendrive', texto: 'Pen drive', certa: true },
        { img: 'fone', texto: 'Fone', dica: 'O fone serve para ouvir.' },
        { img: 'mouse', texto: 'Mouse', dica: 'O mouse serve para clicar.' },
      ],
      explicacao: 'O pen drive é pequenininho e guarda arquivos. Dá para levar para outro computador.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual põe no papel o que está na tela?',
      opcoes: [
        { img: 'celular', texto: 'Celular', dica: 'O celular mostra na tela, não no papel.' },
        { img: 'impressora', texto: 'Impressora', certa: true },
        { img: 'teclado', texto: 'Teclado', dica: 'O teclado serve para escrever.' },
      ],
      explicacao: 'A impressora imprime: põe no papel o desenho ou o texto da tela.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Separe: tem tela ou não tem tela?',
      lugares: [
        { id: 'tem', img: '📺', texto: 'Tem tela' },
        { id: 'nao', img: '🚫', texto: 'Não tem tela' },
      ],
      itens: [
        { img: 'tablet', texto: 'Tablet', lugar: 'tem' },
        { img: 'mouse', texto: 'Mouse', lugar: 'nao' },
        { img: 'celular', texto: 'Celular', lugar: 'tem' },
        { img: 'fone', texto: 'Fone', lugar: 'nao' },
      ],
      explicacao: 'Tablet e celular têm tela. Mouse e fone ajudam o computador, mas não têm tela.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Para escrever o seu nome no computador, você usa o...',
      opcoes: [
        { img: 'fone', texto: 'Fone', dica: 'O fone serve para ouvir.' },
        { img: 'teclado', texto: 'Teclado', certa: true },
        { img: 'impressora', texto: 'Impressora', dica: 'A impressora põe no papel.' },
      ],
      explicacao: 'No teclado a gente aperta as letras para escrever.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Leve cada aparelho para quem precisa dele.',
      lugares: [
        { id: 'musica', img: '🎵', texto: 'Quero ouvir música' },
        { id: 'guardar', img: '🖍️', texto: 'Quero guardar meu desenho' },
        { id: 'ligar', img: '👵', texto: 'Quero ligar para a vovó' },
      ],
      itens: [
        { img: 'fone', texto: 'Fone', lugar: 'musica' },
        { img: 'pendrive', texto: 'Pen drive', lugar: 'guardar' },
        { img: 'celular', texto: 'Celular', lugar: 'ligar' },
      ],
      explicacao: 'Muito bem! Você escolheu o aparelho certo para cada pedido.',
    },
  ],

  // ---------- 2º ano: ícones de programas e de ações ----------
  2: [
    {
      tipo: 'escolha',
      pergunta: 'Qual ícone serve para SALVAR o trabalho?',
      opcoes: [
        { img: 'salvar', texto: 'Salvar', certa: true },
        { img: 'apagar', texto: 'Apagar', dica: 'A lixeira apaga. Cuidado para não perder o trabalho!' },
        { img: 'pesquisar', texto: 'Pesquisar', dica: 'A lupa serve para procurar.' },
      ],
      explicacao: 'O disquete é o ícone de salvar. Ele guarda o seu trabalho para não perder.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual ícone serve para APAGAR?',
      opcoes: [
        { img: 'salvar', texto: 'Salvar', dica: 'O disquete guarda o trabalho.' },
        { img: 'camera', texto: 'Câmera', dica: 'A câmera tira fotos.' },
        { img: 'apagar', texto: 'Apagar', certa: true },
      ],
      explicacao: 'A lixeira joga fora o que a gente não quer mais.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual ícone serve para PESQUISAR?',
      opcoes: [
        { img: 'som', texto: 'Som', dica: 'O alto-falante mexe no som.' },
        { img: 'pesquisar', texto: 'Pesquisar', certa: true },
        { img: 'voltar', texto: 'Voltar', dica: 'A seta volta para a tela de antes.' },
      ],
      explicacao: 'A lupa procura coisas, como uma palavra ou um assunto.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Leve cada ícone até o que ele faz.',
      lugares: [
        { id: 'guardar', img: '📂', texto: 'Guardar' },
        { id: 'papel', img: '📄', texto: 'Pôr no papel' },
        { id: 'fora', img: '🚮', texto: 'Jogar fora' },
        { id: 'antes', img: '↩️', texto: 'Ir para a tela de antes' },
      ],
      itens: [
        { img: 'salvar', texto: 'Salvar', lugar: 'guardar' },
        { img: 'imprimir', texto: 'Imprimir', lugar: 'papel' },
        { img: 'apagar', texto: 'Apagar', lugar: 'fora' },
        { img: 'voltar', texto: 'Voltar', lugar: 'antes' },
      ],
      explicacao: 'Os ícones são desenhos que mostram o que cada botão faz.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Você quer ouvir o vídeo mais alto. Qual ícone procura?',
      opcoes: [
        { img: 'camera', texto: 'Câmera', dica: 'A câmera tira fotos.' },
        { img: 'imprimir', texto: 'Imprimir', dica: 'A impressora põe no papel.' },
        { img: 'som', texto: 'Som', certa: true },
      ],
      explicacao: 'O alto-falante é o ícone do som. Com ele, a gente aumenta ou abaixa o volume.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual ícone abre a câmera para tirar uma foto?',
      opcoes: [
        { img: 'camera', texto: 'Câmera', certa: true },
        { img: 'salvar', texto: 'Salvar', dica: 'O disquete guarda o trabalho.' },
        { img: 'pesquisar', texto: 'Pesquisar', dica: 'A lupa procura coisas.' },
      ],
      explicacao: 'O desenho da câmera abre a câmera para tirar fotos ou gravar.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Você abriu a página errada. Qual ícone leva para a página de antes?',
      opcoes: [
        { img: 'apagar', texto: 'Apagar', dica: 'A lixeira apaga coisas.' },
        { img: 'voltar', texto: 'Voltar', certa: true },
        { img: 'som', texto: 'Som', dica: 'O alto-falante mexe no som.' },
      ],
      explicacao: 'A seta para trás volta para a página de antes.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Você terminou o desenho e quer levar no papel para casa. Qual ícone?',
      opcoes: [
        { img: 'pesquisar', texto: 'Pesquisar', dica: 'A lupa procura coisas.' },
        { img: 'som', texto: 'Som', dica: 'O alto-falante mexe no som.' },
        { img: 'imprimir', texto: 'Imprimir', certa: true },
      ],
      explicacao: 'O ícone da impressora manda o desenho para o papel.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Leve cada ícone até o seu nome.',
      lugares: [
        { id: 'pesquisar', img: '', texto: 'PESQUISAR' },
        { id: 'camera', img: '', texto: 'CÂMERA' },
        { id: 'som', img: '', texto: 'SOM' },
      ],
      itens: [
        { img: 'pesquisar', texto: '', lugar: 'pesquisar' },
        { img: 'camera', texto: '', lugar: 'camera' },
        { img: 'som', texto: '', lugar: 'som' },
      ],
      explicacao: 'Você leu os nomes e achou os ícones. Muito bem!',
    },
    {
      tipo: 'escolha',
      pergunta: 'Antes de fechar o programa, o que é bom fazer para não perder o texto?',
      opcoes: [
        { img: 'salvar', texto: 'Salvar', certa: true },
        { img: 'apagar', texto: 'Apagar', dica: 'Se apagar, o texto vai embora.' },
        { img: 'voltar', texto: 'Voltar', dica: 'Voltar não guarda o texto.' },
      ],
      explicacao: 'Salvar guarda o texto. Assim você pode abrir de novo depois.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Você quer fazer um desenho no computador. Qual programa abre?',
      opcoes: [
        { img: '🧮', texto: 'Calculadora', dica: 'A calculadora faz contas.' },
        { img: '🎨', texto: 'Desenho', certa: true },
        { img: '🎵', texto: 'Música', dica: 'Esse programa toca músicas.' },
      ],
      explicacao: 'O ícone de paleta de tintas abre o programa de desenho.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Leve cada programa até o que ele faz.',
      lugares: [
        { id: 'desenhar', img: '🖌️', texto: 'Desenhar' },
        { id: 'contas', img: '➕', texto: 'Fazer contas' },
        { id: 'internet', img: '🌐', texto: 'Entrar na internet' },
      ],
      itens: [
        { img: '🎨', texto: 'Desenho', lugar: 'desenhar' },
        { img: '🧮', texto: 'Calculadora', lugar: 'contas' },
        { img: '🧭', texto: 'Navegador', lugar: 'internet' },
      ],
      explicacao: 'Cada programa tem o seu ícone. O ícone ajuda a achar o programa certo.',
    },
  ],

  // ---------- 3º ano: tipos de mídia e qual é melhor em cada situação ----------
  3: [
    {
      tipo: 'escolha',
      pergunta: 'Qual destes é um VÍDEO?',
      opcoes: [
        { img: 'foto', texto: 'Foto', dica: 'A foto é uma imagem parada.' },
        { img: 'video', texto: 'Vídeo', certa: true },
        { img: 'texto', texto: 'Texto', dica: 'O texto é feito de palavras.' },
      ],
      explicacao: 'O vídeo tem imagens que se mexem e, muitas vezes, som.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual destes é um ÁUDIO?',
      opcoes: [
        { img: 'audio', texto: 'Áudio', certa: true },
        { img: 'foto', texto: 'Foto', dica: 'A foto a gente vê, não escuta.' },
        { img: 'jogo', texto: 'Jogo', dica: 'O jogo a gente joga.' },
      ],
      explicacao: 'Áudio é só som: uma música, uma voz, um recado falado.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Leve cada mídia até o seu nome.',
      lugares: [
        { id: 'texto', img: '', texto: 'Texto' },
        { id: 'foto', img: '', texto: 'Foto' },
        { id: 'video', img: '', texto: 'Vídeo' },
        { id: 'audio', img: '', texto: 'Áudio' },
      ],
      itens: [
        { img: 'video', texto: '', lugar: 'video' },
        { img: 'texto', texto: '', lugar: 'texto' },
        { img: 'audio', texto: '', lugar: 'audio' },
        { img: 'foto', texto: '', lugar: 'foto' },
      ],
      explicacao: 'Texto se lê, foto se vê, vídeo se vê e se ouve, áudio se ouve.',
    },
    {
      tipo: 'escolha',
      placa: '🎉',
      pergunta: 'Quero mostrar como foi a festa da escola, com música e dança.',
      opcoes: [
        { img: 'texto', texto: 'Texto', dica: 'O texto conta, mas não mostra a dança nem a música.' },
        { img: 'video', texto: 'Vídeo', certa: true },
        { img: 'jogo', texto: 'Jogo', dica: 'Um jogo não mostra como foi a festa.' },
      ],
      explicacao: 'O vídeo mostra o movimento da dança e o som da música.',
    },
    {
      tipo: 'escolha',
      placa: '✏️',
      pergunta: 'Quero mandar uma mensagem escrita para a professora.',
      opcoes: [
        { img: 'jogo', texto: 'Jogo', dica: 'O jogo não leva mensagens.' },
        { img: 'foto', texto: 'Foto', dica: 'A foto mostra uma imagem, não uma mensagem escrita.' },
        { img: 'email', texto: 'E-mail', certa: true },
      ],
      explicacao: 'O e-mail é uma mensagem escrita que vai pela internet.',
    },
    {
      tipo: 'escolha',
      placa: '🖍️',
      pergunta: 'Quero guardar como ficou o desenho que fiz no papel.',
      opcoes: [
        { img: 'foto', texto: 'Foto', certa: true },
        { img: 'audio', texto: 'Áudio', dica: 'O áudio guarda sons, não desenhos.' },
        { img: 'jogo', texto: 'Jogo', dica: 'Um jogo não guarda o seu desenho.' },
      ],
      explicacao: 'A foto guarda uma imagem parada, igualzinha ao desenho.',
    },
    {
      tipo: 'escolha',
      placa: '👵',
      pergunta: 'Quero que a vovó escute uma música que eu cantei.',
      opcoes: [
        { img: 'texto', texto: 'Texto', dica: 'No texto, a vovó lê, mas não escuta.' },
        { img: 'audio', texto: 'Áudio', certa: true },
        { img: 'foto', texto: 'Foto', dica: 'A foto não tem som.' },
      ],
      explicacao: 'O áudio guarda a sua voz. A vovó vai poder escutar a música.',
    },
    {
      tipo: 'escolha',
      placa: '✖️',
      pergunta: 'Quero treinar a tabuada me divertindo.',
      opcoes: [
        { img: 'email', texto: 'E-mail', dica: 'O e-mail serve para mandar mensagens.' },
        { img: 'foto', texto: 'Foto', dica: 'A foto mostra uma imagem.' },
        { img: 'jogo', texto: 'Jogo', certa: true },
      ],
      explicacao: 'Um jogo ajuda a aprender brincando.',
    },
    {
      tipo: 'escolha',
      placa: '🎂',
      pergunta: 'Quero escrever a receita do bolo para a turma ler.',
      opcoes: [
        { img: 'texto', texto: 'Texto', certa: true },
        { img: 'jogo', texto: 'Jogo', dica: 'O jogo não serve para ler uma receita.' },
        { img: 'foto', texto: 'Foto', dica: 'A foto mostra o bolo, mas não ensina a fazer.' },
      ],
      explicacao: 'No texto, a turma lê a receita com calma, passo a passo.',
    },
    {
      tipo: 'arrastar',
      pergunta: 'Leve cada pedido até a mídia certa.',
      lugares: [
        { id: 'audio', img: 'audio', texto: 'Áudio' },
        { id: 'video', img: 'video', texto: 'Vídeo' },
        { id: 'email', img: 'email', texto: 'E-mail' },
      ],
      itens: [
        { img: '🎤', texto: 'Música que eu cantei', lugar: 'audio' },
        { img: '💃', texto: 'Dança da festa', lugar: 'video' },
        { img: '✉️', texto: 'Recado escrito para a professora', lugar: 'email' },
      ],
      explicacao: 'Para cada situação existe uma mídia que combina mais.',
    },
    {
      tipo: 'escolha',
      pergunta: 'Qual destes é um E-MAIL?',
      opcoes: [
        { img: 'video', texto: 'Vídeo', dica: 'Esse é o vídeo.' },
        { img: 'email', texto: 'E-mail', certa: true },
        { img: 'audio', texto: 'Áudio', dica: 'Esse é o áudio.' },
      ],
      explicacao: 'O envelope com @ representa o e-mail, a carta da internet.',
    },
    {
      tipo: 'escolha',
      placa: '🌱',
      pergunta: 'Quero mostrar a planta que cresceu na horta. Não precisa de som.',
      opcoes: [
        { img: 'audio', texto: 'Áudio', dica: 'No áudio, ninguém vê a planta.' },
        { img: 'jogo', texto: 'Jogo', dica: 'Um jogo não mostra a sua planta.' },
        { img: 'foto', texto: 'Foto', certa: true },
      ],
      explicacao: 'A foto mostra a planta direitinho, sem precisar de som.',
    },
  ],
};

/* =====================================================================
   BAIRRO DA CIDADANIA DIGITAL — Placas digitais
   ===================================================================== */
var CIDADANIA = {
  // ---------- 1º ano: situações simples e concretas ----------
  1: [
    {
      tipo: 'escolha',
      placa: '🎮',
      pergunta: 'Um jogo pergunta onde você mora.',
      opcoes: [
        { img: '🤐', texto: 'Não conto', certa: true },
        { img: '🏠', texto: 'Conto onde moro', dica: 'Onde você mora é um segredo da família. Na internet, não conte.' },
      ],
      explicacao: 'Isso mesmo! O endereço é segredo. Se um jogo perguntar, chame um adulto.',
    },
    {
      tipo: 'escolha',
      placa: '😨',
      pergunta: 'Apareceu uma imagem que deu medo.',
      opcoes: [
        { img: '🙈', texto: 'Fico quieto e continuo olhando', dica: 'Você não precisa ficar sozinho com o medo. Um adulto pode ajudar.' },
        { img: '🙋', texto: 'Chamo um adulto', certa: true },
      ],
      explicacao: 'Quando algo assusta, a gente chama um adulto de confiança. Você fez muito bem!',
    },
    {
      tipo: 'escolha',
      placa: '🔑',
      pergunta: 'Um colega pergunta a sua senha.',
      opcoes: [
        { img: '🔒', texto: 'Senha é segredo', certa: true },
        { img: '🗣️', texto: 'Conto a senha', dica: 'A senha é como a chave de casa. Só você e sua família sabem.' },
      ],
      explicacao: 'A senha é segredo, até para os amigos. Só você e sua família sabem.',
    },
    {
      tipo: 'escolha',
      placa: '🎲',
      pergunta: 'Seu colega perdeu no jogo.',
      opcoes: [
        { img: '😝', texto: 'Dou risada dele', dica: 'Rir de quem perdeu deixa o colega triste.' },
        { img: '😊', texto: 'Digo: tenta de novo!', certa: true },
      ],
      explicacao: 'Palavras gentis ajudam. Na internet também!',
    },
    {
      tipo: 'escolha',
      placa: '⏰',
      pergunta: 'Você usou o tablet a tarde toda.',
      opcoes: [
        { img: '⚽', texto: 'Desligo e vou brincar', certa: true },
        { img: '📱', texto: 'Fico mais e mais', dica: 'O corpo também precisa correr, brincar e descansar os olhos.' },
      ],
      explicacao: 'Brincar, correr e conversar também é importante. Tela tem hora certa!',
    },
    {
      tipo: 'escolha',
      placa: '📷',
      pergunta: 'Um jogo pede uma foto sua.',
      opcoes: [
        { img: '📸', texto: 'Mando a foto', dica: 'A sua foto é só sua. Na internet, ela pode ir para muitas pessoas.' },
        { img: '🚫', texto: 'Não mando e chamo um adulto', certa: true },
      ],
      explicacao: 'A sua foto é um dado pessoal. Antes de mandar foto, sempre pergunte a um adulto.',
    },
    {
      tipo: 'escolha',
      placa: '🖼️',
      pergunta: 'Seu colega fez um desenho lindo. Você vai mostrar para a turma.',
      opcoes: [
        { img: '🙋', texto: 'Digo quem fez o desenho', certa: true },
        { img: '🙊', texto: 'Digo que fui eu', dica: 'O desenho é do colega. Ele merece que todos saibam.' },
      ],
      explicacao: 'Quem faz o desenho é o autor. A gente sempre diz o nome de quem fez.',
    },
    {
      tipo: 'escolha',
      placa: '🏫',
      pergunta: 'Um jogo pergunta o nome da sua escola.',
      opcoes: [
        { img: '🏫', texto: 'Conto o nome da escola', dica: 'Com o nome da escola, um estranho pode saber onde você fica.' },
        { img: '🤐', texto: 'Não conto', certa: true },
      ],
      explicacao: 'O nome da escola também é segredo na internet.',
    },
    {
      tipo: 'escolha',
      placa: '💬',
      pergunta: 'Alguém escreveu uma coisa feia para você.',
      opcoes: [
        { img: '🙋', texto: 'Conto para um adulto', certa: true },
        { img: '😠', texto: 'Escrevo uma coisa feia também', dica: 'Responder com coisa feia deixa tudo pior. Um adulto pode ajudar.' },
      ],
      explicacao: 'Você não tem culpa. Contar para um adulto é o melhor caminho.',
    },
    {
      tipo: 'escolha',
      placa: '🌙',
      pergunta: 'Está na hora de dormir, mas você quer ver mais vídeos.',
      opcoes: [
        { img: '📺', texto: 'Vejo mais um, e mais um...', dica: 'Sem dormir, o corpo fica cansado no outro dia.' },
        { img: '😴', texto: 'Desligo e vou dormir', certa: true },
      ],
      explicacao: 'Dormir bem deixa o corpo e a cabeça fortes.',
    },
    {
      tipo: 'escolha',
      placa: '📞',
      pergunta: 'Uma pessoa que você não conhece pede o seu telefone.',
      opcoes: [
        { img: '🚫', texto: 'Não conto e chamo um adulto', certa: true },
        { img: '☎️', texto: 'Conto o telefone', dica: 'O telefone é um dado da família. Não conte a quem você não conhece.' },
      ],
      explicacao: 'Telefone é segredo. Com quem a gente não conhece, não conta nada.',
    },
    {
      tipo: 'escolha',
      placa: '📱',
      pergunta: 'Você quer usar o celular da sua mãe.',
      opcoes: [
        { img: '🙋', texto: 'Peço antes para usar', certa: true },
        { img: '🤫', texto: 'Pego escondido', dica: 'Pegar escondido não é legal. Pedir é sempre melhor.' },
      ],
      explicacao: 'Pedir antes mostra respeito. E o adulto pode ajudar você a usar com segurança.',
    },
  ],

  // ---------- 2º ano: desconhecidos, golpes simples e autoria ----------
  2: [
    {
      tipo: 'escolha',
      placa: '💬',
      pergunta: 'Uma pessoa que você não conhece manda: "Oi! Qual é o seu nome completo?"',
      opcoes: [
        { img: '⌨️', texto: 'Respondo com meu nome completo', dica: 'Seu nome completo é um dado pessoal. Não conte a desconhecidos.' },
        { img: '🙋', texto: 'Não respondo e mostro para um adulto', certa: true },
        { img: '😄', texto: 'Respondo e pergunto o nome dela', dica: 'Na internet, qualquer pessoa pode fingir ser quem não é.' },
      ],
      explicacao: 'Com desconhecidos na internet, a gente não conversa. Mostre a mensagem para um adulto.',
    },
    {
      tipo: 'escolha',
      placa: '🎁',
      pergunta: 'Aparece na tela: "VOCÊ GANHOU UM PRÊMIO! CLIQUE AQUI!"',
      opcoes: [
        { img: '🖱️', texto: 'Clico rápido para ganhar', dica: 'Prêmio que aparece do nada pode ser uma armadilha.' },
        { img: '🛑', texto: 'Não clico e chamo um adulto', certa: true },
      ],
      explicacao: 'Isso pode ser um golpe. Quando aparecer prêmio do nada, não clique e chame um adulto.',
    },
    {
      tipo: 'escolha',
      placa: '🔑',
      pergunta: 'Seu melhor amigo pede a senha do seu jogo emprestada.',
      opcoes: [
        { img: '🔒', texto: 'Não conto: senha é só minha', certa: true },
        { img: '🤝', texto: 'Conto, porque ele é meu amigo', dica: 'Mesmo amigo de verdade não precisa saber a sua senha.' },
      ],
      explicacao: 'Senha é segredo, até para os amigos. Você pode jogar junto sem contar a senha.',
    },
    {
      tipo: 'escolha',
      placa: '👥',
      pergunta: 'No grupo da turma, mandaram uma foto de um colega para rir dele.',
      opcoes: [
        { img: '😂', texto: 'Rio e mando também', dica: 'Rir e mandar de novo faz o colega sofrer ainda mais.' },
        { img: '🙈', texto: 'Finjo que não vi', dica: 'Fingir que não viu não ajuda o colega. Um adulto pode ajudar.' },
        { img: '🛑', texto: 'Não mando e conto para um adulto', certa: true },
      ],
      explicacao: 'Zoar alguém pela internet machuca de verdade. Não repassar e contar para um adulto ajuda o colega.',
    },
    {
      tipo: 'escolha',
      placa: '🎨',
      pergunta: 'Você achou um desenho lindo na internet e quer pôr no seu trabalho.',
      opcoes: [
        { img: '✍️', texto: 'Ponho e escrevo quem fez', certa: true },
        { img: '🙊', texto: 'Digo que fui eu que fiz', dica: 'O desenho tem um autor. Dizer que é seu não é justo com ele.' },
      ],
      explicacao: 'Quem desenhou é o autor. Sempre escrevemos o nome de quem fez.',
    },
    {
      tipo: 'escolha',
      placa: '📷',
      pergunta: 'Um jogo pede: "Mande uma foto do seu rosto e da sua casa."',
      opcoes: [
        { img: '🚫', texto: 'Não mando e conto para um adulto', certa: true },
        { img: '📸', texto: 'Mando as fotos', dica: 'Fotos mostram quem você é e onde você mora. Isso é segredo.' },
      ],
      explicacao: 'Fotos são dados pessoais. Não mande fotos para jogos nem para desconhecidos.',
    },
    {
      tipo: 'escolha',
      placa: '😢',
      pergunta: 'Você está jogando e aparece um vídeo estranho que deixa você triste.',
      opcoes: [
        { img: '🤐', texto: 'Não conto para ninguém', dica: 'Guardar isso sozinho pesa. Um adulto pode ajudar.' },
        { img: '🙋', texto: 'Fecho e conto para um adulto', certa: true },
      ],
      explicacao: 'Você não fez nada de errado. Contar para um adulto é uma atitude corajosa.',
    },
    {
      tipo: 'escolha',
      placa: '📖',
      pergunta: 'Seu colega escreveu uma história. Você quer usar no seu trabalho.',
      opcoes: [
        { img: '✂️', texto: 'Copio e ponho o meu nome', dica: 'A história é do colega. Ele é o autor.' },
        { img: '🙋', texto: 'Peço para ele e ponho o nome dele', certa: true },
      ],
      explicacao: 'Pedir e dizer quem escreveu é respeitar o autor.',
    },
    {
      tipo: 'escolha',
      placa: '😤',
      pergunta: 'Você ficou bravo com um colega durante o jogo on-line.',
      opcoes: [
        { img: '😡', texto: 'Escrevo xingamentos', dica: 'Xingar machuca, mesmo pela tela.' },
        { img: '🧘', texto: 'Respiro e escrevo com calma', certa: true },
        { img: '📢', texto: 'Falo mal dele para todo mundo', dica: 'Falar mal para todos espalha a briga e machuca.' },
      ],
      explicacao: 'Do outro lado da tela tem uma pessoa. Respirar antes de escrever ajuda muito.',
    },
    {
      tipo: 'escolha',
      placa: '⏰',
      pergunta: 'Você passou o dia todo no celular e esqueceu de brincar.',
      opcoes: [
        { img: '🗓️', texto: 'Combino um horário com a família', certa: true },
        { img: '📱', texto: 'Fico no celular o dia todo', dica: 'Muito tempo de tela cansa os olhos e o corpo.' },
      ],
      explicacao: 'Combinar o tempo de tela deixa espaço para brincar, ler e conversar.',
    },
    {
      tipo: 'escolha',
      placa: '📍',
      pergunta: 'Um amigo que você conheceu no jogo diz: "Vamos nos encontrar na praça?"',
      opcoes: [
        { img: '👟', texto: 'Vou sozinho', dica: 'Quem a gente conhece só pela internet pode não ser quem diz ser.' },
        { img: '🙋', texto: 'Não vou e conto para um adulto', certa: true },
      ],
      explicacao: 'Nunca marque encontro com quem conheceu na internet. Conte logo para um adulto.',
    },
    {
      tipo: 'escolha',
      placa: '🪙',
      pergunta: 'No jogo aparece: "Digite seu endereço para ganhar moedas."',
      opcoes: [
        { img: '🛑', texto: 'Não digito', certa: true },
        { img: '🏠', texto: 'Digito para ganhar moedas', dica: 'Moedas de jogo não valem o seu endereço. Ele é segredo.' },
      ],
      explicacao: 'Nenhum prêmio vale contar onde você mora.',
    },
  ],

  // ---------- 3º ano: situações mais elaboradas ----------
  3: [
    {
      tipo: 'escolha',
      placa: '💰',
      pergunta: 'Chega uma mensagem: "Sou da loja do jogo. Mande sua senha para ganhar 1000 moedas!"',
      opcoes: [
        { img: '🔑', texto: 'Mando a senha', dica: 'Nenhuma loja de verdade pede a sua senha.' },
        { img: '🤏', texto: 'Mando só metade da senha', dica: 'Nem um pedaço! A senha inteira é segredo.' },
        { img: '🛑', texto: 'É golpe! Não mando e aviso um adulto', certa: true },
      ],
      explicacao: 'Quem pede senha em troca de prêmio está tentando enganar. Isso é golpe!',
    },
    {
      tipo: 'escolha',
      placa: '🔐',
      pergunta: 'Você vai criar uma senha nova. Qual é a melhor?',
      opcoes: [
        { img: '🎂', texto: 'A data do meu aniversário', dica: 'O aniversário é fácil de descobrir.' },
        { img: '🔐', texto: 'Letras e números misturados que só eu sei', certa: true },
        { img: '📛', texto: 'O meu nome', dica: 'O nome é a primeira coisa que alguém tentaria.' },
      ],
      explicacao: 'Senha forte mistura letras e números e não é fácil de adivinhar.',
    },
    {
      tipo: 'escolha',
      placa: '🎬',
      pergunta: 'Um colega quer postar um vídeo seu com o seu nome completo e o nome da escola.',
      opcoes: [
        { img: '👍', texto: 'Deixo postar tudo', dica: 'Nome completo e escola juntos contam muito sobre você.' },
        { img: '🙋', texto: 'Peço para tirar meus dados e falo com a professora', certa: true },
      ],
      explicacao: 'Você pode dizer não. Seus dados pessoais são seus, e um adulto pode ajudar.',
    },
    {
      tipo: 'escolha',
      placa: '📚',
      pergunta: 'Para um trabalho, você achou um texto ótimo na internet.',
      opcoes: [
        { img: '📋', texto: 'Copio tudo e ponho meu nome', dica: 'O texto tem autor. Pôr o seu nome não é justo.' },
        { img: '✍️', texto: 'Uso uma parte e escrevo quem escreveu', certa: true },
      ],
      explicacao: 'Dizer quem escreveu é dar o crédito ao autor. Isso é respeito!',
    },
    {
      tipo: 'escolha',
      placa: '🎮',
      pergunta: 'No jogo on-line, um jogador começa a xingar o seu amigo.',
      opcoes: [
        { img: '🤬', texto: 'Xingo o jogador também', dica: 'Xingar de volta aumenta a briga.' },
        { img: '😶', texto: 'Saio e não conto para ninguém', dica: 'Sair é bom, mas o seu amigo precisa de ajuda. Conte para um adulto.' },
        { img: '🛡️', texto: 'Apoio meu amigo, bloqueio e aviso um adulto', certa: true },
      ],
      explicacao: 'Ofender alguém pela internet é cyberbullying. Apoiar o amigo e pedir ajuda faz diferença.',
    },
    {
      tipo: 'escolha',
      placa: '⚠️',
      pergunta: 'Aparece: "SEU COMPUTADOR ESTÁ COM VÍRUS! CLIQUE AQUI PARA CONSERTAR!"',
      opcoes: [
        { img: '🛑', texto: 'Não clico e chamo um adulto', certa: true },
        { img: '🖱️', texto: 'Clico para consertar', dica: 'Avisos que assustam e pedem clique costumam ser armadilhas.' },
      ],
      explicacao: 'Avisos assustadores que pedem para clicar costumam ser golpe. Um adulto confere.',
    },
    {
      tipo: 'escolha',
      placa: '👕',
      pergunta: 'Alguém que você só conhece do jogo pede uma foto sua de uniforme.',
      opcoes: [
        { img: '📸', texto: 'Mando, é só uma foto', dica: 'O uniforme mostra onde você estuda.' },
        { img: '🚫', texto: 'Não mando e conto para um adulto', certa: true },
      ],
      explicacao: 'O uniforme mostra a sua escola. Não mande fotos para quem você não conhece.',
    },
    {
      tipo: 'escolha',
      placa: '🎵',
      pergunta: 'Você quer pôr uma música no vídeo da turma.',
      opcoes: [
        { img: '🙋', texto: 'Escolho com a professora e escrevo quem fez a música', certa: true },
        { img: '🙊', texto: 'Digo que a música é minha', dica: 'A música tem autor. Dizer que é sua não é verdade.' },
      ],
      explicacao: 'Músicas, desenhos e textos têm autor. Sempre damos o crédito.',
    },
    {
      tipo: 'escolha',
      placa: '📲',
      pergunta: 'Você recebe uma mensagem com uma piada maldosa sobre um colega.',
      opcoes: [
        { img: '📤', texto: 'Mando para todo mundo', dica: 'Repassar espalha a maldade e machuca o colega.' },
        { img: '🛑', texto: 'Não repasso e falo com um adulto', certa: true },
        { img: '😂', texto: 'Respondo com mais piadas', dica: 'Mais piadas deixam o colega ainda mais triste.' },
      ],
      explicacao: 'Não repassar já ajuda muito. Falar com um adulto pode acabar com o cyberbullying.',
    },
    {
      tipo: 'escolha',
      placa: '🌙',
      pergunta: 'Seu irmão quer jogar até bem tarde, todos os dias.',
      opcoes: [
        { img: '🌙', texto: 'Também fico jogando até tarde', dica: 'Dormir pouco atrapalha a escola e a saúde.' },
        { img: '🗓️', texto: 'Sugiro combinar um horário e fazer outras coisas', certa: true },
      ],
      explicacao: 'Equilíbrio é tudo: tempo de tela, de brincar, de estudar e de dormir.',
    },
    {
      tipo: 'escolha',
      placa: '📝',
      pergunta: 'Um site pede: "Escreva seu nome completo, telefone e escola para continuar."',
      opcoes: [
        { img: '⌨️', texto: 'Escrevo tudo para continuar', dica: 'São muitos dados pessoais juntos. É melhor perguntar antes.' },
        { img: '🛑', texto: 'Paro e peço ajuda a um adulto', certa: true },
      ],
      explicacao: 'Antes de escrever dados pessoais em qualquer site, peça ajuda a um adulto.',
    },
    {
      tipo: 'escolha',
      placa: '🖼️',
      pergunta: 'Um colega postou um desenho, e você não gostou.',
      opcoes: [
        { img: '👎', texto: 'Escrevo que está horrível', dica: 'Comentário maldoso machuca. Do outro lado tem uma pessoa.' },
        { img: '💬', texto: 'Escrevo algo gentil ou não comento', certa: true },
      ],
      explicacao: 'Na internet, a gente trata os outros como gostaria de ser tratado.',
    },
  ],
};

if (typeof module !== 'undefined') module.exports = { TICS: TICS, CIDADANIA: CIDADANIA, ITENS_POR_MISSAO: ITENS_POR_MISSAO };
