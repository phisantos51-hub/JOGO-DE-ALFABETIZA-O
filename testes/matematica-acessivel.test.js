// Confere os textos falados da Feira do Robô acessível (matematica/acessivel/):
// toda fruta e todo dinheiro das fases têm nome, os pedidos viram fala sem
// símbolos e os números em braille estão certos.
// Uso: node testes/matematica-acessivel.test.js
const assert = require('assert');
const { ANOS } = require('../matematica/js/fases.js');
const D = require('../matematica/acessivel/dados.js');

const emojis = new Set();
const dinheiro = new Set();
for (const ano of Object.keys(ANOS)) {
  ANOS[ano].fases.forEach((f, i) => {
    const nome = `${ano}º ano fase ${i + 1}`;
    if (f.fruta) emojis.add(f.fruta);
    (f.grupos || []).forEach((g) => emojis.add(g.fruta));
    if (f.a) emojis.add(f.a.fruta).add(f.b.fruta);
    (f.produtos || []).forEach((p) => emojis.add(p.emoji));
    (f.caixa || []).forEach((v) => dinheiro.add(v));
    if (f.pago) dinheiro.add(f.pago);

    const falado = D.paraFala(f.pedido);
    assert(!/R\$|[−×=]/.test(falado), `${nome}: símbolo sobrando na fala: ${falado}`);
    assert(!/\p{Lu}{2,}/u.test(falado), `${nome}: palavra em maiúsculas seria soletrada: ${falado}`);
    assert(!/\p{Extended_Pictographic}/u.test(falado), `${nome}: emoji na fala`);
  });
}
emojis.forEach((e) => {
  assert(D.FRUTAS[e], `fruta sem nome: ${e}`);
  assert(['m', 'f'].includes(D.FRUTAS[e][2]), `fruta sem gênero: ${e}`);
});
dinheiro.forEach((v) => assert(!/undefined|NaN/.test(D.nomeDinheiro(v)), `dinheiro sem nome: ${v}`));

assert.strictEqual(D.paraFala('R$ 3,50'), '3 reais e 50 centavos');
assert.strictEqual(D.paraFala('R$ 1,00'), '1 real');
assert.strictEqual(D.paraFala('52 − 18 = 34'), '52 menos 18 é igual a 34');
assert.strictEqual(D.nomeDinheiro(100), 'moeda de 1 real');
assert.strictEqual(D.nomeDinheiro(1000), 'nota de 10 reais');
assert.strictEqual(D.solta('🍋', 10), 'soltos');
assert.strictEqual(D.solta('🍊', 1), 'solta');
assert.strictEqual(D.numeroBraille(245), '⠼⠃⠙⠑');
assert.strictEqual(D.numeroBraille(10), '⠼⠁⠚');
assert(D.brailleFalado(7).includes('pontos 1, 2, 4 e 5'));
console.log(`OK: ${emojis.size} frutas, ${dinheiro.size} valores de dinheiro e as falas de todas as fases`);
