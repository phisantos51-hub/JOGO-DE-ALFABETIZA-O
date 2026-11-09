// Atacado do Robô acessível (multiplicação e divisão, só no 3º ano):
// as mesmas fases de ../js/atacado-fases.js, jogadas só pelo teclado, com voz
// e com sons para contar ouvindo. As teclas são as mesmas do resto da Feira:
//   ← →  passam de um grupo para outro (e para a resposta, no fim)
//   ↑ ↓  põem ou tiram frutas; na resposta, trocam o número (ou o cartão)
//   0 a 9 escrevem o número da resposta (nas fases de digitar)
//   R    dá 1 fruta para cada (nas fases de repartir)
//   O    ouvir: toca um som para cada fruta, grupo por grupo
//   Enter confere   Espaço repete   H ajuda   Esc menu
// O jogo acessível (jogo.js) chama AtacadoAcessivel(api) e recebe uma mecânica para cada tipo.
// eslint-disable-next-line no-unused-vars
function AtacadoAcessivel(api) {
  const { falar, vivo, semSons, comBraille, girar, contarAte } = api;

  // [singular, plural, feminino]
  const RECIPIENTES = {
    cesta: ['cesta', 'cestas', true], caixa: ['caixa', 'caixas', true], pacote: ['pacote', 'pacotes', false],
    prato: ['prato', 'pratos', false], cliente: ['cliente', 'clientes', false],
  };
  const rec = (tipo) => RECIPIENTES[tipo] || RECIPIENTES.cesta;
  const Maiuscula = (t) => t[0].toUpperCase() + t.slice(1);
  const nomeGrupo = (tipo, i) => `${Maiuscula(rec(tipo)[0])} ${i + 1}`;
  const fruta = (f, n) => nomeFruta(f, n);
  const qtd = (f, n) => (n ? quantidade(n, fruta(f, 1), fruta(f, 2)) : `nenhum${masculino(f) ? '' : 'a'} ${fruta(f, 1)}`);

  // Sons de vários grupos: um som por fruta, cada grupo com uma altura, e uma pausa entre eles.
  function sonsGrupos(lista) {
    const sons = [];
    lista.forEach((n, g) => {
      for (let i = 0; i < n; i++) sons.push({ som: 'solta', variante: g % 3 });
      sons.push({ pausa: 500 });
    });
    return sons;
  }
  async function ouvirGrupos(seq, nomes, lista) {
    if (semSons()) return;
    for (let g = 0; g < lista.length; g++) {
      await falar(`${nomes(g)}:`);
      if (!vivo(seq)) return;
      if (!lista[g]) await falar('vazio.');
      else if (!(await Sons.tocar(Array(lista[g]).fill({ som: 'solta', variante: g % 3 })))) return;
      if (!vivo(seq)) return;
    }
  }

  // ---------- Resposta: cartões (↑ ↓) ou número digitado (0 a 9, ↑ ↓) ----------
  function criarResposta(fase, n) {
    const valores = Array(n).fill(null);
    const opcoes = fase.digitar ? null : fase.opcoes.slice().sort((a, b) => a - b);
    const digitando = Array(n).fill(false);
    return {
      valores,
      parar() { digitando.fill(false); },
      descrever: (i) => (valores[i] === null ? 'vazio' : String(valores[i])),
      ajuda: () => (opcoes
        ? `escolha o cartão com as setas para cima e para baixo. Os cartões são ${opcoes.join(', ')}`
        : 'escreva o número com as teclas de número, ou use as setas para cima e para baixo. Backspace apaga'),
      tecla(t, i) {
        if (t === 'ArrowUp' || t === 'ArrowDown') {
          const passo = t === 'ArrowUp' ? 1 : -1;
          if (opcoes) valores[i] = girar(opcoes, valores[i], passo);
          else valores[i] = valores[i] === null ? (passo > 0 ? 1 : 0) : Math.max(0, Math.min(999, valores[i] + passo));
          digitando[i] = false;
          Sons.passo();
          falar(`${valores[i]}.${comBraille(valores[i])}`);
          return true;
        }
        if (/^[0-9]$/.test(t)) {
          if (opcoes) {
            falar(`Nesta fase, escolha o cartão com as setas para cima e para baixo. Os cartões são ${opcoes.join(', ')}.`);
            return true;
          }
          const antes = digitando[i] && valores[i] !== null ? String(valores[i]) : '';
          valores[i] = Number((antes + t).slice(-3));
          digitando[i] = true;
          Sons.passo();
          falar(`${valores[i]}.`);
          return true;
        }
        if (t === 'Backspace') {
          valores[i] = null;
          digitando[i] = false;
          Sons.tirou();
          falar('Apagado. Vazio.');
          return true;
        }
        return false;
      },
    };
  }

  // Foco: ← → passam pelas posições (grupos e respostas).
  function moverFoco(atual, total, t, descrever) {
    const novo = Math.max(0, Math.min(total - 1, atual + (t === 'ArrowRight' ? 1 : -1)));
    if (novo === atual) falar(`${t === 'ArrowRight' ? 'Este é o último' : 'Este é o primeiro'}. ${descrever(novo)}`);
    else { Sons.passo(); falar(descrever(novo)); }
    return novo;
  }
  const marcar = (ativo, html) => `<span class="${ativo ? 'foco' : ''}">${html}</span>`;

  // =====================================================================
  // MONTAR: grupos iguais, dobro e triplo
  // =====================================================================
  function mecMontar(fase) {
    const grupos = Array(fase.grupos).fill(0);
    if (fase.modelo) grupos[0] = fase.porGrupo;
    const [um, varios, fem] = rec(fase.recipiente);
    const resp = criarResposta(fase, 1);
    const total = fase.grupos * fase.porGrupo;
    let foco = fase.modelo ? 1 : 0;
    const naResposta = () => foco === fase.grupos;
    const fixo = (c) => Boolean(fase.modelo) && c === 0;
    const conta = () => `${fase.nome ? `o ${fase.nome} de ${fase.porGrupo}, que é ` : ''}${fase.grupos} vezes ${fase.porGrupo}`;
    const descrever = (f = foco) => (f === fase.grupos
      ? `Resposta: ${conta()} é igual a ${resp.descrever(0)}.`
      : `${fixo(f) ? 'O que o cliente já levou' : nomeGrupo(fase.recipiente, f)}: ${grupos[f] ? qtd(fase.fruta, grupos[f]) : (fem ? 'vazia' : 'vazio')}.`);

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') { resp.parar(); foco = moverFoco(foco, fase.grupos + 1, t, descrever); return true; }
      if (naResposta()) return resp.tecla(t, 0);
      if (/^[0-9]$/.test(t)) { falar('Para escrever a resposta, vá até depois do último grupo, com a seta para a direita.'); return true; }
      if (fixo(foco) && (t === 'ArrowUp' || t === 'ArrowDown' || t === 'Backspace')) {
        falar(`Esse já está pronto: ${qtd(fase.fruta, fase.porGrupo)}. Use a seta para a direita.`);
        return true;
      }
      if (t === 'ArrowUp') {
        if (grupos[foco] >= fase.porGrupo + 6) { falar(`${fem ? 'Esta' : 'Este'} ${um} está ${fem ? 'cheia' : 'cheio'}.`); return true; }
        grupos[foco]++;
        Sons.colocou();
        falar(descrever());
      } else if (t === 'ArrowDown' || t === 'Backspace') {
        if (!grupos[foco]) { falar(`${fem ? 'Esta' : 'Este'} ${um} já está ${fem ? 'vazia' : 'vazio'}.`); return true; }
        grupos[foco]--;
        Sons.tirou();
        falar(descrever());
      } else {
        return false;
      }
      return true;
    }

    async function dica(res, tentativa, seq) {
      if (!fase.digitar && res.gruposErrados.length) {
        const ditas = res.gruposErrados.map((c) => `${fem ? 'a' : 'o'} ${um} ${c + 1} tem ${grupos[c] || (fem ? 'nenhuma' : 'nenhum')}`);
        falar(`Cada ${um} precisa ter ${fase.porGrupo} ${fruta(fase.fruta, 2)}. Confira: ${ditas.join(', ')}.`);
        return;
      }
      const saltos = grupos.map((_, i) => (i + 1) * fase.porGrupo);
      await falar(`Vamos contar de ${fase.porGrupo} em ${fase.porGrupo}, ${fem ? 'uma' : 'um'} ${um} de cada vez: ${saltos.join(', ')}.`);
      if (!vivo(seq)) return;
      falar(`${fase.nome ? `O ${fase.nome} é ${fase.grupos} vezes a mesma quantidade. ` : ''}O último número é o total.${res.semTotal ? ' Vá até a resposta, depois do último, e escreva o número.' : ''}`);
    }

    return {
      tecla, dica,
      ouvir: (seq) => ouvirGrupos(seq, (g) => (fixo(g) ? 'O que o cliente já levou' : nomeGrupo(fase.recipiente, g)), grupos),
      teclas: [['← →', `passam de ${fem ? 'uma' : 'um'} ${um} para outro e para a resposta`], ['↑ ↓', 'põem ou tiram fruta; na resposta, trocam o número'], ['O', `ouvir ${fem ? 'as' : 'os'} ${varios}`]],
      instrucao: () => {
        let txt = fase.modelo
          ? `O cliente já levou ${qtd(fase.fruta, fase.porGrupo)}: está no primeiro ${um}. O ${fase.nome} é ${fase.grupos} vezes essa quantidade. Ponha ${fase.porGrupo} ${fruta(fase.fruta, 2)} em ${fase.grupos === 2 ? 'mais um' : `mais ${fase.grupos - 1}`} ${fase.grupos === 2 ? um : varios}. `
          : `Tem ${fase.grupos} ${varios} ${fem ? 'vazias' : 'vazios'}. Ponha ${fase.porGrupo} ${fruta(fase.fruta, 2)} em cada ${um}. `;
        txt += `Use as setas para a esquerda e para a direita para passar de ${fem ? 'uma' : 'um'} ${um} para outro, e a seta para cima para pôr ${umOuUma(fase.fruta)} ${fruta(fase.fruta, 1)}. `;
        txt += `Depois do último fica a resposta: ${conta()} é igual a quanto? Lá, ${resp.ajuda()}. Quando terminar, aperte Enter. Agora: ${descrever()}`;
        return txt;
      },
      agora: () => `${descrever()} ${grupos.map((n, i) => `${fixo(i) ? 'Já levou' : nomeGrupo(fase.recipiente, i)}: ${n}`).join(', ')}. A soma: ${grupos.join(' mais ')}.`,
      quadro: () => '<p>' + grupos.map((n, i) => marcar(i === foco, `${i + 1}: ${fase.fruta.repeat(n) || '—'}`)).join(' · ') + '</p>' +
        `<p>${grupos.join(' + ')} = ${grupos.reduce((a, b) => a + b, 0)}</p>` +
        `<p>${marcar(naResposta(), `${fase.grupos} × ${fase.porGrupo} = ${resp.valores[0] === null ? '__' : resp.valores[0]}`)}</p>`,
      resposta: () => ({ grupos: grupos.slice(), total: resp.valores[0] }),
      resumo: () => `${fase.nome ? `O ${fase.nome} de ${fase.porGrupo} é ${total}. ` : ''}${fase.grupos} vezes ${fase.porGrupo} é igual a ${total}. ${Array(fase.grupos).fill(fase.porGrupo).join(' + ')} = ${total}.${comBraille(total)}`,
    };
  }

  // =====================================================================
  // PARCELAS: 3 + 3 + 3 + 3 = 4 × 3
  // =====================================================================
  function mecParcelas(fase) {
    const [um, varios] = rec(fase.recipiente);
    const resp = criarResposta(fase, 4);
    const total = fase.grupos * fase.porGrupo;
    const NOMES = ['o resultado da soma', `quantos ${varios}`, `quantas ${fruta(fase.fruta, 2)} em cada ${um}`, 'o total da multiplicação'];
    let foco = 0;
    const v = (i) => (resp.valores[i] === null ? 'vazio' : resp.valores[i]);
    const m = (i) => marcar(foco === i, resp.valores[i] === null ? '__' : resp.valores[i]);
    const soma = () => Array(fase.grupos).fill(fase.porGrupo).join(' mais ');
    const descrever = (f = foco) => `${Maiuscula(NOMES[f])}: ${v(f)}. ${f === 0 ? `A soma é ${soma()}, igual a ${v(0)}.` : `A multiplicação é ${v(1)} vezes ${v(2)}, igual a ${v(3)}.`}`;

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') { resp.parar(); foco = moverFoco(foco, 4, t, descrever); return true; }
      return resp.tecla(t, foco);
    }

    async function dica(res, tentativa, seq) {
      await falar(`Primeiro, vamos contar ${varios}: ${contarAte(fase.grupos)}. São ${fase.grupos} ${varios}.`);
      if (!vivo(seq)) return;
      await falar(`Agora vamos somar, de ${fase.porGrupo} em ${fase.porGrupo}: ${Array.from({ length: fase.grupos }, (_, i) => (i + 1) * fase.porGrupo).join(', ')}.`);
      if (!vivo(seq)) return;
      falar(`Somar o ${fase.porGrupo} ${fase.grupos} vezes é o mesmo que ${fase.grupos} vezes ${fase.porGrupo}.${res.vazias ? ' Ainda tem espaço vazio.' : ''} Confira: ${res.erradas.map((i) => NOMES[i]).join(', ')}.`);
    }

    return {
      tecla, dica,
      ouvir: (seq) => ouvirGrupos(seq, (g) => nomeGrupo(fase.recipiente, g), Array(fase.grupos).fill(fase.porGrupo)),
      teclas: [['← →', 'passam pelos espaços da soma e da multiplicação'], ['↑ ↓', 'trocam o número'], ['O', `ouvir os ${varios}`]],
      instrucao: () => `O robô montou ${fase.grupos} ${varios} com ${qtd(fase.fruta, fase.porGrupo)} em cada. Aperte O para ouvir. Complete a soma: ${soma()} é igual a quanto? E a multiplicação: quantos ${varios}, vezes quantas em cada, é igual ao total. Use as setas para a esquerda e para a direita para passar de um espaço para outro, e ${resp.ajuda()}. Quando terminar, aperte Enter. Agora: ${descrever()}`,
      agora: () => descrever(),
      quadro: () => `<p class="linha-emoji">${Array(fase.grupos).fill(fase.fruta.repeat(fase.porGrupo)).join(' | ')}</p>` +
        `<p>${Array(fase.grupos).fill(fase.porGrupo).join(' + ')} = ${m(0)}</p>` +
        `<p>${m(1)} × ${m(2)} = ${m(3)}</p>`,
      resposta: () => resp.valores.slice(),
      resumo: () => `${Array(fase.grupos).fill(fase.porGrupo).join(' + ')} = ${total}. É o mesmo que ${fase.grupos} vezes ${fase.porGrupo}, igual a ${total}.${comBraille(total)}`,
    };
  }

  // =====================================================================
  // RETÂNGULO: fileiras na banca
  // =====================================================================
  function mecRetangulo(fase) {
    let linhas = 0;
    const resp = criarResposta(fase, 1);
    const total = fase.linhas * fase.colunas;
    let foco = 0; // 0 = banca, 1 = resposta
    const descrever = (f = foco) => (f === 1
      ? `Resposta: ${linhas} ${linhas === 1 ? 'fileira' : 'fileiras'} de ${fase.colunas}: quanto dá ao todo? ${resp.descrever(0)}.`
      : `Banca: ${linhas ? `${linhas} ${linhas === 1 ? 'fileira' : 'fileiras'} com ${fase.colunas} ${fruta(fase.fruta, 2)}` : 'vazia'}.`);

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') { resp.parar(); foco = moverFoco(foco, 2, t, descrever); return true; }
      if (foco === 1) return resp.tecla(t, 0);
      if (/^[0-9]$/.test(t)) { falar('Para escrever a resposta, aperte a seta para a direita.'); return true; }
      if (t === 'ArrowUp') {
        if (linhas >= fase.linhas + 3) { falar('A banca está cheia.'); return true; }
        linhas++;
        Sons.colocou();
        Sons.tocar(Array(fase.colunas).fill({ som: 'solta', intervalo: 90 }));
        falar(descrever());
      } else if (t === 'ArrowDown' || t === 'Backspace') {
        if (!linhas) { falar('A banca já está vazia.'); return true; }
        linhas--;
        Sons.tirou();
        falar(descrever());
      } else {
        return false;
      }
      return true;
    }

    async function dica(res, tentativa, seq) {
      if (!res.linhasOk && !fase.digitar) {
        falar(`Agora tem ${linhas} ${linhas === 1 ? 'fileira' : 'fileiras'}. O pedido é ${fase.linhas} fileiras com ${fase.colunas} em cada.`);
        return;
      }
      if (!res.linhasOk) {
        linhas = fase.linhas;
        await falar(`O robô arrumou ${fase.linhas} fileiras na banca para você ouvir.`);
        if (!vivo(seq)) return;
      }
      await falar(`Vamos contar de ${fase.colunas} em ${fase.colunas}, uma fileira de cada vez: ${Array.from({ length: fase.linhas }, (_, i) => (i + 1) * fase.colunas).join(', ')}.`);
      if (!vivo(seq)) return;
      falar(`O último número é o total.${res.semTotal ? ' Aperte a seta para a direita para ir até a resposta.' : ''}`);
    }

    return {
      tecla, dica,
      ouvir: (seq) => ouvirGrupos(seq, (g) => `Fileira ${g + 1}`, Array(linhas).fill(fase.colunas)).then(() => { if (!linhas) falar('A banca está vazia.'); }),
      teclas: [['↑ ↓', 'põem ou tiram uma fileira; na resposta, trocam o número'], ['← →', 'banca ou resposta'], ['O', 'ouvir as fileiras']],
      instrucao: () => `Na barraca tem fileiras prontas, cada uma com ${fase.colunas} ${fruta(fase.fruta, 2)}. A seta para cima põe uma fileira na banca, e a seta para baixo tira. Ponha ${fase.linhas} fileiras. ${fase.digitar ? 'Nesta fase você também pode responder direto, sem montar. ' : ''}Depois aperte a seta para a direita para ir até a resposta: quantas ${fruta(fase.fruta, 2)} ao todo? Lá, ${resp.ajuda()}. Quando terminar, aperte Enter. Agora: ${descrever()}`,
      agora: () => descrever(),
      quadro: () => `<p>${marcar(foco === 0, 'Banca:')}</p>` + (linhas ? Array(linhas).fill(`<p class="linha-emoji">${fase.fruta.repeat(fase.colunas)}</p>`).join('') : '<p>(vazia)</p>') +
        `<p>${marcar(foco === 1, `${linhas} × ${fase.colunas} = ${resp.valores[0] === null ? '__' : resp.valores[0]}`)}</p>`,
      resposta: () => ({ linhas, total: resp.valores[0] }),
      resumo: () => `${fase.linhas} fileiras com ${fase.colunas} em cada: ${fase.linhas} vezes ${fase.colunas} é igual a ${total}.${comBraille(total)}`,
    };
  }

  // =====================================================================
  // CONTAS: tabuadas e contas misturadas
  // =====================================================================
  function mecContas(fase) {
    const lista = fase.contas.map((c) => ({ texto: c, ...Regras.conta(c) }));
    const resp = criarResposta(fase, lista.length);
    let foco = 0;
    const falada = (c) => (c.op === '×' ? `${c.a} vezes ${c.b}` : `${c.a} dividido por ${c.b}`);
    const descrever = (f = foco) => `Conta ${f + 1} de ${lista.length}: ${falada(lista[f])} é igual a ${resp.descrever(f)}.`;

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') { resp.parar(); foco = moverFoco(foco, lista.length, t, descrever); return true; }
      return resp.tecla(t, foco);
    }

    async function ouvir(seq) {
      if (semSons()) return;
      const c = lista[foco];
      if (c.op === '×') {
        await falar(`${falada(c)}: ${c.a} grupos com ${c.b} em cada. Conte!`);
        if (vivo(seq)) await Sons.tocar(sonsGrupos(Array(c.a).fill(c.b)));
      } else {
        await falar(`${falada(c)}: ${c.a} ${fruta(fase.fruta, 2)} repartidas em ${c.b} pratos. Ouça um prato e conte!`);
        if (vivo(seq)) await Sons.tocar(Array(c.resultado).fill({ som: 'solta' }));
      }
    }

    async function dica(res, tentativa, seq) {
      const i = res.erradas[0];
      const c = lista[i];
      foco = i;
      if (c.op === '×') {
        await falar(`Confira a conta ${i + 1}: ${falada(c)}. Conte de ${c.b} em ${c.b}, ${c.a} vezes: ${Array.from({ length: c.a }, (_, k) => (k + 1) * c.b).join(', ')}.`);
      } else {
        await falar(`Confira a conta ${i + 1}: ${falada(c)}. Pense: ${c.b} vezes quanto dá ${c.a}? Aperte O para ouvir um prato e contar.`);
      }
      if (!vivo(seq)) return;
      if (res.erradas.length > 1) falar(`Confira também ${res.erradas.length === 2 ? 'a conta' : 'as contas'} ${res.erradas.slice(1).map((k) => k + 1).join(' e ')}.`);
    }

    return {
      tecla, dica, ouvir,
      teclas: [['← →', 'passam de uma conta para outra'], ['0 a 9 ou ↑ ↓', 'escrevem o resultado'], ['O', 'ouvir a conta em sons']],
      instrucao: () => `São ${lista.length} contas: ${lista.map(falada).join('; ')}. Use as setas para a esquerda e para a direita para passar de uma conta para outra, e ${resp.ajuda()}. Aperte O para ouvir a conta em sons e contar. Quando terminar, aperte Enter. Agora: ${descrever()}`,
      agora: () => descrever(),
      quadro: () => lista.map((c, i) => `<p>${marcar(i === foco, `${c.texto} = ${resp.valores[i] === null ? '__' : resp.valores[i]}`)}</p>`).join(''),
      resposta: () => resp.valores.slice(),
      resumo: () => lista.map((c) => `${falada(c)} é igual a ${c.resultado}`).join('. ') + '.',
    };
  }

  // =====================================================================
  // REPARTIR: um para cada, até acabar (partes e a divisão que sobra)
  // =====================================================================
  function mecRepartir(fase) {
    const grupos = Array(fase.grupos).fill(0);
    let monte = fase.total;
    const [um, varios, fem] = rec(fase.recipiente);
    const certa = Regras.repartir(fase.total, fase.grupos);
    const comSobra = certa.sobra > 0;
    const nResp = comSobra ? 2 : 1;
    const resp = criarResposta(fase, nResp);
    const parte = fase.parte ? Regras.nomeParte(fase.grupos) : null;
    let foco = 0; // 0..grupos-1 = grupos; depois, as respostas
    const naResposta = () => foco >= fase.grupos;
    const pergunta = (r) => {
      if (parte) return `a ${parte} de ${fase.total}, que é ${fase.total} dividido por ${fase.grupos}`;
      if (comSobra) return r === 0 ? `${fase.total} dividido por ${fase.grupos}: quantas em cada ${um}` : 'quantas sobram, fora das cestas';
      return `${fase.total} dividido por ${fase.grupos}: quanto cada ${um} recebe`;
    };
    const noMonte = () => (monte ? `No monte: ${monte}.` : 'O monte acabou.');
    const descrever = (f = foco) => (f >= fase.grupos
      ? `Resposta: ${pergunta(f - fase.grupos)}. ${resp.descrever(f - fase.grupos)}.`
      : `${nomeGrupo(fase.recipiente, f)}: ${grupos[f] ? qtd(fase.fruta, grupos[f]) : (fem ? 'vazia' : 'vazio')}. ${noMonte()}`);

    function rodada() {
      if (monte >= fase.grupos) {
        grupos.forEach((_, c) => { grupos[c]++; });
        monte -= fase.grupos;
        Sons.tocar(Array(fase.grupos).fill({ som: 'solta', intervalo: 120 }));
        falar(`Cada ${um} recebeu 1. ${noMonte()}`);
      } else if (monte > 0) {
        falar(`Agora tem só ${monte} no monte: não dá para dar 1 para cada. ${monte === 1 ? 'Essa fica fora' : 'Essas ficam fora'}.`);
      } else {
        falar('O monte já acabou.');
      }
    }

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') { resp.parar(); foco = moverFoco(foco, fase.grupos + nResp, t, descrever); return true; }
      if (t === 'r' || t === 'R') { rodada(); return true; }
      if (naResposta()) return resp.tecla(t, foco - fase.grupos);
      if (/^[0-9]$/.test(t)) { falar('Para escrever a resposta, vá até depois do último, com a seta para a direita.'); return true; }
      if (t === 'ArrowUp') {
        if (!monte) { falar('O monte acabou.'); return true; }
        monte--;
        grupos[foco]++;
        Sons.colocou();
        falar(descrever());
      } else if (t === 'ArrowDown' || t === 'Backspace') {
        if (!grupos[foco]) { falar(`${fem ? 'Esta' : 'Este'} ${um} não tem fruta.`); return true; }
        grupos[foco]--;
        monte++;
        Sons.tirou();
        falar(`Voltou para o monte. ${descrever()}`);
      } else {
        return false;
      }
      return true;
    }

    async function dica(res, tentativa, seq) {
      if (!res.repartiu && !fase.digitar) {
        if (res.monte >= fase.grupos) {
          falar(`Ainda tem ${res.monte} no monte. Dá para dar mais 1 para cada! Aperte R, ou ponha uma de cada vez com a seta para cima.`);
          return;
        }
        const ditas = grupos.map((n, c) => `${nomeGrupo(fase.recipiente, c)}: ${n}`);
        let txt = `Vamos conferir: ${ditas.join(', ')}. Todos precisam receber a mesma quantidade.`;
        if (tentativa >= 2) txt += ` Dica: cada ${um} fica com ${certa.cada}.`;
        falar(txt);
        return;
      }
      if (!res.repartiu) {
        grupos.fill(certa.cada);
        monte = certa.sobra;
        await falar('O robô repartiu as frutas, uma para cada, até acabar.');
        if (!vivo(seq)) return;
      }
      await falar(`Vamos contar ${fem ? 'a' : 'o'} ${um} 1: ${contarAte(grupos[0])}.`);
      if (!vivo(seq)) return;
      let txt = `Cada ${um} ficou com a mesma quantidade. Esse número é o resultado de ${fase.total} dividido por ${fase.grupos}.`;
      if (parte) txt = `A ${parte} é o que fica em 1 dos ${fase.grupos} pratos iguais. ` + txt;
      if (comSobra) txt += ` As que ficaram no monte são a sobra: ${monte}.`;
      falar(txt);
    }

    return {
      tecla, dica,
      ouvir: async (seq) => {
        if (semSons()) return;
        await falar(monte ? `No monte tem ${monte}:` : 'O monte acabou.');
        if (!vivo(seq)) return;
        if (monte && !(await Sons.tocar(Array(monte).fill({ som: 'solta', variante: 2 }), 300))) return;
        await ouvirGrupos(seq, (g) => nomeGrupo(fase.recipiente, g), grupos);
      },
      teclas: [['← →', `passam de ${fem ? 'uma' : 'um'} ${um} para outro e para a resposta`], ['↑ ↓', 'dão uma fruta ou devolvem ao monte; na resposta, trocam o número'], ['R', 'dá 1 para cada'], ['O', 'ouvir o monte e cada grupo']],
      instrucao: () => {
        let txt = `No monte tem ${qtd(fase.fruta, fase.total)}. Tem ${fase.grupos} ${varios}. Reparta igualmente: a seta para cima dá ${umOuUma(fase.fruta)} ${fruta(fase.fruta, 1)} ${fem ? 'à' : 'ao'} ${um} escolhido, e a letra R dá 1 para cada. As setas para a esquerda e para a direita escolhem ${fem ? 'a' : 'o'} ${um}. `;
        if (comSobra) txt += `Se no fim sobrar fruta que não dá para repartir, ela fica fora das ${varios}. `;
        if (fase.digitar) txt += 'Nesta fase você também pode responder direto, sem repartir. ';
        txt += `Depois do último ${um} fica a resposta: ${pergunta(0)}${comSobra ? ', e depois, quantas sobram' : ''}. Lá, ${resp.ajuda()}. Quando terminar, aperte Enter. Agora: ${descrever()}`;
        return txt;
      },
      agora: () => `${descrever()} ${grupos.map((n, c) => `${nomeGrupo(fase.recipiente, c)}: ${n}`).join(', ')}. ${noMonte()}`,
      quadro: () => `<p>Monte: <span class="linha-emoji">${fase.fruta.repeat(monte) || '—'}</span></p>` +
        '<p>' + grupos.map((n, i) => marcar(i === foco, `${i + 1}: ${fase.fruta.repeat(n) || '—'}`)).join(' · ') + '</p>' +
        `<p>${fase.total} ÷ ${fase.grupos} = ${marcar(foco === fase.grupos, resp.valores[0] === null ? '__' : resp.valores[0])}${comSobra ? ` e sobra ${marcar(foco === fase.grupos + 1, resp.valores[1] === null ? '__' : resp.valores[1])}` : ''}</p>`,
      resposta: () => ({ grupos: grupos.slice(), monte, respostas: resp.valores.slice() }),
      resumo: () => (comSobra
        ? `${fase.total} dividido por ${fase.grupos} dá ${certa.cada} em cada ${um}, e sobra ${certa.sobra}. ${fase.grupos} vezes ${certa.cada} é ${fase.grupos * certa.cada}, mais ${certa.sobra}, dá ${fase.total}.`
        : `${parte ? `A ${parte} de ${fase.total} é ${certa.cada}. ` : ''}${fase.total} dividido por ${fase.grupos} é igual a ${certa.cada}. E ${fase.grupos} vezes ${certa.cada} é igual a ${fase.total}.${comBraille(certa.cada)}`),
    };
  }

  // =====================================================================
  // CABEM: quantas caixas dá para montar
  // =====================================================================
  function mecCabem(fase) {
    const caixas = [];
    let monte = fase.total;
    const resp = criarResposta(fase, 1);
    const q = fase.total / fase.porCaixa;
    let foco = 0; // caixas..., depois "caixa nova", depois resposta
    const posNova = () => caixas.length;
    const posResp = () => caixas.length + 1;
    const descrever = (f = foco) => {
      if (f === posResp()) return `Resposta: ${fase.total} dividido por ${fase.porCaixa}: quantas caixas? ${resp.descrever(0)}.`;
      if (f === posNova()) return `Pegar uma caixa vazia. Aperte a seta para cima. Caixas no balcão: ${caixas.length}. No monte: ${monte}.`;
      return `Caixa ${f + 1}: ${caixas[f] ? qtd(fase.fruta, caixas[f]) : 'vazia'}${caixas[f] === fase.porCaixa ? ', cheia' : ''}. No monte: ${monte}.`;
    };

    function tecla(t) {
      if (t === 'ArrowLeft' || t === 'ArrowRight') { resp.parar(); foco = moverFoco(foco, caixas.length + 2, t, descrever); return true; }
      if (foco === posResp()) return resp.tecla(t, 0);
      if (/^[0-9]$/.test(t)) { falar('Para escrever a resposta, vá até o fim, com a seta para a direita.'); return true; }
      if (foco === posNova()) {
        if (t !== 'ArrowUp') { falar('Aqui, a seta para cima pega uma caixa vazia.'); return true; }
        if (caixas.length >= q + 2) { falar('O balcão está cheio de caixas.'); return true; }
        caixas.push(0);
        foco = caixas.length - 1;
        Sons.caixa();
        falar(`Peguei a caixa ${caixas.length}. Ela está vazia. Cabem ${fase.porCaixa}. Aperte a seta para cima para pôr ${fruta(fase.fruta, 2)}.`);
        return true;
      }
      if (t === 'ArrowUp') {
        if (!monte) { falar('O monte acabou.'); return true; }
        if (caixas[foco] >= fase.porCaixa) { falar(`A caixa ${foco + 1} está cheia. Pegue outra caixa, depois da última.`); return true; }
        monte--;
        caixas[foco]++;
        Sons.colocou();
        falar(caixas[foco] === fase.porCaixa ? `Caixa ${foco + 1} cheia, com ${fase.porCaixa}! No monte: ${monte}.` : descrever());
      } else if (t === 'ArrowDown' || t === 'Backspace') {
        if (!caixas[foco]) {
          caixas.splice(foco, 1);
          Sons.tirou();
          falar(`Tirei a caixa vazia. ${descrever()}`);
          return true;
        }
        caixas[foco]--;
        monte++;
        Sons.tirou();
        falar(descrever());
      } else {
        return false;
      }
      return true;
    }

    async function dica(res, tentativa, seq) {
      if (!res.montou && !fase.digitar) {
        if (res.monte > 0) falar(`Ainda tem ${res.monte} fora das caixas. Cada caixa leva ${fase.porCaixa}. Complete as caixas ou pegue mais uma caixa vazia, depois da última.`);
        else falar(`Cada caixa precisa ficar cheia, com ${fase.porCaixa}. Confira: ${caixas.map((n, i) => `caixa ${i + 1}: ${n}`).join(', ')}.`);
        return;
      }
      if (!res.montou) {
        caixas.length = 0;
        for (let i = 0; i < q; i++) caixas.push(fase.porCaixa);
        monte = 0;
        await falar('O robô montou as caixas para você.');
        if (!vivo(seq)) return;
      }
      await falar(`Vamos contar as caixas: ${contarAte(caixas.length)}.`);
      if (!vivo(seq)) return;
      falar(`Quantas vezes o ${fase.porCaixa} cabe no ${fase.total}? O último número que contamos é a resposta.`);
    }

    return {
      tecla, dica,
      ouvir: async (seq) => {
        if (semSons()) return;
        if (!caixas.length) return void falar(`Ainda não tem caixa no balcão. No monte tem ${monte}.`);
        await ouvirGrupos(seq, (g) => `Caixa ${g + 1}`, caixas);
        if (vivo(seq)) falar(`No monte: ${monte}.`);
      },
      teclas: [['← →', 'passam pelas caixas, pela caixa nova e pela resposta'], ['↑ ↓', 'põem ou tiram; na caixa nova, pegam uma caixa'], ['O', 'ouvir as caixas']],
      instrucao: () => `No monte tem ${qtd(fase.fruta, fase.total)}. Cada caixa leva ${fase.porCaixa}. O balcão começa sem caixas: aperte a seta para cima para pegar uma caixa vazia, e depois a seta para cima de novo para pôr ${fruta(fase.fruta, 2)} nela. Quando uma caixa encher, aperte a seta para a direita para pegar outra. ${fase.digitar ? 'Nesta fase você também pode responder direto. ' : ''}No fim fica a resposta: quantas caixas? Lá, ${resp.ajuda()}. Quando terminar, aperte Enter.`,
      agora: () => descrever(),
      quadro: () => `<p>Monte: <span class="linha-emoji">${fase.fruta.repeat(monte) || '—'}</span></p>` +
        '<p>' + caixas.map((n, i) => marcar(i === foco, `📦${i + 1}: ${fase.fruta.repeat(n) || '—'}`)).concat([marcar(foco === posNova(), '+ caixa nova')]).join(' · ') + '</p>' +
        `<p>${marcar(foco === posResp(), `${fase.total} ÷ ${fase.porCaixa} = ${resp.valores[0] === null ? '__' : resp.valores[0]}`)}</p>`,
      resposta: () => ({ caixas: caixas.slice(), monte, total: resp.valores[0] }),
      resumo: () => `${fase.total} dividido por ${fase.porCaixa} é igual a ${q}: ${q} caixas com ${fase.porCaixa} em cada. E ${q} vezes ${fase.porCaixa} é igual a ${fase.total}.${comBraille(q)}`,
    };
  }

  // =====================================================================
  // RELAÇÃO: se 4 × 3 = 12, então 12 ÷ 3 = 4 e 12 ÷ 4 = 3
  // =====================================================================
  function mecRelacao(fase) {
    const t = fase.grupos * fase.porGrupo;
    const resp = criarResposta(fase, 2);
    let foco = 0;
    const contas = [`${t} dividido por ${fase.porGrupo}`, `${t} dividido por ${fase.grupos}`];
    const descrever = (f = foco) => `${Maiuscula(contas[f])} é igual a ${resp.descrever(f)}.`;

    function tecla(k) {
      if (k === 'ArrowLeft' || k === 'ArrowRight') { resp.parar(); foco = moverFoco(foco, 2, k, descrever); return true; }
      return resp.tecla(k, foco);
    }

    async function dica(res, tentativa, seq) {
      if (res.erradas.includes(0)) {
        foco = 0;
        await falar(`${contas[0]}: quantos grupos de ${fase.porGrupo} cabem em ${t}? Vamos contar as cestas: ${contarAte(fase.grupos)}.`);
      } else {
        foco = 1;
        await falar(`${contas[1]}: ${t} repartidas em ${fase.grupos} cestas. Vamos contar uma cesta: ${contarAte(fase.porGrupo)}.`);
      }
      if (!vivo(seq)) return;
      falar(`A multiplicação e a divisão são da mesma família: se ${fase.grupos} vezes ${fase.porGrupo} é igual a ${t}, os mesmos números aparecem na divisão.`);
    }

    return {
      tecla, dica,
      ouvir: (seq) => ouvirGrupos(seq, (g) => `Cesta ${g + 1}`, Array(fase.grupos).fill(fase.porGrupo)),
      teclas: [['← →', 'passam de uma divisão para a outra'], ['0 a 9 ou ↑ ↓', 'escrevem o resultado'], ['O', 'ouvir as cestas']],
      instrucao: () => `O robô montou ${fase.grupos} cestas com ${qtd(fase.fruta, fase.porGrupo)} em cada. ${fase.grupos} vezes ${fase.porGrupo} é igual a ${t}. Agora descubra: ${contas[0]}, e ${contas[1]}. Use as setas para a esquerda e para a direita para passar de uma conta para a outra, e ${resp.ajuda()}. Aperte O para ouvir as cestas. Quando terminar, aperte Enter. Agora: ${descrever()}`,
      agora: () => `${fase.grupos} vezes ${fase.porGrupo} é igual a ${t}. ${descrever()}`,
      quadro: () => `<p class="linha-emoji">${Array(fase.grupos).fill(fase.fruta.repeat(fase.porGrupo)).join(' | ')}</p><p>${fase.grupos} × ${fase.porGrupo} = ${t} ✅</p>` +
        [0, 1].map((i) => `<p>${marcar(i === foco, `${t} ÷ ${i ? fase.grupos : fase.porGrupo} = ${resp.valores[i] === null ? '__' : resp.valores[i]}`)}</p>`).join(''),
      resposta: () => resp.valores.slice(),
      resumo: () => `${fase.grupos} vezes ${fase.porGrupo} é igual a ${t}. Então ${t} dividido por ${fase.porGrupo} é igual a ${fase.grupos}, e ${t} dividido por ${fase.grupos} é igual a ${fase.porGrupo}.`,
    };
  }

  return {
    montar: mecMontar, parcelas: mecParcelas, retangulo: mecRetangulo, contas: mecContas,
    repartir: mecRepartir, cabem: mecCabem, relacao: mecRelacao,
  };
}
