// Confere a versão acessível: todas as fases têm solução nos dois modos
// (letras e sílabas), o tabuleiro fica entre 3x3 e 4x4 e as frases saem certas.
// Uso: node testes/acessivel.test.js
const assert = require('assert');
Object.assign(global, require('../acessivel/dados.js'));
const A = require('../acessivel/fases.js');

let total = 0;
for (const modo of ['letras', 'silabas']) {
  A.FASES.forEach((_, n) => {
    const fase = A.gerarFase(n, modo);
    assert(fase.tamanho >= 3 && fase.tamanho <= 4, 'tamanho fora de 3x3 a 4x4');
    const r = A.simular(fase, fase.solucao);
    assert.strictEqual(r.fim, 'venceu', `fase ${n + 1} (${modo}) sem solução`);
    assert.deepStrictEqual(A.gerarFase(n, modo).alvos, fase.alvos, 'fase não é sempre igual');
    fase.distratores.forEach((d) => assert(!fase.pecas.includes(d.texto), 'distrator igual a peça'));
    for (const l of fase.pecas.join('')) assert(BRAILLE[l], 'sem braille para ' + l);
    console.log(`${modo.padEnd(7)} fase ${String(n + 1).padStart(2)} ${fase.tamanho}x${fase.tamanho} ${fase.item.palavra.padEnd(7)} comandos=${fase.solucao.length}`);
    total++;
  });
}
// Etapa 1 começa com sequências de 1 a 2 comandos.
assert.strictEqual(A.gerarFase(0, 'letras').solucao.length, 1);
assert(A.gerarFase(1, 'silabas').solucao.length <= 2);

// Erros param no comando certo.
const f = A.gerarFase(0, 'letras');
const comParede = A.simular({ ...f, inicio: { x: 0, y: 0 } }, ['esquerda']);
assert.strictEqual(comParede.fim, 'parede');
assert.strictEqual(comParede.comando, 0);

assert.strictEqual(A.descreverDistancia(2, 0), 'duas casas à direita');
assert.strictEqual(A.descreverDistancia(-1, 1), 'uma casa à esquerda e uma casa para baixo');
assert.strictEqual(A.descreverParedes(3, 0, 0), 'Tem parede em cima e à esquerda do robô.');
assert.strictEqual(A.descreverParedes(3, 1, 1), 'Não tem parede encostada no robô.');
assert.strictEqual(A.descreverPontos([1, 2]), 'pontos 1 e 2');
assert.strictEqual(A.descreverPontos([1, 3, 5]), 'pontos 1, 3 e 5');
assert.strictEqual(A.caractereBraille('B'), '⠃');
console.log(`OK: ${total} fases válidas`);
