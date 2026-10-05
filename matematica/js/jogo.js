// Interface da Feira do Robô: telas, peças, arrastar e soltar, dicas visuais,
// estrelas e progresso salvo. Todo retorno é visual; o som é opcional e começa desligado.
(function () {
  const $ = (sel) => document.querySelector(sel);
  const CHAVE_PROGRESSO = 'feiraRobo.progresso.v1';
  const CHAVE_SOM = 'feiraRobo.som.v1';
  const CHAVE_LIBERADO = 'feiraRobo.liberado.v1';
  const VALOR = Regras.VALOR_UNIDADE;

  const estado = {
    ano: 1,
    indice: 0,
    fase: null,
    mec: null,
    tentativas: 0,
    ocupado: false,
    selecionado: null,
    som: lerArmazenado(CHAVE_SOM, false),
    liberado: lerArmazenado(CHAVE_LIBERADO, false),
    progresso: lerArmazenado(CHAVE_PROGRESSO, {}),
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
    return estado.liberado || indice === 0 || estrelasDe(ano, indice - 1) > 0;
  }

  // ---------- Utilidades ----------
  function h(tag, classe, html) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const animacoesReduzidas = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Número com os algarismos coloridos: centena, dezena, unidade.
  function numeroColorido(n) {
    const s = String(n);
    const classes = ['dig-u', 'dig-d', 'dig-c'];
    return s.split('').map((c, i) => `<span class="${classes[s.length - 1 - i] || ''}">${c}</span>`).join('');
  }

  // "Quadro de dez": 2 fileiras de 5, ajuda a ver a quantidade.
  function quadrosDez(n, simbolo) {
    let html = '<span class="quadros">';
    for (let q = 0; q < Math.ceil(n / 10); q++) {
      html += '<span class="quadro">';
      for (let i = 0; i < 10; i++) {
        const cheio = q * 10 + i < n;
        html += `<span class="celula${cheio ? ' cheia' : ''}">${cheio ? simbolo : ''}</span>`;
      }
      html += '</span>';
    }
    return html + '</span>';
  }

  // ---------- Desenho das peças ----------
  function desenharUnidade(unidade, fruta) {
    if (unidade === 'solta') return h('div', 'peca fruta', fruta);
    if (unidade === 'caixa') {
      return h('div', 'peca caixa10', `<span class="etiqueta">10</span><span class="mini">${`<i>${fruta}</i>`.repeat(10)}</span>`);
    }
    return h('div', 'peca engradado', `<span class="etiqueta">100</span><span class="mini-caixas">${'<i></i>'.repeat(10)}</span>`);
  }

  const NOTAS = {
    200: { cor: '#6d9ac4', bicho: '🐢' },
    500: { cor: '#a77bc4', bicho: '🦩' },
    1000: { cor: '#e0605a', bicho: '🦜' },
    2000: { cor: '#f2b33d', bicho: '🐒' },
    5000: { cor: '#c98a4b', bicho: '🐆' },
    10000: { cor: '#4a90d9', bicho: '🐟' },
  };
  function desenharDinheiro(valor) {
    const texto = Regras.dinheiro(valor).replace(',00', '');
    if (NOTAS[valor]) {
      const e = h('div', 'peca nota', `<span class="bicho">${NOTAS[valor].bicho}</span><span class="valor">${texto}</span>`);
      e.style.setProperty('--cor-nota', NOTAS[valor].cor);
      return e;
    }
    const tipo = valor === 100 ? 'moeda-1' : valor === 5 ? 'moeda-cobre' : valor === 50 ? 'moeda-prata' : 'moeda-ouro';
    const rotulo = valor >= 100 ? 'R$ 1' : valor + '¢';
    return h('div', `peca moeda ${tipo}`, `<span>${rotulo}</span>`);
  }

  // ---------- Som opcional (desligado por padrão) ----------
  let audio = null;
  function som(tipo) {
    if (!estado.som) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const notas = { soltar: [520], acerto: [523, 659, 784, 1047], dica: [440, 494] }[tipo] || [500];
      notas.forEach((freq, i) => {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.frequency.value = freq;
        o.type = 'sine';
        const t = audio.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g).connect(audio.destination);
        o.start(t);
        o.stop(t + 0.2);
      });
    } catch (e) { /* sem áudio */ }
  }
  function falar(texto) {
    if (!estado.som || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto.replace(/R\$ ?(\d+),00/g, '$1 reais').replace(/R\$ ?(\d+),(\d+)/g, '$1 reais e $2 centavos'));
    u.lang = 'pt-BR';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }
  function atualizarBotaoSom() {
    const b = $('#btn-som');
    b.textContent = estado.som ? '🔊 Som ligado' : '🔇 Som desligado';
    b.setAttribute('aria-pressed', String(estado.som));
    $('#btn-ouvir').hidden = !estado.som;
  }

  // ---------- Interação comum: itens, áreas de soltar e seleção ----------
  // dados.chave identifica o item; dados.fixo = continua selecionado depois de usar.
  function itemArrastavel(el, dados, aoClicar) {
    el.dataset.chave = dados.chave;
    Arrastar.item(el, {
      dados,
      aoClicar: () => {
        if (estado.ocupado) return;
        if (aoClicar) aoClicar();
        else selecionar(dados);
      },
    });
    if (estado.selecionado && estado.selecionado.chave === dados.chave) el.classList.add('selecionado');
  }

  function zonaAtiva(el, aceita, soltar) {
    const acao = (d) => { soltar(d); som('soltar'); };
    Arrastar.zona(el, { aceita: (d) => !estado.ocupado && aceita(d), soltar: acao });
    el.addEventListener('click', () => {
      if (Arrastar.cliqueBloqueado() || estado.ocupado) return;
      const d = estado.selecionado;
      if (d && aceita(d)) {
        if (!d.fixo) estado.selecionado = null;
        acao(d);
      }
    });
    if (estado.selecionado && aceita(estado.selecionado)) el.classList.add('espera-clique');
  }

  function selecionar(dados) {
    estado.selecionado = estado.selecionado && estado.selecionado.chave === dados.chave ? null : dados;
    atualizar();
  }

  function atualizar() {
    const area = $('#area');
    area.innerHTML = '';
    estado.mec.render(area);
  }

  // Conta os elementos um a um, com destaque e um número em cima de cada um.
  async function contar(elementos, rotulos) {
    const lista = Array.from(elementos);
    const passo = animacoesReduzidas ? 60 : Math.max(160, Math.min(550, 6500 / Math.max(lista.length, 1)));
    for (let i = 0; i < lista.length; i++) {
      const el = lista[i];
      el.classList.add('contando');
      el.appendChild(h('span', 'selo', String(rotulos ? rotulos[i] : i + 1)));
      await esperar(passo);
      el.classList.remove('contando');
      el.classList.add('contado');
    }
  }

  function mensagem(html, tipo) {
    const m = $('#mensagem');
    m.innerHTML = html;
    m.className = 'mensagem' + (tipo ? ' ' + tipo : '');
  }

  // ---------- Cartões com números (respostas) ----------
  function criarFichas(opcoes, nSlots, infinito, formato) {
    return { opcoes, infinito, formato: formato || String, slots: Array(nSlots).fill(null) };
  }
  function fichasDisponiveis(f) {
    if (f.infinito) return f.opcoes.slice();
    const restantes = f.opcoes.slice();
    f.slots.forEach((v) => {
      if (v === null) return;
      const i = restantes.indexOf(v);
      if (i >= 0) restantes.splice(i, 1);
    });
    return restantes;
  }
  function colocarFicha(f, valor, slot, origem) {
    if (origem !== null && origem !== undefined) f.slots[origem] = null;
    f.slots[slot] = valor;
    atualizar();
  }
  function colocarNoPrimeiro(f, valor) {
    let i = f.slots.indexOf(null);
    if (i < 0 && f.slots.length === 1) i = 0;
    if (i >= 0) { colocarFicha(f, valor, i, null); som('soltar'); }
  }
  function desenharBanco(f, id) {
    const banco = h('div', 'banco');
    fichasDisponiveis(f).forEach((v, k) => {
      const c = h('div', 'ficha', f.formato(v));
      itemArrastavel(c, { chave: `${id}-ficha-${v}-${k}`, tipo: 'ficha', grupo: id, valor: v, slot: null }, () => colocarNoPrimeiro(f, v));
      banco.appendChild(c);
    });
    zonaAtiva(banco, (d) => d.tipo === 'ficha' && d.grupo === id && d.slot !== null, (d) => { f.slots[d.slot] = null; atualizar(); });
    return banco;
  }
  function desenharSlot(f, i, id, classe) {
    const slot = h('div', 'slot' + (classe ? ' ' + classe : ''));
    if (f.slots[i] !== null) {
      const c = h('div', 'ficha', f.formato(f.slots[i]));
      itemArrastavel(c, { chave: `${id}-slot-${i}`, tipo: 'ficha', grupo: id, valor: f.slots[i], slot: i }, () => { f.slots[i] = null; atualizar(); });
      slot.appendChild(c);
      slot.classList.add('cheio');
    } else {
      slot.innerHTML = '<span class="interrogacao">?</span>';
    }
    zonaAtiva(slot, (d) => d.tipo === 'ficha' && d.grupo === id && d.slot !== i, (d) => colocarFicha(f, d.valor, i, d.slot));
    return slot;
  }

  // Espalha os itens de um jeito "bagunçado", mas sempre igual.
  function espalhar(el, i, semente) {
    const r = Math.sin((i + 1) * 12.9898 + semente * 78.233) * 43758.5453;
    const x = r - Math.floor(r);
    el.style.setProperty('--giro', `${Math.round((x - 0.5) * 30)}deg`);
    el.style.setProperty('--sobe', `${Math.round((x * 7) % 1 * 14 - 7)}px`);
  }

  // =====================================================================
  // Mecânicas
  // =====================================================================

  // ---------- Sacola: soltas, caixas de 10 e engradados de 100 ----------
  function mecSacola(fase) {
    const temCaixa = fase.unidades.includes('caixa');
    const nomes = { solta: 'Solta (1)', caixa: 'Caixa com 10', engradado: 'Engradado com 100' };
    let s = Regras.sacolaInicial(fase);
    let ultimo = null;
    let trocou = false;

    function adicionar(u) {
      const total = Regras.totalSacola(s);
      if (total + VALOR[u] > 999 || (!temCaixa && s.solta >= 40)) return;
      s[u]++;
      ultimo = u;
      const trocas = Regras.empacotar(s, fase.unidades);
      trocou = trocas.length > 0;
      if (trocou) {
        ultimo = trocas[trocas.length - 1];
        mensagem(ultimo === 'caixa' ? '📦 10 soltas viraram 1 caixa!' : '🧺 10 caixas viraram 1 engradado!', 'info');
      }
      atualizar();
    }
    function remover(u) {
      if (s[u] <= 0) return;
      s[u]--;
      ultimo = null;
      trocou = false;
      atualizar();
    }
    function abrir(u) {
      if (u === 'caixa' && s.caixa > 0) { s.caixa--; s.solta += 10; ultimo = 'solta'; }
      else if (u === 'engradado' && s.engradado > 0) { s.engradado--; s.caixa += 10; ultimo = 'caixa'; }
      trocou = true;
      mensagem(u === 'caixa' ? '✂️ A caixa abriu: agora são 10 soltas.' : '✂️ O engradado abriu: agora são 10 caixas.', 'info');
      atualizar();
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-sacola');

      const banca = h('div', 'banca');
      banca.appendChild(h('div', 'rotulo', '🏪 Barraca do robô'));
      const prateleira = h('div', 'prateleira');
      fase.unidades.forEach((u) => {
        const estoque = h('div', 'estoque');
        const peca = desenharUnidade(u, fase.fruta);
        itemArrastavel(peca, { chave: 'novo-' + u, tipo: 'novo', unidade: u }, () => { adicionar(u); som('soltar'); });
        estoque.appendChild(peca);
        estoque.appendChild(h('div', 'legenda', nomes[u]));
        prateleira.appendChild(estoque);
      });
      banca.appendChild(prateleira);
      if (fase.abrir) {
        const z = h('div', 'zona-abrir', '✂️ Solte aqui uma caixa para abrir');
        zonaAtiva(z, (d) => d.tipo === 'naSacola' && d.unidade !== 'solta', (d) => abrir(d.unidade));
        banca.appendChild(z);
      }
      banca.appendChild(h('p', 'ajudinha', 'Arraste para a sacola ou clique. Para tirar, clique na fruta da sacola.'));
      zonaAtiva(banca, (d) => d.tipo === 'naSacola', (d) => remover(d.unidade));

      const sacola = h('div', 'sacola');
      sacola.appendChild(h('div', 'rotulo', '🛍️ Sacola do cliente'));
      const dentro = h('div', 'dentro');
      ['engradado', 'caixa'].forEach((u) => {
        if (!s[u]) return;
        const fila = h('div', 'fila-' + u);
        for (let i = 0; i < s[u]; i++) {
          const p = desenharUnidade(u, fase.fruta);
          p.classList.add('na-sacola');
          if (u === ultimo && i === s[u] - 1) p.classList.add(trocou ? 'empacotou' : 'novo');
          itemArrastavel(p, { chave: `sac-${u}-${i}`, tipo: 'naSacola', unidade: u }, () => remover(u));
          fila.appendChild(p);
        }
        dentro.appendChild(fila);
      });
      if (s.solta) {
        const grade = h('div', 'grade-dez');
        for (let i = 0; i < s.solta; i++) {
          const p = desenharUnidade('solta', fase.fruta);
          p.classList.add('na-sacola');
          if (ultimo === 'solta' && i === s.solta - 1) p.classList.add('novo');
          itemArrastavel(p, { chave: `sac-solta-${i}`, tipo: 'naSacola', unidade: 'solta' }, () => remover('solta'));
          grade.appendChild(p);
        }
        dentro.appendChild(grade);
      }
      if (!Regras.totalSacola(s)) dentro.appendChild(h('div', 'vazio', '⬇ Solte aqui'));
      sacola.appendChild(dentro);
      zonaAtiva(sacola, (d) => d.tipo === 'novo', (d) => adicionar(d.unidade));

      mesa.appendChild(banca);
      mesa.appendChild(sacola);
      area.appendChild(mesa);
    }

    async function dica(res, tentativa) {
      const pecas = $('#area').querySelectorAll('.sacola .na-sacola');
      const rotulos = [];
      let soma = 0;
      ['engradado', 'caixa', 'solta'].forEach((u) => {
        for (let i = 0; i < s[u]; i++) { soma += VALOR[u]; rotulos.push(soma); }
      });
      if (pecas.length) {
        mensagem('🔍 Vamos contar juntos!', 'dica');
        await contar(pecas, rotulos);
      }
      const alvo = res.alvo;
      if (res.total === 0) {
        mensagem('A sacola está vazia. Arraste as frutas para a sacola! ⬇', 'dica');
        return;
      }
      const dif = Math.abs(alvo - res.total);
      let txt = `Na sacola tem <b class="num">${res.total}</b>. O pedido é <b class="num">${alvo}</b>. `;
      txt += res.total < alvo ? '➕ Coloque mais' : '➖ Tire algumas';
      txt += tentativa >= 2 ? `: <b class="num">${dif}</b>.` : '.';
      if (tentativa >= 2 && temCaixa) {
        const d = Regras.decompor(alvo);
        const partes = [];
        if (fase.unidades.includes('engradado')) partes.push(`${d.engradado} engradado${d.engradado === 1 ? '' : 's'}`);
        partes.push(`${fase.unidades.includes('engradado') ? d.caixa : Math.floor(alvo / 10)} caixa${d.caixa === 1 ? '' : 's'}`);
        partes.push(`${d.solta} solta${d.solta === 1 ? '' : 's'}`);
        txt += `<br>💡 <b class="num">${alvo}</b> = ${partes.join(', ')}.`;
      }
      mensagem(txt, 'dica');
    }

    function resumo() {
      if (fase.conta) return `<span class="conta">${fase.conta} = ${fase.alvo}</span>`;
      if (!temCaixa) return `<span class="conta">${fase.alvo} ${fase.fruta}</span>`;
      const d = Regras.decompor(fase.alvo);
      const partes = [];
      if (fase.unidades.includes('engradado')) partes.push(`${d.engradado} × 🧺`);
      partes.push(`${fase.unidades.includes('engradado') ? d.caixa : Math.floor(fase.alvo / 10)} × 📦`);
      partes.push(`${d.solta} × ${fase.fruta}`);
      return `<span class="conta">${numeroColorido(fase.alvo)}</span><span class="detalhe">${partes.join(' + ')}</span>`;
    }

    function desenho() {
      if (fase.conta) return `<span class="conta">${fase.conta} = ?</span>`;
      if (fase.alvo <= 30 && !temCaixa) return quadrosDez(fase.alvo, fase.fruta);
      return `<span class="num-grande">${numeroColorido(fase.alvo)}</span> <span class="fruta-pedido">${fase.fruta}</span>`;
    }

    return { render, resposta: () => ({ ...s }), dica, resumo, desenho };
  }

  // ---------- Quantos: contar ou juntar grupos e escolher o número ----------
  function mecQuantos(fase) {
    const fichas = criarFichas(fase.opcoes, 1, false);
    let marcados = new Set();

    function render(area) {
      const mesa = h('div', 'mesa mesa-quantos');
      const linha = h('div', 'linha-grupos');
      let k = 0;
      fase.grupos.forEach((g, gi) => {
        if (gi > 0) linha.appendChild(h('div', 'sinal', '+'));
        const cesta = h('div', 'cesta-grupo');
        for (let i = 0; i < g.n; i++, k++) {
          const id = k;
          const f = h('button', 'fruta contavel' + (marcados.has(id) ? ' marcada' : ''), g.fruta);
          f.type = 'button';
          espalhar(f, id, gi + 1);
          f.addEventListener('click', () => {
            if (estado.ocupado) return;
            if (marcados.has(id)) marcados.delete(id); else marcados.add(id);
            f.classList.toggle('marcada');
          });
          cesta.appendChild(f);
        }
        linha.appendChild(cesta);
      });
      linha.appendChild(h('div', 'sinal', '='));
      linha.appendChild(desenharSlot(fichas, 0, 'q', 'slot-grande'));
      mesa.appendChild(linha);
      mesa.appendChild(h('p', 'ajudinha', 'Clique nas frutas para marcar ✓ enquanto conta. Depois arraste o número certo para o ?'));
      mesa.appendChild(desenharBanco(fichas, 'q'));
      area.appendChild(mesa);
    }

    async function dica(res) {
      marcados = new Set();
      atualizar();
      mensagem('🔍 Vamos contar juntos, uma fruta de cada vez!', 'dica');
      await contar($('#area').querySelectorAll('.contavel'));
      const txt = fase.grupos.length > 1
        ? 'Juntamos as frutas e contamos tudo. O <b>último número</b> que contamos é o total.'
        : 'O <b>último número</b> que contamos é quantas frutas tem.';
      mensagem((res.vazio ? 'Arraste um cartão com número para o <b>?</b>. ' : '') + txt, 'dica');
    }

    const total = Regras.respostaCerta(fase);
    function desenho() {
      return fase.grupos.map((g) => `<span class="fruta-pedido">${g.fruta}</span>`).join('<span class="sinal-p">+</span>') + '<span class="sinal-p">=</span><span class="num-grande">?</span>';
    }
    function resumo() {
      const partes = fase.grupos.map((g) => g.n);
      return `<span class="conta">${partes.length > 1 ? partes.join(' + ') + ' = ' : ''}${total} ${fase.grupos[fase.grupos.length - 1].fruta}</span>`;
    }
    return { render, resposta: () => fichas.slots[0], dica, resumo, desenho };
  }

  // ---------- Comparar: MAIS, MENOS ou IGUAIS ----------
  function mecComparar(fase) {
    let resp = null;
    let alinhado = false;
    const ESTRELA = { chave: 'estrela', tipo: 'estrela', fixo: true };

    function estrela() {
      const e = h('div', 'peca estrela', '⭐');
      itemArrastavel(e, ESTRELA, () => { estado.selecionado = ESTRELA; });
      return e;
    }

    function cesta(lado) {
      const g = fase[lado];
      const outro = fase[lado === 'a' ? 'b' : 'a'];
      const z = h('div', 'cesta-comparar' + (resp === lado ? ' escolhida' : ''));
      z.appendChild(h('div', 'rotulo', lado === 'a' ? '🧺 Cesta A' : '🧺 Cesta B'));
      const frutas = h('div', 'frutas' + (alinhado ? ' alinhadas' : ''));
      for (let i = 0; i < g.n; i++) {
        const f = h('div', 'fruta item-cesta', g.fruta);
        if (!alinhado) espalhar(f, i, lado === 'a' ? 3 : 7);
        else if (i >= outro.n) f.classList.add('sobra');
        frutas.appendChild(f);
      }
      z.appendChild(frutas);
      if (resp === lado) z.appendChild(estrela());
      zonaAtiva(z, (d) => d.tipo === 'estrela', () => { resp = lado; atualizar(); });
      return z;
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-comparar');
      const base = h('div', 'base-estrela');
      base.appendChild(h('span', 'rotulo', resp ? 'Mudou de ideia? Arraste a estrela de novo.' : 'Arraste a estrela ⭐ (ou clique na cesta):'));
      if (!resp) base.appendChild(estrela());
      mesa.appendChild(base);
      const cestas = h('div', 'cestas');
      cestas.appendChild(cesta('a'));
      cestas.appendChild(cesta('b'));
      const igual = h('div', 'zona-igual' + (resp === 'igual' ? ' escolhida' : ''), '<span class="sinal">=</span><span>IGUAIS</span>');
      if (resp === 'igual') igual.appendChild(estrela());
      zonaAtiva(igual, (d) => d.tipo === 'estrela', () => { resp = 'igual'; atualizar(); });
      const grade = h('div', 'grade-comparar');
      grade.appendChild(cestas);
      grade.appendChild(igual);
      mesa.appendChild(grade);
      area.appendChild(mesa);
    }

    async function dica(res, tentativa) {
      alinhado = true;
      atualizar();
      mensagem('🔍 Colocamos as frutas em fila, uma ao lado da outra. Vamos contar!', 'dica');
      const area = $('#area');
      await contar(area.querySelectorAll('.cesta-comparar:nth-child(1) .item-cesta'));
      await contar(area.querySelectorAll('.cesta-comparar:nth-child(2) .item-cesta'));
      const { a, b } = fase;
      let txt;
      if (a.n === b.n) {
        txt = 'Cada fruta tem uma parceira na outra cesta. Não sobra nenhuma!';
        if (tentativa >= 2) txt += ' Então as cestas têm a <b>mesma quantidade</b>: use o <b>= IGUAIS</b>.';
      } else {
        txt = `As frutas que <b>sobram</b> estão brilhando. A cesta com sobra tem <b>MAIS</b>; a outra tem <b>MENOS</b>.`;
      }
      mensagem((res.vazio ? 'Coloque a estrela ⭐ numa cesta ou no IGUAIS. ' : '') + txt, 'dica');
    }

    function desenho() {
      const p = fase.pergunta === 'mais'
        ? '<span class="seta-p">⬆️</span><b>MAIS</b>'
        : '<span class="seta-p">⬇️</span><b>MENOS</b>';
      return `${p}<span class="sinal-p">ou</span><b>= IGUAIS</b>`;
    }
    function resumo() {
      const { a, b } = fase;
      const s = a.n === b.n ? '=' : a.n > b.n ? '>' : '<';
      return `<span class="conta">${a.n} ${a.fruta} ${s} ${b.n} ${b.fruta}</span>`;
    }
    return { render, resposta: () => resp, dica, resumo, desenho, inicio: () => { estado.selecionado = ESTRELA; } };
  }

  // ---------- Sequência: completar a fila de caixotes ----------
  function mecSequencia(fase) {
    const valores = fase.lacunas.map((i) => fase.itens[i]);
    const fichas = criarFichas(Regras.embaralhar(valores.concat(fase.extras), fase.itens[0] + 3), fase.lacunas.length, false);
    const passo = fase.itens[1] - fase.itens[0];
    let conferir = null;

    function render(area) {
      const mesa = h('div', 'mesa mesa-sequencia');
      const fila = h('div', 'fila-caixotes' + (conferir ? ' com-saltos' : ''));
      fase.itens.forEach((n, i) => {
        if (i > 0) fila.appendChild(h('div', 'salto', `+${passo}`));
        const li = fase.lacunas.indexOf(i);
        if (li < 0) {
          fila.appendChild(h('div', 'caixote', `<span>${n}</span>`));
        } else {
          let classe = 'caixote vazio-caixote';
          if (conferir && fichas.slots[li] !== null) classe += conferir.includes(li) ? ' conferir' : ' certo';
          const c = h('div', classe);
          c.appendChild(desenharSlot(fichas, li, 's'));
          fila.appendChild(c);
        }
      });
      mesa.appendChild(fila);
      mesa.appendChild(h('p', 'ajudinha', 'Arraste os números para os caixotes vazios.'));
      mesa.appendChild(desenharBanco(fichas, 's'));
      area.appendChild(mesa);
    }

    async function dica(res) {
      conferir = res.erradas;
      atualizar();
      await contar($('#area').querySelectorAll('.salto'));
      const a = fase.itens[0];
      let txt = `Os números andam de <b>${passo} em ${passo}</b>: ${a} ➜ ${a + passo} ➜ ${a + 2 * passo}…`;
      if (res.vazias) txt += ' Ainda tem caixote vazio.';
      else txt += ' Olhe os caixotes que estão piscando.';
      mensagem(txt, 'dica');
    }

    return {
      render, dica,
      resposta: () => fichas.slots.slice(),
      mudou: () => { conferir = null; },
      desenho: () => `<span class="caixote-p">${fase.itens[0]}</span><span class="sinal-p">➜</span><span class="caixote-p">${fase.itens[1]}</span><span class="sinal-p">➜</span><span class="caixote-p">?</span>`,
      resumo: () => `<span class="conta">${fase.itens.join(', ')}</span>`,
    };
  }

  // ---------- Valor: centenas, dezenas e unidades ----------
  function mecValor(fase) {
    const fichas = criarFichas([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3, true);
    const total = fase.c * 100 + fase.d * 10 + fase.u;
    const colunas = [
      { u: 'engradado', n: fase.c, nome: 'CENTENAS', classe: 'col-c' },
      { u: 'caixa', n: fase.d, nome: 'DEZENAS', classe: 'col-d' },
      { u: 'solta', n: fase.u, nome: 'UNIDADES', classe: 'col-u' },
    ];
    let conferir = null;

    function render(area) {
      const mesa = h('div', 'mesa mesa-valor');
      const estoque = h('div', 'estoque-valor');
      colunas.forEach((c) => {
        const col = h('div', 'coluna-valor ' + c.classe);
        for (let i = 0; i < c.n; i++) col.appendChild(desenharUnidade(c.u, fase.fruta));
        if (!c.n) col.appendChild(h('div', 'nenhum', 'nenhum'));
        estoque.appendChild(col);
      });
      mesa.appendChild(estoque);
      const tabela = h('div', 'tabela-valor');
      colunas.forEach((c, i) => {
        const cel = h('div', 'celula-valor ' + c.classe);
        cel.appendChild(h('div', 'cabeca', `${c.nome}<small>${c.u === 'engradado' ? '🧺 100' : c.u === 'caixa' ? '📦 10' : fase.fruta + ' 1'}</small>`));
        let classeSlot = 'slot-grande';
        if (conferir && fichas.slots[i] !== null) classeSlot += conferir.includes(i) ? ' conferir' : ' certo';
        cel.appendChild(desenharSlot(fichas, i, 'v', classeSlot));
        tabela.appendChild(cel);
      });
      mesa.appendChild(tabela);
      mesa.appendChild(h('p', 'ajudinha', 'Arraste os algarismos para a tabela. Pode usar o mesmo algarismo mais de uma vez.'));
      mesa.appendChild(desenharBanco(fichas, 'v'));
      area.appendChild(mesa);
    }

    async function dica(res) {
      conferir = res.erradas;
      atualizar();
      mensagem('🔍 Vamos contar cada parte separada!', 'dica');
      const area = $('#area');
      for (const c of colunas) await contar(area.querySelectorAll(`.estoque-valor .${c.classe} .peca`));
      let txt = 'Engradados vão nas <b>CENTENAS</b>, caixas nas <b>DEZENAS</b> e soltas nas <b>UNIDADES</b>.';
      if (colunas.some((c) => c.n === 0)) txt += ' Quando não tem nenhum, usamos o <b>0</b>.';
      mensagem(txt, 'dica');
    }

    return {
      render, dica,
      resposta: () => fichas.slots.slice(),
      mudou: () => { conferir = null; },
      desenho: () => '<b class="dig-c">C</b><b class="dig-d">D</b><b class="dig-u">U</b><span class="sinal-p">=</span><span class="num-grande">?</span>',
      resumo: () => `<span class="conta">${numeroColorido(total)}</span><span class="detalhe">${fase.c} centenas, ${fase.d} dezena${fase.d === 1 ? '' : 's'} e ${fase.u} unidade${fase.u === 1 ? '' : 's'}</span>`,
    };
  }

  // ---------- Par ou ímpar ----------
  function mecParImpar(fase) {
    const lugar = fase.numeros.map(() => null);
    let conferir = null;

    function bolinhas(n) {
      const base = n > 20 ? n % 10 : n;
      let html = '<span class="duplas">';
      for (let i = 0; i < base; i += 2) html += i + 1 < base ? '<i>●●</i>' : '<i class="sobra-uma">●</i>';
      return html + '</span>' + (n > 20 ? `<small>olhe o ${base}</small>` : '');
    }

    function cartao(i) {
      const n = fase.numeros[i];
      let classe = 'ficha ficha-numero';
      if (conferir) classe += conferir.includes(i) ? ' conferir' : ' certo';
      const c = h('div', classe, `<span>${n > 20 && conferir ? `${Math.floor(n / 10)}<u>${n % 10}</u>` : n}</span>`);
      if (conferir && conferir.includes(i)) c.insertAdjacentHTML('beforeend', bolinhas(n));
      const dados = { chave: 'pi-' + i, tipo: 'numero', i };
      itemArrastavel(c, dados, lugar[i] ? () => { lugar[i] = null; atualizar(); } : null);
      return c;
    }

    function caixa(tipo) {
      const titulo = tipo === 'par'
        ? '<b>PAR</b><span class="duplas"><i>●●</i><i>●●</i></span><small>forma duplas</small>'
        : '<b>ÍMPAR</b><span class="duplas"><i>●●</i><i class="sobra-uma">●</i></span><small>sobra 1</small>';
      const z = h('div', 'caixa-par caixa-' + tipo);
      z.appendChild(h('div', 'titulo-par', titulo));
      const dentro = h('div', 'dentro');
      lugar.forEach((l, i) => { if (l === tipo) dentro.appendChild(cartao(i)); });
      z.appendChild(dentro);
      zonaAtiva(z, (d) => d.tipo === 'numero' && lugar[d.i] !== tipo, (d) => { lugar[d.i] = tipo; atualizar(); });
      return z;
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-parimpar');
      const banco = h('div', 'banco');
      lugar.forEach((l, i) => { if (!l) banco.appendChild(cartao(i)); });
      if (!lugar.some((l) => !l)) banco.appendChild(h('span', 'ajudinha', 'Todos separados! Clique em ✅ Pronto!'));
      zonaAtiva(banco, (d) => d.tipo === 'numero' && lugar[d.i] !== null, (d) => { lugar[d.i] = null; atualizar(); });
      mesa.appendChild(banco);
      mesa.appendChild(h('p', 'ajudinha', 'Arraste cada número para PAR ou ÍMPAR (ou clique no número e depois na caixa).'));
      const caixas = h('div', 'caixas-par');
      caixas.appendChild(caixa('par'));
      caixas.appendChild(caixa('impar'));
      mesa.appendChild(caixas);
      area.appendChild(mesa);
    }

    async function dica(res) {
      conferir = res.erradas;
      atualizar();
      await contar($('#area').querySelectorAll('.ficha-numero.conferir'));
      let txt = 'Veja as bolinhas: se todas formam <b>duplas</b>, é <b>PAR</b>. Se <b>sobra uma</b>, é <b>ÍMPAR</b>.';
      if (fase.numeros.some((n) => n > 20)) txt += ' Nos números grandes, basta olhar a <b>unidade</b> (o último algarismo).';
      if (res.vazias) txt += ' Ainda tem número para separar.';
      mensagem(txt, 'dica');
    }

    return {
      render, dica,
      resposta: () => lugar.slice(),
      mudou: () => { conferir = null; },
      desenho: () => '<b>PAR</b><span class="duplas"><i>●●</i><i>●●</i></span><span class="sinal-p">ou</span><b>ÍMPAR</b><span class="duplas"><i>●●</i><i class="sobra-uma">●</i></span>',
      resumo: () => {
        const pares = fase.numeros.filter(Regras.ehPar).join(', ');
        const impares = fase.numeros.filter((n) => !Regras.ehPar(n)).join(', ');
        return `<span class="detalhe"><b>PAR:</b> ${pares}<br><b>ÍMPAR:</b> ${impares}</span>`;
      },
    };
  }

  // ---------- Dinheiro: pagar ou dar troco ----------
  function mecDinheiro(fase) {
    let bandeja = [];
    const preco = Regras.totalProdutos(fase);
    const alvo = Regras.respostaCerta(fase);
    const troco = Boolean(fase.pago);

    function adicionar(v) {
      if (bandeja.length >= 30) return;
      bandeja.push(v);
      bandeja.sort((x, y) => y - x);
      atualizar();
    }
    function remover(i) {
      bandeja.splice(i, 1);
      atualizar();
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-dinheiro');
      const caixa = h('div', 'banca caixa-registradora');
      caixa.appendChild(h('div', 'rotulo', '💰 Caixa do robô'));
      const gaveta = h('div', 'gaveta');
      fase.caixa.slice().sort((x, y) => y - x).forEach((v) => {
        const p = desenharDinheiro(v);
        itemArrastavel(p, { chave: 'din-' + v, tipo: 'novo', valor: v }, () => { adicionar(v); som('soltar'); });
        gaveta.appendChild(p);
      });
      caixa.appendChild(gaveta);
      caixa.appendChild(h('p', 'ajudinha', 'Arraste ou clique no dinheiro. Para tirar, clique nele na bandeja.'));
      zonaAtiva(caixa, (d) => d.tipo === 'naBandeja', (d) => remover(d.i));

      const z = h('div', 'bandeja');
      z.appendChild(h('div', 'rotulo', troco ? '🪙 Troco para o cliente' : '🪙 Pagamento'));
      const dentro = h('div', 'dentro');
      bandeja.forEach((v, i) => {
        const p = desenharDinheiro(v);
        p.classList.add('na-bandeja');
        itemArrastavel(p, { chave: 'band-' + i, tipo: 'naBandeja', i }, () => remover(i));
        dentro.appendChild(p);
      });
      if (!bandeja.length) dentro.appendChild(h('div', 'vazio', '⬇ Solte aqui'));
      z.appendChild(dentro);
      zonaAtiva(z, (d) => d.tipo === 'novo', (d) => adicionar(d.valor));

      mesa.appendChild(caixa);
      mesa.appendChild(z);
      area.appendChild(mesa);
    }

    async function dica(res, tentativa) {
      const pecas = $('#area').querySelectorAll('.na-bandeja');
      let soma = 0;
      const rotulos = bandeja.map((v) => Regras.dinheiro((soma += v)).replace(',00', ''));
      if (pecas.length) {
        mensagem('🔍 Vamos somar o dinheiro juntos!', 'dica');
        await contar(pecas, rotulos);
      }
      let txt = `Na bandeja tem <b class="num">${Regras.dinheiro(res.total)}</b>. `;
      if (troco) {
        txt += `Para achar o troco, conte do preço <b class="num">${Regras.dinheiro(preco)}</b> até o valor pago <b class="num">${Regras.dinheiro(fase.pago)}</b>.`;
      } else {
        txt += `O preço é <b class="num">${Regras.dinheiro(preco)}</b>.`;
      }
      if (tentativa >= 2) {
        const dif = Math.abs(alvo - res.total);
        txt += res.total < alvo ? ` ➕ Falta <b class="num">${Regras.dinheiro(dif)}</b>.` : ` ➖ Passou <b class="num">${Regras.dinheiro(dif)}</b>: tire um pouco.`;
      }
      mensagem(txt, 'dica');
    }

    function desenho() {
      let html = fase.produtos.map((p) => `<span class="produto"><span class="fruta-pedido">${p.emoji}</span><span class="preco">${Regras.dinheiro(p.preco)}</span></span>`).join('<span class="sinal-p">+</span>');
      if (troco) {
        html += `<span class="sinal-p">pagou</span>${desenharDinheiro(fase.pago).outerHTML}<span class="sinal-p">troco =</span><span class="num-grande">?</span>`;
      }
      return html;
    }
    function resumo() {
      if (!troco) return `<span class="conta">${Regras.dinheiro(preco)}</span>`;
      const compra = fase.produtos.length > 1 ? `${fase.produtos.map((p) => Regras.dinheiro(p.preco)).join(' + ')} = ${Regras.dinheiro(preco)}<br>` : '';
      return `<span class="detalhe">${compra}${Regras.dinheiro(fase.pago)} − ${Regras.dinheiro(preco)} = <b>${Regras.dinheiro(alvo)}</b></span>`;
    }
    return { render, resposta: () => bandeja.slice(), dica, resumo, desenho };
  }

  // ---------- Grupos iguais (ideia de multiplicação) ----------
  function mecGrupos(fase) {
    const cestas = Array(fase.cestas).fill(0);
    const fichas = criarFichas(fase.opcoes, 1, false);
    const total = fase.cestas * fase.porCesta;
    const NOVA = { chave: 'fruta-nova', tipo: 'novo', fixo: true };
    let conferir = null;

    function render(area) {
      const mesa = h('div', 'mesa mesa-grupos');
      const topo = h('div', 'banca banca-grupos');
      topo.appendChild(h('div', 'rotulo', '🏪 Barraca'));
      const f = h('div', 'peca fruta', fase.fruta);
      itemArrastavel(f, NOVA, () => selecionar(NOVA));
      topo.appendChild(f);
      topo.appendChild(h('p', 'ajudinha', estado.selecionado === NOVA
        ? 'Agora clique nas cestas para colocar. Para tirar, arraste a fruta de volta para a barraca (ou clique de novo na fruta da barraca).'
        : 'Arraste a fruta para as cestas. Ou clique na fruta e depois clique nas cestas. Para tirar, clique na fruta da cesta.'));
      zonaAtiva(topo, (d) => d.tipo === 'naCesta', (d) => { cestas[d.c]--; atualizar(); });
      mesa.appendChild(topo);

      const linha = h('div', 'linha-cestas');
      cestas.forEach((n, c) => {
        let classe = 'cesta-grupo cesta-mult';
        if (conferir) classe += conferir.includes(c) ? ' conferir' : ' certo';
        const z = h('div', classe);
        z.appendChild(h('div', 'rotulo', `🧺 Cesta ${c + 1}`));
        const dentro = h('div', 'dentro');
        for (let i = 0; i < n; i++) {
          const p = h('div', 'peca fruta na-cesta', fase.fruta);
          itemArrastavel(p, { chave: `c${c}-${i}`, tipo: 'naCesta', c }, () => {
            // Com a fruta da barraca escolhida, clicar na cesta (mesmo em cima de uma fruta) coloca mais uma.
            if (estado.selecionado === NOVA) cestas[c]++; else cestas[c]--;
            atualizar();
          });
          dentro.appendChild(p);
        }
        z.appendChild(dentro);
        zonaAtiva(z, (d) => (d.tipo === 'novo' && cestas[c] < fase.porCesta + 6) || (d.tipo === 'naCesta' && d.c !== c), (d) => {
          if (d.tipo === 'naCesta') cestas[d.c]--;
          cestas[c]++;
          atualizar();
        });
        linha.appendChild(z);
      });
      mesa.appendChild(linha);

      const resposta = h('div', 'linha-resposta');
      resposta.appendChild(h('span', 'pergunta', `Quantas frutas ao todo? ${fase.fruta}`));
      resposta.appendChild(desenharSlot(fichas, 0, 'g', 'slot-grande'));
      resposta.appendChild(desenharBanco(fichas, 'g'));
      mesa.appendChild(resposta);
      area.appendChild(mesa);
    }

    async function dica(res) {
      conferir = res.cestasErradas;
      atualizar();
      const area = $('#area');
      if (res.cestasErradas.length) {
        mensagem('🔍 Vamos contar cada cesta!', 'dica');
        for (const cesta of area.querySelectorAll('.cesta-mult')) await contar(cesta.querySelectorAll('.na-cesta'));
        mensagem(`Cada cesta precisa ter <b class="num">${fase.porCesta}</b> ${fase.fruta}. Arrume as cestas que estão piscando.`, 'dica');
        return;
      }
      mensagem(`🔍 Todas as cestas estão certas! Vamos contar de ${fase.porCesta} em ${fase.porCesta}.`, 'dica');
      const rotulos = cestas.map((_, i) => (i + 1) * fase.porCesta);
      await contar(area.querySelectorAll('.cesta-mult'), rotulos);
      mensagem(`${fase.cestas} cestas com ${fase.porCesta} em cada: conte de <b>${fase.porCesta} em ${fase.porCesta}</b>. O último número é o total. ${res.semTotal ? 'Arraste o cartão para o <b>?</b>.' : ''}`, 'dica');
    }

    function desenho() {
      const cesta = `<span class="mini-cesta">🧺<small>${fase.fruta.repeat(fase.porCesta)}</small></span>`;
      return cesta.repeat(fase.cestas);
    }
    return {
      render, dica, desenho,
      resposta: () => ({ cestas: cestas.slice(), total: fichas.slots[0] }),
      mudou: () => { conferir = null; },
      resumo: () => `<span class="conta">${fase.cestas} × ${fase.porCesta} = ${total}</span><span class="detalhe">${Array(fase.cestas).fill(fase.porCesta).join(' + ')} = ${total}</span>`,
    };
  }

  const MECANICAS = {
    sacola: mecSacola, quantos: mecQuantos, comparar: mecComparar, sequencia: mecSequencia,
    valor: mecValor, parimpar: mecParImpar, dinheiro: mecDinheiro, grupos: mecGrupos,
  };

  // =====================================================================
  // Telas
  // =====================================================================
  function mostrarTela(nome) {
    document.querySelectorAll('.tela').forEach((t) => t.classList.remove('ativa'));
    $('#tela-' + nome).classList.add('ativa');
    document.body.classList.toggle('caixa-alta', nome !== 'inicio' && Boolean(ANOS[estado.ano].caixaAlta));
    if (nome === 'inicio') montarInicio();
    if (nome === 'fases') abrirFases(estado.ano);
    window.scrollTo(0, 0);
  }

  function montarInicio() {
    const lista = $('#lista-anos');
    lista.innerHTML = '';
    Object.keys(ANOS).forEach((ano) => {
      const cfg = ANOS[ano];
      const total = cfg.fases.length * 3;
      const ganhas = (estado.progresso[ano] || []).reduce((a, b) => a + (b || 0), 0);
      const botao = h('button', 'cartao-ano');
      botao.style.setProperty('--cor', cfg.cor);
      botao.innerHTML =
        `<div class="num">${cfg.titulo}</div>` +
        `<div class="sub">${cfg.subtitulo}</div>` +
        `<div class="icones">${cfg.fases.slice(0, 5).map((f) => f.icone).join(' ')}</div>` +
        `<p>${cfg.descricao}</p>` +
        `<div class="progresso">⭐ ${ganhas} de ${total} estrelas</div>`;
      botao.addEventListener('click', () => { estado.ano = Number(ano); mostrarTela('fases'); });
      lista.appendChild(botao);
    });
    atualizarBotaoSom();
    $('#btn-liberar').textContent = estado.liberado ? '🔒 Liberar fases uma a uma' : '🔓 Liberar todas as fases';
  }

  function abrirFases(ano) {
    const cfg = ANOS[ano];
    document.documentElement.style.setProperty('--cor-ano', cfg.cor);
    $('#titulo-fases').textContent = `${cfg.titulo} · ${cfg.subtitulo}`;
    $('#descricao-fases').textContent = cfg.descricao;
    const lista = $('#lista-fases');
    lista.innerHTML = '';
    cfg.fases.forEach((fase, i) => {
      const b = h('button', 'botao-fase');
      const est = estrelasDe(ano, i);
      const aberta = liberada(ano, i);
      b.disabled = !aberta;
      b.innerHTML =
        `<span class="n">Fase ${i + 1}</span>` +
        `<span class="fig">${aberta ? fase.icone : '🔒'}</span>` +
        `<span class="est">${'⭐'.repeat(est)}${'<span class="apagada">⭐</span>'.repeat(3 - est)}</span>`;
      b.setAttribute('aria-label', `Fase ${i + 1}${aberta ? '' : ' (bloqueada)'}, ${est} estrelas`);
      b.addEventListener('click', () => abrirFase(i));
      lista.appendChild(b);
    });
  }

  function abrirFase(indice) {
    const cfg = ANOS[estado.ano];
    const fase = cfg.fases[indice];
    estado.indice = indice;
    estado.fase = fase;
    estado.tentativas = 0;
    estado.ocupado = false;
    estado.selecionado = null;
    estado.mec = MECANICAS[fase.tipo](fase);
    if (estado.mec.inicio) estado.mec.inicio();
    $('#titulo-jogo').textContent = `${cfg.titulo} · Fase ${indice + 1} de ${cfg.fases.length}`;
    $('#cliente').textContent = fase.cliente;
    $('#pedido-texto').innerHTML = fase.pedido.replace(/(R\$ ?\d+,\d{2}|\d+)/g, '<b class="num">$1</b>');
    $('#pedido-desenho').innerHTML = estado.mec.desenho();
    $('#robo').className = 'robo';
    mensagem('');
    $('#modal-vitoria').hidden = true;
    mostrarTela('jogo');
    document.documentElement.style.setProperty('--cor-ano', cfg.cor);
    atualizar();
    atualizarBotoes();
  }

  function atualizarBotoes() {
    $('#btn-pronto').disabled = estado.ocupado;
    $('#btn-limpar').disabled = estado.ocupado;
    document.body.classList.toggle('ocupado', estado.ocupado);
  }

  async function pronto() {
    if (estado.ocupado || !estado.mec) return;
    estado.selecionado = estado.selecionado && estado.selecionado.fixo ? estado.selecionado : null;
    const res = Regras.verificar(estado.fase, estado.mec.resposta());
    estado.tentativas++;
    if (res.ok) { vencer(); return; }
    estado.ocupado = true;
    atualizarBotoes();
    som('dica');
    const robo = $('#robo');
    robo.className = 'robo pensando';
    try {
      await estado.mec.dica(res, estado.tentativas);
    } finally {
      estado.ocupado = false;
      robo.className = 'robo';
      atualizarBotoes();
    }
  }

  function vencer() {
    const est = Regras.estrelas(estado.tentativas);
    const lista = estado.progresso[estado.ano] || [];
    lista[estado.indice] = Math.max(lista[estado.indice] || 0, est);
    estado.progresso[estado.ano] = lista;
    salvar(CHAVE_PROGRESSO, estado.progresso);

    som('acerto');
    $('#robo').className = 'robo festa';
    mensagem('🎉 Acertou!', 'ok');
    const caixa = $('#vitoria-estrelas');
    caixa.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const s = h('span', i < est ? 'estrela-ganha' : 'apagada', '⭐');
      s.style.animationDelay = `${0.2 + i * 0.25}s`;
      caixa.appendChild(s);
    }
    $('#vitoria-resumo').innerHTML = estado.mec.resumo();
    const cfg = ANOS[estado.ano];
    const ultima = estado.indice === cfg.fases.length - 1;
    $('#btn-proxima').textContent = ultima ? '🏆 Ver as fases' : 'Próxima fase ➜';
    setTimeout(() => {
      $('#modal-vitoria').hidden = false;
      soltarConfete();
      $('#btn-proxima').focus();
    }, animacoesReduzidas ? 0 : 500);
  }

  function soltarConfete() {
    const caixa = $('#confete');
    caixa.innerHTML = '';
    if (animacoesReduzidas) return;
    const itens = ['🍎', '🍊', '🍌', '⭐', '🍓', '🍇', '🥕', '🎉'];
    for (let i = 0; i < 22; i++) {
      const s = h('span', '', itens[i % itens.length]);
      s.style.left = `${(i * 37) % 100}%`;
      s.style.animationDelay = `${(i % 7) * 0.12}s`;
      caixa.appendChild(s);
    }
  }

  // ---------- Botões ----------
  document.querySelectorAll('[data-ir]').forEach((b) => {
    b.addEventListener('click', () => {
      if (estado.ocupado) return;
      estado.mec = null;
      mostrarTela(b.dataset.ir);
    });
  });
  $('#btn-pronto').addEventListener('click', pronto);
  $('#btn-limpar').addEventListener('click', () => { if (!estado.ocupado) abrirFase(estado.indice); });
  $('#btn-repetir-fase').addEventListener('click', () => abrirFase(estado.indice));
  $('#btn-proxima').addEventListener('click', () => {
    $('#modal-vitoria').hidden = true;
    if (estado.indice < ANOS[estado.ano].fases.length - 1) abrirFase(estado.indice + 1);
    else mostrarTela('fases');
  });
  $('#btn-som').addEventListener('click', () => {
    estado.som = !estado.som;
    salvar(CHAVE_SOM, estado.som);
    atualizarBotaoSom();
    som('soltar');
  });
  $('#btn-ouvir').addEventListener('click', () => falar(estado.fase ? estado.fase.pedido : ''));
  $('#btn-como-jogar').addEventListener('click', () => { $('#modal-ajuda').hidden = false; });
  $('#btn-fechar-ajuda').addEventListener('click', () => { $('#modal-ajuda').hidden = true; });
  $('#btn-liberar').addEventListener('click', () => {
    estado.liberado = !estado.liberado;
    salvar(CHAVE_LIBERADO, estado.liberado);
    montarInicio();
  });
  $('#btn-zerar').addEventListener('click', () => {
    if (!window.confirm('Apagar todas as estrelas deste computador?')) return;
    estado.progresso = {};
    salvar(CHAVE_PROGRESSO, estado.progresso);
    montarInicio();
  });

  // Qualquer mudança na área do jogo apaga as marcas de conferência antigas.
  $('#area').addEventListener('pointerup', () => {
    if (estado.mec && estado.mec.mudou && !estado.ocupado) estado.mec.mudou();
  }, true);

  montarInicio();
})();
