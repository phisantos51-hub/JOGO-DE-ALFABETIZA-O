// Rota Digital — telas, mapa da cidade, missões, estrelas, selos e progresso.
// As perguntas ficam em perguntas.js e as fases da Programação em rota/fases.js.
(function () {
  'use strict';
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const CHAVE_PROGRESSO = 'rotaDigital.progresso.v1';

  const CORES = [
    { nome: 'Vermelho', cor: '#e53935' },
    { nome: 'Azul', cor: '#1e88e5' },
    { nome: 'Amarelo', cor: '#fdd835' },
    { nome: 'Verde', cor: '#43a047' },
    { nome: 'Roxo', cor: '#8e24aa' },
    { nome: 'Laranja', cor: '#fb8c00' },
    { nome: 'Rosa', cor: '#ec407a' },
  ];
  const ANOS = {
    1: { nome: '1º ano', resumo: 'Setas · Aparelhos · Cuidados' },
    2: { nome: '2º ano', resumo: 'Repetir · Ícones · Internet' },
    3: { nome: '3º ano', resumo: 'Semáforo · Mídias · Golpes' },
  };
  const BAIRROS = {
    prog: {
      nome: 'Bairro da Programação', curto: 'Programação', icone: '🧩', selo: '🧩',
      descricao: 'Monte um programa com blocos de setas e leve o carro até o destino.',
    },
    tic: {
      nome: 'Bairro das TICs', curto: 'TICs', icone: '💻', selo: '💻',
      descricao: 'Faça as entregas da Loja de Tecnologia. Escolha ou leve cada item ao lugar certo.',
    },
    cid: {
      nome: 'Bairro da Cidadania Digital', curto: 'Cidadania Digital', icone: '🛡️', selo: '🛡️',
      descricao: 'Leia as placas digitais e escolha o que fazer na internet.',
    },
  };
  const ORDEM_BAIRROS = ['prog', 'tic', 'cid'];

  const estado = {
    nome: '',
    ano: null,
    cor: CORES[0].cor,
    som: false,
    pausado: false,
    tela: 'inicio',
    bairro: null,
    missao: 0,
    posCarro: 'garagem',
    dirigindo: false,
  };
  let progresso = carregarProgresso();

  // =================================================================
  // Progresso (salvo só neste navegador; o nome NÃO é salvo)
  // =================================================================
  function carregarProgresso() {
    try {
      const v = JSON.parse(localStorage.getItem(CHAVE_PROGRESSO));
      if (v && typeof v === 'object') return { liberado: !!v.liberado, anos: v.anos || {} };
    } catch (e) { /* armazenamento indisponível */ }
    return { liberado: false, anos: {} };
  }
  function salvarProgresso() {
    try { localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(progresso)); } catch (e) { /* ignora */ }
  }
  function estrelasDe(bairro, i) {
    const a = progresso.anos[estado.ano];
    return (a && a[bairro] && a[bairro][i]) || 0;
  }
  function registrarEstrelas(bairro, i, n) {
    const a = progresso.anos[estado.ano] || (progresso.anos[estado.ano] = {});
    const lista = a[bairro] || (a[bairro] = []);
    lista[i] = Math.max(lista[i] || 0, n);
    salvarProgresso();
  }
  function listaPerguntas(bairro) {
    const fonte = bairro === 'tic' ? TICS : CIDADANIA;
    return (fonte && fonte[estado.ano]) || [];
  }
  function totalMissoes(bairro) {
    if (bairro === 'prog') return FASES_PROGRAMACAO[estado.ano].length;
    return Math.ceil(listaPerguntas(bairro).length / ITENS_POR_MISSAO);
  }
  function itensDaMissao(bairro, i) {
    return listaPerguntas(bairro).slice(i * ITENS_POR_MISSAO, (i + 1) * ITENS_POR_MISSAO);
  }
  function liberada(bairro, i) {
    return progresso.liberado || i === 0 || estrelasDe(bairro, i - 1) > 0;
  }
  function temSelo(bairro) {
    for (let i = 0; i < totalMissoes(bairro); i++) if (!estrelasDe(bairro, i)) return false;
    return true;
  }
  function todosSelos() { return ORDEM_BAIRROS.every(temSelo); }
  function somaEstrelas(bairro) {
    let s = 0;
    for (let i = 0; i < totalMissoes(bairro); i++) s += estrelasDe(bairro, i);
    return s;
  }

  // =================================================================
  // Utilidades: tempo com pausa, animação, som, confete
  // =================================================================
  function esperar(ms) {
    return new Promise((resolver) => {
      let resta = ms;
      let ultimo = performance.now();
      function passo(agora) {
        if (!estado.pausado) resta -= agora - ultimo;
        ultimo = agora;
        if (resta <= 0) resolver(); else requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
  }
  function animar(ms, cada) {
    return new Promise((resolver) => {
      let t = 0;
      let ultimo = performance.now();
      function passo(agora) {
        if (!estado.pausado) t += agora - ultimo;
        ultimo = agora;
        const p = Math.min(1, t / ms);
        cada(p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
        if (p < 1) requestAnimationFrame(passo); else resolver();
      }
      requestAnimationFrame(passo);
    });
  }
  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function estrelasHtml(n) {
    let h = '';
    for (let i = 1; i <= 3; i++) h += i <= n ? '<span>⭐</span>' : '<span class="apagada">⭐</span>';
    return h;
  }
  function seloHtml(bairro, ganho) {
    return '<span class="selo ' + bairro + (ganho ? '' : ' vazio') + '" aria-hidden="true">' + BAIRROS[bairro].selo + '</span>';
  }
  function embaralhar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let audio = null;
  function tocar(tipo) {
    if (!estado.som) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const notas = { ok: [523, 784], erro: [220, 175], passo: [660], vitoria: [523, 659, 784, 1047], clique: [880] }[tipo] || [440];
      const dur = tipo === 'passo' || tipo === 'clique' ? .06 : .14;
      notas.forEach((f, i) => {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = tipo === 'erro' ? 'square' : 'triangle';
        o.frequency.value = f;
        const t0 = audio.currentTime + i * dur;
        g.gain.setValueAtTime(.12, t0);
        g.gain.exponentialRampToValueAtTime(.001, t0 + dur * .95);
        o.connect(g).connect(audio.destination);
        o.start(t0); o.stop(t0 + dur);
      });
    } catch (e) { /* sem som */ }
  }

  function soltarConfete() {
    const caixa = $('#confete');
    const cores = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa', '#fb8c00'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + '%';
      c.style.background = cores[i % cores.length];
      c.style.animationDuration = (1.8 + Math.random() * 1.8) + 's';
      c.style.animationDelay = Math.random() * .6 + 's';
      caixa.appendChild(c);
    }
    setTimeout(() => { caixa.innerHTML = ''; }, 4500);
  }

  // =================================================================
  // Telas e barra de cima
  // =================================================================
  function mostrarTela(nome) {
    $$('.tela').forEach((t) => t.classList.toggle('ativa', t.id === 'tela-' + nome));
    estado.tela = nome;
    atualizarBarra();
    window.scrollTo(0, 0);
  }
  function atualizarBarra() {
    const voltar = $('#btn-voltar');
    const b = estado.bairro && BAIRROS[estado.bairro];
    const ano = estado.ano ? ANOS[estado.ano].nome : '';
    const textos = {
      inicio: [null, 'Rota Digital'],
      mapa: ['⬅️ Início', 'Cidade Digital · ' + ano],
      bairro: ['🗺️ Mapa', b ? b.icone + ' ' + b.nome : ''],
      prog: ['🏘️ Missões', b ? b.icone + ' ' + b.curto + ' · Missão ' + (estado.missao + 1) : ''],
      quiz: ['🏘️ Missões', b ? b.icone + ' ' + b.curto + ' · Missão ' + (estado.missao + 1) : ''],
      praca: ['🗺️ Mapa', '⛲ Praça Digital'],
    }[estado.tela];
    voltar.hidden = !textos[0];
    voltar.textContent = textos[0] || '';
    $('#titulo-barra').textContent = textos[1];
    $('#carro-barra').innerHTML = estado.ano ? desenhoCarro(estado.cor) : '';
  }
  function voltar() {
    pararMissao();
    if (estado.tela === 'mapa') mostrarInicio();
    else if (estado.tela === 'bairro' || estado.tela === 'praca') abrirMapa();
    else if (estado.tela === 'prog' || estado.tela === 'quiz') abrirBairro(estado.bairro);
  }

  // =================================================================
  // Tela inicial
  // =================================================================
  function montarInicio() {
    const anos = $('#lista-anos');
    anos.innerHTML = '';
    Object.keys(ANOS).forEach((n) => {
      const b = document.createElement('button');
      b.className = 'btn ano-btn';
      b.dataset.ano = n;
      b.setAttribute('aria-pressed', String(estado.ano === Number(n)));
      b.innerHTML = '🎒 ' + ANOS[n].nome + '<small>' + ANOS[n].resumo + '</small>';
      b.addEventListener('click', () => escolherAno(Number(n)));
      anos.appendChild(b);
    });
    const cores = $('#lista-cores');
    cores.innerHTML = '';
    CORES.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'btn cor-btn';
      b.setAttribute('aria-pressed', String(estado.cor === c.cor));
      b.innerHTML = desenhoCarro(c.cor) + '<span>' + c.nome + '</span>';
      b.addEventListener('click', () => {
        estado.cor = c.cor;
        $$('.cor-btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        tocar('clique');
      });
      cores.appendChild(b);
    });
  }
  function escolherAno(n) {
    estado.ano = n;
    document.body.className = 'ano-' + n;
    $$('.ano-btn').forEach((x) => x.setAttribute('aria-pressed', String(Number(x.dataset.ano) === n)));
    tocar('clique');
  }
  function mostrarInicio() {
    $('#campo-nome').value = estado.nome;
    mostrarTela('inicio');
  }
  function comecar() {
    estado.nome = $('#campo-nome').value.trim();
    if (!estado.ano) {
      const caixa = $('#lista-anos');
      caixa.closest('.inicio-caixa').animate(
        [{ background: '#fff' }, { background: '#fff59d' }, { background: '#fff' }],
        { duration: 900, iterations: 2 });
      mostrarAviso('🎒', 'Escolha o seu ano', 'Clique no seu ano (1º, 2º ou 3º) antes de começar.');
      return;
    }
    estado.posCarro = 'garagem';
    abrirMapa();
  }

  // =================================================================
  // Mapa da Cidade Digital
  // =================================================================
  const PONTOS = {
    garagem: { x: 50, y: 90, braco: 'baixo' },
    prog: { x: 25, y: 50, braco: 'esquerda' },
    tic: { x: 75, y: 50, braco: 'direita' },
    cid: { x: 50, y: 74, braco: 'baixo' },
    praca: { x: 50, y: 50, braco: 'centro' },
  };
  function abrirMapa() {
    estado.bairro = null;
    mostrarTela('mapa');
    ORDEM_BAIRROS.forEach((b) => {
      const el = $('#bairro-' + b);
      const total = totalMissoes(b) * 3;
      el.innerHTML = '<span class="b-selo">' + seloHtml(b, temSelo(b)) + '</span>' +
        '<span class="b-icone" aria-hidden="true">' + BAIRROS[b].icone + '</span>' +
        '<span class="b-nome">' + BAIRROS[b].nome + '</span>' +
        '<span class="b-estrelas">⭐ ' + somaEstrelas(b) + ' de ' + total + '</span>';
    });
    const praca = $('#praca');
    const aberta = todosSelos();
    praca.classList.toggle('aberta', aberta);
    praca.innerHTML = aberta
      ? '<span class="p-icone" aria-hidden="true">⛲</span>Praça Digital<br>🎉 Aberta!'
      : '<span class="p-icone" aria-hidden="true">🔒</span>Praça Digital<br>3 selos';
    $('#selos-mapa').innerHTML = ORDEM_BAIRROS.map((b) =>
      '<div class="selo-item">' + seloHtml(b, temSelo(b)) + (temSelo(b) ? '✅ ' : '') + 'Selo ' + BAIRROS[b].curto + '</div>').join('');
    const carro = $('#carro-mapa');
    carro.innerHTML = '<div class="gira">' + desenhoCarro(estado.cor) + '</div>';
    posicionarCarroMapa(PONTOS[estado.posCarro]);
    girarCarroMapa(estado.posCarro === 'garagem' ? -90 : 0);
  }
  function posicionarCarroMapa(p) {
    const carro = $('#carro-mapa');
    carro.style.left = p.x + '%';
    carro.style.top = p.y + '%';
  }
  function girarCarroMapa(graus) {
    const g = $('#carro-mapa .gira');
    if (g) g.style.transform = 'rotate(' + graus + 'deg)';
  }
  async function dirigirPara(destino) {
    const atual = PONTOS[estado.posCarro];
    const alvo = PONTOS[destino];
    let caminho = [];
    if (estado.posCarro === destino) caminho = [];
    else if (atual.braco === alvo.braco) caminho = [alvo];
    else if (destino === 'praca') caminho = [alvo];
    else caminho = [PONTOS.praca, alvo];
    estado.dirigindo = true;
    let de = atual;
    for (const p of caminho) {
      const dx = p.x - de.x;
      const dy = p.y - de.y;
      girarCarroMapa(Math.atan2(dy * 9, dx * 16) * 180 / Math.PI);
      const dist = Math.hypot(dx, dy * 9 / 16);
      const origem = de;
      await esperar(120);
      await animar(Math.max(350, dist * 28), (k) => {
        posicionarCarroMapa({ x: origem.x + dx * k, y: origem.y + dy * k });
      });
      de = p;
    }
    estado.posCarro = destino;
    estado.dirigindo = false;
  }
  async function clicarNoMapa(destino) {
    if (estado.dirigindo) return;
    if (destino === 'praca' && !todosSelos()) {
      const falta = ORDEM_BAIRROS.filter((b) => !temSelo(b)).map((b) => BAIRROS[b].icone + ' ' + BAIRROS[b].curto);
      mostrarAviso('🔒', 'A Praça Digital ainda está fechada',
        'Ganhe os 3 selos para abrir a praça. Faltam: ' + falta.join(', ') + '.',
        '<div class="selos-mapa">' + ORDEM_BAIRROS.map((b) => seloHtml(b, temSelo(b))).join('') + '</div>');
      return;
    }
    tocar('clique');
    await dirigirPara(destino);
    if (estado.tela !== 'mapa') return;
    if (destino === 'praca') abrirPraca(); else abrirBairro(destino);
  }

  // =================================================================
  // Lista de missões de um bairro
  // =================================================================
  function abrirBairro(bairro) {
    pararMissao();
    estado.bairro = bairro;
    const b = BAIRROS[bairro];
    const cab = $('#bairro-cabecalho');
    cab.className = 'bairro-cabecalho cab-' + bairro;
    cab.innerHTML = '<span class="bc-icone" aria-hidden="true">' + b.icone + '</span>' +
      '<div style="flex:1"><h2>' + b.nome + '</h2><p>' + b.descricao + '</p></div>' +
      seloHtml(bairro, temSelo(bairro));
    const lista = $('#lista-missoes');
    lista.innerHTML = '';
    for (let i = 0; i < totalMissoes(bairro); i++) {
      const btn = document.createElement('button');
      const est = estrelasDe(bairro, i);
      const aberta = liberada(bairro, i);
      btn.className = 'btn missao-btn' + (est ? ' feita' : '') + (aberta ? '' : ' trancada');
      btn.disabled = !aberta;
      let icone = bairro === 'tic' ? '📦' : '🚸';
      if (bairro === 'prog') icone = DESTINOS[FASES_PROGRAMACAO[estado.ano][i].destino].emoji;
      btn.innerHTML = '<span class="m-icone" aria-hidden="true">' + (aberta ? icone : '🔒') + '</span>' +
        '<span>Missão ' + (i + 1) + '</span>' +
        '<span class="m-estrelas">' + (aberta ? estrelasHtml(est) : 'Fechada') + '</span>';
      btn.addEventListener('click', () => abrirMissao(bairro, i));
      lista.appendChild(btn);
    }
    mostrarTela('bairro');
  }
  function abrirMissao(bairro, i) {
    fecharModal('modal-resultado');
    estado.bairro = bairro;
    estado.missao = i;
    if (bairro === 'prog') abrirProgramacao(i); else abrirQuiz(bairro, i);
  }

  // =================================================================
  // Resultado da missão (estrelas e selos)
  // =================================================================
  function terminarMissao(estrelas, detalhe) {
    const bairro = estado.bairro;
    const i = estado.missao;
    const tinhaSelo = temSelo(bairro);
    registrarEstrelas(bairro, i, estrelas);
    const novoSelo = !tinhaSelo && temSelo(bairro);
    const praca = novoSelo && todosSelos();
    tocar('vitoria');
    soltarConfete();
    const frases = { 3: 'Perfeito!', 2: 'Muito bem!', 1: 'Você conseguiu!' };
    let html = '<div class="icone-grande" aria-hidden="true">🏁</div><h2>Missão cumprida! ' + frases[estrelas] + '</h2>' +
      '<div class="estrelas-grandes" aria-label="' + estrelas + ' estrelas">' + estrelasHtml(estrelas) + '</div>';
    if (detalhe) html += detalhe;
    if (estrelas < 3) html += '<p>Jogue de novo quando quiser para ganhar mais estrelas.</p>';
    if (novoSelo) {
      html += '<div class="selo-ganho">' + seloHtml(bairro, true) + '<span>Você ganhou o selo do ' + BAIRROS[bairro].nome + '!</span></div>';
    }
    if (praca) html += '<div class="selo-ganho">🎉 Você tem os 3 selos! A Praça Digital está aberta!</div>';
    $('#resultado-conteudo').innerHTML = html;
    const acoes = $('#resultado-acoes');
    acoes.innerHTML = '';
    const botao = (texto, classe, fn) => {
      const b = document.createElement('button');
      b.className = 'btn ' + classe;
      b.textContent = texto;
      b.addEventListener('click', fn);
      acoes.appendChild(b);
      return b;
    };
    if (praca) {
      botao('🎉 Ir para a Praça', 'grande roxo', () => { fecharModal('modal-resultado'); estado.posCarro = bairro; abrirMapa(); clicarNoMapa('praca'); });
    } else if (i + 1 < totalMissoes(bairro)) {
      botao('➡️ Próxima missão', 'grande verde', () => abrirMissao(bairro, i + 1));
    }
    botao('🔁 Jogar de novo', 'azul', () => abrirMissao(bairro, i));
    botao('🏘️ Missões', 'cinza', () => { fecharModal('modal-resultado'); abrirBairro(bairro); });
    botao('🗺️ Mapa', 'cinza', () => { fecharModal('modal-resultado'); pararMissao(); estado.posCarro = bairro; abrirMapa(); });
    abrirModal('modal-resultado');
  }

  // =================================================================
  // BAIRRO DA PROGRAMAÇÃO
  // =================================================================
  let P = null;
  let execucao = 0;
  let relogioSemaforos = null;

  function abrirProgramacao(i) {
    pararMissao();
    const fase = FASES_PROGRAMACAO[estado.ano][i];
    const regras = REGRAS_PROGRAMACAO[estado.ano];
    const mapa = lerMapa(fase);
    const ideal = blocosIdeais(mapa, regras);
    P = {
      fase: fase, mapa: mapa, regras: regras, ideal: ideal,
      limite: regras.limite ? ideal + 2 : null,
      destino: DESTINOS[fase.destino],
      programa: [], cursor: 0, falhas: 0, executando: false, t: 0,
      x: mapa.inicio.x, y: mapa.inicio.y, conferiu: false, limparPendente: false,
    };
    const obj = $('#prog-objetivo');
    let meta = '';
    if (P.limite) meta = '<span class="contador cheio">🧱 Limite: ' + P.limite + ' blocos</span> <span>⭐ Meta: ' + ideal + ' blocos</span>';
    else if (regras.repetir) meta = '<span>⭐ Meta: ' + ideal + ' blocos</span>';
    obj.innerHTML = '<span class="o-icone" aria-hidden="true">🎯</span><span>Leve o carro até: ' +
      P.destino.emoji + ' ' + P.destino.nome + '</span>' + meta +
      (fase.aviso ? '<span class="aviso-novo">💡 ' + fase.aviso + '</span>' : '');
    desenharTabuleiro();
    montarPaleta();
    desenharPrograma();
    mensagem('', '');
    mostrarTela('prog');
    if (mapa.semaforos.length) {
      relogioSemaforos = setInterval(() => {
        if (P && !P.executando && !estado.pausado) { P.t++; atualizarSemaforos(); }
      }, 1500);
    }
  }

  function pararMissao() {
    execucao++;
    if (relogioSemaforos) clearInterval(relogioSemaforos);
    relogioSemaforos = null;
    if (P) P.executando = false;
    Q.token++;
  }

  function vermelho(t) { return t % 6 < 3; }

  function desenharTabuleiro() {
    const tab = $('#tabuleiro');
    const m = P.mapa;
    tab.style.setProperty('--cols', m.colunas);
    tab.style.setProperty('--rows', m.linhas);
    tab.innerHTML = '';
    for (let y = 0; y < m.linhas; y++) {
      for (let x = 0; x < m.colunas; x++) {
        const c = m.casas[y][x];
        const casa = document.createElement('div');
        casa.className = 'casa';
        casa.dataset.x = x;
        casa.dataset.y = y;
        if (c === 'O') { casa.innerHTML = icone('obra'); casa.title = 'Obra'; }
        if (c === 'K') { casa.innerHTML = icone('cone'); casa.title = 'Cone'; }
        if (c === 'X') { casa.classList.add('predio'); casa.innerHTML = icone('predio'); }
        if (c === 'S') casa.classList.add('semaforo');
        if (x === m.destino.x && y === m.destino.y) {
          casa.classList.add('destino');
          casa.innerHTML = '<span class="d-emoji" aria-hidden="true">' + P.destino.emoji + '</span><span class="d-nome">' + P.destino.nome + '</span>';
        }
        if (x === m.inicio.x && y === m.inicio.y) casa.classList.add('inicio');
        tab.appendChild(casa);
      }
    }
    const carro = document.createElement('div');
    carro.className = 'carro carro-tab';
    carro.id = 'carro-tab';
    carro.innerHTML = '<div class="gira">' + desenhoCarro(estado.cor) + '</div>';
    tab.appendChild(carro);
    atualizarSemaforos();
    colocarCarro(m.inicio.x, m.inicio.y, 'direita');
  }
  function atualizarSemaforos() {
    if (!P) return;
    const verm = vermelho(P.t);
    P.mapa.semaforos.forEach((s) => {
      const casa = casaEm(s.x, s.y);
      casa.classList.toggle('vermelho', verm);
      casa.classList.toggle('verde', !verm);
      casa.innerHTML = desenhoSemaforo(verm) + '<span class="s-texto">' + (verm ? '✋ PARE' : '✔ SIGA') + '</span>';
      casa.title = verm ? 'Semáforo vermelho' : 'Semáforo verde';
    });
  }
  function casaEm(x, y) { return $('#tabuleiro .casa[data-x="' + x + '"][data-y="' + y + '"]'); }
  function colocarCarro(x, y, dir) {
    const carro = $('#carro-tab');
    carro.style.left = (x * 100 / P.mapa.colunas) + '%';
    carro.style.top = (y * 100 / P.mapa.linhas) + '%';
    if (dir) carro.querySelector('.gira').style.transform = 'rotate(' + DIRECOES[dir].angulo + 'deg)';
  }

  function montarPaleta() {
    const paleta = $('#paleta');
    paleta.innerHTML = '';
    const blocos = [
      { tipo: 'seta', dir: 'esquerda' }, { tipo: 'seta', dir: 'cima' },
      { tipo: 'seta', dir: 'baixo' }, { tipo: 'seta', dir: 'direita' },
    ];
    if (P.regras.repetir) blocos.push({ tipo: 'repetir', vezes: 2 });
    if (P.regras.espere) blocos.push({ tipo: 'espere' });
    blocos.forEach((modelo) => {
      const b = document.createElement('button');
      b.innerHTML = conteudoBloco(modelo, true);
      b.className = 'bloco ' + modelo.tipo;
      b.title = rotuloBloco(modelo);
      b.addEventListener('click', () => adicionarBloco(Object.assign({}, modelo)));
      paleta.appendChild(b);
    });
  }
  function rotuloBloco(b) {
    if (b.tipo === 'seta') return DIRECOES[b.dir].nome;
    if (b.tipo === 'repetir') return 'Repetir';
    return 'Se vermelho, espere';
  }
  function conteudoBloco(b, naPaleta) {
    if (b.tipo === 'seta') return '<span aria-hidden="true">' + DIRECOES[b.dir].seta + '</span><span class="b-rotulo">' + DIRECOES[b.dir].nome.toUpperCase() + '</span>';
    if (b.tipo === 'repetir') {
      return '<span aria-hidden="true">🔁</span><span class="b-rotulo">REPETIR</span>' +
        (naPaleta ? '' : '<span class="vezes" title="Clique para mudar">' + b.vezes + '×</span>');
    }
    return '<span aria-hidden="true">🚦</span><span class="b-rotulo">SE VERMELHO,<br>ESPERE</span>';
  }

  function adicionarBloco(bloco) {
    if (!P || P.executando) return;
    if (P.limite && P.programa.length >= P.limite) {
      mensagem('🧱 O limite é ' + P.limite + ' blocos. Use o 🔁 REPETIR para economizar!', 'erro');
      return;
    }
    limparMarcas();
    P.programa.splice(P.cursor, 0, bloco);
    P.cursor++;
    tocar('clique');
    desenharPrograma();
  }
  function tirarBloco() {
    if (!P || P.executando || P.cursor === 0) return;
    limparMarcas();
    P.programa.splice(P.cursor - 1, 1);
    P.cursor--;
    desenharPrograma();
  }
  function limparPrograma() {
    if (!P || P.executando || !P.programa.length) return;
    const btn = $('#btn-limpar');
    if (!P.limparPendente) {
      P.limparPendente = true;
      btn.textContent = '❓ Clique de novo para limpar';
      setTimeout(() => {
        if (P) P.limparPendente = false;
        btn.textContent = '🧽 Limpar tudo';
      }, 3000);
      return;
    }
    P.limparPendente = false;
    btn.textContent = '🧽 Limpar tudo';
    P.programa = [];
    P.cursor = 0;
    limparMarcas();
    desenharPrograma();
    voltarCarroAoInicio();
  }
  function limparMarcas() {
    $$('#programa .bloco').forEach((b) => b.classList.remove('erro', 'rodando'));
    if (P && !P.executando) mensagem('', '');
  }

  function desenharPrograma(erroEm) {
    const area = $('#programa');
    area.innerHTML = '';
    const inicio = document.createElement('button');
    inicio.className = 'bloco';
    inicio.style.background = '#fff';
    inicio.style.color = '#1b1b1b';
    inicio.style.minWidth = '48px';
    inicio.title = 'Início do programa: clique para pôr blocos aqui';
    inicio.innerHTML = '<span aria-hidden="true">🚩</span><span class="b-rotulo">INÍCIO</span>';
    inicio.addEventListener('click', () => { if (!P.executando) { P.cursor = 0; desenharPrograma(); } });
    area.appendChild(inicio);
    if (P.cursor === 0) area.appendChild(cursorEl());
    P.programa.forEach((bloco, i) => {
      const b = document.createElement('button');
      b.className = 'bloco ' + bloco.tipo;
      b.dataset.i = i;
      b.innerHTML = conteudoBloco(bloco, false);
      b.title = rotuloBloco(bloco) + ' (clique para marcar)';
      if (i === P.cursor - 1) b.classList.add('selecionado');
      if (i === erroEm) b.classList.add('erro');
      b.addEventListener('click', (e) => {
        if (P.executando) return;
        if (bloco.tipo === 'repetir' && e.target.closest('.vezes')) {
          bloco.vezes = bloco.vezes >= MAX_REPETIR ? 2 : bloco.vezes + 1;
          tocar('clique');
        }
        P.cursor = i + 1;
        limparMarcas();
        desenharPrograma();
      });
      area.appendChild(b);
      if (P.cursor === i + 1) area.appendChild(cursorEl());
    });
    if (!P.programa.length) {
      const v = document.createElement('span');
      v.className = 'vazio';
      v.textContent = '👈 Clique nas setas para montar o programa.';
      area.appendChild(v);
    }
    const n = P.programa.length;
    const cont = $('#contador-blocos');
    cont.textContent = P.limite ? n + ' de ' + P.limite + ' blocos' : n + (n === 1 ? ' bloco' : ' blocos');
    cont.classList.toggle('cheio', !!P.limite && n >= P.limite);
    $$('#paleta .bloco').forEach((b) => { b.disabled = P.executando || (!!P.limite && n >= P.limite); });
    $('#btn-executar').disabled = P.executando;
    $('#btn-tirar').disabled = P.executando || P.cursor === 0;
    $('#btn-limpar').disabled = P.executando || !n;
  }
  function cursorEl() {
    const c = document.createElement('span');
    c.className = 'cursor-insercao';
    c.title = 'O próximo bloco entra aqui';
    return c;
  }
  function mensagem(texto, tipo) {
    const m = $('#prog-mensagem');
    m.className = 'mensagem ' + (tipo || '');
    m.innerHTML = texto;
  }
  function voltarCarroAoInicio() {
    P.x = P.mapa.inicio.x;
    P.y = P.mapa.inicio.y;
    colocarCarro(P.x, P.y, 'direita');
    $$('#tabuleiro .casa.passou').forEach((c) => c.classList.remove('passou'));
  }
  function marcarRodando(indices) {
    $$('#programa .bloco').forEach((b) => b.classList.toggle('rodando', b.dataset.i !== undefined && indices.includes(Number(b.dataset.i))));
  }

  async function executar() {
    if (!P || P.executando) return;
    if (!P.programa.length) {
      mensagem('👈 Primeiro, clique nas setas para montar o programa.', 'info');
      return;
    }
    limparMarcas();
    for (let i = 0; i < P.programa.length; i++) {
      const b = P.programa[i];
      if (b.tipo === 'repetir') {
        const prox = P.programa[i + 1];
        if (!prox || prox.tipo === 'repetir') {
          P.falhas++;
          falhar(i, 'O bloco 🔁 REPETIR precisa de um bloco logo depois dele, para saber o que repetir. Coloque uma seta depois do bloco marcado.');
          return;
        }
      }
    }
    const id = ++execucao;
    P.executando = true;
    P.t = 0;
    P.conferiu = false;
    voltarCarroAoInicio();
    atualizarSemaforos();
    desenharPrograma();
    mensagem('🚗 O carro está seguindo o programa...', 'info');
    await esperar(300);
    let chegouEm = -1;
    for (let i = 0; i < P.programa.length; i++) {
      let vezes = 1;
      let alvo = i;
      const marcas = [i];
      if (P.programa[i].tipo === 'repetir') {
        vezes = P.programa[i].vezes;
        alvo = i + 1;
        marcas.push(alvo);
      }
      const bloco = P.programa[alvo];
      for (let k = 0; k < vezes; k++) {
        if (chegouEm === -2) chegouEm = alvo;
        marcarRodando(marcas);
        const r = bloco.tipo === 'seta' ? await mover(bloco.dir, id) : await conferirSemaforo(id);
        if (id !== execucao) return;
        if (r.erro) {
          P.falhas++;
          falhar(alvo, r.erro);
          return;
        }
        const noDestino = P.x === P.mapa.destino.x && P.y === P.mapa.destino.y;
        if (noDestino && chegouEm === -1) chegouEm = -2; // chegou: o próximo passo mostra quem leva embora
      }
      i = alvo;
    }
    marcarRodando([]);
    if (P.x === P.mapa.destino.x && P.y === P.mapa.destino.y) {
      P.executando = false;
      desenharPrograma();
      vencerProgramacao();
      return;
    }
    P.falhas++;
    if (chegouEm >= 0) {
      falhar(chegouEm, 'O carro passou pelo destino ' + P.destino.emoji + ', mas não parou lá. A partir do bloco marcado, ele foi embora. Tire os blocos que sobram.');
    } else {
      falhar(P.programa.length - 1, 'O programa acabou, mas o carro ainda não chegou ' + P.destino.emoji + '. Falta um pedaço do caminho: acrescente blocos depois do bloco marcado.');
    }
  }

  async function mover(dir, id) {
    const d = DIRECOES[dir];
    const carro = $('#carro-tab');
    carro.querySelector('.gira').style.transform = 'rotate(' + d.angulo + 'deg)';
    const nx = P.x + d.dx;
    const ny = P.y + d.dy;
    const x0 = P.x;
    const y0 = P.y;
    const fora = nx < 0 || ny < 0 || nx >= P.mapa.colunas || ny >= P.mapa.linhas;
    const c = fora ? null : P.mapa.casas[ny][nx];
    let erro = null;
    if (fora) erro = 'Ops! O carro ia sair da cidade. Troque a seta marcada.';
    else if (c === 'O') erro = 'Ops! Tem uma obra 🚧 no caminho. Troque a seta marcada para desviar.';
    else if (c === 'K') erro = 'Ops! Tem um cone no caminho. Troque a seta marcada para desviar.';
    else if (c === 'X') erro = 'Ops! Ali tem um prédio. O carro só anda na rua. Troque a seta marcada.';
    else if (c === 'S' && !P.conferiu) erro = '✋ Pare! Antes de entrar no semáforo 🚦, o carro precisa conferir a cor. Coloque o bloco 🚦 SE VERMELHO, ESPERE antes da seta marcada.';
    else if (c === 'S' && vermelho(P.t)) erro = 'O semáforo estava vermelho! Use o bloco 🚦 SE VERMELHO, ESPERE antes da seta marcada.';
    if (erro) {
      // Bate de leve e volta
      await animar(180, (k) => posicaoCarro(x0 + d.dx * .3 * k, y0 + d.dy * .3 * k));
      carro.classList.add('batida');
      tocar('erro');
      await animar(180, (k) => posicaoCarro(x0 + d.dx * .3 * (1 - k), y0 + d.dy * .3 * (1 - k)));
      setTimeout(() => carro.classList.remove('batida'), 400);
      return { erro: erro };
    }
    tocar('passo');
    await animar(380, (k) => posicaoCarro(x0 + d.dx * k, y0 + d.dy * k));
    if (id !== execucao) return {};
    P.x = nx;
    P.y = ny;
    P.t++;
    P.conferiu = false;
    atualizarSemaforos();
    const casa = casaEm(nx, ny);
    if (casa && !casa.classList.contains('destino') && !casa.classList.contains('semaforo')) casa.classList.add('passou');
    await esperar(90);
    return {};
  }
  function posicaoCarro(x, y) {
    const carro = $('#carro-tab');
    carro.style.left = (x * 100 / P.mapa.colunas) + '%';
    carro.style.top = (y * 100 / P.mapa.linhas) + '%';
  }
  async function conferirSemaforo(id) {
    P.conferiu = true;
    const perto = P.mapa.semaforos.filter((s) => Math.abs(s.x - P.x) + Math.abs(s.y - P.y) === 1);
    if (!perto.length) {
      balao('🚦 Sem semáforo aqui');
      await esperar(600);
      balao(null);
      return {};
    }
    balao('👀 Conferindo...');
    await esperar(450);
    while (vermelho(P.t)) {
      if (id !== execucao) return {};
      balao('⏳ Esperando o verde...');
      await esperar(700);
      P.t++;
      atualizarSemaforos();
    }
    balao('✅ Verde! Pode ir');
    tocar('ok');
    await esperar(500);
    balao(null);
    return {};
  }
  function balao(texto) {
    let b = $('#balao-espera');
    if (!texto) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('div');
      b.id = 'balao-espera';
      b.className = 'balao-espera';
      $('#tabuleiro').appendChild(b);
    }
    b.textContent = texto;
    b.style.left = (P.x * 100 / P.mapa.colunas) + '%';
    b.style.top = (P.y * 100 / P.mapa.linhas) + '%';
  }
  function falhar(indice, texto) {
    P.executando = false;
    balao(null);
    marcarRodando([]);
    P.cursor = indice + 1;
    desenharPrograma(indice);
    mensagem('<b>⚠️ Quase!</b> ' + texto + '<br>🔧 O bloco com problema está em vermelho. Conserte e clique em ▶️ Executar de novo.', 'erro');
    $('#prog-mensagem').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function vencerProgramacao() {
    mensagem('🎉 Chegou! O carro está na ' + P.destino.nome + '!', 'ok');
    let estrelas;
    let detalhe = '';
    const n = P.programa.length;
    if (estado.ano === 1) {
      estrelas = P.falhas === 0 ? 3 : P.falhas <= 2 ? 2 : 1;
      if (P.falhas) detalhe = '<p>Você testou e consertou o programa. É assim que os programadores fazem!</p>';
    } else {
      estrelas = 3;
      if (n > P.ideal) estrelas--;
      if (P.falhas >= 2) estrelas--;
      estrelas = Math.max(1, estrelas);
      detalhe = '<p>Você usou ' + n + ' blocos.</p>';
      if (n > P.ideal) detalhe += '<p class="dica-meta">💡 Dá para fazer com só ' + P.ideal + ' blocos usando o 🔁 REPETIR!</p>';
    }
    terminarMissao(estrelas, detalhe);
  }

  // =================================================================
  // BAIRROS DAS TICs E DA CIDADANIA DIGITAL (perguntas)
  // =================================================================
  const Q = { token: 0, bairro: null, itens: [], atual: 0, erros: 0, resolvido: false, escolhido: null, colocados: 0 };

  function abrirQuiz(bairro, i) {
    pararMissao();
    Q.bairro = bairro;
    Q.itens = itensDaMissao(bairro, i);
    Q.atual = 0;
    Q.erros = 0;
    desenharEstrada();
    mostrarTela('quiz');
    mostrarItem(0);
  }
  function posMarco(k) {
    const n = Q.itens.length;
    return n === 1 ? 50 : 16 + k * (68 / (n - 1));
  }
  function desenharEstrada() {
    const e = $('#estrada');
    let html = '';
    Q.itens.forEach((item, k) => {
      const fig = Q.bairro === 'tic' ? '📦' : '<span class="selo" style="width:46px;height:46px;font-size:1.5rem;border-radius:10px;background:#ffd54f">' + (item.placa || '⚠️') + '</span>';
      html += '<div class="marco" id="marco-' + k + '" style="left:' + posMarco(k) + '%">' + fig + '<small>' + (k + 1) + '</small></div>';
    });
    html += '<div class="fim" aria-hidden="true">' + (Q.bairro === 'tic' ? '🏪' : '🏁') + '</div>';
    html += '<div class="carro carro-estrada" id="carro-estrada"><div class="gira">' + desenhoCarro(estado.cor) + '</div></div>';
    e.innerHTML = html;
    $('#carro-estrada').style.left = '5%';
  }
  async function dirigirEstrada(ate) {
    const carro = $('#carro-estrada');
    const de = parseFloat(carro.style.left);
    await animar(Math.max(300, Math.abs(ate - de) * 18), (k) => { carro.style.left = (de + (ate - de) * k) + '%'; });
  }
  async function mostrarItem(k) {
    const token = ++Q.token;
    Q.atual = k;
    Q.resolvido = false;
    Q.escolhido = null;
    Q.colocados = 0;
    $('#cartao').hidden = true;
    $('#retorno').hidden = true;
    await dirigirEstrada(posMarco(k) - 7);
    if (token !== Q.token) return;
    const item = Q.itens[k];
    const cartao = $('#cartao');
    cartao.className = 'cartao ' + (Q.bairro === 'tic' ? 'placa-tic' : 'placa-cid');
    const placaPadrao = Q.bairro === 'tic' ? '📦' : '⚠️';
    const rotulo = (Q.bairro === 'tic' ? 'Entrega ' : 'Placa ') + (k + 1) + ' de ' + Q.itens.length;
    let html = '<div class="pergunta"><span class="p-placa" aria-hidden="true">' + escapar(item.placa || placaPadrao) + '</span>' +
      '<span><span class="p-numero">' + rotulo + '</span>' + escapar(item.pergunta) + '</span></div>';
    if (item.tipo === 'arrastar') html += htmlArrastar(item);
    else html += htmlEscolha(item);
    cartao.innerHTML = html;
    cartao.hidden = false;
    if (item.tipo === 'arrastar') ligarArrastar(item); else ligarEscolha(item);
    cartao.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ---------- Escolher a resposta ----------
  function htmlEscolha(item) {
    return '<div class="opcoes">' + item.opcoes.map((o, i) =>
      '<button class="btn opcao" data-i="' + i + '"><span class="o-tecla">' + (i + 1) + '</span>' +
      '<span class="o-img">' + icone(o.img) + '</span><span>' + escapar(o.texto) + '</span></button>').join('') + '</div>';
  }
  function ligarEscolha(item) {
    $$('#cartao .opcao').forEach((b) => b.addEventListener('click', () => escolherOpcao(item, Number(b.dataset.i))));
  }
  function escolherOpcao(item, i) {
    if (Q.resolvido) return;
    const botao = $('#cartao .opcao[data-i="' + i + '"]');
    if (!botao || botao.disabled) return;
    const o = item.opcoes[i];
    if (o.certa) {
      Q.resolvido = true;
      botao.classList.add('certa');
      $$('#cartao .opcao').forEach((b) => { if (b !== botao) b.disabled = true; });
      tocar('ok');
      mostrarRetorno(true, item.explicacao);
    } else {
      Q.erros++;
      botao.classList.add('errada');
      botao.disabled = true;
      tocar('erro');
      mostrarRetorno(false, (o.dica || 'Essa não é a melhor escolha.') + ' Escolha outra opção.');
    }
  }
  function mostrarRetorno(certo, texto) {
    const r = $('#retorno');
    const ultimo = Q.atual + 1 >= Q.itens.length;
    if (certo) {
      r.className = 'retorno ok';
      r.innerHTML = '<span class="r-icone" aria-hidden="true">🎉</span><div class="r-texto"><b>Muito bem!</b>' + escapar(texto || '') + '</div>' +
        '<button id="btn-continuar-quiz" class="btn grande verde">' + (ultimo ? '🏁 Terminar' : '➡️ Continuar') + '</button>';
      r.querySelector('button').addEventListener('click', () => {
        if (ultimo) terminarQuiz(); else mostrarItem(Q.atual + 1);
      });
    } else {
      r.className = 'retorno tenta';
      r.innerHTML = '<span class="r-icone" aria-hidden="true">🤔</span><div class="r-texto"><b>Vamos pensar juntos!</b>' + escapar(texto) + '</div>';
    }
    r.hidden = false;
    r.animate([{ transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 200 });
    r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  async function terminarQuiz() {
    const token = ++Q.token;
    $('#cartao').hidden = true;
    $('#retorno').hidden = true;
    await dirigirEstrada(90);
    if (token !== Q.token) return;
    const estrelas = Q.erros === 0 ? 3 : Q.erros <= 2 ? 2 : 1;
    const detalhe = Q.bairro === 'tic'
      ? '<p>📦 Todas as entregas chegaram à Loja de Tecnologia!</p>'
      : '<p>🛡️ Você passou por todas as placas com cuidado!</p>';
    terminarMissao(estrelas, detalhe);
  }

  // ---------- Levar cada item ao lugar certo ----------
  function htmlArrastar(item) {
    const ordem = embaralhar(item.itens.map((_, i) => i));
    return '<p class="dica-arrastar">👆 Clique num item e depois clique na caixa certa. Se preferir, arraste com o mouse.</p>' +
      '<div class="arrastar-itens">' + ordem.map((i) => {
        const it = item.itens[i];
        return '<button class="btn item" data-i="' + i + '"><span class="o-img">' + icone(it.img) + '</span><span>' + escapar(it.texto || '') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="lugares">' + item.lugares.map((l) =>
        '<button class="btn lugar" data-lugar="' + escapar(l.id) + '"><span class="l-cabeca">' +
        (l.img ? '<span class="o-img">' + icone(l.img) + '</span>' : '') + '<span>' + escapar(l.texto) + '</span></span>' +
        '<span class="l-dentro"></span></button>').join('') + '</div>';
  }
  function ligarArrastar(item) {
    let arrasto = null;
    let ignorarClique = false;
    $$('#cartao .item').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || Q.resolvido) return;
        arrasto = { el: el, x: e.clientX, y: e.clientY, fantasma: null, id: e.pointerId };
      });
      el.addEventListener('click', () => {
        if (ignorarClique) { ignorarClique = false; return; }
        escolherItem(el);
      });
    });
    const mover = (e) => {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      if (!arrasto.fantasma) {
        if (Math.hypot(e.clientX - arrasto.x, e.clientY - arrasto.y) < 10) return;
        const f = arrasto.el.cloneNode(true);
        f.classList.add('fantasma');
        f.style.width = arrasto.el.offsetWidth + 'px';
        document.body.appendChild(f);
        arrasto.fantasma = f;
        escolherItem(arrasto.el, true);
      }
      arrasto.fantasma.style.left = (e.clientX - arrasto.el.offsetWidth / 2) + 'px';
      arrasto.fantasma.style.top = (e.clientY - arrasto.el.offsetHeight / 2) + 'px';
      const sob = lugarSob(e.clientX, e.clientY);
      $$('#cartao .lugar').forEach((l) => l.classList.toggle('sobre', l === sob));
    };
    const soltar = (e) => {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      const a = arrasto;
      arrasto = null;
      if (!a.fantasma) return;
      a.fantasma.remove();
      ignorarClique = true;
      setTimeout(() => { ignorarClique = false; }, 0);
      $$('#cartao .lugar').forEach((l) => l.classList.remove('sobre'));
      const sob = lugarSob(e.clientX, e.clientY);
      if (sob) colocarItem(item, sob); else escolherItem(a.el, true);
    };
    const cartao = $('#cartao');
    document.addEventListener('pointermove', mover);
    document.addEventListener('pointerup', soltar);
    document.addEventListener('pointercancel', soltar);
    // Remove os ouvintes quando a pergunta trocar
    const token = Q.token;
    const vigia = setInterval(() => {
      if (token !== Q.token || !document.body.contains(cartao) || cartao.hidden) {
        document.removeEventListener('pointermove', mover);
        document.removeEventListener('pointerup', soltar);
        document.removeEventListener('pointercancel', soltar);
        clearInterval(vigia);
      }
    }, 500);
    $$('#cartao .lugar').forEach((l) => l.addEventListener('click', () => {
      if (Q.escolhido) colocarItem(item, l);
      else mostrarRetornoCurto('👆 Primeiro clique num item lá em cima. Depois clique na caixa.');
    }));
  }
  function lugarSob(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('#cartao .lugar') : null;
  }
  function escolherItem(el, manter) {
    if (Q.resolvido) return;
    const ja = Q.escolhido === el;
    $$('#cartao .item').forEach((i) => i.classList.remove('escolhido'));
    Q.escolhido = ja && !manter ? null : el;
    if (Q.escolhido) Q.escolhido.classList.add('escolhido');
    $$('#cartao .lugar').forEach((l) => l.classList.toggle('alvo', !!Q.escolhido));
    tocar('clique');
  }
  function colocarItem(item, lugarEl) {
    const el = Q.escolhido;
    if (!el || Q.resolvido) return;
    const it = item.itens[Number(el.dataset.i)];
    const lugar = item.lugares.find((l) => l.id === lugarEl.dataset.lugar);
    if (it.lugar === lugar.id) {
      const mini = document.createElement('span');
      mini.className = 'mini';
      mini.title = it.texto || '';
      mini.innerHTML = icone(it.img);
      lugarEl.querySelector('.l-dentro').appendChild(mini);
      el.remove();
      Q.escolhido = null;
      Q.colocados++;
      $$('#cartao .lugar').forEach((l) => l.classList.remove('alvo'));
      tocar('ok');
      if (Q.colocados === item.itens.length) {
        Q.resolvido = true;
        $('#cartao .arrastar-itens').innerHTML = '<span class="vazio">✅ Tudo entregue!</span>';
        mostrarRetorno(true, item.explicacao);
      } else {
        mostrarRetornoCurto('✅ Isso! ' + (it.texto ? it.texto + ' → ' : '') + lugar.texto + '.', true);
      }
    } else {
      Q.erros++;
      tocar('erro');
      lugarEl.classList.remove('nao');
      void lugarEl.offsetWidth;
      lugarEl.classList.add('nao');
      setTimeout(() => lugarEl.classList.remove('nao'), 500);
      mostrarRetorno(false, it.dica || 'Esse item não vai nessa caixa. Leia de novo o nome da caixa e tente outra.');
    }
  }
  function mostrarRetornoCurto(texto, ok) {
    const r = $('#retorno');
    r.className = 'retorno ' + (ok ? 'ok' : 'tenta');
    r.innerHTML = '<div class="r-texto">' + escapar(texto) + '</div>';
    r.hidden = false;
  }

  // =================================================================
  // Praça Digital e certificado
  // =================================================================
  function abrirPraca() {
    mostrarTela('praca');
    $('#campo-nome-cert').value = estado.nome;
    $('#nome-certificado').hidden = false;
    desenharCertificado();
    soltarConfete();
    tocar('vitoria');
  }
  function desenharCertificado() {
    const data = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const nome = estado.nome ? escapar(estado.nome) : '&nbsp;';
    $('#certificado').innerHTML =
      '<div class="c-titulo">🏅 CERTIFICADO 🏅</div>' +
      '<div class="c-jogo">Rota Digital · Cidade Digital</div>' +
      '<div class="c-texto">Certificamos que</div>' +
      '<div class="c-nome">' + nome + '</div>' +
      '<div class="c-texto">completou a Rota Digital do ' + ANOS[estado.ano].nome +
      ', cumprindo as missões dos bairros da Programação, das TICs e da Cidadania Digital.</div>' +
      '<div class="c-selos">' + ORDEM_BAIRROS.map((b) => '<div>' + seloHtml(b, true) + BAIRROS[b].curto + '</div>').join('') + '</div>' +
      '<div class="c-data">' + data + '</div>';
  }

  // =================================================================
  // Janelas: aviso, ajuda, pausa, professor
  // =================================================================
  function abrirModal(id) {
    const m = $('#' + id);
    m.hidden = false;
    m.querySelector('.janela').scrollTop = 0;
    const b = m.querySelector('.btn');
    if (b) b.focus({ preventScroll: true });
  }
  function fecharModal(id) { $('#' + id).hidden = true; }
  function modalAberto() { return $$('.modal').find((m) => !m.hidden); }

  function mostrarAviso(icone, titulo, texto, extra) {
    $('#resultado-conteudo').innerHTML = '<div class="icone-grande" aria-hidden="true">' + icone + '</div><h2>' + escapar(titulo) + '</h2><p>' + escapar(texto) + '</p>' + (extra || '');
    const acoes = $('#resultado-acoes');
    acoes.innerHTML = '<button class="btn grande verde">👍 Entendi</button>';
    acoes.querySelector('button').addEventListener('click', () => fecharModal('modal-resultado'));
    abrirModal('modal-resultado');
  }

  function abrirAjuda() {
    const ano = estado.ano || 1;
    const secoes = [
      {
        id: 'mapa', titulo: '🗺️ Na Cidade Digital', itens: [
          ['🗺️', 'Clique num bairro. O carro vai até lá.'],
          ['⭐⭐⭐', 'Cada missão vale até 3 estrelas.'],
          ['🏅', 'Termine as missões do bairro e ganhe o selo.'],
          ['⛲', 'Com os 3 selos, a Praça Digital abre!'],
        ],
      },
      {
        id: 'prog', titulo: '🧩 Programação', itens: [
          ['➡️', 'Clique numa seta. Ela vai para o programa. Cada seta anda uma casa.'],
          ['▶️', 'Clique em Executar e veja o carro andar.'],
          ['⚠️', 'Deu erro? O bloco fica vermelho. Troque só ele!'],
          ['🚩 ▮', 'A barrinha amarela mostra onde entra o próximo bloco. Clique num bloco para mudar.'],
          ['🗑️', 'Tirar bloco apaga o bloco marcado.'],
        ].concat(ano >= 2 ? [['🔁 3×', 'REPETIR repete o bloco seguinte. Clique no número para mudar.']] : [])
          .concat(ano >= 3 ? [['🚦', 'SE VERMELHO, ESPERE: use antes de entrar no semáforo.']] : []),
      },
      {
        id: 'tic', titulo: '💻 TICs', itens: [
          ['👆', 'Clique na resposta certa.'],
          ['📦 ➜ 📥', 'Para levar um item: clique nele e depois na caixa certa. Ou arraste com o mouse.'],
        ],
      },
      {
        id: 'cid', titulo: '🛡️ Cidadania Digital', itens: [
          ['⚠️', 'Leia a placa.'],
          ['👆', 'Escolha o que você faria.'],
          ['💬', 'Leia a explicação. Errou? Tudo bem: tente de novo!'],
        ],
      },
      {
        id: 'teclado', titulo: '⌨️ Teclado (se quiser)', itens: [
          ['⬅️⬆️⬇️➡️', 'Setas do teclado põem blocos de seta.'],
          ['R  E', 'R põe REPETIR. E põe SE VERMELHO, ESPERE.'],
          ['Enter', 'Executa o programa ou continua.'],
          ['1 2 3', 'Escolhem a resposta.'],
          ['P  H', 'P pausa. H abre o Como jogar.'],
        ],
      },
    ];
    let destaque = 'mapa';
    if (estado.tela === 'prog') destaque = 'prog';
    else if (estado.tela === 'quiz' || estado.tela === 'bairro') destaque = estado.bairro || 'mapa';
    secoes.sort((a, b) => (b.id === destaque) - (a.id === destaque));
    $('#conteudo-ajuda').innerHTML = secoes.map((s) =>
      '<section class="ajuda-secao' + (s.id === destaque ? ' destaque' : '') + '"><h3>' + s.titulo + '</h3><ol>' +
      s.itens.map((i) => '<li><span class="a-fig" aria-hidden="true">' + i[0] + '</span><span>' + i[1] + '</span></li>').join('') +
      '</ol></section>').join('');
    abrirModal('modal-ajuda');
  }

  function pausar() {
    estado.pausado = true;
    document.body.classList.add('pausado');
    abrirModal('modal-pausa');
  }
  function continuar() {
    estado.pausado = false;
    document.body.classList.remove('pausado');
    fecharModal('modal-pausa');
  }

  let contaProfessor = 0;
  function abrirProfessor() {
    const a = 3 + Math.floor(Math.random() * 7);
    const b = 3 + Math.floor(Math.random() * 7);
    contaProfessor = a + b;
    $('#prof-conta').textContent = 'Quanto é ' + a + ' + ' + b + '?';
    $('#prof-resposta').value = '';
    $('#prof-erro').textContent = '';
    $('#prof-aviso').textContent = '';
    $('#prof-pergunta').hidden = false;
    $('#prof-painel').hidden = true;
    $('#prof-confirmar').hidden = true;
    $('#modal-professor').hidden = false;
    $('#prof-resposta').focus();
  }
  function entrarProfessor() {
    if (Number($('#prof-resposta').value.trim()) === contaProfessor) {
      $('#prof-pergunta').hidden = true;
      $('#prof-painel').hidden = false;
      atualizarBotaoLiberar();
    } else {
      $('#prof-erro').textContent = 'Resposta incorreta. Tente de novo.';
    }
  }
  function atualizarBotaoLiberar() {
    $('#prof-liberar').textContent = progresso.liberado ? '🔒 Voltar a liberar uma fase de cada vez' : '🔓 Liberar todas as fases';
  }
  function atualizarTelaAtual() {
    if (estado.tela === 'mapa') abrirMapa();
    else if (estado.tela === 'bairro') abrirBairro(estado.bairro);
  }

  // =================================================================
  // Eventos
  // =================================================================
  function ligarEventos() {
    $('#btn-comecar').addEventListener('click', comecar);
    $('#campo-nome').addEventListener('keydown', (e) => { if (e.key === 'Enter') comecar(); });
    $('#btn-voltar').addEventListener('click', voltar);
    $('#btn-ajuda').addEventListener('click', abrirAjuda);
    $('#btn-pausa').addEventListener('click', pausar);
    $('#btn-continuar').addEventListener('click', continuar);
    $('#btn-som').addEventListener('click', () => {
      estado.som = !estado.som;
      const b = $('#btn-som');
      b.setAttribute('aria-pressed', String(estado.som));
      b.textContent = estado.som ? '🔊 Som ligado' : '🔇 Som desligado';
      tocar('ok');
    });
    $$('[data-fechar]').forEach((b) => b.addEventListener('click', () => { b.closest('.modal').hidden = true; }));
    $$('[data-bairro]').forEach((b) => b.addEventListener('click', () => clicarNoMapa(b.dataset.bairro)));

    $('#btn-executar').addEventListener('click', executar);
    $('#btn-tirar').addEventListener('click', tirarBloco);
    $('#btn-limpar').addEventListener('click', limparPrograma);

    $('#campo-nome-cert').addEventListener('input', (e) => {
      estado.nome = e.target.value.trim();
      desenharCertificado();
    });
    $('#btn-imprimir').addEventListener('click', () => window.print());
    $('#btn-praca-mapa').addEventListener('click', abrirMapa);

    $$('[data-abrir-professor]').forEach((b) => b.addEventListener('click', abrirProfessor));
    $('#prof-entrar').addEventListener('click', entrarProfessor);
    $('#prof-resposta').addEventListener('keydown', (e) => { if (e.key === 'Enter') entrarProfessor(); });
    $('#prof-liberar').addEventListener('click', () => {
      progresso.liberado = !progresso.liberado;
      salvarProgresso();
      atualizarBotaoLiberar();
      $('#prof-aviso').textContent = progresso.liberado ? '✅ Todas as fases foram liberadas.' : '✅ As fases voltaram a abrir uma de cada vez.';
      atualizarTelaAtual();
    });
    $('#prof-apagar').addEventListener('click', () => { $('#prof-confirmar').hidden = false; $('#prof-aviso').textContent = ''; });
    $('#prof-apagar-nao').addEventListener('click', () => { $('#prof-confirmar').hidden = true; });
    $('#prof-apagar-sim').addEventListener('click', () => {
      progresso = { liberado: false, anos: {} };
      salvarProgresso();
      try { localStorage.removeItem(CHAVE_PROGRESSO); } catch (e) { /* ignora */ }
      $('#prof-confirmar').hidden = true;
      atualizarBotaoLiberar();
      $('#prof-aviso').textContent = '✅ O progresso foi apagado.';
      atualizarTelaAtual();
    });

    document.addEventListener('keydown', teclado);
  }

  function teclado(e) {
    if (e.target.matches('input, textarea')) return;
    const aberto = modalAberto();
    if (e.key === 'Escape') {
      if (!aberto) return;
      if (aberto.id === 'modal-pausa') continuar(); else aberto.hidden = true;
      return;
    }
    if (aberto) return;
    const k = e.key.toLowerCase();
    if (k === 'p') { pausar(); return; }
    if (k === 'h') { abrirAjuda(); return; }
    const botaoComFoco = document.activeElement && document.activeElement.tagName === 'BUTTON';
    if (estado.tela === 'prog' && P) {
      const setas = { ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita' };
      if (setas[e.key]) { e.preventDefault(); adicionarBloco({ tipo: 'seta', dir: setas[e.key] }); }
      else if (k === 'r' && P.regras.repetir) adicionarBloco({ tipo: 'repetir', vezes: 2 });
      else if (k === 'e' && P.regras.espere) adicionarBloco({ tipo: 'espere' });
      else if (e.key === 'Enter' && !botaoComFoco) { e.preventDefault(); executar(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); tirarBloco(); }
    } else if (estado.tela === 'quiz') {
      const item = Q.itens[Q.atual];
      if (/^[1-4]$/.test(e.key) && item && item.tipo === 'escolha' && !$('#cartao').hidden) {
        if (Number(e.key) <= item.opcoes.length) escolherOpcao(item, Number(e.key) - 1);
      } else if (e.key === 'Enter' && !botaoComFoco) {
        const b = $('#btn-continuar-quiz');
        if (b && !$('#retorno').hidden) { e.preventDefault(); b.click(); }
      }
    }
  }

  // Pausa automática quando a janela perde o foco não é necessária: o jogo não tem tempo-limite.
  montarInicio();
  ligarEventos();
  atualizarBarra();
})();
