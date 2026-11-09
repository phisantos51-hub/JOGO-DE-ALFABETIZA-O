// Confere as fases da Feira do Robô (matematica/): dados válidos, resposta certa
// aceita, respostas erradas recusadas e valores possíveis com as peças da fase.
// Uso: node testes/matematica.test.js
const assert = require('assert');
const R = require('../matematica/js/regras.js');
const { ANOS } = require('../matematica/js/fases.js');
const { ATACADO } = require('../matematica/js/atacado-fases.js');

const LIMITES = { 1: 30, 2: 100, 3: 999 };
const MOEDAS_E_NOTAS = [5, 10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

// Dá para formar o valor com as cédulas e moedas da fase? (sem limite de quantidade)
function formavel(valor, caixa) {
  const pode = Array(valor + 1).fill(false);
  pode[0] = true;
  for (let v = 1; v <= valor; v++) pode[v] = caixa.some((c) => c <= v && pode[v - c]);
  return pode[valor];
}

let total = 0;
for (const ano of Object.keys(ANOS)) {
  const cfg = ANOS[ano];
  assert.strictEqual(cfg.fases.length, 20, `${ano}º ano deve ter 20 fases`);
  cfg.fases.forEach((f, i) => {
    const nome = `${cfg.titulo} fase ${i + 1} (${f.tipo})`;
    assert(f.pedido && f.cliente && f.icone, `${nome}: falta pedido, cliente ou ícone`);
    const certa = R.respostaCerta(f);

    switch (f.tipo) {
      case 'sacola': {
        assert(f.alvo <= LIMITES[ano], `${nome}: passa do limite do ano`);
        const ideal = f.unidades.includes('caixa') ? R.decompor(f.alvo) : { engradado: 0, caixa: 0, solta: f.alvo };
        if (!f.unidades.includes('engradado')) { ideal.caixa += ideal.engradado * 10; ideal.engradado = 0; }
        assert(R.verificar(f, ideal).ok, `${nome}: resposta certa recusada`);
        assert(!R.verificar(f, { ...ideal, solta: ideal.solta + 1 }).ok, `${nome}: aceitou 1 a mais`);
        if (f.conta) {
          const [a, op, b] = f.conta.split(' ');
          assert.strictEqual(Number(a), f.inicial, `${nome}: conta não bate com a sacola inicial`);
          const res = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b);
          assert.strictEqual(res, f.alvo, `${nome}: conta errada`);
          assert(f.pedido.includes(a) && f.pedido.includes(b), `${nome}: pedido não fala dos números da conta`);
        } else {
          assert(f.pedido.includes(String(f.alvo)), `${nome}: pedido não mostra o número`);
        }
        // Empacotar mantém o total
        const s = R.sacolaInicial(f);
        const antes = R.totalSacola(s);
        s.solta += 25;
        R.empacotar(s, f.unidades);
        assert.strictEqual(R.totalSacola(s), antes + 25);
        if (f.unidades.includes('caixa')) assert(s.solta < 10);
        break;
      }
      case 'quantos':
        assert(f.opcoes.includes(certa), `${nome}: opções sem a resposta`);
        assert(certa <= LIMITES[ano]);
        assert(R.verificar(f, certa).ok);
        f.opcoes.filter((o) => o !== certa).forEach((o) => assert(!R.verificar(f, o).ok));
        assert(!R.verificar(f, null).ok);
        if (f.grupos.length > 1) assert(certa <= 10, `${nome}: juntar no 1º ano vai até 10`);
        break;
      case 'comparar':
        assert(['mais', 'menos'].includes(f.pergunta));
        assert(R.verificar(f, certa).ok);
        ['a', 'b', 'igual'].filter((x) => x !== certa).forEach((x) => assert(!R.verificar(f, x).ok));
        break;
      case 'sequencia': {
        const passo = f.itens[1] - f.itens[0];
        f.itens.forEach((n, k) => k && assert.strictEqual(n - f.itens[k - 1], passo, `${nome}: passo irregular`));
        assert(R.verificar(f, certa).ok);
        assert(!R.verificar(f, certa.slice().reverse()).ok);
        f.extras.forEach((e) => assert(!certa.includes(e), `${nome}: extra igual à resposta`));
        break;
      }
      case 'valor':
        [f.c, f.d, f.u].forEach((d) => assert(d >= 0 && d <= 9));
        assert(R.verificar(f, certa).ok);
        assert(!R.verificar(f, [f.u, f.d, f.c]).ok || f.u === f.c);
        break;
      case 'parimpar':
        assert(R.verificar(f, certa).ok);
        assert(certa.includes('par') && certa.includes('impar'), `${nome}: precisa ter par e ímpar`);
        assert(!R.verificar(f, certa.map((x) => (x === 'par' ? 'impar' : 'par'))).ok);
        assert(!R.verificar(f, certa.map(() => null)).ok);
        break;
      case 'dinheiro': {
        assert(certa > 0, `${nome}: valor deve ser positivo`);
        f.caixa.forEach((c) => assert(MOEDAS_E_NOTAS.includes(c), `${nome}: ${c} não é cédula/moeda do real`));
        assert(formavel(certa, f.caixa), `${nome}: não dá para formar ${R.dinheiro(certa)}`);
        if (f.pago) assert(f.pedido.includes(R.dinheiro(f.pago).replace('R$ ', '')) || f.produtos.length > 1);
        assert(R.verificar(f, [certa]).ok);
        assert(!R.verificar(f, [certa, f.caixa[0]]).ok);
        break;
      }
      case 'grupos':
        assert(f.opcoes.includes(certa.total));
        assert(R.verificar(f, certa).ok);
        assert(!R.verificar(f, { ...certa, total: f.opcoes.find((o) => o !== certa.total) }).ok);
        assert(!R.verificar(f, { cestas: certa.cestas.map((n, k) => (k ? n : n + 1)), total: certa.total }).ok);
        assert(f.pedido.includes(String(f.cestas)) && f.pedido.includes(String(f.porCesta)));
        break;
      default:
        assert.fail(`${nome}: tipo desconhecido`);
    }
    console.log(`OK ${nome}`);
    total++;
  });
}

