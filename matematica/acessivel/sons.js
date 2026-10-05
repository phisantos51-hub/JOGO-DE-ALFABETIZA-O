// Sons da feira, além dos sons do Robô Letrinha (Som e Voz vêm de ../../acessivel/som.js).
// Cada fruta, caixa, engradado, moeda ou nota tem um som diferente, para dar para
// contar ouvindo. Respeitam a opção "Sons" do menu (Som.ligado).
const Sons = (() => {
  let ctx = null;

  function contexto() {
    if (!Som.ligado) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function saida(c, pan) {
    if (!c.createStereoPanner) return c.destination;
    const p = c.createStereoPanner();
    p.pan.value = pan;
    p.connect(c.destination);
    return p;
  }

  function tom({ freq, freqFinal, dur = 0.12, tipo = 'triangle', pan = 0, vol = 0.3, atraso = 0 }) {
    const c = contexto();
    if (!c) return;
    const t0 = c.currentTime + atraso;
    const osc = c.createOscillator();
    const ganho = c.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqFinal) osc.frequency.exponentialRampToValueAtTime(freqFinal, t0 + dur);
    ganho.gain.setValueAtTime(0.0001, t0);
    ganho.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(ganho);
    ganho.connect(saida(c, pan));
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // Barulho de papel, para as notas de dinheiro.
  function papel(pan = 0) {
    const c = contexto();
    if (!c) return;
    const dur = 0.18;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const fonte = c.createBufferSource();
    fonte.buffer = buf;
    const filtro = c.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = 3000;
    const ganho = c.createGain();
    ganho.gain.value = 0.35;
    fonte.connect(filtro).connect(ganho).connect(saida(c, pan));
    fonte.start();
  }

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  const sons = {
    // Uma unidade (fruta solta). "variante" muda a altura para diferenciar grupos.
    solta(pan = 0, variante = 0) { tom({ freq: 700 + variante * 180, dur: 0.09, pan, vol: 0.32 }); },
    caixa(pan = 0) {
      tom({ freq: 260, dur: 0.16, tipo: 'square', pan, vol: 0.16 });
      tom({ freq: 390, dur: 0.12, tipo: 'triangle', pan, vol: 0.2, atraso: 0.08 });
    },
    engradado(pan = 0) {
      tom({ freq: 110, dur: 0.3, tipo: 'square', pan, vol: 0.18 });
      tom({ freq: 165, dur: 0.25, tipo: 'triangle', pan, vol: 0.22, atraso: 0.1 });
    },
    moeda(pan = 0) {
      tom({ freq: 1900, dur: 0.12, tipo: 'sine', pan, vol: 0.2 });
      tom({ freq: 2600, dur: 0.2, tipo: 'sine', pan, vol: 0.15, atraso: 0.06 });
    },
    nota(pan = 0) { papel(pan); },
    colocou() { tom({ freq: 330, freqFinal: 660, dur: 0.12, tipo: 'sine', vol: 0.28 }); },
    tirou() { tom({ freq: 660, freqFinal: 300, dur: 0.14, tipo: 'sine', vol: 0.25 }); },
    passo() { tom({ freq: 900, dur: 0.04, tipo: 'sine', vol: 0.18 }); },
    empacotou() { [523, 659, 784].forEach((f, i) => tom({ freq: f, dur: 0.1, vol: 0.25, atraso: i * 0.07 })); },
    abriu() { [784, 659, 523].forEach((f, i) => tom({ freq: f, dur: 0.1, vol: 0.25, atraso: i * 0.07 })); },
    estrela(pan = 0) { tom({ freq: 1200, freqFinal: 1600, dur: 0.18, tipo: 'sine', pan, vol: 0.25 }); },
    // Pista neutra: "vamos conferir juntos" (não é som de erro).
    dica() {
      tom({ freq: 523, dur: 0.14, vol: 0.25 });
      tom({ freq: 587, dur: 0.2, vol: 0.25, atraso: 0.16 });
    },
  };

  // Toca uma lista de sons em sequência, para contar ouvindo.
  // Cada item: { som: 'solta' | 'caixa' | ..., pan, variante }. "parar()" interrompe.
  let execucao = 0;
  async function tocar(lista, intervalo = 420) {
    const minha = ++execucao;
    for (const item of lista) {
      if (minha !== execucao) return false;
      if (item.pausa) { await esperar(item.pausa); continue; }
      sons[item.som](item.pan || 0, item.variante || 0);
      await esperar(item.intervalo || intervalo);
    }
    return minha === execucao;
  }
  function parar() { execucao++; }

  return Object.assign(sons, { tocar, parar, iniciar: contexto });
})();
