# 🤖 Robô Letrinha

Jogo educativo que junta **alfabetização** e **programação** para o **1º, 2º e 3º ano do Ensino Fundamental**.

A criança monta um programa com blocos de setas para levar o robô até as letras ou sílabas e formar a palavra da figura, **na ordem certa**. Assim ela pratica a escrita de palavras e, ao mesmo tempo, aprende sequência, repetição e depuração (achar e corrigir erros no programa).

## Como abrir

O jogo é feito só com HTML, CSS e JavaScript, sem instalação:

- Abra o arquivo `index.html` em um navegador (Chrome, Edge, Firefox ou Safari), **ou**
- Publique a pasta no GitHub Pages ou em qualquer servidor de arquivos estáticos.

Funciona em computador, tablet e celular. A voz usa a síntese de fala do próprio navegador (português do Brasil). Sem internet, a fonte Andika é trocada por uma fonte do sistema e o restante continua funcionando.

## Versão acessível (alunos cegos)

A pasta [`acessivel/`](acessivel/) tem uma versão do jogo feita para alunos cegos ou com baixa visão. Ela funciona só pelo teclado, tem voz em português, sons que mostram a direção, opção de braille e funciona com o NVDA. Veja como usar em [`acessivel/README.md`](acessivel/README.md).

## Feira do Robô (matemática)

A pasta [`matematica/`](matematica/) tem um segundo jogo, de **matemática**, para o mesmo Ciclo de Alfabetização: o robô tem uma barraca de feira e a criança ajuda a contar, juntar, separar e pagar frutas e verduras. Tudo é feito com o mouse (arrastar e soltar ou clicar), sem depender de som. Veja [`matematica/README.md`](matematica/README.md). Ela também tem uma versão acessível para alunos cegos, em [`matematica/acessivel/`](matematica/acessivel/).

## Como jogar

1. Escolha o ano e a fase.
2. Veja a figura e a palavra que o robô precisa formar (🔊 lê a palavra em voz alta e soletra).
3. Toque nas setas para montar o programa: cada seta anda **uma casa**.
4. Toque em **▶ Executar**. O robô pega a peça quando passa por cima dela.
5. Se o robô bater numa pedra 🪨, sair do tabuleiro ou pegar a peça errada, ele para e mostra qual bloco deu problema. O programa continua lá para ser corrigido.
6. Ganhe até ⭐⭐⭐: quanto menos blocos, mais estrelas.

Atalhos de teclado: setas adicionam blocos, **R** adiciona REPETIR, **Enter** executa, **Backspace** apaga o último bloco.

## Progressão por ano

| Ano | Alfabetização | Programação | Tabuleiro |
| --- | --- | --- | --- |
| **1º ano** | Letras (palavras canônicas CV: SOL, BOLA, GATO, CASA…), nome das letras falado | Sequência de comandos (setas) | 5×5, poucas pedras |
| **2º ano** | Sílabas simples (BO-NE-CA, MA-CA-CO…) e leitura de frase ao vencer | Sequência + **repetição** (bloco 🔁 REPETIR) | 6×6 |
| **3º ano** | Sílabas complexas e dígrafos (CH, NH, LH, RR, SS, QU, GU, encontros consonantais) com "pegadinhas" parecidas (XU × CHU, NA × NHA, LA × LHA) | Repetição + **otimização**: limite de blocos | 7×7, mais obstáculos |

Cada ano tem 10 fases, liberadas uma a uma. O progresso fica salvo no navegador. Para começar do zero (por exemplo, quando outro aluno vai usar o computador), abra **Para o professor**, no fim da tela inicial, e clique em **🧽 Apagar o progresso**. O jogo pergunta na própria página antes de apagar.

## Habilidades trabalhadas

**Alfabetização (Língua Portuguesa)**
- Reconhecer letras e relacionar o nome da letra ao seu som.
- Compreender que a ordem das letras/sílabas muda a palavra.
- Segmentar palavras em sílabas e reconstruí-las.
- Diferenciar grafias próximas e dígrafos (CH/X, NH/N, LH/L, RR, SS, QU, GU).
- Ler frases curtas com a palavra formada em destaque.

**Pensamento computacional (BNCC Computação)**
- Criar e seguir uma sequência de passos (algoritmo).
- Usar repetição para encurtar programas.
- Testar, encontrar o erro (o bloco fica destacado em vermelho) e corrigir — depuração.
- Comparar soluções e buscar a mais curta (estrelas e limite de blocos).

## Sugestões para a sala de aula

- **Antes do computador:** desenhe o tabuleiro no chão com fita crepe; uma criança é o "robô" e a turma dita as setas.
- **Em duplas:** uma criança planeja o programa e a outra confere a palavra; depois trocam.
- **Depois da fase:** peça para escrever a palavra no caderno e criar uma nova frase com ela.

## Estrutura do projeto

```
index.html          telas do jogo
css/estilo.css      visual
js/dados.js         palavras, sílabas, figuras e frases de cada ano
js/fases.js         geração das fases (sempre iguais) e verificação de que têm solução
js/jogo.js          interface, execução do programa, voz, estrelas e progresso
testes/fases.test.js  confere que todas as fases têm solução
acessivel/          versão acessível (veja acessivel/README.md)
testes/acessivel.test.js  testes da versão acessível
matematica/         jogo de matemática Feira do Robô (veja matematica/README.md)
testes/matematica.test.js  confere as fases da Feira do Robô
testes/matematica-acessivel.test.js  confere as falas da Feira acessível
```

### Como adicionar palavras

Edite `js/dados.js` e acrescente um item na lista `palavras` do ano:

```js
{ palavra: 'PIPA', pecas: ['PI', 'PA'], figura: '🪁', frase: 'A pipa voa alto.' }
```

`armadilhas` (opcional) lista peças parecidas para confundir. Depois rode o teste:

```bash
node testes/fases.test.js
```