// ---------- Atacado do Robô (multiplicação e divisão, só no 3º ano) ----------
assert.strictEqual(ATACADO.ano, 3, 'o Atacado é do 3º ano');
assert(ATACADO.fases.length >= 10, 'o Atacado deve ter fases');
// Começa pela multiplicação, depois a divisão, e termina com as duas juntas.
const ordem = { montar: 'x', parcelas: 'x', retangulo: 'x', repartir: 'd', cabem: 'd', relacao: 'm' };
const etapas = ATACADO.fases.map((f) => (f.tipo === 'contas'
  ? (f.contas.some((c) => c.includes('÷')) ? 'm' : 'x')
  : ordem[f.tipo]));
assert.strictEqual(etapas[0], 'x');
assert.strictEqual(etapas[etapas.length - 1], 'd', 'a última fase é a divisão que sobra');
assert(etapas.indexOf('d') > etapas.lastIndexOf('x'), 'divisão depois da multiplicação');
const ultima = ATACADO.fases[ATACADO.fases.length - 1];
assert(ultima.tipo === 'repartir' && ultima.total % ultima.grupos > 0, 'a última fase tem sobra');
ATACADO.fases.slice(0, -1).forEach((f, i) => {
  if (f.tipo === 'repartir') assert.strictEqual(f.total % f.grupos, 0, `Atacado fase ${i + 1}: antes da última, só divisões exatas`);
});

