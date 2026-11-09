# 🍎 Feira do Robô

Jogo de **matemática** para o **1º, 2º e 3º ano do Ensino Fundamental**, pensado a partir do Currículo da Cidade de São Paulo (Matemática, Ciclo de Alfabetização).

O robô tem uma barraca de feira. Em cada fase chega um cliente com um pedido ("Quero 7 laranjas", "Dê o troco"…) e a criança ajuda a **contar, juntar, separar e pagar** frutas e verduras.

## Feito para o laboratório de informática

- **Sem som obrigatório:** todo retorno é visual (cores, destaques, números que aparecem, estrelas). O som é opcional e começa **desligado**. Dá para ligar no botão "🔇 Som desligado" da tela inicial ou no botão "🔇 Som" no alto da tela do jogo. Com o som ligado tocam efeitos (sem narração): um "plop" ao colocar ou tirar peças, uma fanfarra e um "plim" por estrela ao acertar, um "hmm?" leve quando ainda não está certo, um toque por item na contagem da dica, moedas tilintando e notas fazendo barulho de papel. Aparece também o botão 🗣️, que lê o pedido em voz alta. A escolha fica guardada em cada computador.
- **Jogo independente:** a Feira do Robô não tem mais botão para o Robô Letrinha. O botão **🏠 Jogos do LED**, na tela inicial, leva para o menu https://phisantos51-hub.github.io/. O endereço da Feira continua o mesmo: https://phisantos51-hub.github.io/JOGO-DE-ALFABETIZA-O/matematica/. O progresso fica guardado separado do Robô Letrinha.
- **Mouse:** arraste e solte as peças. Quem ainda tem dificuldade para arrastar pode **clicar**: um clique na fruta coloca na sacola e outro clique tira. Não tem clique duplo. As peças são grandes e as áreas de soltar piscam e aceitam a peça mesmo se ela cair um pouco fora. Se a tela for pequena, ela rola sozinha quando a peça chega perto da borda.
- **Sem tempo e sem mensagens negativas:** ao clicar em **✅ Pronto!**, se ainda não estiver certo, o robô mostra uma **dica** (conta os itens um a um com destaque, alinha as frutas lado a lado, mostra os saltos da sequência…) e a criança continua de onde parou.
- **Estrelas:** acertou de primeira = ⭐⭐⭐; na segunda = ⭐⭐; depois = ⭐.
- **Sem instalação e sem internet:** depois de aberto, o jogo funciona offline. Sem internet, a fonte Andika é trocada por uma fonte parecida do computador.
- **1º ano em letra de imprensa maiúscula.**

## 🤖📦 Atacado do Robô (multiplicação e divisão, só no 3º ano)

Uma parte extra da Feira, que **só aparece no 3º ano**: o robô agora também vende por atacado. Ele monta cestas, caixas e pacotes com quantidades iguais e reparte as mercadorias entre os clientes. No 1º e no 2º ano nada muda.

**Como abrir:** na tela inicial, clique em **3º ano**. No alto da lista de fases aparece o cartão roxo **🤖📦 Atacado do Robô**. Clique nele. Para voltar, use **⬅ Voltar para o 3º ano**. O cartão do 3º ano, na tela inicial, também mostra as estrelas do Atacado.

São 20 fases curtas, com dificuldade crescente. Primeiro vem a multiplicação, depois a divisão, e no fim as duas juntas:

| Fases | O que a criança faz |
| --- | --- |
| 1 e 2 | **Grupos iguais:** arrasta frutas para montar cestas com a mesma quantidade e diz o total (4 × 3). |
| 3 | **Parcelas iguais:** completa 3 + 3 + 3 + 3 = 12 e 4 × 3 = 12. |
| 4 e 5 | **Organização retangular:** arrasta fileiras de frutas para a banca (3 fileiras de 5). |
| 6 e 7 | **Dobro e triplo.** |
| 8 e 9 | **Tabuadas do 2, 3, 4, 5 e 10**, cada conta com o desenho dos grupos. |
| 10 e 11 | **Repartir igualmente** entre clientes, uma fruta de cada vez (só divisões exatas). |
| 12 | **Quantas vezes cabe:** monta caixas de ovos e descobre quantas caixas deu. |
| 13 a 17 | **Metade, terça parte, quarta parte, quinta parte e décima parte**, repartindo em pratos iguais (com o botão "🔄 Dar 1 para cada"). |
| 18 | **Multiplicação e divisão juntas:** se 4 × 3 = 12, então 12 ÷ 3 = 4 e 12 ÷ 4 = 3. |
| 19 | Contas de multiplicação e divisão misturadas. |
| 20 | **Divisão que sobra:** 13 laranjas em 4 cestas: 3 em cada e sobra 1. As frutas que sobram ficam fora das cestas, no monte. |

