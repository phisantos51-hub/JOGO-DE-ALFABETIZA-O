// Verifica que todas as fases são geradas e que a solução de referência
// realmente coleta as peças na ordem, sem bater e sem pegar peça errada.
// Uso: node testes/fases.test.js
const assert = require('assert');
global.ANOS = require('../js/dados.js').ANOS;
const { DIRECOES, gerarFase, contarBlocosIdeais } = require('../js/fases.js');

function simular(fase, passos) {
  let x = fase.inicio.x, y = fase.inicio.y, coletadas = 0;
  const removidas = new Set();
  for (const dir of passos) {
    x += DIRECOES[dir].dx; y += DIRECOES[dir].dy;
    assert(x >= 0 && y >= 0 && x < fase.tamanho && y < fase.tamanho, 'saiu do tabuleiro');
    assert(!fase.pedras.some((p) => p.x === x && p.y === y), 'bateu na pedra');
    assert(!fase.distratores.some((p) => p.x === x && p.y === y), 'pegou distrator');
    const i = fase.alvos.findIndex((p, k) => p.x === x && p.y === y && !removidas.has(k));
    if (i >= 0) {
      assert.strictEqual(fase.alvos[i].texto, fase.item.pecas[coletadas], 'peça fora de ordem');
      removidas.add(i); coletadas++;
    }
  }
  return coletadas;
}

let total = 0;
for (const ano of Object.keys(ANOS)) {
  ANOS[ano].palavras.forEach((item, i) => {
    const fase = gerarFase(Number(ano), i);
    assert.strictEqual(simular(fase, fase.passosSolucao), item.pecas.length, `${ano}-${i} incompleta`);
    assert.deepStrictEqual(gerarFase(Number(ano), i).alvos, fase.alvos, 'fase não é determinística');
    item.pecas.forEach((p) => assert(!fase.distratores.some((d) => d.texto === p), 'distrator igual a peça'));
    if (fase.limiteBlocos) assert(fase.limiteBlocos >= fase.blocosIdeais);
    console.log(`${ANOS[ano].titulo} fase ${i + 1} ${item.palavra.padEnd(10)} passos=${fase.passosSolucao.length} ideal=${fase.blocosIdeais}${fase.limiteBlocos ? ' limite=' + fase.limiteBlocos : ''}`);
    total++;
  });
}
assert.strictEqual(contarBlocosIdeais(['direita', 'direita', 'direita', 'cima'], true), 3);
assert.strictEqual(contarBlocosIdeais(['direita', 'direita', 'direita', 'cima'], false), 4);
console.log(`OK: ${total} fases válidas`);
