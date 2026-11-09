// Regras da Feira do Robô: contas, conferência das respostas e formatação.
// Não mexe na tela, por isso também roda nos testes (node).
(function (raiz) {
  const VALOR_UNIDADE = { solta: 1, caixa: 10, engradado: 100 };

  function totalSacola(s) {
    return (s.engradado || 0) * 100 + (s.caixa || 0) * 10 + (s.solta || 0);
  }

  function decompor(n) {
    return { engradado: Math.floor(n / 100), caixa: Math.floor((n % 100) / 10), solta: n % 10 };
  }

  // Conteúdo inicial da sacola, agrupado só nas unidades que a fase usa.
  function sacolaInicial(fase) {
    const n = fase.inicial || 0;
    const u = fase.unidades;
    if (u.includes('engradado')) return decompor(n);
    if (u.includes('caixa')) return { engradado: 0, caixa: Math.floor(n / 10), solta: n % 10 };
    return { engradado: 0, caixa: 0, solta: n };
  }

  // Quando juntam 10 soltas, viram 1 caixa; 10 caixas viram 1 engradado.
  // Devolve a lista de trocas feitas, para a tela animar.
  function empacotar(s, unidades) {
    const trocas = [];
    if (unidades.includes('caixa')) {
      while (s.solta >= 10) { s.solta -= 10; s.caixa++; trocas.push('caixa'); }
    }
    if (unidades.includes('engradado')) {
      while (s.caixa >= 10) { s.caixa -= 10; s.engradado++; trocas.push('engradado'); }
    }
    return trocas;
  }

  function dinheiro(centavos) {
    const reais = Math.floor(centavos / 100);
    const cent = centavos % 100;
    return 'R$ ' + reais + ',' + String(cent).padStart(2, '0');
  }

  function totalProdutos(fase) {
    return fase.produtos.reduce((soma, p) => soma + p.preco, 0);
  }

  function ehPar(n) { return n % 2 === 0; }

  // ---------- Atacado do Robô (multiplicação e divisão) ----------
  // "3 × 4" ou "12 ÷ 4" → { a, op, b, resultado }
  function conta(texto) {
    const m = String(texto).match(/^\s*(\d+)\s*([×÷])\s*(\d+)\s*$/);
    if (!m) throw new Error('conta inválida: ' + texto);
    const a = Number(m[1]);
    const b = Number(m[3]);
    return { a, op: m[2], b, resultado: m[2] === '×' ? a * b : a / b };
  }
  // Repartir: quanto fica em cada grupo e quanto sobra.
  function repartir(total, grupos) {
    return { cada: Math.floor(total / grupos), sobra: total % grupos };
  }
  // Nome da parte: 2 → metade, 3 → terça parte...
  const NOMES_PARTE = { 2: 'metade', 3: 'terça parte', 4: 'quarta parte', 5: 'quinta parte', 10: 'décima parte' };
  function nomeParte(grupos) { return NOMES_PARTE[grupos] || null; }

  // Resposta certa de cada fase, no mesmo formato que a tela entrega.
  function respostaCerta(fase) {
    switch (fase.tipo) {
      case 'sacola': return fase.alvo;
      case 'quantos': return fase.grupos.reduce((s, g) => s + g.n, 0);
      case 'comparar': {
        const { a, b } = fase;
        if (a.n === b.n) return 'igual';
        const aMaior = a.n > b.n;
        return (fase.pergunta === 'mais') === aMaior ? 'a' : 'b';
      }
      case 'sequencia': return fase.lacunas.map((i) => fase.itens[i]);
      case 'valor': return [fase.c, fase.d, fase.u];
      case 'parimpar': return fase.numeros.map((n) => (ehPar(n) ? 'par' : 'impar'));
      case 'dinheiro': return fase.pago ? fase.pago - totalProdutos(fase) : totalProdutos(fase);
      case 'grupos': return { cestas: Array(fase.cestas).fill(fase.porCesta), total: fase.cestas * fase.porCesta };
      // Atacado do Robô
      case 'montar': return { grupos: Array(fase.grupos).fill(fase.porGrupo), total: fase.grupos * fase.porGrupo };
      case 'parcelas': {
        const t = fase.grupos * fase.porGrupo;
        return [t, fase.grupos, fase.porGrupo, t];
      }
      case 'retangulo': return { linhas: fase.linhas, total: fase.linhas * fase.colunas };
      case 'contas': return fase.contas.map((c) => conta(c).resultado);
      case 'repartir': {
        const r = repartir(fase.total, fase.grupos);
        return { grupos: Array(fase.grupos).fill(r.cada), monte: r.sobra, respostas: r.sobra ? [r.cada, r.sobra] : [r.cada] };
      }
      case 'cabem': {
        const n = fase.total / fase.porCaixa;
        return { caixas: Array(n).fill(fase.porCaixa), monte: 0, total: n };
      }
      case 'relacao': {
        const t = fase.grupos * fase.porGrupo;
        return [t / fase.porGrupo, t / fase.grupos];
      }
      default: throw new Error('tipo de fase desconhecido: ' + fase.tipo);
    }
  }

  // Confere uma lista de números: devolve os índices errados e quantos estão vazios.
  function conferirLista(certa, r) {
    const erradas = [];
    certa.forEach((v, i) => { if (r[i] !== v) erradas.push(i); });
    return { erradas, vazias: certa.filter((_, i) => r[i] === null || r[i] === undefined).length };
  }

  // Confere a resposta. Devolve { ok, ... } com detalhes para a dica.
  function verificar(fase, r) {
    const certa = respostaCerta(fase);
    switch (fase.tipo) {
      case 'sacola': {
        const total = totalSacola(r);
        return { ok: total === certa, total, alvo: certa };
      }
      case 'quantos':
        return { ok: r === certa, vazio: r === null || r === undefined, alvo: certa };
      case 'comparar':
        return { ok: r === certa, vazio: !r };
      case 'sequencia':
      case 'valor':
      case 'parimpar': {
        const erradas = [];
        certa.forEach((v, i) => { if (r[i] !== v) erradas.push(i); });
        return { ok: erradas.length === 0, erradas, vazias: r.filter((v) => v === null || v === undefined).length };
      }
      case 'dinheiro': {
        const total = r.reduce((s, v) => s + v, 0);
        return { ok: total === certa, total, alvo: certa };
      }
      case 'grupos': {
        const cestasErradas = [];
        r.cestas.forEach((n, i) => { if (n !== fase.porCesta) cestasErradas.push(i); });
        const totalOk = r.total === certa.total;
        return { ok: cestasErradas.length === 0 && totalOk, cestasErradas, totalOk, semTotal: r.total === null };
      }
      // ---------- Atacado do Robô ----------
      // Nas fases com "digitar", mexer nas frutas é só ajuda: vale a resposta.
      case 'montar': {
        const gruposErrados = [];
        r.grupos.forEach((n, i) => { if (n !== fase.porGrupo) gruposErrados.push(i); });
        const totalOk = r.total === certa.total;
        const montou = gruposErrados.length === 0;
        return { ok: totalOk && (montou || Boolean(fase.digitar)), gruposErrados, totalOk, semTotal: r.total === null || r.total === undefined };
      }
      case 'parcelas': {
        // A multiplicação vale nas duas ordens (4 × 3 ou 3 × 4).
        const ordem = r[1] === fase.porGrupo && r[2] === fase.grupos ? [certa[0], fase.porGrupo, fase.grupos, certa[3]] : certa;
        const c = conferirLista(ordem, r);
        return { ok: c.erradas.length === 0, ...c };
      }
      case 'retangulo': {
        const linhasOk = r.linhas === fase.linhas;
        const totalOk = r.total === certa.total;
        return { ok: totalOk && (linhasOk || Boolean(fase.digitar)), linhasOk, totalOk, semTotal: r.total === null || r.total === undefined };
      }
      case 'contas':
      case 'relacao': {
        const c = conferirLista(certa, r);
        return { ok: c.erradas.length === 0, ...c };
      }
      case 'repartir': {
        const gruposErrados = [];
        r.grupos.forEach((n, i) => { if (n !== certa.grupos[0]) gruposErrados.push(i); });
        const iguais = r.grupos.every((n) => n === r.grupos[0]);
        const repartiu = gruposErrados.length === 0 && r.monte === certa.monte;
        const c = conferirLista(certa.respostas, r.respostas);
        return {
          ok: c.erradas.length === 0 && (repartiu || Boolean(fase.digitar)),
          repartiu, iguais, gruposErrados, monte: r.monte, sobra: certa.monte, cada: certa.grupos[0],
          respostasErradas: c.erradas, vazias: c.vazias,
        };
      }
      case 'cabem': {
        const incompletas = [];
        r.caixas.forEach((n, i) => { if (n !== fase.porCaixa) incompletas.push(i); });
        const montou = incompletas.length === 0 && r.monte === 0 && r.caixas.length === certa.total;
        const totalOk = r.total === certa.total;
        return { ok: totalOk && (montou || Boolean(fase.digitar)), montou, incompletas, monte: r.monte, totalOk, semTotal: r.total === null || r.total === undefined };
      }
      default: throw new Error('tipo de fase desconhecido: ' + fase.tipo);
    }
  }

  // Estrelas: acertou na 1ª vez = 3; na 2ª = 2; depois = 1.
  function estrelas(tentativas) {
    return tentativas <= 1 ? 3 : tentativas === 2 ? 2 : 1;
  }

  // Ordem "embaralhada" sempre igual (para a mesma fase ficar sempre igual).
  function embaralhar(lista, semente) {
    const copia = lista.slice();
    let s = semente || 1;
    for (let i = copia.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  const Regras = {
    VALOR_UNIDADE, totalSacola, decompor, sacolaInicial, empacotar, dinheiro,
    totalProdutos, ehPar, respostaCerta, verificar, estrelas, embaralhar,
    conta, repartir, nomeParte,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Regras;
  else raiz.Regras = Regras;
})(this);
