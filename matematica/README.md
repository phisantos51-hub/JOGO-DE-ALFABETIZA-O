# 🍎 Feira do Robô

Jogo de **matemática** para o **1º, 2º e 3º ano do Ensino Fundamental**, pensado a partir do Currículo da Cidade de São Paulo (Matemática, Ciclo de Alfabetização).

O robô tem uma barraca de feira. Em cada fase chega um cliente com um pedido ("Quero 7 laranjas", "Dê o troco"…) e a criança ajuda a **contar, juntar, separar e pagar** frutas e verduras.

## Feito para o laboratório de informática

- **Sem som obrigatório:** todo retorno é visual (cores, destaques, números que aparecem, estrelas). O som é opcional e começa **desligado**. Dá para ligar no botão "🔇 Som desligado" da tela inicial; com ele ligado aparece também o botão 🔊 para ouvir o pedido.
- **Mouse:** arraste e solte as peças. Quem ainda tem dificuldade para arrastar pode **clicar**: um clique na fruta coloca na sacola e outro clique tira. Não tem clique duplo. As peças são grandes e as áreas de soltar piscam e aceitam a peça mesmo se ela cair um pouco fora. Se a tela for pequena, ela rola sozinha quando a peça chega perto da borda.
- **Sem tempo e sem mensagens negativas:** ao clicar em **✅ Pronto!**, se ainda não estiver certo, o robô mostra uma **dica** (conta os itens um a um com destaque, alinha as frutas lado a lado, mostra os saltos da sequência…) e a criança continua de onde parou.
- **Estrelas:** acertou de primeira = ⭐⭐⭐; na segunda = ⭐⭐; depois = ⭐.
- **Sem instalação e sem internet:** depois de aberto, o jogo funciona offline. Sem internet, a fonte Andika é trocada por uma fonte parecida do computador.
- **1º ano em letra de imprensa maiúscula.**

## Versão acessível (alunos cegos)

A pasta [`acessivel/`](acessivel/) tem a mesma Feira, com as mesmas fases, para alunos cegos ou com baixa visão. Ela funciona só pelo teclado, com voz, sons para contar ouvindo e braille, e funciona com o NVDA. Veja [`acessivel/README.md`](acessivel/README.md).

## Fases

Cada ano tem 10 fases, liberadas uma a uma (o progresso fica salvo no navegador de cada computador). Em "Para o professor", na tela inicial, dá para **liberar todas as fases** ou **apagar o progresso**.

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
js/regras.js      contas e conferência das respostas
js/arrastar.js    arrastar e soltar com o mouse (e clique)
js/jogo.js        telas, peças, dicas, estrelas e progresso
acessivel/        versão acessível (teclado, voz e sons)
```
