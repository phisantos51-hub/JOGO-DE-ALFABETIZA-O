// Lógica da interface do Robô Letrinha: telas, montagem do programa,
// execução passo a passo, voz, estrelas e progresso salvo.
(function () {
  const $ = (sel) => document.querySelector(sel);
  const CHAVE_PROGRESSO = 'roboLetrinha.progresso.v1';
  const CHAVE_SOM = 'roboLetrinha.som.v1';
  const MAX_BLOCOS = 40;
  const VELOCIDADES = [
    { nome: '🚶 Normal', ms: 450 },
    { nome: '🐇 Rápido', ms: 220 },
    { nome: '🐢 Devagar', ms: 800 },
  ];
  const NOMES_LETRAS = {
    A: 'á', B: 'bê', C: 'cê', D: 'dê', E: 'é', F: 'éfe', G: 'gê', H: 'agá', I: 'i', J: 'jota',
    K: 'cá', L: 'éle', M: 'ême', N: 'êne', O: 'ó', P: 'pê', Q: 'quê', R: 'érre', S: 'ésse',
    T: 'tê', U: 'u', V: 'vê', W: 'dáblio', X: 'xis', Y: 'ípsilon', Z: 'zê',
  };

  const estado = {
    ano: 1,
    indice: 0,
    fase: null,
    programa: [],
    executando: false,
    velocidade: 0,
    som: lerArmazenado(CHAVE_SOM, true),
    progresso: lerArmazenado(CHAVE_PROGRESSO, {}),
    // Estado da simulação
    robo: null,
    coletadas: 0,
    removidas: new Set(),
  };

  // ---------- Armazenamento (pode falhar em modo privado) ----------
  function lerArmazenado(chave, padrao) {
    try {
      const v = localStorage.getItem(chave);
      return v === null ? padrao : JSON.parse(v);
    } catch (e) {
      return padrao;
    }
  }
  function salvar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ }
  }
  function estrelasDe(ano, indice) {
    return (estado.progresso[ano] || [])[indice] || 0;
  }
  function liberada(ano, indice) {
    return indice === 0 || estrelasDe(ano, indice - 1) > 0;
  }

  // ---------- Voz ----------
  let vozPt = null;
  function escolherVoz() {
    if (!('speechSynthesis' in window)) return;
    const vozes = speechSynthesis.getVoices();
    vozPt = vozes.find((v) => v.lang === 'pt-BR') || vozes.find((v) => v.lang && v.lang.startsWith('pt')) || null;
  }
  if ('speechSynthesis' in window) {
    escolherVoz();
    speechSynthesis.onvoiceschanged = escolherVoz;
  }
  function falar(texto, opcoes = {}) {
    if (!estado.som || !('speechSynthesis' in window)) return;
    if (!opcoes.naFila) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    if (vozPt) u.voice = vozPt;
    u.rate = opcoes.rate || 0.85;
    speechSynthesis.speak(u);
  }
  function pronuncia(peca) {
    return peca.length === 1 ? NOMES_LETRAS[peca] || peca : peca.toLowerCase();
  }
  function falarPeca(peca) {
    falar(pronuncia(peca));
  }
  function falarPalavra() {
    const item = estado.fase.item;
    falar(item.palavra.toLowerCase());
    const partes = item.pecas.map(pronuncia);
    falar(partes.join('... '), { naFila: true, rate: 0.7 });
  }

  // ---------- Navegação ----------
  function mostrarTela(nome) {
    document.querySelectorAll('.tela').forEach((t) => t.classList.remove('ativa'));
    $('#tela-' + nome).classList.add('ativa');
    window.scrollTo(0, 0);
  }

  function montarInicio() {
    const lista = $('#lista-anos');
    lista.innerHTML = '';
    Object.keys(ANOS).forEach((ano) => {
      const cfg = ANOS[ano];
      const total = cfg.palavras.length * 3;
      const ganhas = (estado.progresso[ano] || []).reduce((a, b) => a + (b || 0), 0);
      const botao = document.createElement('button');
      botao.className = 'cartao-ano';
      botao.style.setProperty('--cor', cfg.cor);
      botao.innerHTML =
        `<div class="num">${cfg.titulo}</div>` +
        `<div class="sub">${cfg.subtitulo}</div>` +
        `<p>${cfg.descricao}</p>` +
        `<div class="progresso">⭐ ${ganhas} de ${total} estrelas</div>`;
      botao.addEventListener('click', () => abrirFases(Number(ano)));
      lista.appendChild(botao);
    });
    atualizarBotaoSom();
  }

  function abrirFases(ano) {
    estado.ano = ano;
    const cfg = ANOS[ano];
    document.documentElement.style.setProperty('--cor-ano', cfg.cor);
    $('#titulo-fases').textContent = `${cfg.titulo} · ${cfg.subtitulo}`;
    $('#descricao-fases').textContent = cfg.descricao;
    const lista = $('#lista-fases');
    lista.innerHTML = '';
    cfg.palavras.forEach((item, i) => {
      const b = document.createElement('button');
      b.className = 'botao-fase';
      const est = estrelasDe(ano, i);
      const aberta = liberada(ano, i);
      b.disabled = !aberta;
      b.innerHTML =
        `<span class="n">Fase ${i + 1}</span>` +
        `<span class="fig">${aberta ? item.figura : '🔒'}</span>` +
        `<span class="est">${'⭐'.repeat(est)}${'☆'.repeat(3 - est)}</span>`;
      b.setAttribute('aria-label', `Fase ${i + 1}${aberta ? '' : ' (bloqueada)'}, ${est} estrelas`);
      b.addEventListener('click', () => abrirFase(i));
      lista.appendChild(b);
    });
    mostrarTela('fases');
  }

  // ---------- Fase ----------
  function abrirFase(indice) {
    estado.indice = indice;
    estado.fase = gerarFase(estado.ano, indice);
    estado.programa = [];
    const cfg = ANOS[estado.ano];
    const fase = estado.fase;
    $('#titulo-jogo').textContent = `${cfg.titulo} · Fase ${indice + 1}`;
    $('#figura').textContent = fase.item.figura;
    $('#meta-blocos').textContent = fase.limiteBlocos
      ? `Limite: ${fase.limiteBlocos} blocos · ⭐⭐⭐ com ${fase.blocosIdeais}`
      : `⭐⭐⭐ com até ${fase.blocosIdeais} blocos`;
    montarPaleta();
    reiniciarSimulacao();
    desenharPrograma();
    mostrarTela('jogo');

    const primeira = fase.item.pecas[0];
    const tipo = primeira.length === 1 ? 'a letra' : 'a sílaba';
    let msg = `Monte o programa para o robô pegar ${tipo} ${primeira} primeiro.`;
    if (cfg.repetir && indice === 0 && estado.ano === 2) {
      msg = 'Novidade: o bloco 🔁 REPETIR repete a seta que vem depois dele. Toque no número para mudar!';
    } else if (cfg.limiteBlocos && indice === 0) {
      msg = `Desafio: use no máximo ${fase.limiteBlocos} blocos. Use o 🔁 REPETIR para economizar!`;
    }
    mostrarMensagem(msg, 'info');
    falar(`Vamos formar a palavra ${fase.item.palavra.toLowerCase()}!`);
  }

  function montarPaleta() {
    const paleta = $('#paleta');
    paleta.innerHTML = '';
    ['cima', 'baixo', 'esquerda', 'direita'].forEach((dir) => {
      const b = document.createElement('button');
      b.className = 'bloco';
      b.textContent = DIRECOES[dir].seta;
      b.setAttribute('aria-label', 'Andar ' + DIRECOES[dir].nome);
      b.addEventListener('click', () => adicionarBloco({ tipo: 'mover', dir }));
      paleta.appendChild(b);
    });
    if (ANOS[estado.ano].repetir) {
      const r = document.createElement('button');
      r.className = 'bloco repetir';
      r.innerHTML = '🔁 REPETIR';
      r.setAttribute('aria-label', 'Repetir o próximo bloco');
      r.addEventListener('click', () => adicionarBloco({ tipo: 'repetir', vezes: 2 }));
      paleta.appendChild(r);
    }
  }

  function reiniciarSimulacao() {
    const fase = estado.fase;
    estado.robo = { x: fase.inicio.x, y: fase.inicio.y, dir: 'direita' };
    estado.coletadas = 0;
    estado.removidas = new Set();
    desenharTabuleiro();
    desenharEncaixes();
  }

  function desenharTabuleiro() {
    const fase = estado.fase;
    const tab = $('#tabuleiro');
    tab.style.setProperty('--n', fase.tamanho);
    tab.innerHTML = '';
    const pecas = new Map();
    fase.alvos.forEach((p, i) => pecas.set(p.x + ',' + p.y, { ...p, id: 'a' + i }));
    fase.distratores.forEach((p, i) => pecas.set(p.x + ',' + p.y, { ...p, id: 'd' + i }));
    const pedras = new Set(fase.pedras.map((p) => p.x + ',' + p.y));

    for (let y = 0; y < fase.tamanho; y++) {
      for (let x = 0; x < fase.tamanho; x++) {
        const casa = document.createElement('div');
        casa.className = 'casa' + ((x + y) % 2 ? '' : ' clara');
        const k = x + ',' + y;
        if (pedras.has(k)) {
          casa.innerHTML = '<span class="pedra" aria-label="pedra">🪨</span>';
        } else if (pecas.has(k)) {
          const p = pecas.get(k);
          const el = document.createElement('div');
          el.className = 'peca' + (p.texto.length > 2 ? ' longa' : '');
          el.dataset.id = p.id;
          el.textContent = p.texto;
          casa.appendChild(el);
        }
        tab.appendChild(casa);
      }
    }
    const robo = document.createElement('div');
    robo.className = 'robo';
    robo.id = 'robo';
    robo.innerHTML = '<span class="corpo">🤖</span><span class="olhar"></span>';
    robo.style.width = robo.style.height = 100 / fase.tamanho + '%';
    tab.appendChild(robo);
    posicionarRobo();
  }

  function posicionarRobo() {
    const n = estado.fase.tamanho;
    const robo = $('#robo');
    robo.style.left = (estado.robo.x * 100) / n + '%';
    robo.style.top = (estado.robo.y * 100) / n + '%';
    const d = DIRECOES[estado.robo.dir];
    const olhar = robo.querySelector('.olhar');
    olhar.textContent = d.seta;
    olhar.style.left = 50 + d.dx * 36 - 8 + '%';
    olhar.style.top = 50 + d.dy * 36 - 14 + '%';
  }

  function desenharEncaixes() {
    const box = $('#encaixes');
    box.innerHTML = '';
    estado.fase.item.pecas.forEach((p, i) => {
      const e = document.createElement('div');
      e.className = 'encaixe';
      if (i < estado.coletadas) e.classList.add('cheio');
      else if (i === estado.coletadas) e.classList.add('proximo');
      e.textContent = p;
      box.appendChild(e);
    });
  }

  // ---------- Programa ----------
  function limiteAtual() {
    return estado.fase.limiteBlocos || MAX_BLOCOS;
  }

  function adicionarBloco(bloco) {
    if (estado.executando) return;
    if (estado.programa.length >= limiteAtual()) {
      mostrarMensagem(
        estado.fase.limiteBlocos
          ? `O limite é ${estado.fase.limiteBlocos} blocos. Tente usar o 🔁 REPETIR!`
          : 'O programa está cheio!',
        'erro'
      );
      return;
    }
    estado.programa.push(bloco);
    desenharPrograma();
  }

  function removerBloco(i) {
    if (estado.executando) return;
    estado.programa.splice(i, 1);
    desenharPrograma();
  }

  function desenharPrograma() {
    const lista = $('#programa');
    lista.innerHTML = '';
    estado.programa.forEach((bloco, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      if (bloco.tipo === 'repetir') {
        b.className = 'bloco repetir';
        b.innerHTML = `🔁 <span class="vezes">${bloco.vezes}×</span>`;
        b.setAttribute('aria-label', `Repetir ${bloco.vezes} vezes. Toque para mudar.`);
        b.addEventListener('click', () => {
          if (estado.executando) return;
          bloco.vezes = bloco.vezes >= 9 ? 2 : bloco.vezes + 1;
          desenharPrograma();
        });
        if (estado.programa[i + 1] && estado.programa[i + 1].tipo === 'mover') li.classList.add('junto');
      } else {
        b.className = 'bloco';
        b.textContent = DIRECOES[bloco.dir].seta;
        b.setAttribute('aria-label', 'Andar ' + DIRECOES[bloco.dir].nome);
        b.tabIndex = -1;
      }
      const x = document.createElement('button');
      x.className = 'remover';
      x.textContent = '✕';
      x.setAttribute('aria-label', 'Remover bloco');
      x.addEventListener('click', () => removerBloco(i));
      li.appendChild(b);
      li.appendChild(x);
      lista.appendChild(li);
    });
    const cont = $('#contador-blocos');
    const lim = estado.fase.limiteBlocos;
    cont.textContent = lim ? `${estado.programa.length} / ${lim} blocos` : `${estado.programa.length} blocos`;
    cont.classList.toggle('estourou', !!lim && estado.programa.length >= lim);
    atualizarBotoes();
  }

  function atualizarBotoes() {
    const vazio = estado.programa.length === 0;
    $('#btn-executar').disabled = estado.executando || vazio;
    $('#btn-apagar').disabled = estado.executando || vazio;
    $('#btn-limpar').disabled = estado.executando || vazio;
    $('#btn-dica').disabled = estado.executando;
    $('#btn-executar').textContent = estado.executando ? '⏳ Executando…' : '▶ Executar';
  }

  // Transforma o programa em uma lista de passos simples.
  function expandirPrograma(programa) {
    const passos = [];
    for (let i = 0; i < programa.length; i++) {
      const bloco = programa[i];
      if (bloco.tipo === 'repetir') {
        const prox = programa[i + 1];
        if (!prox || prox.tipo !== 'mover') {
          return { erro: { bloco: i, msg: 'O bloco 🔁 REPETIR precisa de uma seta logo depois dele.' } };
        }
        for (let v = 0; v < bloco.vezes; v++) passos.push({ dir: prox.dir, blocos: [i, i + 1] });
        i++;
      } else {
        passos.push({ dir: bloco.dir, blocos: [i] });
      }
    }
    return { passos };
  }

  // ---------- Execução ----------
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  function destacarBlocos(indices, classe) {
    document.querySelectorAll('#programa li').forEach((li, i) => {
      li.classList.remove('ativo', 'erro');
      if (indices && indices.includes(i)) li.classList.add(classe);
    });
  }

  function pecaEm(x, y) {
    const fase = estado.fase;
    const a = fase.alvos.findIndex((p, i) => p.x === x && p.y === y && !estado.removidas.has('a' + i));
    if (a >= 0) return { id: 'a' + a, texto: fase.alvos[a].texto };
    const d = fase.distratores.findIndex((p) => p.x === x && p.y === y);
    if (d >= 0) return { id: 'd' + d, texto: fase.distratores[d].texto };
    return null;
  }

  async function executar() {
    if (estado.executando || estado.programa.length === 0) return;
    const { passos, erro } = expandirPrograma(estado.programa);
    if (erro) {
      destacarBlocos([erro.bloco], 'erro');
      mostrarMensagem(erro.msg, 'erro');
      return;
    }
    estado.executando = true;
    atualizarBotoes();
    reiniciarSimulacao();
    mostrarMensagem('O robô está seguindo o programa…', 'info');
    const fase = estado.fase;
    const ms = VELOCIDADES[estado.velocidade].ms;
    $('#robo').style.transitionDuration = Math.min(ms * 0.7, 300) + 'ms';
    await esperar(250);

    let resultado = null;
    for (const passo of passos) {
      destacarBlocos(passo.blocos, 'ativo');
      const d = DIRECOES[passo.dir];
      estado.robo.dir = passo.dir;
      const nx = estado.robo.x + d.dx;
      const ny = estado.robo.y + d.dy;
      const fora = nx < 0 || ny < 0 || nx >= fase.tamanho || ny >= fase.tamanho;
      const pedra = !fora && fase.pedras.some((p) => p.x === nx && p.y === ny);
      if (fora || pedra) {
        posicionarRobo();
        bater();
        destacarBlocos(passo.blocos, 'erro');
        resultado = { tipo: 'erro', msg: fora ? 'Ops! O robô bateu na borda do tabuleiro.' : 'Ops! O robô bateu na pedra 🪨.' };
        break;
      }
      estado.robo.x = nx;
      estado.robo.y = ny;
      posicionarRobo();
      await esperar(ms);

      const peca = pecaEm(nx, ny);
      if (peca) {
        const precisa = fase.item.pecas[estado.coletadas];
        if (peca.texto === precisa) {
          estado.removidas.add(peca.id);
          const el = document.querySelector(`.peca[data-id="${peca.id}"]`);
          if (el) el.classList.add('coletada');
          estado.coletadas++;
          desenharEncaixes();
          falarPeca(peca.texto);
          if (estado.coletadas === fase.item.pecas.length) {
            resultado = { tipo: 'vitoria' };
            break;
          }
        } else {
          const el = document.querySelector(`.peca[data-id="${peca.id}"]`);
          if (el) el.classList.add('errada');
          destacarBlocos(passo.blocos, 'erro');
          const de = precisa.length === 1 ? 'da letra' : 'da sílaba';
          resultado = {
            tipo: 'erro',
            msg: `Ops! O robô pegou "${peca.texto}", mas agora precisamos ${de} "${precisa}".`,
          };
          falar(`Ops! Precisamos ${de} ${pronuncia(precisa)}`);
          break;
        }
      }
    }

    if (!resultado) {
      const falta = fase.item.pecas[estado.coletadas];
      const tipo = falta.length === 1 ? 'a letra' : 'a sílaba';
      resultado = { tipo: 'erro', msg: `O programa acabou, mas ainda falta pegar ${tipo} "${falta}". Continue o programa!` };
      destacarBlocos(null);
    }

    estado.executando = false;
    atualizarBotoes();
    if (resultado.tipo === 'vitoria') {
      destacarBlocos(null);
      $('#robo').classList.add('festa');
      mostrarMensagem('Você conseguiu! 🎉', 'ok');
      await esperar(700);
      vencer();
    } else {
      mostrarMensagem(resultado.msg + ' Arrume o programa e toque em ▶ Executar.', 'erro');
    }
  }

  function bater() {
    const robo = $('#robo');
    robo.classList.remove('batida');
    void robo.offsetWidth;
    robo.classList.add('batida');
  }

  // ---------- Vitória ----------
  function calcularEstrelas() {
    const usados = estado.programa.length;
    const ideal = estado.fase.blocosIdeais;
    if (usados <= ideal) return 3;
    if (usados <= ideal + 3) return 2;
    return 1;
  }

  function vencer() {
    const fase = estado.fase;
    const estrelas = calcularEstrelas();
    const lista = (estado.progresso[estado.ano] = estado.progresso[estado.ano] || []);
    lista[estado.indice] = Math.max(lista[estado.indice] || 0, estrelas);
    salvar(CHAVE_PROGRESSO, estado.progresso);

    $('#vitoria-figura').textContent = fase.item.figura;
    $('#vitoria-palavra').innerHTML = fase.item.pecas
      .map((p) => `<span>${p}</span>`)
      .join(fase.item.pecas[0].length > 1 ? '<span class="sep">-</span>' : '');
    $('#vitoria-estrelas').innerHTML = [0, 1, 2]
      .map((i) => `<span class="${i < estrelas ? '' : 'apagada'}">⭐</span>`)
      .join('');
    $('#vitoria-dica').textContent =
      estrelas === 3
        ? `Programa perfeito: ${estado.programa.length} blocos!`
        : `Você usou ${estado.programa.length} blocos. Dá para fazer com ${fase.blocosIdeais}! Quer tentar?`;

    const frase = $('#vitoria-frase');
    if (fase.item.frase) {
      frase.hidden = false;
      $('#frase-texto').innerHTML = destacarPalavra(fase.item.frase, fase.item.palavra);
    } else {
      frase.hidden = true;
    }
    const ultima = estado.indice >= ANOS[estado.ano].palavras.length - 1;
    $('#btn-proxima').textContent = ultima ? 'Ver as fases ➜' : 'Próxima fase ➜';

    soltarConfete();
    $('#modal-vitoria').hidden = false;
    $('#btn-proxima').focus();
    falar(`Muito bem! Você formou a palavra ${fase.item.palavra.toLowerCase()}!`);
    if (fase.item.frase) falar(fase.item.frase, { naFila: true });
  }

  function destacarPalavra(frase, palavra) {
    const alvo = palavra.toLowerCase();
    return frase
      .split(' ')
      .map((p) => {
        const limpa = p.replace(/[.,!?]/g, '').toLowerCase();
        return limpa === alvo ? `<b style="color:var(--principal-escuro)">${p}</b>` : p;
      })
      .join(' ');
  }

  function soltarConfete() {
    const caixa = $('#confete');
    caixa.innerHTML = '';
    const itens = ['🎉', '⭐', '🎈', '✨', '🔤', '🤖'];
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.textContent = itens[i % itens.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 0.6 + 's';
      caixa.appendChild(s);
    }
  }

  // ---------- Mensagens ----------
  function mostrarMensagem(texto, tipo) {
    const m = $('#mensagem');
    m.className = 'mensagem ' + (tipo || 'info');
    m.textContent = texto;
  }

  function darDica() {
    if (estado.executando) return;
    reiniciarSimulacao();
    const fase = estado.fase;
    const precisa = fase.item.pecas[0];
    const el = document.querySelector('.peca[data-id="a0"]');
    if (el) {
      el.classList.remove('dica');
      void el.offsetWidth;
      el.classList.add('dica');
    }
    const primeiro = fase.passosSolucao[0];
    let n = 0;
    while (fase.passosSolucao[n] === primeiro) n++;
    const tipo = precisa.length === 1 ? 'a letra' : 'a sílaba';
    const vezes = n === 1 ? 'uma casa' : `${n} casas`;
    mostrarMensagem(
      `Dica: a primeira peça é ${tipo} "${precisa}" (piscando). Comece andando ${vezes} ${DIRECOES[primeiro].nome} ${DIRECOES[primeiro].seta}.`,
      'info'
    );
    falar(`Procure ${tipo} ${pronuncia(precisa)}`);
  }

  function atualizarBotaoSom() {
    const b = $('#btn-som');
    b.textContent = estado.som ? '🔊 Som ligado' : '🔇 Som desligado';
    b.setAttribute('aria-pressed', String(estado.som));
  }

  // ---------- Eventos ----------
  document.querySelectorAll('[data-voltar]').forEach((b) =>
    b.addEventListener('click', () => {
      if (estado.executando) return;
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      if (b.dataset.voltar === 'inicio') {
        montarInicio();
        mostrarTela('inicio');
      } else {
        abrirFases(estado.ano);
      }
    })
  );

  $('#btn-executar').addEventListener('click', executar);
  $('#btn-apagar').addEventListener('click', () => {
    if (estado.programa.length) removerBloco(estado.programa.length - 1);
  });
  $('#btn-limpar').addEventListener('click', () => {
    if (estado.executando) return;
    estado.programa = [];
    desenharPrograma();
    reiniciarSimulacao();
    mostrarMensagem('Programa apagado. Comece de novo!', 'info');
  });
  $('#btn-dica').addEventListener('click', darDica);
  $('#btn-ouvir').addEventListener('click', falarPalavra);
  $('#btn-velocidade').addEventListener('click', () => {
    estado.velocidade = (estado.velocidade + 1) % VELOCIDADES.length;
    $('#btn-velocidade').textContent = VELOCIDADES[estado.velocidade].nome;
  });
  $('#btn-velocidade').textContent = VELOCIDADES[estado.velocidade].nome;

  $('#btn-som').addEventListener('click', () => {
    estado.som = !estado.som;
    salvar(CHAVE_SOM, estado.som);
    if (!estado.som && 'speechSynthesis' in window) speechSynthesis.cancel();
    atualizarBotaoSom();
  });
  $('#btn-como-jogar').addEventListener('click', () => {
    $('#modal-ajuda').hidden = false;
    $('#btn-fechar-ajuda').focus();
  });
  $('#btn-fechar-ajuda').addEventListener('click', () => ($('#modal-ajuda').hidden = true));

  $('#btn-ouvir-frase').addEventListener('click', () => falar(estado.fase.item.frase));
  $('#btn-repetir-fase').addEventListener('click', () => {
    $('#modal-vitoria').hidden = true;
    abrirFase(estado.indice);
  });
  $('#btn-proxima').addEventListener('click', () => {
    $('#modal-vitoria').hidden = true;
    const prox = estado.indice + 1;
    if (prox < ANOS[estado.ano].palavras.length) abrirFase(prox);
    else abrirFases(estado.ano);
  });

  document.addEventListener('keydown', (e) => {
    if (!$('#modal-ajuda').hidden && e.key === 'Escape') $('#modal-ajuda').hidden = true;
    if (!$('#tela-jogo').classList.contains('ativa') || !$('#modal-vitoria').hidden) return;
    if (estado.executando) return;
    const mapa = { ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita' };
    if (mapa[e.key]) {
      e.preventDefault();
      adicionarBloco({ tipo: 'mover', dir: mapa[e.key] });
    } else if ((e.key === 'r' || e.key === 'R') && ANOS[estado.ano].repetir) {
      adicionarBloco({ tipo: 'repetir', vezes: 2 });
    } else if (e.key === 'Enter' && document.activeElement === document.body) {
      executar();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (estado.programa.length) removerBloco(estado.programa.length - 1);
    }
  });

  montarInicio();
})();