const vazio = (n) => Array(n).fill(null);
ATACADO.fases.forEach((f, i) => {
  const nome = `Atacado fase ${i + 1} (${f.tipo})`;
  assert(f.pedido && f.cliente && f.icone && f.fruta, `${nome}: falta pedido, cliente, ícone ou fruta`);
  assert(f.digitar || Array.isArray(f.opcoes), `${nome}: precisa de opcoes (cartões) ou digitar: true`);
  const certa = R.respostaCerta(f);
  const temOpcao = (v) => f.digitar || f.opcoes.includes(v);
  switch (f.tipo) {
    case 'montar': {
      assert(temOpcao(certa.total), `${nome}: opções sem a resposta`);
      assert(f.pedido.includes(String(f.porGrupo)), `${nome}: pedido não fala de ${f.porGrupo}`);
      if (!f.modelo) assert(f.pedido.includes(String(f.grupos)), `${nome}: pedido não fala de ${f.grupos}`);
      if (f.nome) assert(f.pedido.includes(f.nome) && f.grupos === { dobro: 2, triplo: 3 }[f.nome], `${nome}: dobro/triplo errado`);
      assert(R.verificar(f, certa).ok);
      assert(!R.verificar(f, { ...certa, total: certa.total + 1 }).ok);
      assert(!R.verificar(f, { ...certa, total: null }).ok);
      const torto = { grupos: certa.grupos.map((n, k) => (k === f.grupos - 1 ? n + 1 : n)), total: certa.total };
      assert.strictEqual(R.verificar(f, torto).ok, Boolean(f.digitar), `${nome}: grupos diferentes`);
      break;
    }
    case 'parcelas':
      certa.forEach((v) => assert(temOpcao(v), `${nome}: falta o cartão ${v}`));
      assert(R.verificar(f, certa).ok);
      assert(R.verificar(f, [certa[0], f.porGrupo, f.grupos, certa[3]]).ok, `${nome}: vale nas duas ordens`);
      assert(!R.verificar(f, [certa[0], f.grupos, f.grupos, certa[3]]).ok);
      assert(!R.verificar(f, vazio(4)).ok);
      break;
    case 'retangulo':
      assert(temOpcao(certa.total));
      assert(f.pedido.includes(String(f.linhas)) && f.pedido.includes(String(f.colunas)));
      assert(R.verificar(f, certa).ok);
      assert(!R.verificar(f, { ...certa, total: certa.total + f.colunas }).ok);
      assert.strictEqual(R.verificar(f, { linhas: 0, total: certa.total }).ok, Boolean(f.digitar));
      break;
    case 'contas':
      f.contas.forEach((c) => {
        const k = R.conta(c);
        assert(Number.isInteger(k.resultado), `${nome}: ${c} não dá exato`);
        assert(k.resultado <= 100 && k.a <= 100 && k.b <= 10, `${nome}: ${c} grande demais para o 3º ano`);
        if (k.op === '×') assert([2, 3, 4, 5, 10].includes(k.b), `${nome}: ${c} fora das tabuadas do 2, 3, 4, 5 e 10`);
      });
      certa.forEach((v) => assert(temOpcao(v)));
      assert(R.verificar(f, certa).ok);
      assert(!R.verificar(f, certa.map((v, k) => (k ? v : v + 1))).ok);
      assert(!R.verificar(f, vazio(certa.length)).ok);
      break;
    case 'repartir': {
      const r = R.repartir(f.total, f.grupos);
      assert(f.pedido.includes(String(f.total)) && f.pedido.includes(String(f.grupos)), `${nome}: pedido sem os números`);
      if (f.parte) assert(R.nomeParte(f.grupos) && f.pedido.includes(R.nomeParte(f.grupos)), `${nome}: nome da parte`);
      certa.respostas.forEach((v) => assert(temOpcao(v), `${nome}: falta o cartão ${v}`));
      assert(R.verificar(f, certa).ok);
      assert(!R.verificar(f, { ...certa, respostas: certa.respostas.map((v) => v + 1) }).ok);
      // Sem repartir (tudo no monte): só vale nas fases de digitar.
      assert.strictEqual(R.verificar(f, { grupos: Array(f.grupos).fill(0), monte: f.total, respostas: certa.respostas }).ok, Boolean(f.digitar));
      // Repartido desigual
      if (f.grupos > 1 && r.cada > 0) {
        const desigual = certa.grupos.slice();
        desigual[0]++;
        desigual[1]--;
        assert.strictEqual(R.verificar(f, { grupos: desigual, monte: certa.monte, respostas: certa.respostas }).ok, Boolean(f.digitar));
      }
      break;
    }
    case 'cabem':
      assert.strictEqual(f.total % f.porCaixa, 0, `${nome}: precisa dar exato`);
      assert(temOpcao(certa.total));
      assert(f.pedido.includes(String(f.total)) && f.pedido.includes(String(f.porCaixa)));
      assert(R.verificar(f, certa).ok);
      assert.strictEqual(R.verificar(f, { caixas: [], monte: f.total, total: certa.total }).ok, Boolean(f.digitar));
      assert(!R.verificar(f, { ...certa, total: certa.total + 1 }).ok);
      break;
    case 'relacao':
      certa.forEach((v) => assert(temOpcao(v)));
      assert(R.verificar(f, certa).ok);
      assert(!R.verificar(f, certa.slice().reverse()).ok || certa[0] === certa[1]);
      break;
    default:
      assert.fail(`${nome}: tipo desconhecido`);
  }
  console.log(`OK ${nome}`);
  total++;
});
// Todos os conteúdos do 3º ano estão no Atacado.
const tipos = new Set(ATACADO.fases.map((f) => f.tipo));
['montar', 'parcelas', 'retangulo', 'contas', 'repartir', 'cabem', 'relacao'].forEach((t) => assert(tipos.has(t), `falta fase do tipo ${t}`));
['dobro', 'triplo'].forEach((n) => assert(ATACADO.fases.some((f) => f.nome === n), `falta ${n}`));
[2, 3, 4, 5, 10].forEach((p) => assert(ATACADO.fases.some((f) => f.parte && f.grupos === p), `falta a parte ${R.nomeParte(p)}`));
const tabuadas = new Set();
ATACADO.fases.filter((f) => f.tipo === 'contas').forEach((f) => f.contas.forEach((c) => { const k = R.conta(c); if (k.op === '×') tabuadas.add(k.b); }));
[2, 3, 4, 5, 10].forEach((t) => assert(tabuadas.has(t), `falta a tabuada do ${t}`));
assert.deepStrictEqual(R.conta('12 ÷ 4'), { a: 12, op: '÷', b: 4, resultado: 3 });
assert.deepStrictEqual(R.repartir(13, 4), { cada: 3, sobra: 1 });

assert.strictEqual(R.dinheiro(350), 'R$ 3,50');
assert.strictEqual(R.dinheiro(5000), 'R$ 50,00');
assert.deepStrictEqual(R.decompor(306), { engradado: 3, caixa: 0, solta: 6 });
assert.strictEqual(R.estrelas(1), 3);
assert.strictEqual(R.estrelas(2), 2);
assert.strictEqual(R.estrelas(5), 1);
console.log(`OK: ${total} fases da Feira do Robô válidas (com o Atacado do Robô)`);
