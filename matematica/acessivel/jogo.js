// Feira do Robô acessível: as mesmas fases da Feira do Robô (../js/fases.js),
// jogadas só pelo teclado, com voz e com sons para contar ouvindo.
//
// Teclas iguais em todas as fases:
//   ← →  escolhem (o tipo de fruta, a cesta, o caixote, a nota…)
//   ↑ ↓  mudam o que está escolhido (põem ou tiram, trocam o número)
//   O    ouvir: toca um som para cada coisa, para contar
//   Enter confere (é o "Pronto!")   Espaço repete   H ajuda   Esc menu
(function () {
  const $ = (s) => document.querySelector(s);
  const CHAVE = 'feiraRobo.acessivel.v1';

  // ---------- Preferências e progresso ----------
  function ler() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || {};
    } catch (e) {
      return {};
    }
  }
  const salvo = ler();
  const prefs = {
    ano: ANOS[salvo.ano] ? salvo.ano : 1,
    voz: salvo.voz !== false,
    sons: salvo.sons !== false,
    braille: !!salvo.braille,
    estrelas: salvo.estrelas && typeof salvo.estrelas === 'object' ? salvo.estrelas : {},
  };
  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(prefs));
    } catch (e) { /* sem armazenamento: o jogo continua funcionando */ }
  }
  Voz.propria = prefs.voz;
  Som.ligado = prefs.sons;

  const estado = {
    tela: 'entrada', // entrada | menu | fases | jogo | vitoria
    menu: [],
    foco: 0,
    indice: 0,
    fase: null,
    mec: null,
    tentativas: 0,
    seq: 0, // muda a cada tecla: interrompe sons e dicas que estavam tocando
    ultimaFala: '',
    confirmandoApagar: false,
  };

  function estrelasDe(ano, i) {
    return (prefs.estrelas[ano] || [])[i] || 0;
  }

  // ---------- Fala ----------
  function falar(texto, opcoes) {
    const t = paraFala(texto);
    estado.ultimaFala = t;
    return Voz.falar(t, opcoes);
  }
  function novaSequencia() {
    Sons.parar();
    return ++estado.seq;
  }
  const vivo = (t) => t === estado.seq;
  function contarAte(n, inicio = 1) {
    const nums = [];
    for (let i = inicio; i <= n; i++) nums.push(i);
    return nums.join(', ');
  }
  function comBraille(n) {
    return prefs.braille ? ` ${brailleFalado(n)}` : '';
  }
  function semSons() {
    if (Som.ligado) return false;
    falar('Os sons estão desligados. Para ouvir e contar, ligue os sons no menu.');
    return true;
  }
  // Ciclo de opções com ↑ ↓ (null = ainda nada escolhido).
  function girar(lista, atual, passo) {
    const i = lista.indexOf(atual);
    if (i < 0) return passo > 0 ? lista[0] : lista[lista.length - 1];
    return lista[(i + passo + lista.length) % lista.length];
  }

  // =====================================================================
  // Mecânicas. Cada uma devolve:
  //   teclas: [[tecla, o que faz]], instrucao(): texto ao abrir a fase,
  //   agora(): o que está escolhido (Espaço), quadro(): html para quem enxerga,
  //   tecla(t): trata a tecla (true se usou), ouvir(seq), dica(res, tentativa, seq),
  //   resposta(), resumo()
  // =====================================================================

  // ---------- Sacola ----------
  function mecSacola(fase) {
    const s = Regras.sacolaInicial(fase);
    const unidades = fase.unidades;
    const temCaixa = unidades.includes('caixa');
    let sel = 0;

    const nomeUnidade = (u) => ({
      solta: `${nomeFruta(fase.fruta, 1)} ${solta(fase.fruta, 1)}`,
      caixa: `caixa com 10 ${nomeFruta(fase.fruta, 2)}`,
      engradado: `engradado com 100 ${nomeFruta(fase.fruta, 2)}`,
    })[u];
    const plural = { solta: [solta(fase.fruta, 1), solta(fase.fruta, 2)], caixa: ['caixa', 'caixas'], engradado: ['engradado', 'engradados'] };

    function conteudoFalado() {
      if (!Regras.totalSacola(s)) return 'A sacola está vazia.';
      if (!temCaixa) return 'Aperte O para ouvir e contar o que tem na sacola.';
      const partes = ['engradado', 'caixa', 'solta'].filter((u) => unidades.includes(u) && s[u]).map((u) => quantidade(s[u], ...plural[u]));
      const ultima = partes.pop();
      return `Na sacola tem ${partes.length ? `${partes.join(', ')} e ` : ''}${ultima}.`;
    }

    function tecla(t) {
      const u = unidades[sel];
      if ((t === 'ArrowLeft' || t === 'ArrowRight') && unidades.length > 1) {
        sel = (sel + (t === 'ArrowRight' ? 1 : -1) + unidades.length) % unidades.length;
        Sons[unidades[sel]]();
        falar(`${nomeUnidade(unidades[sel])}.`);
      } else if (t === 'ArrowLeft' || t === 'ArrowRight') {
        falar(`Aqui só tem ${nomeFruta(fase.fruta, 2)} soltas. Use seta para cima para pôr e seta para baixo para tirar.`);
      } else if (t === 'ArrowUp') {
        if (Regras.totalSacola(s) + Regras.VALOR_UNIDADE[u] > 999 || (!temCaixa && s.solta >= 40)) {
          falar('A sacola está cheia.');
          return true;
        }
        s[u]++;
        Sons.colocou();
        Sons[u](0);
        const trocas = Regras.empacotar(s, unidades);
        if (trocas.length) {
          Sons.empacotou();
          const ultima = trocas[trocas.length - 1];
          falar(ultima === 'caixa'
            ? `Juntou 10 ${nomeFruta(fase.fruta, 2)} ${solta(fase.fruta, 2)}: viraram 1 caixa!`
            : 'Juntou 10 caixas: viraram 1 engradado!');
        }
      } else if (t === 'ArrowDown' || t === 'Backspace') {
        if (!s[u]) {
          falar(`Não tem ${u === 'solta' ? `${nomeFruta(fase.fruta, 1)} ${solta(fase.fruta, 1)}` : u} na sacola.`);
          return true;
        }
        s[u]--;
        Sons.tirou();
      } else if ((t === 'a' || t === 'A') && fase.abrir) {
        if (s.caixa > 0) {
          s.caixa--;
          s.solta += 10;
          Sons.abriu();
          falar(`Abri uma caixa: saíram 10 ${nomeFruta(fase.fruta, 2)} ${solta(fase.fruta, 2)}.`);
        } else {
          falar('Não tem caixa na sacola para abrir.');
        }
      } else {
        return false;
      }
      return true;
    }

    async function ouvir(seq) {
      if (semSons()) return;
      if (!Regras.totalSacola(s)) return void falar('A sacola está vazia.');
      if (!temCaixa) {
        await falar(`Vou tocar um som para cada ${nomeFruta(fase.fruta, 1)}. Conte!`);
        if (vivo(seq)) await Sons.tocar(Array(s.solta).fill({ som: 'solta' }));
        return;
      }
      for (const u of ['engradado', 'caixa', 'solta']) {
        if (!unidades.includes(u) || !vivo(seq)) continue;
        await falar(`${plural[u][1][0].toUpperCase()}${plural[u][1].slice(1)}:`);
        if (!vivo(seq)) return;
        if (!s[u]) await falar(u === 'engradado' || (u === 'solta' && masculino(fase.fruta)) ? 'nenhum.' : 'nenhuma.');
        else await Sons.tocar(Array(s[u]).fill({ som: u }), u === 'solta' ? 380 : 520);
      }
    }

    async function dica(res, tentativa, seq) {
      const rotulos = [];
      let soma = 0;
      ['engradado', 'caixa', 'solta'].forEach((u) => {
        for (let i = 0; i < s[u]; i++) { soma += Regras.VALOR_UNIDADE[u]; rotulos.push(soma); }
      });
      if (rotulos.length) {
        await falar(`Vamos contar juntos o que tem na sacola: ${rotulos.join(', ')}.`);
        if (!vivo(seq)) return;
      }
      if (res.total === 0) return void falar('A sacola está vazia. Aperte seta para cima para pôr frutas na sacola.');
      let txt = `Na sacola tem ${res.total}. O pedido é ${res.alvo}. `;
      txt += res.total < res.alvo ? 'Coloque mais' : 'Tire algumas';
      txt += tentativa >= 2 ? `: ${Math.abs(res.alvo - res.total)}.` : '.';
      if (tentativa >= 2 && temCaixa) {
        const d = Regras.decompor(res.alvo);
        const caixas = unidades.includes('engradado') ? d.caixa : Math.floor(res.alvo / 10);
        const partes = [];
        if (unidades.includes('engradado')) partes.push(quantidade(d.engradado, 'engradado', 'engradados'));
        partes.push(quantidade(caixas, 'caixa', 'caixas'), quantidade(d.solta, ...plural.solta));
        txt += ` Dica: ${res.alvo} é ${partes.join(', ')}.`;
      }
      falar(txt);
    }

    function quadro() {
      const linhas = [];
      if (unidades.length > 1) {
        linhas.push('<p>Barraca: ' + unidades.map((u, i) => `<span class="${i === sel ? 'foco' : ''}">${nomeUnidade(u)}</span>`).join(' · ') + '</p>');
      }
      linhas.push('<p>Sacola:</p>');
      if (s.engradado) linhas.push(`<p class="linha-emoji">${'🧺'.repeat(s.engradado)}</p>`);
      if (s.caixa) linhas.push(`<p class="linha-emoji">${'📦'.repeat(s.caixa)}</p>`);
      if (s.solta) linhas.push(`<p class="linha-emoji">${fase.fruta.repeat(s.solta)}</p>`);
      if (!Regras.totalSacola(s)) linhas.push('<p>(vazia)</p>');
      return linhas.join('');
    }

    const teclas = [['↑', `põe ${unidades.length > 1 ? 'o escolhido' : 'uma fruta'} na sacola`], ['↓', 'tira da sacola']];
    if (unidades.length > 1) teclas.unshift(['← →', 'escolhem: solta, caixa ou engradado']);
    if (fase.abrir) teclas.push(['A', 'abre uma caixa']);
    teclas.push(['O', 'ouvir o que tem na sacola']);

    function instrucao() {
      let txt = '';
      if (fase.inicial) txt += `A sacola já começa com ${fase.inicial} ${nomeFruta(fase.fruta, 2)}. `;
      if (unidades.length > 1) {
        txt += `Na barraca tem ${unidades.map(nomeUnidade).join(', ')}. Use as setas para a esquerda e para a direita para escolher. `;
      }
      txt += 'Seta para cima põe na sacola, seta para baixo tira. ';
      if (fase.abrir) txt += 'Para tirar de dentro de uma caixa, aperte A para abrir a caixa. ';
      if (temCaixa) txt += 'Quando juntar 10 soltas, elas viram 1 caixa sozinhas. ';
      txt += 'Aperte O para ouvir e contar o que tem na sacola. Quando terminar, aperte Enter.';
      return txt;
    }

    return {
      teclas, tecla, ouvir, dica, quadro, instrucao,
      agora: () => (unidades.length > 1 ? `Escolhido: ${nomeUnidade(unidades[sel])}. ` : '') + conteudoFalado(),
      resposta: () => ({ ...s }),
      resumo: () => {
        if (fase.conta) return `${fase.conta} = ${fase.alvo}.`;
        if (!temCaixa) return `${fase.alvo} ${nomeFruta(fase.fruta, fase.alvo)}.${comBraille(fase.alvo)}`;
        const d = Regras.decompor(fase.alvo);
        const partes = [];
        if (unidades.includes('engradado')) partes.push(quantosOuNenhum(d.engradado, 'engradado', 'engradados', false));
        partes.push(quantosOuNenhum(unidades.includes('engradado') ? d.caixa : Math.floor(fase.alvo / 10), 'caixa', 'caixas'));
        partes.push(`e ${quantosOuNenhum(d.solta, solta(fase.fruta, 1), solta(fase.fruta, 2), !masculino(fase.fruta))}`);
        return `${fase.alvo} ${nomeFruta(fase.fruta, 2)}: ${partes.join(', ').replace(', e ', ' e ')}.${comBraille(fase.alvo)}`;
      },
    };
  }

  // ---------- Quantos: contar ouvindo e escolher o número ----------
  function mecQuantos(fase) {
    const opcoes = fase.opcoes.slice().sort((a, b) => a - b);
    let resp = null;
    const juntar = fase.grupos.length > 1;

    function tecla(t) {
      if (t !== 'ArrowUp' && t !== 'ArrowDown') return false;
      resp = girar(opcoes, resp, t === 'ArrowUp' ? 1 : -1);
      Sons.passo();
      falar(`Cartão ${resp}.${comBraille(resp)}`);
      return true;
    }

    async function ouvir(seq) {
      if (semSons()) return;
      for (let g = 0; g < fase.grupos.length; g++) {
        const grupo = fase.grupos[g];
        await falar(juntar ? `${g === 0 ? 'Primeiro' : 'Depois'}, ${artigo(grupo.fruta, true)} ${nomeFruta(grupo.fruta, 2)}:` : `Um som para cada ${nomeFruta(grupo.fruta, 1)}. Conte!`);
        if (!vivo(seq)) return;
        if (!(await Sons.tocar(Array(grupo.n).fill({ som: 'solta', variante: g })))) return;
      }
    }

    async function dica(res, tentativa, seq) {
      const total = Regras.respostaCerta(fase);
      await falar(`Vamos contar juntos${juntar ? ', juntando tudo' : ''}: ${contarAte(total)}.`);
      if (!vivo(seq)) return;
      falar(`${res.vazio ? 'Você ainda não escolheu um cartão. ' : ''}O último número que contamos é ${juntar ? 'o total' : 'quantas tem'}. Escolha o cartão com as setas para cima e para baixo.`);
    }

    return {
      tecla, ouvir, dica,
      teclas: [['O', 'ouvir as frutas e contar'], ['↑ ↓', 'escolhem o cartão com o número']],
      instrucao: () => `Aperte O para ouvir as frutas: é um som para cada uma. Conte os sons. Depois escolha o número com as setas para cima e para baixo: os cartões são ${opcoes.join(', ')}. Quando terminar, aperte Enter.`,
      agora: () => (resp === null ? 'Você ainda não escolheu um cartão.' : `Você escolheu o cartão ${resp}.`),
      quadro: () => fase.grupos.map((g) => `<p class="linha-emoji">${g.fruta.repeat(g.n)}</p>`).join('<p>+</p>') +
        `<p>Cartões: ${opcoes.map((o) => `<span class="${o === resp ? 'foco' : ''}">${o}</span>`).join(' · ')}</p>`,
      resposta: () => resp,
      resumo: () => {
        const total = Regras.respostaCerta(fase);
        const mesmaFruta = fase.grupos.every((g) => g.fruta === fase.grupos[0].fruta);
        const nome = mesmaFruta ? nomeFruta(fase.grupos[0].fruta, total) : 'frutas';
        return `${juntar ? fase.grupos.map((g) => g.n).join(' + ') + ' = ' : ''}${total} ${nome}.${comBraille(total)}`;
      },
    };
  }

  // ---------- Comparar: cesta A (esquerda), IGUAIS, cesta B (direita) ----------
  function mecComparar(fase) {
    const LUGARES = ['a', 'igual', 'b'];
    const NOMES = { a: 'cesta A, do lado esquerdo', igual: 'iguais', b: 'cesta B, do lado direito' };
    const PAN = { a: -0.9, igual: 0, b: 0.9 };
    let resp = null;
    const fruta = fase.a.fruta;

    function tecla(t) {
      if (t !== 'ArrowLeft' && t !== 'ArrowRight') return false;
      const passo = t === 'ArrowRight' ? 1 : -1;
      if (resp === null) resp = passo > 0 ? 'b' : 'a';
      else resp = LUGARES[Math.max(0, Math.min(2, LUGARES.indexOf(resp) + passo))];
      Sons.estrela(PAN[resp]);
      falar(`Estrela ${resp === 'igual' ? 'no' : 'na'} ${NOMES[resp]}.`);
      return true;
    }

    async function tocarCesta(lado, seq) {
      await falar(lado === 'a' ? 'Cesta A, no lado esquerdo:' : 'Cesta B, no lado direito:');
      if (!vivo(seq)) return false;
      return Sons.tocar(Array(fase[lado].n).fill({ som: 'solta', pan: PAN[lado] }));
    }

    async function ouvir(seq) {
      if (semSons()) return;
      if (await tocarCesta('a', seq)) await tocarCesta('b', seq);
    }

    async function dica(res, tentativa, seq) {
      const { a, b } = fase;
      const pares = Math.min(a.n, b.n);
      if (Som.ligado) {
        await falar('Vamos fazer duplas: agora toca um som de cada lado, ao mesmo tempo. Quando tocar só de um lado, é fruta que sobrou.');
        if (!vivo(seq)) return;
        const lista = [];
        for (let i = 0; i < pares; i++) lista.push({ som: 'solta', pan: 0, intervalo: 500 });
        if (a.n !== b.n) lista.push({ pausa: 500 });
        const sobraLado = a.n > b.n ? 'a' : 'b';
        for (let i = pares; i < Math.max(a.n, b.n); i++) lista.push({ som: 'solta', pan: PAN[sobraLado], variante: 1, intervalo: 500 });
        if (!(await Sons.tocar(lista))) return;
      }
      await falar(`Contando: a cesta A tem ${a.n}. A cesta B tem ${b.n}.`);
      if (!vivo(seq)) return;
      let txt;
      if (a.n === b.n) {
        txt = 'Cada fruta tem uma parceira do outro lado. Não sobra nenhuma!';
        if (tentativa >= 2) txt += ' Então as cestas têm a mesma quantidade: leve a estrela para o iguais.';
      } else {
        txt = 'A cesta que tem fruta sobrando tem mais. A outra tem menos.';
      }
      falar((res.vazio ? 'Leve a estrela com as setas para a esquerda e para a direita. ' : '') + txt);
    }

    return {
      tecla, ouvir, dica,
      teclas: [['O', 'ouvir as duas cestas'], ['← →', 'levam a estrela: cesta A, iguais, cesta B']],
      instrucao: () => `A pergunta é: qual cesta tem ${fase.pergunta === 'mais' ? 'mais' : 'menos'} ${nomeFruta(fruta, 2)}? Se as duas tiverem a mesma quantidade, a resposta é iguais. Aperte O para ouvir as cestas: a cesta A toca no lado esquerdo do fone e a cesta B no lado direito. Use as setas para a esquerda e para a direita para levar a estrela. Quando terminar, aperte Enter.`,
      agora: () => (resp ? `A estrela está ${resp === 'igual' ? 'no' : 'na'} ${NOMES[resp]}.` : 'A estrela ainda não foi colocada.'),
      quadro: () => `<p>Cesta A: <span class="linha-emoji">${fruta.repeat(fase.a.n)}</span></p><p>Cesta B: <span class="linha-emoji">${fase.b.fruta.repeat(fase.b.n)}</span></p>` +
        `<p>${LUGARES.map((l) => `<span class="${l === resp ? 'foco' : ''}">${l === resp ? '⭐ ' : ''}${l === 'igual' ? 'IGUAIS' : 'Cesta ' + l.toUpperCase()}</span>`).join(' · ')}</p>`,
      resposta: () => resp,
      resumo: () => {
        const { a, b } = fase;
        if (a.n === b.n) return `As duas cestas têm ${a.n}: são iguais.`;
        return `A cesta A tem ${a.n} e a cesta B tem ${b.n}. ${a.n > b.n ? 'A cesta A' : 'A cesta B'} tem mais.`;
      },
    };
  }

  // ---------- Sequência: caixotes numerados ----------
  function mecSequencia(fase) {
    const opcoes = fase.lacunas.map((i) => fase.itens[i]).concat(fase.extras).sort((a, b) => a - b);
    const valores = fase.lacunas.map(() => null);
    const passo = fase.itens[1] - fase.itens[0];
    let foco = 0;

    function valorEm(i) {
      const li = fase.lacunas.indexOf(i);
      return li < 0 ? fase.itens[i] : valores[li];
    }
    function vizinho(i) {
      if (i < 0 || i >= fase.itens.length) return null;
      const v = valorEm(i);
      return v === null ? 'outro caixote vazio' : String(v);
    }
    function descrever() {
      const i = fase.lacunas[foco];
      const antes = vizinho(i - 1);
      const depois = vizinho(i + 1);
      const onde = antes && depois ? `entre ${antes} e ${depois}` : antes ? `depois do ${antes}` : `antes do ${depois}`;
      const v = valores[foco];
      return `Caixote ${i + 1}, ${onde}: ${v === null ? 'vazio' : v}.`;
    }

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') {
        const novo = foco + (t === 'ArrowRight' ? 1 : -1);
        if (novo < 0 || novo >= valores.length) {
          falar(`Não tem mais caixote vazio para ${t === 'ArrowRight' ? 'a direita' : 'a esquerda'}. ${descrever()}`);
        } else {
          foco = novo;
          Sons.passo();
          falar(descrever());
        }
      } else if (t === 'ArrowUp' || t === 'ArrowDown') {
        valores[foco] = girar(opcoes, valores[foco], t === 'ArrowUp' ? 1 : -1);
        Sons.passo();
        falar(`${valores[foco]}.${comBraille(valores[foco])}`);
      } else if (t === 'Backspace') {
        valores[foco] = null;
        Sons.tirou();
        falar('Caixote vazio de novo.');
      } else {
        return false;
      }
      return true;
    }

    const fila = () => fase.itens.map((_, i) => (valorEm(i) === null ? 'vazio' : valorEm(i))).join(', ');

    async function dica(res, tentativa, seq) {
      const a = fase.itens[0];
      await falar(`Os números andam de ${passo} em ${passo}: ${a}, ${a + passo}, ${a + 2 * passo}, e assim por diante.`);
      if (!vivo(seq)) return;
      let txt = res.vazias ? 'Ainda tem caixote vazio.' : `Confira ${res.erradas.length === 1 ? 'o caixote' : 'os caixotes'} ${res.erradas.map((li) => fase.lacunas[li] + 1).join(' e ')}.`;
      if (tentativa >= 2) txt += ` A fila agora está assim: ${fila()}.`;
      falar(txt);
    }

    return {
      tecla, dica,
      ouvir: () => falar(`A fila de caixotes: ${fila()}.`),
      teclas: [['← →', 'passam de um caixote vazio para outro'], ['↑ ↓', 'trocam o número do caixote'], ['⌫', 'esvazia o caixote'], ['O', 'ouvir a fila inteira']],
      instrucao: () => `Os caixotes estão em fila: ${fila()}. Use as setas para a esquerda e para a direita para ir de um caixote vazio para outro, e as setas para cima e para baixo para escolher o número. Os números que você pode usar são ${opcoes.join(', ')}. Quando terminar, aperte Enter. Agora: ${descrever()}`,
      agora: () => descrever(),
      quadro: () => '<p>' + fase.itens.map((_, i) => {
        const li = fase.lacunas.indexOf(i);
        const v = valorEm(i);
        const texto = v === null ? '__' : v;
        return li === foco ? `<span class="foco">${texto}</span>` : li >= 0 ? `<span class="escolha">${texto}</span>` : texto;
      }).join(' · ') + '</p>',
      resposta: () => valores.slice(),
      resumo: () => `A fila completa: ${fase.itens.join(', ')}.`,
    };
  }

  // ---------- Valor: centenas, dezenas e unidades ----------
  function mecValor(fase) {
    const COLUNAS = [
      { nome: 'centenas', u: 'engradado', n: fase.c, conta: ['engradado de 100', 'engradados de 100'] },
      { nome: 'dezenas', u: 'caixa', n: fase.d, conta: ['caixa de 10', 'caixas de 10'] },
      { nome: 'unidades', u: 'solta', n: fase.u, conta: [`${nomeFruta(fase.fruta, 1)} ${solta(fase.fruta, 1)}`, `${nomeFruta(fase.fruta, 2)} ${solta(fase.fruta, 2)}`] },
    ];
    const DIGITOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const valores = [null, null, null];
    let foco = 0;
    const descrever = () => `${COLUNAS[foco].nome[0].toUpperCase()}${COLUNAS[foco].nome.slice(1)}: ${valores[foco] === null ? 'vazio' : valores[foco]}.`;

    function mudar(v) {
      valores[foco] = v;
      Sons.passo();
      falar(`${COLUNAS[foco].nome}: ${v}.${prefs.braille ? ` Em braille, o ${v} é ${descreverPontosDigito(v)}.` : ''}`);
    }

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') {
        foco = Math.max(0, Math.min(2, foco + (t === 'ArrowRight' ? 1 : -1)));
        Sons.passo();
        falar(descrever());
      } else if (t === 'ArrowUp' || t === 'ArrowDown') {
        mudar(girar(DIGITOS, valores[foco], t === 'ArrowUp' ? 1 : -1));
      } else if (/^[0-9]$/.test(t)) {
        mudar(Number(t));
      } else if (t === 'Backspace') {
        valores[foco] = null;
        Sons.tirou();
        falar(descrever());
      } else {
        return false;
      }
      return true;
    }

    async function ouvir(seq) {
      if (semSons()) return;
      for (const c of COLUNAS) {
        await falar(`${c.conta[1][0].toUpperCase()}${c.conta[1].slice(1)}:`);
        if (!vivo(seq)) return;
        if (!c.n) await falar(c.u === 'engradado' || (c.u === 'solta' && masculino(fase.fruta)) ? 'nenhum.' : 'nenhuma.');
        else if (!(await Sons.tocar(Array(c.n).fill({ som: c.u }), c.u === 'solta' ? 380 : 560))) return;
      }
    }

    async function dica(res, tentativa, seq) {
      const partes = COLUNAS.map((c) => `${c.conta[1]}: ${c.n ? contarAte(c.n) : 'nenhum'}`);
      await falar(`Vamos contar cada parte separada. ${partes.join('. ')}.`);
      if (!vivo(seq)) return;
      let txt = 'Os engradados vão nas centenas, as caixas nas dezenas e as soltas nas unidades.';
      if (COLUNAS.some((c) => c.n === 0)) txt += ' Quando não tem nenhum, usamos o zero.';
      if (res.vazias) txt += ' Ainda tem casa vazia na tabela.';
      falar(txt);
    }

    return {
      tecla, ouvir, dica,
      teclas: [['O', 'ouvir engradados, caixas e soltas'], ['← →', 'centenas, dezenas, unidades'], ['↑ ↓ ou 0 a 9', 'escolhem o algarismo']],
      instrucao: () => 'Na barraca tem engradados de 100, caixas de 10 e frutas soltas. Aperte O para ouvir e contar cada parte: o engradado tem um som grave, a caixa um som médio e a fruta solta um som agudo. ' +
        'Depois escreva o número na tabela: use as setas para a esquerda e para a direita para ir para centenas, dezenas ou unidades, e as setas para cima e para baixo, ou as teclas de número, para escolher o algarismo. Quando terminar, aperte Enter. Agora: ' + descrever(),
      agora: () => `${descrever()} A tabela está assim: ${COLUNAS.map((c, i) => `${c.nome} ${valores[i] === null ? 'vazio' : valores[i]}`).join(', ')}.`,
      quadro: () => `<p class="linha-emoji">${'🧺'.repeat(fase.c)} ${'📦'.repeat(fase.d)} ${fase.fruta.repeat(fase.u)}</p>` +
        '<p>' + COLUNAS.map((c, i) => `<span class="${i === foco ? 'foco' : ''}">${c.nome[0].toUpperCase()}: ${valores[i] === null ? '__' : valores[i]}</span>`).join(' · ') + '</p>',
      resposta: () => valores.slice(),
      resumo: () => {
        const n = fase.c * 100 + fase.d * 10 + fase.u;
        return `${n}: ${quantosOuNenhum(fase.c, 'centena', 'centenas')}, ${quantosOuNenhum(fase.d, 'dezena', 'dezenas')} e ${quantosOuNenhum(fase.u, 'unidade', 'unidades')}.${comBraille(n)}`;
      },
    };
  }
  function descreverPontosDigito(d) {
    return brailleFalado(d).split('depois ')[1].replace('.', '');
  }

  // ---------- Par ou ímpar ----------
  function mecParImpar(fase) {
    const lugar = fase.numeros.map(() => null);
    let foco = 0;
    const NOMES = { par: 'par', impar: 'ímpar' };
    const descrever = (i = foco) => `Número ${fase.numeros[i]}: ${lugar[i] ? `está em ${NOMES[lugar[i]]}` : 'ainda sem caixa'}.`;

    function por(tipo) {
      lugar[foco] = tipo;
      Sons.colocou();
      const faltam = lugar.filter((l) => !l).length;
      falar(`${fase.numeros[foco]} foi para ${NOMES[tipo]}.${faltam ? '' : ' Todos os números estão separados. Aperte Enter para conferir.'}`);
    }

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') {
        foco = Math.max(0, Math.min(lugar.length - 1, foco + (t === 'ArrowRight' ? 1 : -1)));
        Sons.passo();
        falar(descrever());
      } else if (t === 'ArrowUp' || t === 'p' || t === 'P') {
        por('par');
      } else if (t === 'ArrowDown' || t === 'i' || t === 'I') {
        por('impar');
      } else if (t === 'Backspace') {
        lugar[foco] = null;
        Sons.tirou();
        falar(descrever());
      } else {
        return false;
      }
      return true;
    }

    // Toca o número em duplas: dois sons juntos, uma pausa... e o que sobra, sozinho.
    function duplas(n) {
      const base = n > 20 ? n % 10 : n;
      const lista = [];
      for (let i = 0; i + 1 < base; i += 2) {
        lista.push({ som: 'solta', intervalo: 150 }, { som: 'solta', intervalo: 550 });
      }
      if (base % 2) lista.push({ som: 'solta', variante: 2, intervalo: 600 });
      return { base, lista };
    }

    async function dica(res, tentativa, seq) {
      const conferir = res.erradas;
      for (const i of conferir.slice(0, 3)) {
        const n = fase.numeros[i];
        const { base, lista } = duplas(n);
        const intro = n > 20 ? `No ${n}, olhe a unidade, o último algarismo: ${base}. Ouça o ${base} em duplas:` : `Ouça o ${n} em duplas:`;
        await falar(intro);
        if (!vivo(seq)) return;
        if (Som.ligado) {
          if (!(await Sons.tocar(lista))) return;
        } else {
          await falar(`${Math.floor(base / 2)} duplas${base % 2 ? ' e sobra 1' : ''}.`);
        }
        if (!vivo(seq)) return;
      }
      let txt = 'Se todos formam duplas, é par. Se sobra um sozinho, é ímpar.';
      if (conferir.length) txt += ` Confira ${conferir.map((i) => `o ${fase.numeros[i]}`).join(', ')}.`;
      falar(txt);
    }

    return {
      tecla, dica,
      ouvir: () => falar(`Os números: ${fase.numeros.map((n, i) => `${n}, ${lugar[i] ? NOMES[lugar[i]] : 'sem caixa'}`).join('; ')}.`),
      teclas: [['← →', 'passam de um número para outro'], ['↑ ou P', 'põe em PAR'], ['↓ ou I', 'põe em ÍMPAR'], ['O', 'ouvir onde está cada número']],
      instrucao: () => `Os números são ${fase.numeros.join(', ')}. Use as setas para a esquerda e para a direita para escolher o número. Seta para cima, ou a letra P, põe em par. Seta para baixo, ou a letra I, põe em ímpar. Quando terminar, aperte Enter. Agora: ${descrever()}`,
      agora: () => descrever(),
      quadro: () => '<p>' + fase.numeros.map((n, i) => `<span class="${i === foco ? 'foco' : ''}">${n}${lugar[i] ? ` → ${lugar[i] === 'par' ? 'PAR' : 'ÍMPAR'}` : ''}</span>`).join(' · ') + '</p>',
      resposta: () => lugar.slice(),
      resumo: () => `Pares: ${fase.numeros.filter(Regras.ehPar).join(', ')}. Ímpares: ${fase.numeros.filter((n) => !Regras.ehPar(n)).join(', ')}.`,
    };
  }

  // ---------- Dinheiro: pagar ou dar troco ----------
  function mecDinheiro(fase) {
    const caixa = fase.caixa.slice().sort((a, b) => b - a);
    const bandeja = [];
    let sel = 0;
    const troco = Boolean(fase.pago);
    const preco = Regras.totalProdutos(fase);
    const somDe = (v) => (v >= 200 ? 'nota' : 'moeda');

    function conteudo() {
      if (!bandeja.length) return 'A bandeja está vazia.';
      const contagem = {};
      bandeja.forEach((v) => { contagem[v] = (contagem[v] || 0) + 1; });
      const partes = Object.keys(contagem).map(Number).sort((a, b) => b - a).map((v) => {
        const n = contagem[v];
        const nome = nomeDinheiro(v);
        return n === 1 ? `1 ${nome}` : `${n} ${nome.replace('nota', 'notas').replace('moeda', 'moedas')}`;
      });
      return `Na bandeja tem ${partes.join(', ')}.`;
    }

    function tecla(t) {
      const v = caixa[sel];
      if (t === 'ArrowLeft' || t === 'ArrowRight') {
        sel = (sel + (t === 'ArrowRight' ? 1 : -1) + caixa.length) % caixa.length;
        Sons[somDe(caixa[sel])]();
        falar(`${nomeDinheiro(caixa[sel])}.`);
      } else if (t === 'ArrowUp') {
        if (bandeja.length >= 30) {
          falar('A bandeja está cheia.');
          return true;
        }
        bandeja.push(v);
        Sons[somDe(v)]();
      } else if (t === 'ArrowDown' || t === 'Backspace') {
        const i = bandeja.indexOf(v);
        if (i < 0) {
          falar(`Não tem ${nomeDinheiro(v)} na bandeja.`);
        } else {
          bandeja.splice(i, 1);
          Sons.tirou();
        }
      } else {
        return false;
      }
      return true;
    }

    const produtos = () => fase.produtos.map((p) => {
      const varios = p.nome.endsWith('s');
      return `${artigo(p.emoji, varios)} ${p.nome} ${varios ? 'custam' : 'custa'} ${valorFalado(p.preco)}`;
    }).join(', e ');

    async function dica(res, tentativa, seq) {
      if (bandeja.length) {
        let soma = 0;
        const parciais = bandeja.slice().sort((a, b) => b - a).map((v) => valorFalado((soma += v)));
        await falar(`Vamos somar o dinheiro da bandeja: ${parciais.join('; ')}.`);
        if (!vivo(seq)) return;
      }
      let txt = `Na bandeja tem ${valorFalado(res.total)}. `;
      if (troco && fase.produtos.length > 1 && tentativa < 2) {
        // Primeiro passo de quem comprou várias coisas: somar a compra (sem dar o total ainda).
        txt += `Primeiro some a compra: ${fase.produtos.map((p) => valorFalado(p.preco)).join(', mais ')}. Depois conte desse total até o que o cliente pagou, ${valorFalado(fase.pago)}.`;
      } else {
        txt += troco
          ? `Para achar o troco, conte do preço, ${valorFalado(preco)}, até o que o cliente pagou, ${valorFalado(fase.pago)}.`
          : `O preço é ${valorFalado(preco)}.`;
      }
      if (tentativa >= 2) {
        const dif = Math.abs(res.alvo - res.total);
        txt += res.total < res.alvo ? ` Falta ${valorFalado(dif)}.` : ` Passou ${valorFalado(dif)}: tire um pouco.`;
      }
      falar(txt);
    }

    return {
      tecla, dica,
      ouvir: () => falar(conteudo()),
      teclas: [['← →', 'escolhem a nota ou a moeda'], ['↑', 'põe na bandeja'], ['↓', 'tira da bandeja'], ['O', 'ouvir o que tem na bandeja']],
      instrucao: () => {
        // Só repete o preço e o pagamento quando o pedido ainda não falou deles.
        let txt = fase.pedido.includes('custa') ? '' : `${produtos()[0].toUpperCase()}${produtos().slice(1)}. `;
        if (troco) txt += `${fase.pedido.includes('pagou') ? '' : `O cliente pagou com ${nomeDinheiro(fase.pago)}. `}Ponha o troco na bandeja. `;
        else txt += 'Ponha na bandeja o dinheiro para pagar. ';
        txt += `No caixa do robô tem: ${caixa.map(nomeDinheiro).join(', ')}. Use as setas para a esquerda e para a direita para escolher. Seta para cima põe na bandeja e seta para baixo tira. Aperte O para ouvir o que tem na bandeja. Quando terminar, aperte Enter.`;
        return txt;
      },
      agora: () => `Escolhido: ${nomeDinheiro(caixa[sel])}. ${conteudo()}`,
      quadro: () => `<p>Caixa: ${caixa.map((v, i) => `<span class="${i === sel ? 'foco' : ''}">${Regras.dinheiro(v)}</span>`).join(' · ')}</p>` +
        `<p>Bandeja: ${bandeja.length ? bandeja.slice().sort((a, b) => b - a).map(Regras.dinheiro).join(' + ') : '(vazia)'}</p>`,
      resposta: () => bandeja.slice(),
      resumo: () => (troco
        ? `${fase.produtos.length > 1 ? `A compra deu ${valorFalado(preco)}. ` : ''}O troco é ${valorFalado(fase.pago)} menos ${valorFalado(preco)}, que dá ${valorFalado(Regras.respostaCerta(fase))}.`
        : `Você pagou ${valorFalado(preco)}.`),
    };
  }

  // ---------- Grupos iguais ----------
  function mecGrupos(fase) {
    const cestas = Array(fase.cestas).fill(0);
    const opcoes = fase.opcoes.slice().sort((a, b) => a - b);
    let resp = null;
    let foco = 0; // 0..cestas-1 = cestas; cestas = resposta
    const fruta = (n) => nomeFruta(fase.fruta, n);
    const naResposta = () => foco === fase.cestas;
    const descrever = () => (naResposta()
      ? `Resposta: quantas ${fruta(2)} ao todo? ${resp === null ? 'Ainda sem cartão' : `Cartão ${resp}`}.`
      : `Cesta ${foco + 1}: ${cestas[foco] ? quantidade(cestas[foco], fruta(1), fruta(2)) : 'vazia'}.`);

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') {
        foco = Math.max(0, Math.min(fase.cestas, foco + (t === 'ArrowRight' ? 1 : -1)));
        Sons.passo();
        falar(descrever());
      } else if ((t === 'ArrowUp' || t === 'ArrowDown') && naResposta()) {
        resp = girar(opcoes, resp, t === 'ArrowUp' ? 1 : -1);
        Sons.passo();
        falar(`Cartão ${resp}.${comBraille(resp)}`);
      } else if (t === 'ArrowUp') {
        if (cestas[foco] >= fase.porCesta + 6) {
          falar('Esta cesta está cheia.');
          return true;
        }
        cestas[foco]++;
        Sons.colocou();
        falar(descrever());
      } else if (t === 'ArrowDown' || t === 'Backspace') {
        if (naResposta()) { resp = null; falar(descrever()); return true; }
        if (!cestas[foco]) {
          falar('Esta cesta já está vazia.');
          return true;
        }
        cestas[foco]--;
        Sons.tirou();
        falar(descrever());
      } else {
        return false;
      }
      return true;
    }

    async function ouvir(seq) {
      if (semSons()) return;
      for (let c = 0; c < fase.cestas; c++) {
        await falar(`Cesta ${c + 1}:`);
        if (!vivo(seq)) return;
        if (!cestas[c]) await falar('vazia.');
        else if (!(await Sons.tocar(Array(cestas[c]).fill({ som: 'solta' })))) return;
      }
    }

    async function dica(res, tentativa, seq) {
      if (res.cestasErradas.length) {
        const ditas = res.cestasErradas.map((c) => `a cesta ${c + 1} tem ${cestas[c] || 'nenhuma'}`);
        falar(`Cada cesta precisa ter ${fase.porCesta} ${fruta(2)}. Confira: ${ditas.join(', ')}.`);
        return;
      }
      const saltos = cestas.map((_, i) => (i + 1) * fase.porCesta);
      await falar(`Todas as cestas estão certas! Vamos contar de ${fase.porCesta} em ${fase.porCesta}, uma cesta de cada vez: ${saltos.join(', ')}.`);
      if (!vivo(seq)) return;
      falar(`O último número é o total. ${res.semTotal ? 'Vá até a resposta, depois da última cesta, e escolha o cartão com as setas para cima e para baixo.' : ''}`);
    }

    return {
      tecla, ouvir, dica,
      teclas: [['← →', 'passam de uma cesta para outra e para a resposta'], ['↑ ↓', 'põem ou tiram fruta; na resposta, trocam o cartão'], ['O', 'ouvir as cestas']],
      instrucao: () => `Tem ${fase.cestas} cestas vazias. Ponha ${fase.porCesta} ${fruta(2)} em cada uma. Use as setas para a esquerda e para a direita para ir de uma cesta para outra, e a seta para cima para pôr ${umOuUma(fase.fruta)} ${fruta(1)}. Depois da última cesta fica a resposta: quantas ${fruta(2)} ao todo. Lá, escolha o cartão com as setas para cima e para baixo. Quando terminar, aperte Enter. Agora: ${descrever()}`,
      agora: () => `${descrever()} ${cestas.map((n, i) => `Cesta ${i + 1}: ${n}`).join(', ')}.`,
      quadro: () => '<p>' + cestas.map((n, i) => `<span class="${i === foco ? 'foco' : ''}">🧺${i + 1}: ${fase.fruta.repeat(n) || '—'}</span>`).join(' · ') + '</p>' +
        `<p><span class="${naResposta() ? 'foco' : ''}">Ao todo: ${resp === null ? '__' : resp}</span> (cartões ${opcoes.join(', ')})</p>`,
      resposta: () => ({ cestas: cestas.slice(), total: resp }),
      resumo: () => `${fase.cestas} vezes ${fase.porCesta} é igual a ${fase.cestas * fase.porCesta}. ${Array(fase.cestas).fill(fase.porCesta).join(' + ')} = ${fase.cestas * fase.porCesta}.`,
    };
  }

  const MECANICAS = {
    sacola: mecSacola, quantos: mecQuantos, comparar: mecComparar, sequencia: mecSequencia,
    valor: mecValor, parimpar: mecParImpar, dinheiro: mecDinheiro, grupos: mecGrupos,
  };

  // =====================================================================
  // Telas e menu
  // =====================================================================
  function mostrarTela(nome) {
    document.querySelectorAll('.tela').forEach((t) => t.classList.remove('ativa'));
    $('#tela-' + nome).classList.add('ativa');
  }

  function proximaFase(ano) {
    const i = ANOS[ano].fases.findIndex((_, k) => !estrelasDe(ano, k));
    return i < 0 ? 0 : i;
  }
  const tituloAno = (ano) => `${ano}º ano`;

  function itensMenu() {
    const ano = prefs.ano;
    const n = proximaFase(ano);
    return [
      { rotulo: `Jogar: ${tituloAno(ano)}, fase ${n + 1}. ${paraFala(ANOS[ano].fases[n].pedido)}`, acao: () => abrirFase(n) },
      {
        ajuste: true,
        rotulo: `Ano: ${tituloAno(ano)}, ${ANOS[ano].subtitulo.toLowerCase()}. Enter troca.`,
        acao: () => { prefs.ano = (prefs.ano % 3) + 1; salvar(); },
      },
      { rotulo: `Escolher outra fase do ${tituloAno(ano)}`, acao: () => abrirListaFases() },
      {
        ajuste: true,
        rotulo: `Voz do jogo: ${prefs.voz ? 'ligada' : 'desligada. O leitor de tela fala'}. Enter troca.`,
        acao: () => { prefs.voz = !prefs.voz; Voz.propria = prefs.voz; salvar(); },
      },
      {
        ajuste: true,
        rotulo: `Sons: ${prefs.sons ? 'ligados' : 'desligados'}. Enter troca.`,
        acao: () => { prefs.sons = !prefs.sons; Som.ligado = prefs.sons; salvar(); if (prefs.sons) Sons.colocou(); },
      },
      {
        ajuste: true,
        rotulo: `Braille: ${prefs.braille ? 'ligado. Falo os pontos dos números' : 'desligado'}. Enter troca.`,
        acao: () => { prefs.braille = !prefs.braille; salvar(); },
      },
      {
        ajuste: true,
        rotulo: estado.confirmandoApagar
          ? 'Tem certeza? Aperte Enter de novo para apagar as estrelas dos três anos, ou Esc para cancelar.'
          : 'Apagar o progresso: as estrelas dos três anos.',
        acao: () => {
          if (!estado.confirmandoApagar) {
            estado.confirmandoApagar = true;
            return;
          }
          estado.confirmandoApagar = false;
          prefs.estrelas = {};
          salvar();
          // Aviso sempre falado: com o leitor de tela, o rótulo novo não conta que apagou.
          return 'Pronto, o progresso foi apagado. O jogo vai começar de novo na fase 1. As outras opções continuam iguais.';
        },
      },
      { rotulo: 'Ajuda: como jogar', acao: () => falar(textoAjuda()) },
    ];
  }

  // Sair da pergunta "Tem certeza?" sem apagar nada.
  function cancelarApagar() {
    if (!estado.confirmandoApagar) return false;
    estado.confirmandoApagar = false;
    desenharMenu(itensMenu(), 'Menu', estado.foco);
    return true;
  }

  function itensFases() {
    const ano = prefs.ano;
    const itens = [{ rotulo: 'Voltar para o menu', acao: () => abrirMenu() }];
    ANOS[ano].fases.forEach((f, i) => {
      const est = estrelasDe(ano, i);
      itens.push({
        rotulo: `Fase ${i + 1}: ${paraFala(f.pedido)}${est ? ` Já feita, ${est} ${est === 1 ? 'estrela' : 'estrelas'}.` : ''}`,
        acao: () => abrirFase(i),
      });
    });
    return itens;
  }

  let ultimoTecladoEm = 0;
  function desenharMenu(itens, titulo, foco) {
    estado.menu = itens;
    estado.foco = Math.min(foco || 0, itens.length - 1);
    $('#titulo-menu').textContent = titulo;
    const lista = $('#lista-menu');
    lista.innerHTML = '';
    itens.forEach((item, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = 'botao';
      b.textContent = item.rotulo;
      b.addEventListener('click', () => {
        // Clique de mouse (professor). O teclado é tratado no keydown.
        if (Date.now() - ultimoTecladoEm < 400) return;
        Som.iniciar();
        estado.foco = i;
        confirmarMenu();
      });
      li.appendChild(b);
      lista.appendChild(li);
    });
    mostrarTela('menu');
    focarMenu(false);
  }

  function focarMenu(anunciar = true) {
    const botoes = document.querySelectorAll('#lista-menu .botao');
    botoes.forEach((b, i) => b.classList.toggle('focado', i === estado.foco));
    botoes[estado.foco].focus();
    // Com o leitor de tela, o próprio foco já é lido: não repetir na região viva.
    if (anunciar) falarMenu(estado.menu[estado.foco].rotulo);
  }

  function falarMenu(texto) {
    estado.ultimaFala = texto;
    if (Voz.propria) Voz.falar(texto);
    else $('#fala').textContent = texto;
  }

  function abrirMenu(foco = 0) {
    novaSequencia();
    estado.tela = 'menu';
    $('#tela-jogo').classList.remove('venceu');
    desenharMenu(itensMenu(), 'Menu', foco);
    falar(`Menu. Use as setas para cima e para baixo para escolher, e Enter para confirmar. ${estado.menu[estado.foco].rotulo}`);
  }

  function abrirListaFases() {
    estado.tela = 'fases';
    desenharMenu(itensFases(), `Fases do ${tituloAno(prefs.ano)}`, proximaFase(prefs.ano) + 1);
    falar(`Escolha a fase com as setas para cima e para baixo. ${estado.menu[estado.foco].rotulo}`);
  }

  function confirmarMenu() {
    const item = estado.menu[estado.foco];
    const aviso = item.acao();
    // Opções que só trocam um ajuste continuam no menu, com o novo texto.
    if (item.ajuste) {
      const foco = estado.foco;
      desenharMenu(itensMenu(), 'Menu', foco);
      if (aviso) falar(aviso);
      else falarMenu(estado.menu[foco].rotulo);
    }
  }

  // ---------- Fase ----------
  function abrirFase(indice) {
    novaSequencia();
    const ano = prefs.ano;
    const fase = ANOS[ano].fases[indice];
    estado.tela = 'jogo';
    estado.indice = indice;
    estado.fase = fase;
    estado.tentativas = 0;
    estado.mec = MECANICAS[fase.tipo](fase);
    mostrarTela('jogo');
    $('#tela-jogo').classList.remove('venceu');
    $('#app').focus();
    $('#titulo-jogo').textContent = `Fase ${indice + 1} de ${ANOS[ano].fases.length}`;
    $('#ano-jogo').textContent = `${tituloAno(ano)} · ${ANOS[ano].subtitulo}`;
    $('#pedido').textContent = `${fase.cliente} ${fase.pedido}`;
    const teclas = estado.mec.teclas.concat([['Enter', 'conferir (Pronto!)'], ['Espaço', 'repete o pedido'], ['H', 'ajuda · Esc menu']]);
    $('#lista-teclas').innerHTML = teclas.map(([k, d]) => `<li><kbd>${k}</kbd> ${d}</li>`).join('');
    desenharQuadro();
    const primeira = indice === 0 && ano === 1 ? 'Na feira, cada fase tem um pedido de um cliente. ' : '';
    falar(`Fase ${indice + 1}. ${primeira}O cliente diz: ${fase.pedido} ${estado.mec.instrucao()}`);
  }

  function desenharQuadro() {
    if (!estado.mec) return;
    $('#quadro').innerHTML = estado.mec.quadro() +
      (prefs.braille && estado.tela === 'vitoria' ? `<p class="braille" aria-hidden="true">${numeroBraille(respostaNumerica())}</p>` : '');
  }

  function respostaNumerica() {
    const certa = Regras.respostaCerta(estado.fase);
    if (typeof certa === 'number') return estado.fase.tipo === 'dinheiro' ? Math.round(certa / 100) : certa;
    if (estado.fase.tipo === 'valor') return certa[0] * 100 + certa[1] * 10 + certa[2];
    if (estado.fase.tipo === 'grupos') return certa.total;
    return 0;
  }

  async function pronto() {
    const seq = novaSequencia();
    const res = Regras.verificar(estado.fase, estado.mec.resposta());
    estado.tentativas++;
    if (res.ok) return vencer();
    Sons.dica();
    await falar('Vamos conferir juntos.');
    if (vivo(seq)) await estado.mec.dica(res, estado.tentativas, seq);
  }

  async function vencer() {
    const ano = prefs.ano;
    const est = Regras.estrelas(estado.tentativas);
    const lista = prefs.estrelas[ano] || [];
    lista[estado.indice] = Math.max(lista[estado.indice] || 0, est);
    prefs.estrelas[ano] = lista;
    salvar();
    estado.tela = 'vitoria';
    $('#tela-jogo').classList.add('venceu');
    desenharQuadro();
    Som.venceu();
    const ultima = estado.indice >= ANOS[ano].fases.length - 1;
    const continuar = ultima
      ? `Você terminou todas as fases do ${tituloAno(ano)}! Aperte Enter para voltar ao menu.`
      : 'Aperte Enter para a próxima fase, ou Esc para o menu.';
    falar(`Muito bem! ${estado.mec.resumo()} Você ganhou ${est} ${est === 1 ? 'estrela' : 'estrelas'}. ${continuar}`);
  }

  function textoAjuda() {
    if (estado.tela === 'jogo' || estado.tela === 'vitoria') {
      return (
        'Ajuda. Escute o pedido do cliente. As setas para a esquerda e para a direita escolhem. ' +
        'As setas para cima e para baixo põem, tiram ou trocam o número. ' +
        'A letra O é de ouvir: toca um som para cada fruta, para você contar. ' +
        'Quando terminar, aperte Enter para conferir. Se ainda não estiver certo, eu dou uma dica, e você continua de onde parou. ' +
        'Espaço repete o pedido. Esc volta para o menu. Não tem pressa: pense com calma.'
      );
    }
    return (
      'Ajuda. No menu, use as setas para cima e para baixo para escolher, e Enter para confirmar. ' +
      'Espaço repete a opção. Esc volta. ' +
      'Se você usa o NVDA, desligue a voz do jogo no menu para as duas vozes não falarem juntas.'
    );
  }

  // ---------- Teclado ----------
  const TECLAS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Backspace', 'Escape'];

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const t = e.key;
    if (!TECLAS.includes(t) && !/^[a-zA-Z0-9]$/.test(t)) return;
    e.preventDefault();
    ultimoTecladoEm = Date.now();
    if (e.repeat) return; // segurar a tecla não repete
    Som.iniciar();
    Sons.iniciar();

    if (estado.tela === 'entrada') {
      if (t === 'Enter' || t === ' ') comecar();
      return;
    }
    if (t === 'h' || t === 'H') return void falar(textoAjuda());

    if (estado.tela === 'menu' || estado.tela === 'fases') {
      if (t === 'Escape' && cancelarApagar()) return void falar('Cancelado. Nada foi apagado.');
      if (t === 'ArrowUp' || t === 'ArrowDown') cancelarApagar();
      if (t === 'ArrowDown') { estado.foco = (estado.foco + 1) % estado.menu.length; focarMenu(); }
      else if (t === 'ArrowUp') { estado.foco = (estado.foco - 1 + estado.menu.length) % estado.menu.length; focarMenu(); }
      else if (t === 'Enter') confirmarMenu();
      else if (t === ' ') falar(`${estado.menu[estado.foco].rotulo}. Use as setas para cima e para baixo, e Enter para escolher.`);
      else if (t === 'Escape' && estado.tela === 'fases') abrirMenu(2);
      else if (t === 'ArrowLeft' || t === 'ArrowRight') falar('No menu, use as setas para cima e para baixo.');
      return;
    }

    // Qualquer tecla interrompe o som ou a dica que estava tocando.
    const seq = novaSequencia();
    if (t === 'Escape') return void abrirMenu();

    if (estado.tela === 'vitoria') {
      if (t === 'Enter') {
        if (estado.indice >= ANOS[prefs.ano].fases.length - 1) abrirMenu();
        else abrirFase(estado.indice + 1);
      } else if (t === ' ') {
        falar(`${estado.mec.resumo()} Aperte Enter para continuar.`);
      } else {
        falar('Você já acertou esta fase! Aperte Enter para continuar, ou Esc para o menu.');
      }
      return;
    }

    const mec = estado.mec;
    if (t === 'Enter') pronto();
    else if (t === ' ') falar(`O pedido é: ${estado.fase.pedido} ${mec.agora()}`);
    else if (t === 'o' || t === 'O') mec.ouvir(seq);
    else if (!mec.tecla(t)) falar('Essa tecla não faz nada aqui. Aperte H para ouvir a ajuda.');
    desenharQuadro();
  });

  function comecar() {
    Som.iniciar();
    Sons.iniciar();
    Sons.colocou();
    estado.tela = 'menu';
    desenharMenu(itensMenu(), 'Menu', 0);
    falar(
      'Olá! Eu sou o robô da feira. Vamos contar, juntar, separar e pagar frutas na minha barraca. ' +
      `Você está no menu. Use as setas para cima e para baixo, e Enter para escolher. ${estado.menu[0].rotulo}`
    );
  }

  $('#btn-comecar').addEventListener('click', () => {
    if (Date.now() - ultimoTecladoEm < 400) return;
    comecar();
  });
})();
