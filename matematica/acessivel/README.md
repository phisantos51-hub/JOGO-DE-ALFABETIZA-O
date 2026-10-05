# 🍎 Feira do Robô Acessível

Versão da Feira do Robô para alunos cegos ou com baixa visão. Ela tem **as mesmas 30 fases** do jogo da turma (mesmos pedidos, mesmos números), então o aluno faz a mesma atividade que os colegas, ao mesmo tempo.

Tudo funciona **só pelo teclado**. O jogo fala sozinho, toca um som para cada fruta (para contar ouvindo) e também funciona com o leitor de tela NVDA. As teclas são as mesmas da versão acessível do Robô Letrinha.

**Use fones de ouvido.** Nesta versão o som é essencial, e com fones ele não atrapalha o resto do laboratório.

## Teclas (sempre as mesmas)

| Tecla | O que faz |
| --- | --- |
| ← → | Escolhem: o tipo de peça (solta, caixa, engradado), a cesta, o caixote, o número ou a nota |
| ↑ ↓ | Põem ou tiram; ou trocam o número escolhido |
| O | **Ouvir**: toca um som para cada coisa, para o aluno contar |
| Enter | Confere a resposta (é o "Pronto!") |
| Espaço | Repete o pedido e diz o que está escolhido agora |
| Backspace (⌫) | Tira / apaga |
| H | Ajuda falada |
| Esc | Volta para o menu |

No menu: setas para cima e para baixo escolhem, Enter confirma.

## Como cada atividade vira som

| Atividade | Como o aluno faz |
| --- | --- |
| **Sacola** ("Quero 7 laranjas") | ↑ põe uma fruta (faz um som), ↓ tira. **O** toca um som por fruta para conferir contando. No 2º e 3º ano, ← → escolhem fruta solta (som agudo), caixa de 10 (som médio) ou engradado de 100 (som grave). 10 soltas viram 1 caixa sozinhas, e o jogo avisa. Nas fases de tirar, **A** abre uma caixa. |
| **Quantas tem?** | **O** toca um som por fruta; o aluno conta e escolhe o cartão com ↑ ↓. Ao juntar dois grupos, cada grupo tem um som um pouco diferente. |
| **Mais, menos ou iguais** | **O** toca a cesta A no **lado esquerdo** do fone e a cesta B no **lado direito**. ← → levam a estrela: cesta A, iguais, cesta B. |
| **Sequência** | ← → vão de um caixote vazio para outro (o jogo diz os vizinhos: "entre 22 e 24"); ↑ ↓ trocam o número. |
| **Centena, dezena e unidade** | **O** toca os engradados, as caixas e as soltas separados; ← → vão para centenas, dezenas ou unidades; ↑ ↓ ou as teclas de número escrevem o algarismo. |
| **Par ou ímpar** | ← → passam pelos números; ↑ (ou P) põe em par, ↓ (ou I) em ímpar. |
| **Dinheiro e troco** | ← → escolhem a nota ou moeda (nota faz barulho de papel, moeda tilinta); ↑ põe na bandeja, ↓ tira. **O** diz o que tem na bandeja. |
| **Grupos iguais** | ← → passam pelas cestas e, depois da última, pela resposta; ↑ ↓ põem ou tiram fruta, ou trocam o cartão. |

## Quando ainda não está certo

Não tem limite de tempo nem mensagem negativa. Ao apertar Enter, se ainda não estiver certo, o robô diz "Vamos conferir juntos" e dá uma dica falada, como a dica visual da turma:

- conta junto em voz alta ("1, 2, 3, 4, 5");
- na comparação, toca as frutas **em duplas**, um som de cada lado ao mesmo tempo. A fruta que sobra toca sozinha, do lado da cesta que tem mais;
- no par e ímpar, toca o número em duplas, e o que sobra toca sozinho;
- no dinheiro, soma em voz alta ("10 reais; 15 reais").

O que o aluno já fez continua lá. Qualquer tecla interrompe a dica. Estrelas: acertou de primeira = 3; na segunda = 2; depois = 1.

## Opções do menu (para o professor)

- **Ano:** 1º, 2º ou 3º ano. Enter troca.
- **Voz do jogo: ligada ou desligada.** Se o aluno usa o NVDA, **desligue a voz do jogo**: aí só o NVDA fala, e as duas vozes não falam ao mesmo tempo. Os sons de contar continuam.
- **Sons: ligados ou desligados.** Para contar ouvindo, deixe ligados.
- **Braille: ligado ou desligado.** Ligado, o jogo diz os pontos dos números ("sinal de número, pontos 3, 4, 5 e 6; depois pontos 1 e 2") e mostra a cela na tela. É bom para o aluno conferir na reglete ou na máquina Perkins.

As opções e as estrelas ficam guardadas no navegador do computador.

## Sugestão

O jogo funciona ainda melhor junto com **material concreto**: tampinhas ou fichas, o material dourado e dinheirinho de brinquedo com marcas em relevo. O aluno pode montar com as mãos o que está fazendo no jogo.

## Arquivos

```
acessivel/index.html            telas (com rótulos para leitor de tela)
acessivel/feira-acessivel.css   ajustes de visual (o alto contraste vem do Robô Letrinha acessível)
acessivel/dados.js              nomes das frutas e do dinheiro, falas e braille
acessivel/sons.js               sons de cada peça e sequências para contar
acessivel/jogo.js               teclado, menu, atividades e dicas
```

As fases e as regras são as mesmas do jogo da turma (`../js/fases.js` e `../js/regras.js`). A voz vem de `../../acessivel/som.js`.

Para conferir os textos falados: `node testes/matematica-acessivel.test.js`.