- As frutas aparecem sempre junto com a conta escrita (por exemplo, a soma 3 + 3 + 2 vai mudando enquanto a criança enche as cestas, ao lado de 4 × 3 = ?).
- Nas primeiras fases a resposta é um cartão com número para arrastar. Nas fases mais avançadas a criança **digita o número** ou usa os botões **−** e **+**. Nessas fases mexer nas frutas é só uma ajuda: dá para responder direto.
- Se ainda não estiver certo, o robô dá uma dica visual (conta os grupos um a um com destaque, conta de 3 em 3, reparte as frutas para a criança ver…). O que a criança já fez continua lá.
- Estrelas, "🔓 Liberar todas as fases" e "🧽 Apagar o progresso" funcionam igual ao resto da Feira.

### Como acrescentar fases no Atacado

As fases do Atacado ficam no arquivo [`js/atacado-fases.js`](js/atacado-fases.js). No começo desse arquivo há uma explicação de cada tipo de fase. O jeito mais fácil:

1. Copie uma linha parecida com a fase que você quer.
2. Cole na lista, no lugar em que ela deve aparecer (a ordem da lista é a ordem das fases).
3. Troque o texto do pedido e os números. Por exemplo:

```js
{ tipo: 'montar', icone: '🧺', cliente: '👩', pedido: 'Monte 5 cestas com 2 peras em cada uma.', fruta: '🍐', recipiente: 'cesta', grupos: 5, porGrupo: 2, opcoes: [7, 10, 12] },
{ tipo: 'repartir', icone: '🤝', cliente: '👦', pedido: 'Reparta 15 morangos igualmente entre 3 clientes.', fruta: '🍓', total: 15, grupos: 3, recipiente: 'cliente', opcoes: [3, 5, 12] },
{ tipo: 'contas', icone: '4️⃣', cliente: '👵', pedido: 'Tabuada do 4: quantas frutas em cada pedido?', fruta: '🍋', contas: ['2 × 4', '5 × 4', '9 × 4'], digitar: true },
```

4. Rode o teste: `node testes/matematica.test.js`. Ele avisa se algum número não bate (por exemplo, se o cartão com a resposta certa ficou de fora).

A fase nova aparece sozinha no jogo e também na versão acessível.

## Versão acessível (alunos cegos)

A pasta [`acessivel/`](acessivel/) tem a mesma Feira, com as mesmas fases (inclusive o Atacado do Robô, no 3º ano), para alunos cegos ou com baixa visão. Ela funciona só pelo teclado, com voz, sons para contar ouvindo e braille, e funciona com o NVDA. Veja [`acessivel/README.md`](acessivel/README.md).

## Fases

Cada ano tem 20 fases. No 1º ano, as fases 11 a 20 trazem mais contagem, comparação, juntar e **tirar** até 10 e sequência até 20. No 2º ano, as fases 11 a 20 trazem mais dezenas e unidades (até **100 = 10 caixas**), adição e subtração até 100, sequências de 2 em 2 e de 5 em 5 e par ou ímpar. No 3º ano, as fases 11 a 20 são **desafios do troco** (o cliente compra 2 ou 3 produtos, a criança soma a compra e dá o troco, primeiro em reais inteiros e no fim com centavos). As fases são liberadas uma a uma (o progresso fica salvo no navegador de cada computador). Em "Para o professor", na tela inicial, dá para **liberar todas as fases** ou **apagar o progresso**.

| Ano | O que a criança faz |
| --- | --- |
| **1º ano** | Coloca na sacola a quantidade pedida (até 30, com o desenho em quadros de 10); conta frutas e escolhe o número; compara cestas (MAIS, MENOS, IGUAIS); junta dois grupos (adição até 10). |
| **2º ano** | Monta quantidades com **caixas de 10** e frutas soltas (10 soltas viram 1 caixa sozinhas); adição e subtração até 100 (inclusive abrindo uma caixa para tirar); completa sequências (de 1 em 1, de 10 em 10); separa números em **PAR** e **ÍMPAR**. |
| **3º ano** | Usa **engradados de 100**, caixas de 10 e soltas; escreve números em **centenas, dezenas e unidades**; paga e dá **troco** com cédulas e moedas do real (inclusive centavos); monta **grupos iguais** (4 cestas com 3 maçãs) — ideia de multiplicação. |

## Como mudar ou criar fases

As fases ficam em `js/fases.js`. Exemplo de fase de sacola:

```js
{ tipo: 'sacola', icone: '🍊', cliente: '👩', pedido: 'Quero 7 laranjas.', fruta: '🍊', alvo: 7, unidades: ['solta'] }
```

Depois de mudar, rode o teste para conferir se todas as fases continuam corretas:

```bash
node testes/matematica.test.js
```

## Estrutura

```
index.html        telas do jogo
css/feira.css     visual
js/fases.js       pedidos de cada fase, por ano
js/atacado-fases.js  pedidos e números do Atacado do Robô (3º ano)
js/atacado.js     telas do Atacado: cestas, fileiras, repartir, caixas
js/regras.js      contas e conferência das respostas
js/arrastar.js    arrastar e soltar com o mouse (e clique)
js/jogo.js        telas, peças, dicas, estrelas e progresso
acessivel/        versão acessível (teclado, voz e sons)
```
