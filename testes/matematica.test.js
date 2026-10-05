// Confere as fases da Feira do Robô (matematica/): dados válidos, resposta certa
// aceita, respostas erradas recusadas e valores possíveis com as peças da fase.
// Uso: node testes/matematica.test.js
const assert = require('assert');
const R = require('../matematica/js/regras.js');
const { ANOS } = require('../matematica/js/fases.js');

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
  const esperado = ano === '3' ? 20 : 10; // o 3º ano tem mais 10 fases de desafios do troco
  assert.strictEqual(cfg.fases.length, esperado, `${ano}º ano deve ter ${esperado} fases`);
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

assert.strictEqual(R.dinheiro(350), 'R$ 3,50');
assert.strictEqual(R.dinheiro(5000), 'R$ 50,00');
assert.deepStrictEqual(R.decompor(306), { engradado: 3, caixa: 0, solta: 6 });
assert.strictEqual(R.estrelas(1), 3);
assert.strictEqual(R.estrelas(2), 2);
assert.strictEqual(R.estrelas(5), 1);
console.log(`OK: ${total} fases da Feira do Robô válidas`);
