// Robô Letrinha acessível: tudo pelo teclado, com voz, sons e descrições.
(function () {
  const $ = (s) => document.querySelector(s);
  const CHAVE = 'roboLetrinha.acessivel.v1';
  const MAX_COMANDOS = 20;
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

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
    modo: salvo.modo || 'letras',
    braille: !!salvo.braille,
    voz: salvo.voz !== false,
    sons: salvo.sons !== false,
    feitas: Array.isArray(salvo.feitas) ? salvo.feitas : [],
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
    numero: 0,
    fase: null,
    programa: [],
    testados: 0, // comandos que já rodaram sem erro
    robo: null, // { x, y, coletadas, pegas }
    rodando: false,
    execucao: 0,
    ultimaTecla: '',
    ultimaFala: '',
    confirmandoApagar: false,
  };

  // ---------- Fala ----------
  function falar(texto, opcoes) {
    estado.ultimaFala = texto;
    return Voz.falar(texto, opcoes);
  }

  function falada(peca) {
    return peca.length === 1 ? NOMES_LETRAS[peca] || peca : peca.toLowerCase();
  }
  function tipoPeca(peca) {
    return peca.length === 1 ? 'a letra' : 'a sílaba';
  }
  function comBraille(peca) {
    if (!prefs.braille) return falada(peca);
    const letras = [...peca].map((l) => `${NOMES_LETRAS[l] || l}, ${descreverPontos(BRAILLE[l] || [])}`);
    return peca.length === 1 ? letras[0] : `${peca.toLowerCase()}: ${letras.join('; ')}`;
  }
  function soletrar(fase) {
    const pecas = fase.pecas;
    if (pecas.length === 1) return `Só uma peça: ${comBraille(pecas[0])}.`;
    const porLetra = pecas[0].length === 1 && pecas.every((p) => p.length === 1);
    const intro = porLetra ? `Soletrando, letra por letra:` : `Em sílabas:`;
    return `${intro} ${pecas.map(comBraille).join('. ')}.`;
  }
  // Fases de uma peça só são "pegue a letra"; as outras são "forme a palavra".
  function umaPeca(fase) {
    return fase.pecas.length === 1;
  }
  function objetivo(fase) {
    return umaPeca(fase)
      ? `pegue ${tipoPeca(fase.pecas[0])} ${falada(fase.pecas[0])}`
      : `forme a palavra ${fase.item.palavra.toLowerCase()}`;
  }
  function falarPalavra(fase) {
    if (umaPeca(fase)) return `Desta vez, é só uma letra: ${comBraille(fase.pecas[0])}.`;
    const p = fase.item.palavra.toLowerCase();
    const dica = fase.item.dica;
    return `A palavra é ${p}. ${dica[0].toUpperCase()}${dica.slice(1)}. ${soletrar(fase)}`;
  }
  function conquista(fase) {
    return umaPeca(fase)
      ? `Você pegou ${tipoPeca(fase.pecas[0])} ${falada(fase.pecas[0])}`
      : `Você formou a palavra ${fase.item.palavra.toLowerCase()}`;
  }
  function plural(n, um, varios) {
    return `${n === 1 ? 'um' : n} ${n === 1 ? um : varios}`;
  }

  // ---------- Telas ----------
  function mostrarTela(nome) {
    document.querySelectorAll('.tela').forEach((t) => t.classList.remove('ativa'));
    $('#tela-' + nome).classList.add('ativa');
  }

  function proximaFase() {
    const n = FASES.findIndex((_, i) => !prefs.feitas.includes(i));
    return n < 0 ? 0 : n;
  }

  function nomeFase(item) {
    return item.letras.length === 1 ? `a letra ${falada(item.letras[0])}` : item.palavra.toLowerCase();
  }

  function itensMenu() {
    const n = proximaFase();
    const item = ETAPAS[FASES[n].etapa].palavras[FASES[n].indice];
    return [
      { rotulo: `Jogar a fase ${n + 1}: ${nomeFase(item)}`, acao: () => abrirFase(n) },
      { rotulo: 'Escolher outra fase', acao: () => abrirListaFases() },
      {
        ajuste: true,
        rotulo: `Peças: ${prefs.modo === 'letras' ? 'letras, bom para o 1º ano' : 'sílabas, bom para o 2º e o 3º ano'}. Enter troca.`,
        acao: () => { prefs.modo = prefs.modo === 'letras' ? 'silabas' : 'letras'; salvar(); },
      },
      {
        ajuste: true,
        rotulo: `Braille: ${prefs.braille ? 'ligado. Falo os pontos de cada letra' : 'desligado'}. Enter troca.`,
        acao: () => { prefs.braille = !prefs.braille; salvar(); },
      },
      {
        ajuste: true,
        rotulo: `Voz do jogo: ${prefs.voz ? 'ligada' : 'desligada. O leitor de tela fala'}. Enter troca.`,
        acao: () => {
          prefs.voz = !prefs.voz;
          Voz.propria = prefs.voz;
          salvar();
        },
      },
      {
        ajuste: true,
        rotulo: `Sons: ${prefs.sons ? 'ligados' : 'desligados'}. Enter troca.`,
        acao: () => { prefs.sons = !prefs.sons; Som.ligado = prefs.sons; salvar(); if (prefs.sons) Som.certa(); },
      },
      {
        ajuste: true,
        rotulo: estado.confirmandoApagar
          ? 'Tem certeza? Aperte Enter de novo para apagar as fases feitas, ou Esc para cancelar.'
          : 'Apagar o progresso: as fases feitas.',
        acao: () => {
          if (!estado.confirmandoApagar) {
            estado.confirmandoApagar = true;
            return;
          }
          estado.confirmandoApagar = false;
          prefs.feitas = [];
          salvar();
          // Aviso sempre falado: com o leitor de tela, o rótulo novo não conta que apagou.
          return 'Pronto, o progresso foi apagado. O jogo vai começar de novo na fase 1. As outras opções continuam iguais.';
        },
      },
      { rotulo: 'Ajuda: como jogar', acao: () => falar(textoAjuda()) },
    ];
  }

  function itensFases() {
    const itens = [{ rotulo: 'Voltar para o menu', acao: () => abrirMenu() }];
    FASES.forEach((f, n) => {
      const etapa = ETAPAS[f.etapa];
      const item = etapa.palavras[f.indice];
      const feita = prefs.feitas.includes(n) ? ' Já feita.' : '';
      itens.push({
        rotulo: `Fase ${n + 1}: ${nomeFase(item)}. Etapa ${f.etapa + 1}.${feita}`,
        acao: () => abrirFase(n),
      });
    });
    return itens;
  }

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
    estado.tela = 'menu';
    desenharMenu(itensMenu(), 'Menu', foco);
    const atual = estado.menu[estado.foco].rotulo;
    falar(`Menu. Use as setas para cima e para baixo para escolher, e Enter para confirmar. ${atual}`);
  }

  function abrirListaFases() {
    estado.tela = 'fases';
    desenharMenu(itensFases(), 'Escolher fase', proximaFase() + 1);
    falar(`Escolha a fase com as setas para cima e para baixo. ${estado.menu[estado.foco].rotulo}`);
  }

  function confirmarMenu() {
    const item = estado.menu[estado.foco];
    const aviso = item.acao();
    // Opções que só trocam um ajuste continuam no menu, com o novo texto.
    // Com o leitor de tela, o novo foco já é lido; a voz do jogo só fala se estiver ligada.
    if (item.ajuste) {
      const foco = estado.foco;
      desenharMenu(itensMenu(), 'Menu', foco);
      if (aviso) falar(aviso);
      else if (Voz.propria) falar(estado.menu[foco].rotulo);
    }
  }

  // Sair da pergunta "Tem certeza?" sem apagar nada.
  function cancelarApagar() {
    if (!estado.confirmandoApagar) return false;
    estado.confirmandoApagar = false;
    desenharMenu(itensMenu(), 'Menu', estado.foco);
    return true;
  }

  // ---------- Fase ----------
  function abrirFase(numero) {
    estado.tela = 'jogo';
    estado.numero = numero;
    estado.fase = gerarFase(numero, prefs.modo);
    estado.programa = [];
    estado.testados = 0;
    estado.robo = simular(estado.fase, []).estado;
    mostrarTela('jogo');
    $('#app').focus();
    desenharJogo();

    const fase = estado.fase;
    const etapa = ETAPAS[fase.etapa];
    let texto = `Fase ${numero + 1}. ${etapa.nome}. ${falarPalavra(fase)} `;
    if (numero === 0) {
      texto +=
        'Cada seta é um comando, e o robô anda uma casa para cada comando. ' +
        'Aperte L para saber onde está a letra. Depois aperte uma seta e o Enter.';
    } else {
      texto += 'Aperte L para saber onde estão as peças.';
    }
    falar(texto);
  }

  function desenharJogo() {
    const fase = estado.fase;
    $('#titulo-jogo').textContent = `Fase ${estado.numero + 1}: ${fase.item.palavra}`;
    $('#etapa-jogo').textContent = ETAPAS[fase.etapa].nome;
    desenharEncaixes();
    desenharTabuleiro();
    desenharPrograma();
  }

  function desenharEncaixes() {
    const lista = $('#encaixes');
    lista.innerHTML = '';
    estado.fase.pecas.forEach((p, i) => {
      const li = document.createElement('li');
      li.className = i < estado.robo.coletadas ? 'cheio' : i === estado.robo.coletadas ? 'proximo' : '';
      li.innerHTML = `<span>${p}</span>` + (prefs.braille ? `<small aria-hidden="true">${[...p].map(caractereBraille).join('')}</small>` : '');
      lista.appendChild(li);
    });
  }

  function desenharTabuleiro(destaque) {
    const fase = estado.fase;
    const tab = $('#tabuleiro');
    tab.style.setProperty('--n', fase.tamanho);
    tab.innerHTML = '';
    const precisa = fase.pecas[estado.robo.coletadas];
    for (let y = 0; y < fase.tamanho; y++) {
      for (let x = 0; x < fase.tamanho; x++) {
        const casa = document.createElement('div');
        casa.className = 'casa';
        const ai = fase.alvos.findIndex((p, i) => p.x === x && p.y === y && !estado.robo.pegas.has('a' + i));
        const d = fase.distratores.find((p) => p.x === x && p.y === y);
        const peca = ai >= 0 ? fase.alvos[ai] : d;
        if (peca) {
          const el = document.createElement('div');
          el.className = 'peca';
          if (ai >= 0 && peca.texto === precisa) el.classList.add('proxima');
          if (destaque && destaque.x === x && destaque.y === y) el.classList.add('errada');
          el.innerHTML = `<span>${peca.texto}</span>` + (prefs.braille ? `<small>${[...peca.texto].map(caractereBraille).join('')}</small>` : '');
          casa.appendChild(el);
        }
        if (estado.robo.x === x && estado.robo.y === y) {
          const r = document.createElement('div');
          r.className = 'robo' + (destaque && destaque.parede ? ' bateu' : '');
          r.textContent = '🤖';
          casa.appendChild(r);
        }
        tab.appendChild(casa);
      }
    }
  }

  function desenharPrograma(ativo, erro) {
    const lista = $('#programa');
    lista.innerHTML = '';
    if (!estado.programa.length) {
      const li = document.createElement('li');
      li.className = 'vazio';
      li.textContent = 'vazio';
      lista.appendChild(li);
      return;
    }
    estado.programa.forEach((dir, i) => {
      const li = document.createElement('li');
      li.textContent = `${DIRECOES[dir].seta} ${DIRECOES[dir].nome}`;
      if (i < estado.testados) li.classList.add('testado');
      if (i === ativo) li.classList.add('ativo');
      if (i === erro) li.classList.add('erro');
      lista.appendChild(li);
    });
  }

  // ---------- Comandos do aluno ----------
  function adicionar(dir) {
    Som.direcao(dir);
    if (estado.programa.length >= MAX_COMANDOS) {
      falar(`O programa já tem ${MAX_COMANDOS} comandos. Aperte Enter para o robô andar.`);
      return;
    }
    estado.programa.push(dir);
    desenharPrograma();
    falar(`${DIRECOES[dir].nome}. Comando ${estado.programa.length}.`);
  }

  function apagar() {
    if (!estado.programa.length) {
      falar('O programa já está vazio. Aperte uma seta para pôr um comando.');
      return;
    }
    const dir = estado.programa.pop();
    Som.apagou();
    if (estado.testados > estado.programa.length) {
      estado.testados = estado.programa.length;
      estado.robo = simular(estado.fase, estado.programa).estado;
      desenharTabuleiro();
      desenharEncaixes();
    }
    desenharPrograma();
    const n = estado.programa.length;
    falar(`Apaguei: ${DIRECOES[dir].nome}. ${n ? `Agora o programa tem ${plural(n, 'comando', 'comandos')}.` : 'O programa ficou vazio.'}`);
  }

  function descreverProgramaFalado() {
    const n = estado.programa.length;
    if (!n) return 'Seu programa está vazio.';
    return `Seu programa tem ${plural(n, 'comando', 'comandos')}: ${estado.programa.map((d) => DIRECOES[d].nome).join(', ')}.`;
  }

  function instrucaoAtual() {
    if (estado.tela === 'vitoria') {
      const ultima = estado.numero >= FASES.length - 1;
      return `${conquista(estado.fase)}. Aperte Enter para ${ultima ? 'voltar ao menu' : 'ir para a próxima fase'}.`;
    }
    const fase = estado.fase;
    const precisa = fase.pecas[estado.robo.coletadas];
    const pegas = fase.pecas.slice(0, estado.robo.coletadas);
    const alvo = objetivo(fase);
    let texto = `${alvo[0].toUpperCase()}${alvo.slice(1)}. `;
    if (pegas.length) texto += `Já pegou: ${pegas.map(falada).join(', ')}. `;
    if (!umaPeca(fase)) texto += `Agora pegue ${tipoPeca(precisa)} ${falada(precisa)}. `;
    texto += `${descreverProgramaFalado()} `;
    texto += 'Setas põem comandos, Enter faz o robô andar, L diz onde estão as peças.';
    return texto;
  }

  // L: onde está o robô e as peças, sempre em relação ao robô.
  function descreverLugar(completo) {
    const fase = estado.fase;
    const r = estado.robo;
    const partes = [descreverParedes(fase.tamanho, r.x, r.y)];
    const precisa = fase.pecas[r.coletadas];
    const restantes = fase.alvos.filter((p, i) => !r.pegas.has('a' + i));
    const distancia = (p) => Math.abs(p.x - r.x) + Math.abs(p.y - r.y);
    const proxima = restantes.filter((p) => p.texto === precisa).sort((a, b) => distancia(a) - distancia(b))[0];
    partes.push(`A próxima peça, ${tipoPeca(precisa)} ${falada(precisa)}, está ${descreverDistancia(proxima.x - r.x, proxima.y - r.y)} do robô.`);

    const outras = [...restantes.filter((p) => p !== proxima), ...fase.distratores];
    if (outras.length && !completo) {
      partes.push(`Tem mais ${plural(outras.length, 'peça', 'peças')} no tabuleiro. Aperte L de novo para ouvir onde estão.`);
    } else if (outras.length) {
      outras.forEach((p) => {
        const fora = !fase.pecas.includes(p.texto) ? ', que não faz parte da palavra,' : '';
        partes.push(`${tipoPeca(p.texto).replace(/^a/, 'A')} ${falada(p.texto)}${fora} está ${descreverDistancia(p.x - r.x, p.y - r.y)}.`);
      });
    }
    return partes.join(' ');
  }

  // ---------- Execução ----------
  async function executar() {
    const fase = estado.fase;
    if (!estado.programa.length) {
      falar('O programa ainda está vazio. Aperte uma seta para pôr um comando.');
      return;
    }
    const minhaExecucao = ++estado.execucao;
    const cancelada = () => minhaExecucao !== estado.execucao;
    estado.rodando = true;
    estado.robo = simular(fase, []).estado;
    desenharTabuleiro();
    desenharEncaixes();
    await falar('Lá vai o robô!');
    if (cancelada()) return;

    const programa = estado.programa.slice();
    const r = simular(fase, programa);
    const andando = { x: fase.inicio.x, y: fase.inicio.y, coletadas: 0, pegas: new Set() };
    estado.robo = andando;
    let destaque = null;

    for (const ev of r.eventos) {
      if (cancelada()) return;
      if (ev.tipo === 'andou') {
        andando.x = ev.x;
        andando.y = ev.y;
        desenharPrograma(ev.comando);
        desenharTabuleiro();
        Som.andou(ev.dir);
        await esperar(650);
      } else if (ev.tipo === 'pegou') {
        andando.pegas.add(ev.id);
        andando.coletadas++;
        desenharTabuleiro();
        desenharEncaixes();
        Som.certa();
        await esperar(250);
        await falar(`Pegou ${comBraille(ev.texto)}!`);
      } else if (ev.tipo === 'parede') {
        destaque = { x: andando.x, y: andando.y, parede: true };
        desenharPrograma(null, ev.comando);
        desenharTabuleiro(destaque);
        Som.parede(ev.dir);
        await esperar(500);
      } else if (ev.tipo === 'errada') {
        destaque = { x: andando.x, y: andando.y };
        desenharPrograma(null, ev.comando);
        desenharTabuleiro(destaque);
        Som.errada();
        await esperar(600);
      }
    }
    if (cancelada()) return;
    estado.rodando = false;

    if (r.fim === 'venceu') {
      vencer();
      return;
    }
    if (r.fim === 'acabou') {
      estado.testados = programa.length;
      estado.robo = r.estado;
      desenharPrograma();
      const falta = fase.pecas[r.estado.coletadas];
      falar(`O robô fez todos os comandos. Ainda falta pegar ${tipoPeca(falta)} ${falada(falta)}. Continue o programa com mais setas. Aperte L para saber onde ela está.`);
      return;
    }

    // Erro: guarda os comandos que deram certo e tira só o que deu problema.
    const i = r.comando;
    const nome = DIRECOES[programa[i]].nome;
    const ultimo = r.eventos[r.eventos.length - 1];
    const motivo =
      r.fim === 'parede'
        ? 'o robô bateu na parede'
        : `o robô chegou ${tipoPeca(ultimo.texto).replace(/^a /, 'na ')} ${falada(ultimo.texto)}, ` +
          `mas agora precisa ${tipoPeca(ultimo.precisa).replace(/^a /, 'da ')} ${falada(ultimo.precisa)}`;
    const sobra = programa.length - i - 1;
    estado.programa = programa.slice(0, i);
    estado.testados = i;
    estado.robo = simular(fase, estado.programa).estado;
    desenharTabuleiro();
    desenharEncaixes();
    desenharPrograma();
    const guardados = i === 0 ? 'Tirei esse comando.' : `Guardei ${i === 1 ? 'o primeiro comando, que deu certo' : `os ${i} primeiros comandos, que deram certo`}.`;
    const depois = sobra > 0 ? ` Os comandos que vinham depois também saíram.` : '';
    falar(`Opa! No comando ${i + 1}, ${nome}, ${motivo}. Tudo bem! ${guardados}${depois} Tente outra seta.`);
  }

  async function vencer() {
    const fase = estado.fase;
    estado.tela = 'vitoria';
    if (!prefs.feitas.includes(estado.numero)) prefs.feitas.push(estado.numero);
    salvar();
    estado.testados = estado.programa.length;
    desenharPrograma();
    $('#tela-jogo').classList.add('venceu');
    Som.venceu();
    const ultima = estado.numero >= FASES.length - 1;
    const continuar = ultima
      ? 'Você terminou todas as fases! Aperte Enter para voltar ao menu.'
      : 'Aperte Enter para ir para a próxima fase.';
    const numero = estado.numero;
    await esperar(900);
    if (estado.tela !== 'vitoria' || estado.numero !== numero) return; // o aluno já seguiu em frente
    falar(`Parabéns! ${conquista(fase)}! ${umaPeca(fase) ? '' : soletrar(fase)} Você usou ${plural(estado.programa.length, 'comando', 'comandos')}. ${continuar}`);
  }

  function textoAjuda() {
    if (estado.tela === 'jogo' || estado.tela === 'vitoria') {
      return (
        'Ajuda. O robô precisa pegar as peças da palavra, na ordem certa. ' +
        'As setas põem comandos no programa: cada seta faz o robô andar uma casa. ' +
        'Enter faz o robô andar. Backspace apaga o último comando. ' +
        'Espaço repete a instrução. L diz onde estão as peças. P fala a palavra de novo. ' +
        'Esc volta para o menu. Não tem pressa: pense com calma.'
      );
    }
    return (
      'Ajuda. No menu, use as setas para cima e para baixo para escolher, e Enter para confirmar. ' +
      'Espaço repete a opção. Esc volta. ' +
      'Se você usa o NVDA, desligue a voz do jogo no menu para as duas vozes não falarem juntas.'
    );
  }

  // ---------- Teclado ----------
  let ultimoTecladoEm = 0;
  const SETAS = { ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita' };

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const tecla = e.key;
    const ehNossa = tecla in SETAS || ['Enter', ' ', 'Backspace', 'Escape'].includes(tecla) || /^[hHlLpP]$/.test(tecla);
    if (!ehNossa) return;
    e.preventDefault();
    ultimoTecladoEm = Date.now();
    if (e.repeat) return; // segurar a tecla não repete comandos
    Som.iniciar();

    if (estado.tela === 'entrada') {
      if (tecla === 'Enter' || tecla === ' ') comecar();
      return;
    }

    if (tecla === 'h' || tecla === 'H') return void falar(textoAjuda());

    if (estado.tela === 'menu' || estado.tela === 'fases') {
      if (tecla === 'Escape' && cancelarApagar()) return void falar('Cancelado. Nada foi apagado.');
      if (tecla === 'ArrowUp' || tecla === 'ArrowDown') cancelarApagar();
      if (tecla === 'ArrowDown') { estado.foco = (estado.foco + 1) % estado.menu.length; focarMenu(); }
      else if (tecla === 'ArrowUp') { estado.foco = (estado.foco - 1 + estado.menu.length) % estado.menu.length; focarMenu(); }
      else if (tecla === 'Enter') confirmarMenu();
      else if (tecla === ' ') falar(`${estado.menu[estado.foco].rotulo}. Use as setas para cima e para baixo, e Enter para escolher.`);
      else if (tecla === 'Escape' && estado.tela === 'fases') abrirMenu(1);
      else if (tecla === 'ArrowLeft' || tecla === 'ArrowRight') falar('No menu, use as setas para cima e para baixo.');
      return;
    }

    if (tecla === 'Escape') {
      estado.execucao++;
      estado.rodando = false;
      $('#tela-jogo').classList.remove('venceu');
      abrirMenu();
      return;
    }
    if (estado.rodando) return; // espera o robô terminar; não há limite de tempo

    if (estado.tela === 'vitoria') {
      if (tecla === 'Enter') {
        $('#tela-jogo').classList.remove('venceu');
        if (estado.numero >= FASES.length - 1) abrirMenu();
        else abrirFase(estado.numero + 1);
      } else if (tecla === ' ') falar(instrucaoAtual());
      else if (tecla === 'p' || tecla === 'P') falar(falarPalavra(estado.fase));
      else falar('Você já venceu esta fase! ' + instrucaoAtual());
      return;
    }

    if (tecla in SETAS) adicionar(SETAS[tecla]);
    else if (tecla === 'Enter') executar();
    else if (tecla === 'Backspace') apagar();
    else if (tecla === ' ') falar(instrucaoAtual());
    else if (tecla === 'p' || tecla === 'P') falar(falarPalavra(estado.fase));
    else if (tecla === 'l' || tecla === 'L') {
      const completo = estado.ultimaTecla === 'l';
      falar(descreverLugar(completo));
      estado.ultimaTecla = completo ? '' : 'l';
      return;
    }
    estado.ultimaTecla = '';
  });

  function comecar() {
    Som.iniciar();
    Som.certa();
    estado.tela = 'menu';
    desenharMenu(itensMenu(), 'Menu', 0);
    falar(
      'Olá! Eu sou o Robô Letrinha. Vamos formar palavras programando o robô. ' +
      `Você está no menu. Use as setas para cima e para baixo, e Enter para escolher. ${estado.menu[0].rotulo}`
    );
  }

  $('#btn-comecar').addEventListener('click', () => {
    if (Date.now() - ultimoTecladoEm < 400) return;
    comecar();
  });
})();
