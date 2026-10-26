// Confere a Rota Digital: todas as fases da Programação têm solução, os
// semáforos do 3º ano não podem ser evitados e as perguntas estão bem escritas.
// Uso: node testes/rota.test.js
const assert = require('assert');
const F = require('../rota/fases.js');
const { ICONES } = require('../rota/icones.js');
const { TICS, CIDADANIA, ITENS_POR_MISSAO } = require('../perguntas.js');

let total = 0;

// ---------- Programação ----------
for (const ano of [1, 2, 3]) {
  const regras = F.REGRAS_PROGRAMACAO[ano];
  F.FASES_PROGRAMACAO[ano].forEach((fase, i) => {
    const nome = `Programação ${ano}º ano, missão ${i + 1}`;
    const largura = fase.mapa[0].length;
    fase.mapa.forEach((linha) => {
      assert.strictEqual(linha.length, largura, `${nome}: linhas de tamanhos diferentes`);
      assert(/^[.CDOKXS]+$/.test(linha), `${nome}: letra desconhecida em "${linha}"`);
    });
    const texto = fase.mapa.join('');
    assert.strictEqual(texto.split('C').length - 1, 1, `${nome}: precisa de exatamente um C`);
    assert.strictEqual(texto.split('D').length - 1, 1, `${nome}: precisa de exatamente um D`);
    assert(F.DESTINOS[fase.destino], `${nome}: destino "${fase.destino}" não existe`);
    if (!regras.espere) assert(!texto.includes('S'), `${nome}: semáforo só no 3º ano`);
    const mapa = F.lerMapa(fase);
    const ideal = F.blocosIdeais(mapa, regras);
    assert(ideal, `${nome}: não tem solução`);
    if (mapa.semaforos.length) {
      const semSemaforo = F.lerMapa({ mapa: fase.mapa.map((l) => l.replace(/S/g, 'X')) });
      assert.strictEqual(F.blocosIdeais(semSemaforo, regras), null, `${nome}: dá para desviar do semáforo`);
    }
    total++;
  });
}

// ---------- Perguntas ----------
function conferirImagem(img, onde) {
  assert(typeof img === 'string', `${onde}: img precisa ser texto`);
  if (/^[a-z]+$/.test(img)) assert(ICONES[img], `${onde}: o desenho "${img}" não existe`);
}
function conferir(lista, nomeBairro, aceitaArrastar) {
  for (const ano of [1, 2, 3]) {
    const itens = lista[ano];
    assert(Array.isArray(itens) && itens.length >= ITENS_POR_MISSAO, `${nomeBairro} ${ano}º ano: poucas perguntas`);
    itens.forEach((p, i) => {
      const onde = `${nomeBairro} ${ano}º ano, pergunta ${i + 1}`;
      assert(p.pergunta && typeof p.pergunta === 'string', `${onde}: falta a pergunta`);
      assert(p.explicacao, `${onde}: falta a explicação`);
      if (p.tipo === 'escolha') {
        assert(p.opcoes.length >= 2 && p.opcoes.length <= 4, `${onde}: use de 2 a 4 opções`);
        assert.strictEqual(p.opcoes.filter((o) => o.certa).length, 1, `${onde}: precisa de exatamente uma opção certa`);
        p.opcoes.forEach((o, k) => { assert(o.texto, `${onde}: opção ${k + 1} sem texto`); conferirImagem(o.img, `${onde}, opção ${k + 1}`); });
      } else if (p.tipo === 'arrastar') {
        assert(aceitaArrastar, `${onde}: "arrastar" só no Bairro das TICs`);
        const ids = p.lugares.map((l) => l.id);
        assert.strictEqual(new Set(ids).size, ids.length, `${onde}: ids de lugares repetidos`);
        p.lugares.forEach((l) => { assert(l.texto, `${onde}: lugar sem texto`); if (l.img) conferirImagem(l.img, onde); });
        p.itens.forEach((it, k) => {
          assert(ids.includes(it.lugar), `${onde}: o item ${k + 1} vai para "${it.lugar}", que não existe`);
          conferirImagem(it.img, `${onde}, item ${k + 1}`);
        });
        ids.forEach((id) => assert(p.itens.some((it) => it.lugar === id), `${onde}: o lugar "${id}" ficou sem item`));
      } else {
        assert.fail(`${onde}: tipo "${p.tipo}" desconhecido (use 'escolha' ou 'arrastar')`);
      }
      total++;
    });
  }
}
conferir(TICS, 'TICs', true);
conferir(CIDADANIA, 'Cidadania', false);

console.log(`Rota Digital: ${total} fases e perguntas conferidas. Tudo certo!`);
