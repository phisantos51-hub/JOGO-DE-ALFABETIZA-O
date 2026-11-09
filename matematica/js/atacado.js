// Atacado do Robô: as mecânicas de multiplicação e divisão (só no 3º ano).
// Usa as mesmas peças, áreas de soltar, cartões, dicas e estrelas da Feira do Robô.
// O jogo (jogo.js) chama AtacadoMecanicas(ui) e recebe uma mecânica para cada tipo.
// As fases (pedidos e números) ficam em atacado-fases.js.
// eslint-disable-next-line no-unused-vars
function AtacadoMecanicas(ui) {
  const { h, $, estado, itemArrastavel, zonaAtiva, selecionar, atualizar, contar, mensagem } = ui;

  const RECIPIENTES = {
    cesta: { icone: '🧺', nome: 'Cesta', plural: 'cestas' },
    caixa: { icone: '📦', nome: 'Caixa', plural: 'caixas' },
    pacote: { icone: '🛍️', nome: 'Pacote', plural: 'pacotes' },
    prato: { icone: '🍽️', nome: 'Prato', plural: 'pratos' },
    cliente: { icone: '🙂', nome: 'Cliente', plural: 'clientes' },
  };
  const CLIENTES = ['👩', '👦', '👴', '👧', '🧑', '👵', '👨', '👩‍🦱', '🧒', '👱'];
  function rotuloGrupo(tipo, i) {
    const r = RECIPIENTES[tipo] || RECIPIENTES.cesta;
    return `${tipo === 'cliente' ? CLIENTES[i % CLIENTES.length] : r.icone} ${r.nome} ${i + 1}`;
  }

  // ---------- Escrita matemática ----------
  // Monta uma linha de conta: números grandes, sinais e espaços de resposta.
  function linhaConta(partes, classe) {
    const linha = h('div', 'conta-viva' + (classe ? ' ' + classe : ''));
    partes.forEach((p) => {
      if (p instanceof Element) linha.appendChild(p);
      else if (typeof p === 'number') linha.appendChild(h('span', 'termo', String(p)));
      else if (['+', '×', '÷', '=', '−'].includes(p)) linha.appendChild(h('span', 'op', p));
      else linha.appendChild(h('span', 'palavra', p));
    });
    return linha;
  }
  // "3 + 3 + 3 + 3" a partir de uma lista de números.
  function parcelas(lista) {
    const partes = [];
    lista.forEach((n, i) => { if (i) partes.push('+'); partes.push(n); });
    return partes;
  }

  // ---------- Respostas: cartões para arrastar ou número digitado ----------
  // fase.digitar = true → caixa com − e + (e dá para digitar); senão, cartões.
  function criarResposta(fase, n, id) {
    if (fase.digitar) {
      const valores = Array(n).fill(null);
      return {
        valores: () => valores.slice(),
        campo: (i, classe) => campoNumero(valores, i, classe),
        banco: () => null,
      };
    }
    const fichas = ui.criarFichas(fase.opcoes.slice().sort((a, b) => a - b), n, n > 1);
    return {
      valores: () => fichas.slots.slice(),
      campo: (i, classe) => ui.desenharSlot(fichas, i, id, 'slot-grande' + (classe ? ' ' + classe : '')),
      banco: () => ui.desenharBanco(fichas, id),
    };
  }

  // Número grande com botões − e +. Também aceita digitar (e Enter = Pronto!).
  function campoNumero(valores, i, classe) {
    const caixa = h('div', 'campo-numero' + (classe ? ' ' + classe : ''));
    const menos = h('button', 'btn-campo', '−');
    const mais = h('button', 'btn-campo', '+');
    menos.type = 'button';
    mais.type = 'button';
    menos.setAttribute('aria-label', 'Diminuir 1');
    mais.setAttribute('aria-label', 'Aumentar 1');
    const entrada = document.createElement('input');
    entrada.type = 'text';
    entrada.inputMode = 'numeric';
    entrada.autocomplete = 'off';
    entrada.maxLength = 3;
    entrada.placeholder = '?';
    entrada.setAttribute('aria-label', 'Resposta');
    entrada.value = valores[i] === null ? '' : String(valores[i]);
    function mudar(v) {
      valores[i] = v;
      entrada.value = v === null ? '' : String(v);
      caixa.classList.remove('conferir', 'certo');
    }
    entrada.addEventListener('input', () => {
      const d = entrada.value.replace(/\D/g, '').slice(0, 3);
      mudar(d === '' ? null : Number(d));
    });
    entrada.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); $('#btn-pronto').click(); }
    });
    menos.addEventListener('click', () => {
      if (estado.ocupado) return;
      mudar(valores[i] === null ? 0 : Math.max(0, valores[i] - 1));
      ui.som('tirar');
    });
    mais.addEventListener('click', () => {
      if (estado.ocupado) return;
      mudar(valores[i] === null ? 1 : Math.min(999, valores[i] + 1));
      ui.som('soltar');
    });
    caixa.appendChild(menos);
    caixa.appendChild(entrada);
    caixa.appendChild(mais);
    return caixa;
  }
  const classeConferir = (lista, i) => (lista ? (lista.includes(i) ? 'conferir' : 'certo') : '');

  // ---------- Barraca com uma fruta para pegar (fonte sem fim) ----------
  function bancaFruta(fruta, sel, ajuda, devolver) {
    const topo = h('div', 'banca banca-grupos');
    topo.appendChild(h('div', 'rotulo', '🏪 Barraca'));
    const f = h('div', 'peca fruta', fruta);
    itemArrastavel(f, sel, () => selecionar(sel));
    topo.appendChild(f);
    topo.appendChild(h('p', 'ajudinha', ajuda(estado.selecionado === sel)));
    zonaAtiva(topo, (d) => d.tipo === 'noGrupo', devolver);
    return topo;
  }

  // Mini desenho de grupos para o balão do pedido e para as contas.
  function miniGrupos(nGrupos, porGrupo, fruta, icone) {
    let html = '';
    for (let g = 0; g < nGrupos; g++) html += `<span class="mini-grupo">${icone ? `<b>${icone}</b>` : ''}<small>${`<i>${fruta}</i>`.repeat(porGrupo)}</small></span>`;
    return html;
  }

  // =====================================================================
  // MONTAR: grupos iguais, dobro e triplo
  // =====================================================================
  function mecMontar(fase) {
    const grupos = Array(fase.grupos).fill(0);
    if (fase.modelo) grupos[0] = fase.porGrupo;
    const resp = criarResposta(fase, 1, 'mt');
    const NOVA = { chave: 'fruta-nova', tipo: 'novo', fixo: true };
    const total = fase.grupos * fase.porGrupo;
    const rec = RECIPIENTES[fase.recipiente] || RECIPIENTES.cesta;
    const fixo = (c) => Boolean(fase.modelo) && c === 0;
    let conferir = null;
    let conferirTotal = false;

    function render(area) {
      const mesa = h('div', 'mesa mesa-atacado');
      mesa.appendChild(bancaFruta(fase.fruta, NOVA, (sel) => (sel
        ? `Agora clique ${rec.plural === 'pratos' ? 'nos pratos' : `nas ${rec.plural}`} para colocar. Para tirar, arraste a fruta de volta para a barraca.`
        : `Arraste a fruta para ${rec.plural === 'pratos' ? 'os pratos' : `as ${rec.plural}`}. Ou clique na fruta e depois clique onde quer pôr. Para tirar, clique na fruta.`),
      (d) => { if (!fixo(d.c)) { grupos[d.c]--; atualizar(); } }));

      const linha = h('div', 'linha-cestas');
      linha.style.setProperty('--cestas', fase.grupos);
      grupos.forEach((n, c) => {
        const z = h('div', `cesta-grupo cesta-mult grupo-atacado rec-${fase.recipiente || 'cesta'} ${fixo(c) ? 'modelo' : ''} ${classeConferir(conferir, c)}`);
        z.appendChild(h('div', 'rotulo', fixo(c) ? `${rec.icone} ${fase.nome ? 'O que ele levou' : 'Pronto'}` : `${rec.icone} ${rec.nome} ${c + 1}`));
        const dentro = h('div', 'dentro');
        for (let i = 0; i < n; i++) {
          const p = h('div', 'peca fruta na-cesta', fase.fruta);
          if (!fixo(c)) {
            itemArrastavel(p, { chave: `g${c}-${i}`, tipo: 'noGrupo', c }, () => {
              if (estado.selecionado === NOVA) grupos[c]++; else grupos[c]--;
              ui.som(estado.selecionado === NOVA ? 'soltar' : 'tirar');
              atualizar();
            });
          }
          dentro.appendChild(p);
        }
        z.appendChild(dentro);
        z.appendChild(h('div', 'contador', String(n)));
        if (!fixo(c)) {
          zonaAtiva(z, (d) => (d.tipo === 'novo' && grupos[c] < fase.porGrupo + 6) || (d.tipo === 'noGrupo' && d.c !== c), (d) => {
            if (d.tipo === 'noGrupo') grupos[d.c]--;
            grupos[c]++;
            atualizar();
          });
        }
        linha.appendChild(z);
      });
      mesa.appendChild(linha);

      const contas = h('div', 'quadro-contas');
      contas.appendChild(linhaConta(parcelas(grupos).concat(['=', grupos.reduce((a, b) => a + b, 0)]), 'soma'));
      const inicio = fase.nome ? [`O ${fase.nome} de`, fase.porGrupo, '='] : [];
      contas.appendChild(linhaConta(inicio.concat([fase.grupos, '×', fase.porGrupo, '=', resp.campo(0, conferirTotal ? 'conferir' : '')])));
      mesa.appendChild(contas);
      const banco = resp.banco();
      if (banco) mesa.appendChild(banco);
      area.appendChild(mesa);
    }

    async function dica(res, tentativa) {
      conferir = fase.digitar ? null : res.gruposErrados;
      conferirTotal = !res.totalOk;
      atualizar();
      const area = $('#area');
      if (!fase.digitar && res.gruposErrados.length) {
        mensagem(`🔍 Vamos contar ${rec.plural === 'pratos' ? 'cada prato' : `cada ${rec.nome.toLowerCase()}`}!`, 'dica');
        for (const g of area.querySelectorAll('.grupo-atacado')) await contar(g.querySelectorAll('.na-cesta'));
        mensagem(`Cada ${rec.nome.toLowerCase()} precisa ter <b class="num">${fase.porGrupo}</b> ${fase.fruta}. Arrume ${rec.plural === 'pratos' ? 'os que estão piscando' : 'as que estão piscando'}.`, 'dica');
        return;
      }
      mensagem(`🔍 Vamos contar de <b>${fase.porGrupo} em ${fase.porGrupo}</b>!`, 'dica');
      await contar(area.querySelectorAll('.grupo-atacado'), grupos.map((_, i) => (i + 1) * fase.porGrupo));
      let txt = `${fase.grupos} ${rec.plural} com ${fase.porGrupo} em cada: ${Array(fase.grupos).fill(fase.porGrupo).join(' + ')}. O último número que contamos é o total.`;
      if (fase.nome) txt = `O ${fase.nome} é ${fase.grupos === 2 ? '2 vezes' : '3 vezes'} a mesma quantidade. ` + txt;
      if (res.semTotal) txt += ' Coloque o total no <b>?</b>.';
      mensagem(txt, 'dica');
    }

    return {
      render, dica,
      resposta: () => ({ grupos: grupos.slice(), total: resp.valores()[0] }),
      mudou: () => { conferir = null; },
      desenho: () => (fase.nome
        ? `<span class="fruta-pedido">${fase.fruta.repeat(Math.min(fase.porGrupo, 6))}</span><span class="sinal-p">${fase.nome} =</span><span class="num-grande">?</span>`
        : miniGrupos(fase.grupos, fase.porGrupo, fase.fruta, rec.icone)),
      resumo: () => `<span class="conta">${fase.grupos} × ${fase.porGrupo} = ${total}</span><span class="detalhe">${fase.nome ? `O ${fase.nome} de ${fase.porGrupo} é ${total}.<br>` : ''}${Array(fase.grupos).fill(fase.porGrupo).join(' + ')} = ${total}</span>`,
    };
  }

  // =====================================================================
  // PARCELAS: 3 + 3 + 3 + 3 é o mesmo que 4 × 3
  // =====================================================================
  function mecParcelas(fase) {
    const resp = criarResposta(fase, 4, 'pc');
    const rec = RECIPIENTES[fase.recipiente] || RECIPIENTES.pacote;
    const total = fase.grupos * fase.porGrupo;
    let conferir = null;

    function render(area) {
      const mesa = h('div', 'mesa mesa-atacado');
      const linha = h('div', 'linha-cestas');
      linha.style.setProperty('--cestas', fase.grupos);
      for (let c = 0; c < fase.grupos; c++) {
        const z = h('div', `cesta-grupo cesta-mult grupo-atacado rec-${fase.recipiente}`);
        z.appendChild(h('div', 'rotulo', `${rec.icone} ${rec.nome} ${c + 1}`));
        const dentro = h('div', 'dentro');
        for (let i = 0; i < fase.porGrupo; i++) dentro.appendChild(h('div', 'peca fruta na-cesta', fase.fruta));
        z.appendChild(dentro);
        z.appendChild(h('div', 'contador', String(fase.porGrupo)));
        linha.appendChild(z);
      }
      mesa.appendChild(linha);
      const contas = h('div', 'quadro-contas');
      contas.appendChild(linhaConta(parcelas(Array(fase.grupos).fill(fase.porGrupo)).concat(['=', resp.campo(0, classeConferir(conferir, 0))]), 'soma'));
      const mult = linhaConta([resp.campo(1, classeConferir(conferir, 1)), '×', resp.campo(2, classeConferir(conferir, 2)), '=', resp.campo(3, classeConferir(conferir, 3))]);
      contas.appendChild(mult);
      contas.appendChild(h('p', 'legenda-conta', `<span>quantos ${rec.plural}</span><span>×</span><span>quantas em cada</span><span>=</span><span>total</span>`));
      mesa.appendChild(contas);
      mesa.appendChild(h('p', 'ajudinha', 'Arraste os números para os espaços com <b>?</b>. Pode usar o mesmo número mais de uma vez.'));
      const banco = resp.banco();
      if (banco) mesa.appendChild(banco);
      area.appendChild(mesa);
    }

    async function dica(res, tentativa) {
      conferir = res.erradas;
      atualizar();
      const area = $('#area');
      mensagem(`🔍 Primeiro, vamos contar os ${rec.plural}.`, 'dica');
      await contar(area.querySelectorAll('.grupo-atacado'));
      mensagem(`Agora vamos somar: de <b>${fase.porGrupo} em ${fase.porGrupo}</b>.`, 'dica');
      for (const el of area.querySelectorAll('.contado')) {
        el.classList.remove('contado');
        const selo = el.querySelector('.selo');
        if (selo) selo.remove();
      }
      await contar(area.querySelectorAll('.grupo-atacado'), Array.from({ length: fase.grupos }, (_, i) => (i + 1) * fase.porGrupo));
      let txt = `São <b class="num">${fase.grupos}</b> ${rec.plural} com <b class="num">${fase.porGrupo}</b> em cada. Somar o ${fase.porGrupo} ${fase.grupos} vezes é o mesmo que <b>${fase.grupos} × ${fase.porGrupo}</b>.`;
      if (res.vazias) txt += ' Ainda tem espaço com <b>?</b>.';
      mensagem(txt, 'dica');
    }

    return {
      render, dica,
      resposta: () => resp.valores(),
      mudou: () => { conferir = null; },
      desenho: () => miniGrupos(fase.grupos, fase.porGrupo, fase.fruta, rec.icone),
      resumo: () => `<span class="conta">${fase.grupos} × ${fase.porGrupo} = ${total}</span><span class="detalhe">${Array(fase.grupos).fill(fase.porGrupo).join(' + ')} = ${total}</span>`,
    };
  }

  // =====================================================================
  // RETÂNGULO: fileiras e colunas na banca
  // =====================================================================
  function mecRetangulo(fase) {
    let linhas = 0;
    const resp = criarResposta(fase, 1, 'rt');
    const total = fase.linhas * fase.colunas;
    const FILEIRA = { chave: 'fileira-nova', tipo: 'novaFileira' };
    let conferir = false;
    let conferirTotal = false;

    function fileira(classe) {
      const f = h('div', 'fileira ' + (classe || ''));
      for (let i = 0; i < fase.colunas; i++) f.appendChild(h('span', 'fruta-fileira', fase.fruta));
      return f;
    }
    function adicionar() {
      if (linhas >= fase.linhas + 3) return;
      linhas++;
      atualizar();
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-atacado mesa-retangulo');
      const fonte = h('div', 'banca banca-grupos');
      fonte.appendChild(h('div', 'rotulo', '🏪 Barraca'));
      const peca = h('div', 'peca bandeja-fileira', '');
      peca.appendChild(fileira());
      peca.appendChild(h('span', 'etiqueta-fileira', `1 fileira de ${fase.colunas}`));
      itemArrastavel(peca, FILEIRA, () => { adicionar(); ui.som('soltar'); });
      fonte.appendChild(peca);
      fonte.appendChild(h('p', 'ajudinha', 'Arraste a fileira para a banca (ou clique nela). Para tirar uma fileira, clique nela.'));
      zonaAtiva(fonte, (d) => d.tipo === 'naBanca', () => { linhas--; atualizar(); });
      mesa.appendChild(fonte);

      const banca = h('div', 'banca-arrumada' + (conferir ? ' conferir' : ''));
      banca.appendChild(h('div', 'rotulo', '🟫 Banca do robô'));
      const grade = h('div', 'grade-fileiras');
      const cab = h('div', 'linha-grade cabecalho');
      cab.appendChild(h('span', 'num-fileira', ''));
      for (let i = 0; i < fase.colunas; i++) cab.appendChild(h('span', 'num-coluna', String(i + 1)));
      grade.appendChild(cab);
      for (let r = 0; r < linhas; r++) {
        const l = h('div', 'linha-grade');
        l.appendChild(h('span', 'num-fileira', `${r + 1}ª`));
        const f = fileira('na-banca');
        itemArrastavel(f, { chave: `fileira-${r}`, tipo: 'naBanca', r }, () => { linhas--; ui.som('tirar'); atualizar(); });
        l.appendChild(f);
        grade.appendChild(l);
      }
      if (!linhas) grade.appendChild(h('div', 'vazio', '⬇ Solte as fileiras aqui'));
      banca.appendChild(grade);
      zonaAtiva(banca, (d) => d.tipo === 'novaFileira', adicionar);
      mesa.appendChild(banca);

      const contas = h('div', 'quadro-contas');
      contas.appendChild(linhaConta([linhas, linhas === 1 ? 'fileira de' : 'fileiras de', fase.colunas, '→', linhas, '×', fase.colunas, '=', resp.campo(0, conferirTotal ? 'conferir' : '')]));
      mesa.appendChild(contas);
      const banco = resp.banco();
      if (banco) mesa.appendChild(banco);
      area.appendChild(mesa);
    }

    async function dica(res) {
      conferirTotal = !res.totalOk;
      const area = () => $('#area');
      if (!res.linhasOk && !fase.digitar) {
        conferir = true;
        atualizar();
        mensagem('🔍 Vamos contar as fileiras!', 'dica');
        await contar(area().querySelectorAll('.na-banca'));
        mensagem(`Agora tem <b class="num">${linhas}</b> ${linhas === 1 ? 'fileira' : 'fileiras'}. O pedido é <b class="num">${fase.linhas}</b> fileiras com <b class="num">${fase.colunas}</b> em cada.`, 'dica');
        return;
      }
      if (!res.linhasOk) {
        // Fases de digitar: o robô arruma as fileiras para a criança ver.
        linhas = fase.linhas;
        mensagem('🔍 O robô arrumou as fileiras na banca para você ver.', 'dica');
      }
      atualizar();
      await contar(area().querySelectorAll('.na-banca'), Array.from({ length: linhas }, (_, i) => (i + 1) * fase.colunas));
      mensagem(`${fase.linhas} fileiras com ${fase.colunas} em cada: conte de <b>${fase.colunas} em ${fase.colunas}</b>. O último número é o total.${res.semTotal ? ' Coloque o total no <b>?</b>.' : ''}`, 'dica');
    }

    return {
      render, dica,
      resposta: () => ({ linhas, total: resp.valores()[0] }),
      mudou: () => { conferir = false; },
      desenho: () => `<span class="mini-retangulo" style="--colunas:${fase.colunas}">${`<i>${fase.fruta}</i>`.repeat(total)}</span>`,
      resumo: () => `<span class="conta">${fase.linhas} × ${fase.colunas} = ${total}</span><span class="detalhe">${fase.linhas} fileiras com ${fase.colunas} ${fase.fruta} em cada</span>`,
    };
  }

  // =====================================================================
  // CONTAS: tabuadas e contas misturadas, cada uma com o desenho
  // =====================================================================
  function mecContas(fase) {
    const lista = fase.contas.map((c) => ({ texto: c, ...Regras.conta(c) }));
    const resp = criarResposta(fase, lista.length, 'ct');
    let conferir = null;

    function desenhoConta(c) {
      const d = h('div', 'desenho-conta');
      if (c.op === '×') {
        d.innerHTML = miniGrupos(c.a, c.b, fase.fruta, '');
      } else {
        d.innerHTML = miniGrupos(c.b, c.a / c.b, fase.fruta, '🍽️');
      }
      return d;
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-atacado');
      const quadro = h('div', 'lista-contas');
      lista.forEach((c, i) => {
        const l = h('div', 'item-conta ' + classeConferir(conferir, i));
        l.appendChild(desenhoConta(c));
        l.appendChild(linhaConta([c.a, c.op, c.b, '=', resp.campo(i, classeConferir(conferir, i))]));
        l.appendChild(h('p', 'legenda-conta', c.op === '×'
          ? `${c.a} ${c.a === 1 ? 'grupo' : 'grupos'} com ${c.b} em cada`
          : `${c.a} repartidos em ${c.b} pratos: quanto em cada?`));
        quadro.appendChild(l);
      });
      mesa.appendChild(quadro);
      mesa.appendChild(h('p', 'ajudinha', fase.digitar ? 'Digite o número ou use os botões <b>−</b> e <b>+</b>. Os desenhos ajudam a contar.' : 'Arraste os números para os espaços com <b>?</b>.'));
      const banco = resp.banco();
      if (banco) mesa.appendChild(banco);
      area.appendChild(mesa);
    }

    async function dica(res) {
      conferir = res.erradas;
      atualizar();
      const i = res.erradas[0];
      const c = lista[i];
      const item = $('#area').querySelectorAll('.item-conta')[i];
      const grupos = item.querySelectorAll('.mini-grupo');
      if (c.op === '×') {
        mensagem(`🔍 Para <b>${c.a} × ${c.b}</b>, conte de <b>${c.b} em ${c.b}</b>.`, 'dica');
        await contar(grupos, Array.from({ length: c.a }, (_, k) => (k + 1) * c.b));
        mensagem(`<b>${c.a} × ${c.b}</b>: ${c.a} grupos com ${c.b} em cada. O último número é o resultado.${res.erradas.length > 1 ? ' Confira também as outras contas que estão piscando.' : ''}`, 'dica');
      } else {
        mensagem(`🔍 Para <b>${c.a} ÷ ${c.b}</b>, as frutas foram repartidas em ${c.b} pratos. Conte um prato.`, 'dica');
        await contar(grupos[0].querySelectorAll('small i'));
        mensagem(`Em cada prato ficou o resultado da divisão. Pense também: <b>${c.b} × ? = ${c.a}</b>.${res.erradas.length > 1 ? ' Confira também as outras contas que estão piscando.' : ''}`, 'dica');
      }
    }

    return {
      render, dica,
      resposta: () => resp.valores(),
      mudou: () => { conferir = null; },
      desenho: () => lista.map((c) => `<span class="caixote-p">${c.texto}</span>`).join(''),
      resumo: () => `<span class="detalhe">${lista.map((c) => `${c.texto} = <b>${c.resultado}</b>`).join('<br>')}</span>`,
    };
  }

  // =====================================================================
  // REPARTIR: um a um, até acabar (metade, terça parte… e a divisão que sobra)
  // =====================================================================
  function mecRepartir(fase) {
    const grupos = Array(fase.grupos).fill(0);
    let monte = fase.total;
    const certa = Regras.repartir(fase.total, fase.grupos);
    const comSobra = certa.sobra > 0;
    const resp = criarResposta(fase, comSobra ? 2 : 1, 'rp');
    const rec = RECIPIENTES[fase.recipiente] || RECIPIENTES.cesta;
    const nomeParte = fase.parte ? Regras.nomeParte(fase.grupos) : null;
    const MONTE = { chave: 'monte', tipo: 'monte', fixo: true };
    let conferir = null;
    let conferirResp = null;

    function dar(c) {
      if (monte <= 0) return;
      monte--;
      grupos[c]++;
      atualizar();
    }
    function devolver(c) {
      if (grupos[c] <= 0) return;
      grupos[c]--;
      monte++;
      atualizar();
    }
    function rodada() {
      if (estado.ocupado) return;
      if (monte >= fase.grupos) {
        grupos.forEach((_, c) => { grupos[c]++; });
        monte -= fase.grupos;
        ui.som('soltar');
        mensagem(`🔄 Cada ${rec.nome.toLowerCase()} recebeu 1. ${monte ? `Ainda tem <b class="num">${monte}</b> no monte.` : 'O monte acabou!'}`, 'info');
      } else if (monte > 0) {
        mensagem(`Agora tem só <b class="num">${monte}</b> no monte: não dá para dar 1 para cada. ${monte === 1 ? 'Essa fica fora' : 'Essas ficam fora'}.`, 'info');
      } else {
        mensagem('O monte já acabou.', 'info');
      }
      atualizar();
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-atacado');
      const topo = h('div', 'banca banca-monte' + (estado.selecionado === MONTE ? ' monte-escolhido' : ''));
      topo.appendChild(h('div', 'rotulo', comSobra ? `🏪 Monte (o que sobrar fica aqui, fora das ${rec.plural})` : '🏪 Monte de frutas'));
      const pilha = h('div', 'pilha');
      for (let i = 0; i < monte; i++) {
        const f = h('div', 'peca fruta no-monte', fase.fruta);
        itemArrastavel(f, { chave: `monte-${i}`, tipo: 'monte' }, () => selecionar(MONTE));
        pilha.appendChild(f);
      }
      if (!monte) pilha.appendChild(h('div', 'nenhum', 'O monte acabou!'));
      topo.appendChild(pilha);
      const rodape = h('div', 'rodape-monte');
      rodape.appendChild(h('span', 'contador-monte', `No monte: <b>${monte}</b>`));
      if (fase.rodada) {
        const b = h('button', 'btn secundario btn-rodada', '🔄 Dar 1 para cada');
        b.type = 'button';
        b.addEventListener('click', rodada);
        rodape.appendChild(b);
      }
      topo.appendChild(rodape);
      topo.appendChild(h('p', 'ajudinha', estado.selecionado === MONTE
        ? `Agora clique ${fase.recipiente === 'cliente' ? 'nos clientes' : rec.plural === 'pratos' ? 'nos pratos' : `nas ${rec.plural}`} para dar uma fruta de cada vez.`
        : 'Arraste as frutas, uma de cada vez. Ou clique no monte e depois clique onde quer pôr. Para devolver, clique na fruta.'));
      zonaAtiva(topo, (d) => d.tipo === 'noGrupo', (d) => devolver(d.c));
      mesa.appendChild(topo);

      const linha = h('div', 'linha-cestas');
      linha.style.setProperty('--cestas', Math.min(fase.grupos, 5));
      grupos.forEach((n, c) => {
        const z = h('div', `cesta-grupo cesta-mult grupo-atacado rec-${fase.recipiente} ${classeConferir(conferir, c)}`);
        z.appendChild(h('div', 'rotulo', rotuloGrupo(fase.recipiente, c)));
        const dentro = h('div', 'dentro');
        for (let i = 0; i < n; i++) {
          const p = h('div', 'peca fruta na-cesta', fase.fruta);
          itemArrastavel(p, { chave: `g${c}-${i}`, tipo: 'noGrupo', c }, () => {
            if (estado.selecionado === MONTE) { if (monte > 0) { dar(c); ui.som('soltar'); } } else { devolver(c); ui.som('tirar'); }
          });
          dentro.appendChild(p);
        }
        z.appendChild(dentro);
        z.appendChild(h('div', 'contador', String(n)));
        zonaAtiva(z, (d) => (d.tipo === 'monte' && monte > 0) || (d.tipo === 'noGrupo' && d.c !== c), (d) => {
          if (d.tipo === 'noGrupo') { grupos[d.c]--; grupos[c]++; atualizar(); } else dar(c);
        });
        linha.appendChild(z);
      });
      mesa.appendChild(linha);

      const contas = h('div', 'quadro-contas');
      const r0 = resp.campo(0, classeConferir(conferirResp, 0));
      if (nomeParte) {
        contas.appendChild(linhaConta([`A ${nomeParte} de`, fase.total, '=', fase.total, '÷', fase.grupos, '=', r0]));
      } else if (comSobra) {
        contas.appendChild(linhaConta([fase.total, '÷', fase.grupos, '=', r0, 'e sobra', resp.campo(1, classeConferir(conferirResp, 1))]));
        contas.appendChild(h('p', 'legenda-conta', `<span>quantas em cada ${rec.nome.toLowerCase()}</span><span>e</span><span>quantas ficam fora</span>`));
      } else {
        contas.appendChild(linhaConta([fase.total, '÷', fase.grupos, '=', r0]));
        contas.appendChild(h('p', 'legenda-conta', `<span>Quanto cada ${fase.recipiente === 'cliente' ? 'cliente recebe' : `${rec.nome.toLowerCase()} recebe`}?</span>`));
      }
      mesa.appendChild(contas);
      const banco = resp.banco();
      if (banco) mesa.appendChild(banco);
      area.appendChild(mesa);
    }

    async function dica(res, tentativa) {
      conferirResp = res.respostasErradas;
      const area = () => $('#area');
      if (!res.repartiu && !fase.digitar) {
        conferir = res.iguais && res.monte >= fase.grupos ? null : res.gruposErrados;
        atualizar();
        if (res.monte >= fase.grupos) {
          mensagem(`Ainda tem <b class="num">${res.monte}</b> no monte. Dá para dar <b>mais 1 para cada</b>! Continue repartindo, uma de cada vez.`, 'dica');
          return;
        }
        mensagem(`🔍 Vamos contar ${fase.recipiente === 'cliente' ? 'o que cada cliente recebeu' : `cada ${rec.nome.toLowerCase()}`}!`, 'dica');
        for (const g of area().querySelectorAll('.grupo-atacado')) await contar(g.querySelectorAll('.na-cesta'));
        let txt = 'Todos precisam receber a <b>mesma quantidade</b>. Arrume os que estão piscando.';
        if (comSobra && res.iguais && res.monte < fase.grupos) txt = `As ${rec.plural} estão iguais, mas ainda dá para repartir melhor.`;
        if (tentativa >= 2) txt += ` Dica: cada um fica com <b class="num">${certa.cada}</b>.`;
        mensagem(txt, 'dica');
        return;
      }
      if (!res.repartiu) {
        // Fases de digitar: o robô reparte, uma rodada de cada vez, para a criança ver.
        grupos.fill(certa.cada);
        monte = certa.sobra;
        mensagem('🔍 O robô repartiu as frutas, uma para cada, até acabar.', 'dica');
      }
      conferir = null;
      atualizar();
      const primeiro = area().querySelector('.grupo-atacado');
      mensagem(`🔍 Vamos contar ${fase.recipiente === 'cliente' ? 'o que o cliente 1 recebeu' : `${rec.plural === 'pratos' ? 'o prato 1' : `a ${rec.nome.toLowerCase()} 1`}`}.`, 'dica');
      await contar(primeiro.querySelectorAll('.na-cesta'));
      let txt = `Cada ${fase.recipiente === 'cliente' ? 'cliente' : rec.nome.toLowerCase()} ficou com a mesma quantidade. Esse número é o resultado de <b>${fase.total} ÷ ${fase.grupos}</b>.`;
      if (nomeParte) txt = `A <b>${nomeParte}</b> é o que fica em <b>1</b> dos ${fase.grupos} pratos iguais. ` + txt;
      if (comSobra) {
        await contar(area().querySelectorAll('.no-monte'));
        txt += ` As frutas que ficaram no monte são a <b>sobra</b>.`;
      }
      txt += ` Pense também: <b>${fase.grupos} × ? = ${fase.total - certa.sobra}</b>.`;
      mensagem(txt, 'dica');
    }

    function desenho() {
      const quem = fase.recipiente === 'cliente' ? CLIENTES.slice(0, fase.grupos).join('') : rec.icone.repeat(fase.grupos);
      return `<span class="fruta-pedido">${fase.fruta}</span><span class="num-grande">${fase.total}</span><span class="sinal-p">÷</span><span class="fruta-pedido">${quem}</span>`;
    }
    function resumo() {
      const cada = `${fase.total} ÷ ${fase.grupos} = ${certa.cada}`;
      if (comSobra) {
        return `<span class="conta">${fase.total} ÷ ${fase.grupos} = ${certa.cada} e sobra ${certa.sobra}</span>` +
          `<span class="detalhe">${fase.grupos} × ${certa.cada} = ${fase.grupos * certa.cada}; ${fase.grupos * certa.cada} + ${certa.sobra} = ${fase.total}<br>${(rec.icone + fase.fruta.repeat(certa.cada) + ' ').repeat(fase.grupos)} sobra ${fase.fruta.repeat(certa.sobra)}</span>`;
      }
      return `<span class="conta">${cada}</span><span class="detalhe">${nomeParte ? `A ${nomeParte} de ${fase.total} é ${certa.cada}.<br>` : ''}Se ${fase.total} ÷ ${fase.grupos} = ${certa.cada}, então ${fase.grupos} × ${certa.cada} = ${fase.total}.</span>`;
    }

    return {
      render, dica, desenho, resumo,
      resposta: () => ({ grupos: grupos.slice(), monte, respostas: resp.valores() }),
      mudou: () => { conferir = null; conferirResp = null; },
    };
  }

  // =====================================================================
  // CABEM: quantas caixas dá para montar
  // =====================================================================
  function mecCabem(fase) {
    const caixas = [];
    let monte = fase.total;
    const resp = criarResposta(fase, 1, 'cb');
    const MONTE = { chave: 'monte', tipo: 'monte', fixo: true };
    const CAIXA = { chave: 'caixa-nova', tipo: 'caixaNova' };
    let conferir = null;
    let conferirTotal = false;

    function novaCaixa() {
      if (caixas.length >= Math.ceil(fase.total / fase.porCaixa) + 2) return;
      caixas.push(0);
      atualizar();
    }
    function por(c) {
      if (monte <= 0 || caixas[c] >= fase.porCaixa) return;
      monte--;
      caixas[c]++;
      atualizar();
    }

    function render(area) {
      const mesa = h('div', 'mesa mesa-atacado');
      const topo = h('div', 'banca banca-monte' + (estado.selecionado === MONTE ? ' monte-escolhido' : ''));
      topo.appendChild(h('div', 'rotulo', `🏪 Monte: ${fase.total} ${fase.fruta}`));
      const linhaTopo = h('div', 'linha-monte');
      const pilha = h('div', 'pilha');
      for (let i = 0; i < monte; i++) {
        const f = h('div', 'peca fruta no-monte', fase.fruta);
        itemArrastavel(f, { chave: `monte-${i}`, tipo: 'monte' }, () => selecionar(MONTE));
        pilha.appendChild(f);
      }
      if (!monte) pilha.appendChild(h('div', 'nenhum', 'O monte acabou!'));
      linhaTopo.appendChild(pilha);
      const fonte = h('div', 'estoque');
      const cx = h('div', 'peca caixa-vazia', `<span class="etiqueta">cabem ${fase.porCaixa}</span><span class="buracos">${'<i></i>'.repeat(fase.porCaixa)}</span>`);
      itemArrastavel(cx, CAIXA, () => { novaCaixa(); ui.som('soltar'); });
      fonte.appendChild(cx);
      fonte.appendChild(h('div', 'legenda', '📦 Caixa vazia'));
      linhaTopo.appendChild(fonte);
      topo.appendChild(linhaTopo);
      topo.appendChild(h('p', 'ajudinha', estado.selecionado === MONTE
        ? 'Agora clique nas caixas para pôr. Para tirar, arraste de volta para o monte.'
        : 'Arraste uma caixa vazia para o balcão. Depois arraste os ovos para as caixas (ou clique no monte e depois na caixa). Para tirar, clique no ovo da caixa.'));
      zonaAtiva(topo, (d) => d.tipo === 'naCaixa', (d) => { caixas[d.c]--; monte++; atualizar(); });
      mesa.appendChild(topo);

      const balcao = h('div', 'balcao');
      balcao.appendChild(h('div', 'rotulo', '🧾 Balcão: caixas montadas'));
      const fila = h('div', 'fila-caixas');
      caixas.forEach((n, c) => {
        const z = h('div', `caixa-montada grupo-atacado ${n === fase.porCaixa ? 'cheia' : ''} ${classeConferir(conferir, c)}`);
        z.appendChild(h('div', 'rotulo', `📦 Caixa ${c + 1}`));
        const buracos = h('div', 'buracos-grandes');
        for (let i = 0; i < fase.porCaixa; i++) {
          if (i < n) {
            const p = h('div', 'peca fruta na-cesta', fase.fruta);
            itemArrastavel(p, { chave: `cx${c}-${i}`, tipo: 'naCaixa', c }, () => {
              if (estado.selecionado === MONTE) { por(c); ui.som('soltar'); } else { caixas[c]--; monte++; ui.som('tirar'); atualizar(); }
            });
            buracos.appendChild(p);
          } else {
            buracos.appendChild(h('div', 'buraco', ''));
          }
        }
        z.appendChild(buracos);
        if (!n) {
          const tirar = h('button', 'btn-tirar-caixa', '✖ tirar caixa');
          tirar.type = 'button';
          tirar.addEventListener('click', (e) => { e.stopPropagation(); if (!estado.ocupado) { caixas.splice(c, 1); atualizar(); } });
          z.appendChild(tirar);
        }
        zonaAtiva(z, (d) => (d.tipo === 'monte' && monte > 0 && caixas[c] < fase.porCaixa) || (d.tipo === 'naCaixa' && d.c !== c && caixas[c] < fase.porCaixa), (d) => {
          if (d.tipo === 'naCaixa') { caixas[d.c]--; caixas[c]++; atualizar(); } else por(c);
        });
        fila.appendChild(z);
      });
      if (!caixas.length) fila.appendChild(h('div', 'vazio', '⬇ Solte as caixas aqui'));
      balcao.appendChild(fila);
      zonaAtiva(balcao, (d) => d.tipo === 'caixaNova', novaCaixa);
      mesa.appendChild(balcao);

      const cheias = caixas.filter((n) => n === fase.porCaixa).length;
      const contas = h('div', 'quadro-contas');
      contas.appendChild(linhaConta([fase.total, '÷', fase.porCaixa, '=', resp.campo(0, conferirTotal ? 'conferir' : ''), 'caixas']));
      contas.appendChild(h('p', 'legenda-conta', `<span>Caixas cheias agora: <b>${cheias}</b></span><span>Fora das caixas: <b>${monte}</b></span>`));
      mesa.appendChild(contas);
      const banco = resp.banco();
      if (banco) mesa.appendChild(banco);
      area.appendChild(mesa);
    }

    async function dica(res, tentativa) {
      conferirTotal = !res.totalOk;
      const area = () => $('#area');
      if (!res.montou && !fase.digitar) {
        conferir = res.incompletas;
        atualizar();
        if (res.monte > 0) {
          mensagem(`Ainda tem <b class="num">${res.monte}</b> ${fase.fruta} fora das caixas. Cada caixa leva <b class="num">${fase.porCaixa}</b>. ${res.incompletas.length ? 'Complete as caixas que estão piscando ou ' : ''}pegue mais uma caixa vazia.`, 'dica');
        } else {
          mensagem(`Cada caixa precisa ficar cheia, com <b class="num">${fase.porCaixa}</b>. Arrume as caixas que estão piscando.`, 'dica');
        }
        return;
      }
      if (!res.montou) {
        caixas.length = 0;
        for (let i = 0; i < fase.total / fase.porCaixa; i++) caixas.push(fase.porCaixa);
        monte = 0;
        mensagem('🔍 O robô montou as caixas para você ver.', 'dica');
      }
      conferir = null;
      atualizar();
      mensagem('🔍 Vamos contar as caixas!', 'dica');
      await contar(area().querySelectorAll('.caixa-montada'));
      mensagem(`Cada caixa leva ${fase.porCaixa}. Quantas vezes o ${fase.porCaixa} cabe no ${fase.total}? O último número que contamos é a resposta.${tentativa >= 2 ? ` Pense: <b>? × ${fase.porCaixa} = ${fase.total}</b>.` : ''}`, 'dica');
    }

    const q = fase.total / fase.porCaixa;
    return {
      render, dica,
      resposta: () => ({ caixas: caixas.slice(), monte, total: resp.valores()[0] }),
      mudou: () => { conferir = null; },
      desenho: () => `<span class="num-grande">${fase.total}</span><span class="fruta-pedido">${fase.fruta}</span><span class="sinal-p">em caixas de</span><span class="num-grande">${fase.porCaixa}</span><span class="sinal-p">=</span><span class="num-grande">?</span><span class="fruta-pedido">📦</span>`,
      resumo: () => `<span class="conta">${fase.total} ÷ ${fase.porCaixa} = ${q}</span><span class="detalhe">${q} caixas com ${fase.porCaixa} ${fase.fruta} em cada.<br>${q} × ${fase.porCaixa} = ${fase.total}</span>`,
    };
  }

  // =====================================================================
  // RELAÇÃO: se 4 × 3 = 12, então 12 ÷ 3 = 4 e 12 ÷ 4 = 3
  // =====================================================================
  function mecRelacao(fase) {
    const t = fase.grupos * fase.porGrupo;
    const resp = criarResposta(fase, 2, 'rl');
    let conferir = null;

    function render(area) {
      const mesa = h('div', 'mesa mesa-atacado');
      const linha = h('div', 'linha-cestas');
      linha.style.setProperty('--cestas', fase.grupos);
      for (let c = 0; c < fase.grupos; c++) {
        const z = h('div', 'cesta-grupo cesta-mult grupo-atacado rec-cesta');
        z.appendChild(h('div', 'rotulo', `🧺 Cesta ${c + 1}`));
        const dentro = h('div', 'dentro');
        for (let i = 0; i < fase.porGrupo; i++) dentro.appendChild(h('div', 'peca fruta na-cesta', fase.fruta));
        z.appendChild(dentro);
        z.appendChild(h('div', 'contador', String(fase.porGrupo)));
        linha.appendChild(z);
      }
      mesa.appendChild(linha);
      const contas = h('div', 'quadro-contas familia');
      contas.appendChild(linhaConta([fase.grupos, '×', fase.porGrupo, '=', t, '✅'], 'pronta'));
      contas.appendChild(linhaConta([t, '÷', fase.porGrupo, '=', resp.campo(0, classeConferir(conferir, 0))]));
      contas.appendChild(h('p', 'legenda-conta', `<span>${t} ${fase.fruta} em grupos de ${fase.porGrupo}: quantos grupos?</span>`));
      contas.appendChild(linhaConta([t, '÷', fase.grupos, '=', resp.campo(1, classeConferir(conferir, 1))]));
      contas.appendChild(h('p', 'legenda-conta', `<span>${t} ${fase.fruta} repartidas em ${fase.grupos} cestas: quantas em cada?</span>`));
      mesa.appendChild(contas);
      const banco = resp.banco();
      if (banco) mesa.appendChild(banco);
      area.appendChild(mesa);
    }

    async function dica(res) {
      conferir = res.erradas;
      atualizar();
      const area = $('#area');
      if (res.erradas.includes(0)) {
        mensagem(`🔍 <b>${t} ÷ ${fase.porGrupo}</b>: quantos grupos de ${fase.porGrupo} cabem em ${t}? Conte as cestas.`, 'dica');
        await contar(area.querySelectorAll('.grupo-atacado'));
      } else {
        mensagem(`🔍 <b>${t} ÷ ${fase.grupos}</b>: ${t} repartidas em ${fase.grupos} cestas. Conte uma cesta.`, 'dica');
        await contar(area.querySelector('.grupo-atacado').querySelectorAll('.na-cesta'));
      }
      mensagem(`A multiplicação e a divisão são da mesma família: se <b>${fase.grupos} × ${fase.porGrupo} = ${t}</b>, os mesmos números aparecem na divisão.`, 'dica');
    }

    return {
      render, dica,
      resposta: () => resp.valores(),
      mudou: () => { conferir = null; },
      desenho: () => `${miniGrupos(fase.grupos, fase.porGrupo, fase.fruta, '🧺')}<span class="sinal-p">${fase.grupos} × ${fase.porGrupo} = ${t}</span>`,
      resumo: () => `<span class="conta">${fase.grupos} × ${fase.porGrupo} = ${t}</span><span class="detalhe">${t} ÷ ${fase.porGrupo} = ${fase.grupos}<br>${t} ÷ ${fase.grupos} = ${fase.porGrupo}</span>`,
    };
  }

  return {
    montar: mecMontar, parcelas: mecParcelas, retangulo: mecRetangulo, contas: mecContas,
    repartir: mecRepartir, cabem: mecCabem, relacao: mecRelacao,
  };
}
