// Pistas sonoras e voz.
// Sons: esquerda/direita saem de um lado do fone; cima é agudo, baixo é grave.
// Voz: a própria do navegador (pt-BR) ou, se ela estiver desligada, uma
// região "aria-live" para o leitor de tela (NVDA) ler. Nunca as duas juntas.

const Som = (() => {
  let ctx = null;
  let ligado = true;

  const PAN = { esquerda: -0.9, direita: 0.9, cima: 0, baixo: 0 };
  const ALTURA = { cima: 880, baixo: 262, esquerda: 523, direita: 523 };

  function contexto() {
    if (!ligado) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tom({ freq, freqFinal, dur = 0.15, tipo = 'sine', pan = 0, vol = 0.3, atraso = 0 }) {
    const c = contexto();
    if (!c) return;
    const t0 = c.currentTime + atraso;
    const osc = c.createOscillator();
    const ganho = c.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqFinal) osc.frequency.exponentialRampToValueAtTime(freqFinal, t0 + dur);
    ganho.gain.setValueAtTime(0.0001, t0);
    ganho.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let saida = ganho;
    if (c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.value = pan;
      ganho.connect(p);
      saida = p;
    }
    osc.connect(ganho);
    saida.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    set ligado(v) { ligado = v; },
    get ligado() { return ligado; },
    iniciar: contexto,
    // Ao escolher uma seta e a cada passo do robô.
    direcao(dir) {
      tom({ freq: ALTURA[dir], dur: 0.14, tipo: 'triangle', pan: PAN[dir], vol: 0.35 });
    },
    andou(dir) {
      tom({ freq: ALTURA[dir], dur: 0.09, tipo: 'triangle', pan: PAN[dir], vol: 0.25 });
      tom({ freq: ALTURA[dir], dur: 0.09, tipo: 'triangle', pan: PAN[dir], vol: 0.2, atraso: 0.12 });
    },
    parede(dir) {
      tom({ freq: 140, freqFinal: 70, dur: 0.35, tipo: 'square', pan: PAN[dir], vol: 0.25 });
    },
    certa() {
      tom({ freq: 660, dur: 0.12, vol: 0.3 });
      tom({ freq: 990, dur: 0.22, vol: 0.3, atraso: 0.12 });
    },
    errada() {
      tom({ freq: 392, dur: 0.18, tipo: 'sawtooth', vol: 0.15 });
      tom({ freq: 262, dur: 0.3, tipo: 'sawtooth', vol: 0.15, atraso: 0.2 });
    },
    venceu() {
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
        tom({ freq: f, dur: i === 5 ? 0.5 : 0.16, tipo: 'triangle', vol: 0.3, atraso: i * 0.15 })
      );
    },
    apagou() {
      tom({ freq: 330, freqFinal: 200, dur: 0.12, tipo: 'sine', vol: 0.25 });
    },
  };
})();

const Voz = (() => {
  let propria = true;
  let vozPt = null;
  const temSintese = typeof window !== 'undefined' && 'speechSynthesis' in window;

  function escolherVoz() {
    const vozes = speechSynthesis.getVoices();
    vozPt =
      vozes.find((v) => v.lang === 'pt-BR' && /google|francisca|maria|luciana/i.test(v.name)) ||
      vozes.find((v) => v.lang === 'pt-BR' || v.lang === 'pt_BR') ||
      vozes.find((v) => v.lang && v.lang.startsWith('pt')) ||
      null;
  }
  if (temSintese) {
    escolherVoz();
    speechSynthesis.onvoiceschanged = escolherVoz;
  }

  // Mostra o texto na tela (sempre) e entrega para quem vai falar.
  function mostrar(texto) {
    const tela = document.getElementById('fala');
    if (tela) tela.textContent = texto;
  }

  function anunciarParaLeitor(texto) {
    const regiao = document.getElementById('anuncios');
    if (!regiao) return;
    const p = document.createElement('p');
    p.textContent = texto;
    regiao.appendChild(p);
    while (regiao.children.length > 4) regiao.removeChild(regiao.firstChild);
  }

  // Fala o texto. Devolve uma promessa que termina quando a fala acaba,
  // para o jogo esperar antes de continuar (sem limite de tempo para o aluno).
  function falar(texto, { interromper = true } = {}) {
    mostrar(texto);
    if (!propria) {
      anunciarParaLeitor(texto);
      return new Promise((r) => setTimeout(r, Math.min(4000, 600 + texto.length * 45)));
    }
    if (!temSintese) return Promise.resolve();
    if (interromper) speechSynthesis.cancel();
    speechSynthesis.resume();
    // Frases curtas: o Chrome corta falas muito longas.
    const partes = texto.split(/(?<=[.!?])\s+/).filter(Boolean);
    return new Promise((resolver) => {
      const limite = setTimeout(resolver, 2500 + texto.length * 110);
      partes.forEach((parte, i) => {
        const u = new SpeechSynthesisUtterance(parte);
        u.lang = 'pt-BR';
        if (vozPt) u.voice = vozPt;
        u.rate = 0.9;
        if (i === partes.length - 1) {
          u.onend = u.onerror = () => {
            clearTimeout(limite);
            resolver();
          };
        }
        speechSynthesis.speak(u);
      });
    });
  }

  function calar() {
    if (temSintese) speechSynthesis.cancel();
  }

  return {
    falar,
    calar,
    set propria(v) {
      propria = v;
      if (!v) calar();
    },
    get propria() { return propria; },
  };
})();
