# 🤖 Robô Letrinha Acessível

Versão do Robô Letrinha para alunos cegos ou com baixa visão. Ela tem o mesmo objetivo do jogo original: formar palavras pegando letras ou sílabas na ordem certa, e programar o robô com uma sequência de comandos (e depois corrigir os erros).

Tudo funciona **só pelo teclado**. O jogo fala sozinho, faz sons que mostram a direção nos fones de ouvido e também funciona com o leitor de tela NVDA.

## Teclas (sempre as mesmas)

| Tecla | O que faz |
| --- | --- |
| Setas ← ↑ → ↓ | Põem um comando no programa (cada seta = uma casa) |
| Enter | O robô anda seguindo o programa |
| Backspace (⌫) | Apaga só o último comando |
| Espaço | Repete a instrução: o que fazer agora e quais comandos já foram colocados |
| L | Diz onde está o robô e a próxima peça ("A letra O está uma casa à direita do robô"). Apertando L de novo, ele fala onde estão todas as peças |
| P | Fala a palavra de novo e soletra |
| H | Ajuda falada |
| Esc | Volta para o menu |

No menu: setas para cima e para baixo escolhem, Enter confirma.

## Opções do menu (para o professor ajustar)

- **Peças: letras ou sílabas.** Letras é bom para o 1º ano; sílabas, para o 2º e o 3º ano.
- **Braille: ligado ou desligado.** Ligado, o jogo diz os pontos de cada letra ("bê, pontos 1 e 2") e mostra a cela braille na tela.
- **Voz do jogo: ligada ou desligada.** Se o aluno usa o NVDA, **desligue a voz do jogo**: aí só o NVDA fala, e as duas vozes não falam ao mesmo tempo.
- **Sons: ligados ou desligados.**

- **Apagar o progresso.** Apaga as fases já feitas, para começar de novo na fase 1. O jogo pergunta "Tem certeza?": é preciso apertar Enter mais uma vez para apagar. Esc ou as setas cancelam. As outras opções (peças, braille, voz e sons) continuam como estavam.

As opções e as fases já feitas ficam guardadas no navegador do computador.

## Fases

| Etapa | Tabuleiro | O que treina |
| --- | --- | --- |
| 1. Primeiros passos (fases 1 a 5) | 3x3 | 1 ou 2 comandos para pegar letras: A, OI, EU, AI, PÉ |
| 2. Duas sílabas (fases 6 a 11) | 3x3 e depois 4x4 | BOLA, CASA, SAPO, GATO, LUVA, DEDO |
| 3. Três sílabas (fases 12 a 17) | 4x4 | BONECA, SAPATO, MACACO, PIPOCA, CAVALO, BANANA |

No fim da etapa 2 e na etapa 3 aparecem algumas peças que não fazem parte da palavra, para o aluno desviar delas.

## Sons

- **Andou / escolheu uma seta:** um bipe. Esquerda e direita tocam só de um lado do fone. Para cima é agudo e para baixo é grave.
- **Bateu na parede:** um som grave e áspero, do lado em que bateu.
- **Pegou a peça certa:** duas notas subindo.
- **Pegou a peça errada:** duas notas descendo.
- **Venceu:** uma musiquinha.

## Quando dá erro

Não tem limite de tempo. Quando o robô bate na parede ou chega numa peça errada, o jogo diz qual comando deu problema ("No comando 3, direita, o robô bateu na parede"). Ele **guarda os comandos que deram certo** e tira só o que deu problema e os que vinham depois dele. Assim o aluno continua dali, sem precisar apagar tudo.

## Arquivos

```
acessivel/index.html   telas (HTML com rótulos para leitor de tela)
acessivel/estilo.css   alto contraste e letras grandes
acessivel/dados.js     palavras, dicas e tabela braille
acessivel/fases.js     montagem das fases e simulação do robô
acessivel/som.js       sons com direção (estéreo) e voz
acessivel/jogo.js      teclado, menu e regras
```

Para conferir se todas as fases têm solução: `node testes/acessivel.test.js`.
