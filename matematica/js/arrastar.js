// Arrastar e soltar com o mouse (também funciona com toque).
// - Um clique simples (sem arrastar) chama aoClicar.
// - A área de soltar tem uma folga em volta, para não exigir precisão.
const Arrastar = (function () {
  const LIMIAR = 8;   // pixels de movimento para começar a arrastar
  const FOLGA = 28;   // folga em volta das áreas de soltar
  let atual = null;
  let ignorarClique = false;

  // Torna um elemento arrastável. opcoes: { dados, aoClicar }
  function item(el, opcoes) {
    el.classList.add('arrastavel');
    el.addEventListener('pointerdown', (e) => iniciar(e, el, opcoes));
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (ignorarClique) return;
      if (opcoes.aoClicar) opcoes.aoClicar(e);
    });
  }

  // Marca um elemento como área de soltar. cfg: { aceita(dados), soltar(dados) }
  function zona(el, cfg) {
    el.classList.add('zona');
    el._zona = cfg;
  }

  function cliqueBloqueado() {
    return ignorarClique;
  }

  function iniciar(e, el, opcoes) {
    if (e.button !== undefined && e.button !== 0) return;
    if (atual) return;
    e.preventDefault();
    atual = { el, opcoes, x0: e.clientX, y0: e.clientY, arrastando: false, fantasma: null, zonas: [], sobre: null };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', cancelar);
  }

  function comecarArrasto(e) {
    const { el, opcoes } = atual;
    const r = el.getBoundingClientRect();
    const f = el.cloneNode(true);
    f.classList.add('fantasma');
    f.classList.remove('selecionado', 'novo');
    f.style.width = r.width + 'px';
    f.style.height = r.height + 'px';
    document.body.appendChild(f);
    atual.fantasma = f;
    atual.dx = r.width / 2;
    atual.dy = r.height / 2;
    atual.origem = r;
    atual.arrastando = true;
    el.classList.add('origem-arrasto');
    document.body.classList.add('arrastando');
    atual.zonas = Array.from(document.querySelectorAll('.zona')).filter((z) => z._zona && z._zona.aceita(opcoes.dados));
    atual.zonas.forEach((z) => z.classList.add('pode-soltar'));
    posicionar(e);
  }

  function posicionar(e) {
    atual.fantasma.style.transform = `translate(${e.clientX - atual.dx}px, ${e.clientY - atual.dy}px) scale(1.12) rotate(-4deg)`;
  }

  function zonaEm(x, y) {
    let melhor = null;
    let menorArea = Infinity;
    let menorDist = Infinity;
    for (const z of atual.zonas) {
      const r = z.getBoundingClientRect();
      const dentro = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      const perto = x >= r.left - FOLGA && x <= r.right + FOLGA && y >= r.top - FOLGA && y <= r.bottom + FOLGA;
      if (dentro) {
        const area = r.width * r.height;
        if (area < menorArea || menorDist > 0) { melhor = z; menorArea = area; menorDist = 0; }
      } else if (perto && menorDist > 0) {
        const dx = Math.max(r.left - x, 0, x - r.right);
        const dy = Math.max(r.top - y, 0, y - r.bottom);
        const d = Math.hypot(dx, dy);
        if (d < menorDist) { melhor = z; menorDist = d; }
      }
    }
    return melhor;
  }

  // Perto da borda de cima ou de baixo, a página rola sozinha.
  function rolar() {
    if (!atual || !atual.arrastando) return;
    const y = atual.y;
    const borda = 90;
    let passo = 0;
    if (y < borda) passo = -Math.ceil((borda - y) / 6);
    else if (y > window.innerHeight - borda) passo = Math.ceil((y - (window.innerHeight - borda)) / 6);
    if (passo) {
      window.scrollBy(0, passo);
      atualizarSobre(atual.x, atual.y);
    }
    atual.rolagem = requestAnimationFrame(rolar);
  }

  function atualizarSobre(x, y) {
    const z = zonaEm(x, y);
    if (z !== atual.sobre) {
      if (atual.sobre) atual.sobre.classList.remove('sobre');
      if (z) z.classList.add('sobre');
      atual.sobre = z;
    }
  }

  function mover(e) {
    if (!atual) return;
    if (!atual.arrastando) {
      if (Math.hypot(e.clientX - atual.x0, e.clientY - atual.y0) < LIMIAR) return;
      comecarArrasto(e);
      atual.rolagem = requestAnimationFrame(rolar);
    }
    atual.x = e.clientX;
    atual.y = e.clientY;
    posicionar(e);
    atualizarSobre(e.clientX, e.clientY);
  }

  function limparOuvintes() {
    window.removeEventListener('pointermove', mover);
    window.removeEventListener('pointerup', soltar);
    window.removeEventListener('pointercancel', cancelar);
  }

  function terminar() {
    if (atual.rolagem) cancelAnimationFrame(atual.rolagem);
    atual.zonas.forEach((z) => z.classList.remove('pode-soltar', 'sobre'));
    atual.el.classList.remove('origem-arrasto');
    document.body.classList.remove('arrastando');
    limparOuvintes();
    atual = null;
  }

  function soltar(e) {
    if (!atual) return;
    if (!atual.arrastando) { limparOuvintes(); atual = null; return; }
    // O clique que o navegador dispara logo depois de soltar não conta.
    ignorarClique = true;
    setTimeout(() => { ignorarClique = false; }, 0);
    const z = zonaEm(e.clientX, e.clientY);
    const { fantasma, opcoes, origem } = atual;
    terminar();
    if (z) {
      fantasma.remove();
      z._zona.soltar(opcoes.dados);
    } else {
      voltar(fantasma, origem);
    }
  }

  function cancelar() {
    if (!atual) return;
    const { fantasma, origem, arrastando } = atual;
    terminar();
    if (arrastando) voltar(fantasma, origem);
  }

  // Sem área de soltar: o item volta para o lugar de onde saiu.
  function voltar(fantasma, origem) {
    fantasma.classList.add('voltando');
    fantasma.style.transform = `translate(${origem.left}px, ${origem.top}px)`;
    setTimeout(() => fantasma.remove(), 260);
  }

  return { item, zona, cliqueBloqueado };
})();
