# Órbita do Saber

Jogo arcade educativo em HTML, CSS e JavaScript puros, no estilo dos fliperamas dos anos 1980. O jogador pilota uma nave contra ondas de invasores e, a cada onda limpa, enfrenta um campo de asteroides com uma pergunta de conhecimentos gerais. Acertar rende pontos e um reforço de combate.

O placar final entra em um ranking de dez posições com iniciais de três letras, como nas máquinas originais.

---

## Como jogar

Baixe o `orbita-do-saber.html`, o `perguntas.js` e o `ranking.js`, deixe-os **na mesma pasta** e abra o `orbita-do-saber.html` no navegador. Não precisa instalar nada, nem internet. Assim, cada máquina guarda o próprio ranking; para gravar o ranking no arquivo `ranking.js` e compartilhá-lo, rode o `servidor.js` (veja [O ranking](#o-ranking)).

### Controles

| Ação | Teclado | Celular |
|---|---|---|
| Mover a nave | `←` `→` ou `A` `D` | botões ◀ ▶ ou arrastar o dedo na tela |
| Atirar | `espaço` | botão ATIRAR |
| Bomba (quando houver uma guardada) | `B` | botão BOMBA |
| Ligar ou desligar o som | `M` | botão ♪ SOM no topo |
| Pausar | `P` ou `Esc` | — |

---

## Como o jogo funciona

### O combate

Uma formação de invasores desce em direção à sua nave, movendo-se de lado e caindo um degrau a cada vez que encosta na borda. São três tipos:

| Inimigo | Cor | Pontos | Resistência |
|---|---|---|---|
| Peão | ciano | 25 | 1 tiro |
| Veloz | verde-limão | 40 | 1 tiro |
| Couraçado | rosa | 70 | 2 tiros |

De tempos em tempos um inimigo se solta da formação e **mergulha** em curva na sua direção: vale o triplo, mas colide com a nave. Um **disco rosa** também cruza o topo da tela de vez em quando, valendo de 200 a 800 pontos.

Se a formação alcançar a linha vermelha, você perde uma vida e ela é empurrada de volta para cima.

### A pontuação

O multiplicador é o coração da competitividade. Ele sobe a cada dez abates e vai até **x8**, mas **um único tiro recebido zera tudo**. Isso separa quem apenas sobrevive de quem domina o jogo.

- Onda limpa: 200 × número da onda
- Onda perfeita, sem levar dano: 1.000 extras
- Resposta certa na prova: 250 × número da onda

Todos esses valores são multiplicados pelo multiplicador ativo.

### A prova

Ao limpar cada onda, quatro asteroides entram flutuando com as alternativas escritas. Você tem **20 segundos** para atirar na resposta certa.

Acertar dá pontos e um reforço, num ciclo fixo que se repete:

1. **Escudo** — absorve um impacto sem custar vida **e sem zerar o multiplicador**
2. **Tiro triplo** — leque de três projéteis por duas ondas
3. **Cadência rápida** — quase o dobro da taxa de disparo por duas ondas
4. **Nave extra** — até o limite de cinco
5. **Tiro perfurante** — os projéteis atravessam os inimigos em vez de parar no primeiro, por duas ondas
6. **Bomba** — fica guardada (no máximo duas). Ao apertar `B`, limpa os tiros inimigos e os mergulhadores e causa 1 de dano em toda a formação. Não zera a onda sozinha
7. **Pontos em dobro** — dobra o multiplicador por uma onda
8. **Nave extra** — a segunda do ciclo, então ela aparece a cada quatro prêmios

O ciclo tem oito passos e a ordem ser fixa é proposital: o aluno aprende a sequência e passa a calcular se vale arriscar um chute quando o próximo prêmio é a nave extra.

Errar **não custa vida**. Você só perde o reforço daquela rodada, e a resposta correta aparece na tela com a explicação. No fim da partida, todas as questões erradas são listadas com a justificativa — é o momento didático do jogo.

### Fases especiais

A cada **cinco ondas** (5, 10, 15...) o combate normal dá lugar a uma fase especial, e a prova de conhecimento continua vindo logo depois. Elas se alternam:

| Onda | Fase | O que acontece |
|---|---|---|
| 5, 15, 25... | **Chefe** | Uma nave-mãe com barra de vida. Ela atira em leque e, conforme perde energia, fica mais rápida e passa a mirar em você (três estágios). O 1º chefe tem 40 de vida e cada chefe seguinte tem 20 a mais. Derrotá-lo vale 1.000 × onda × multiplicador e dá uma bomba |
| 10, 20, 30... | **Chuva de meteoros** | Sem inimigos: sobreviva 25 segundos destruindo o que cair. Meteoros grandes aguentam 3 tiros, os dourados valem 300. Colidir custa uma vida como qualquer outro dano |

Para mudar a frequência, edite a constante `ESPECIAL_A_CADA` no topo do script do jogo.

### A trilha sonora

Música chiptune gerada em tempo real, com um tema para cada momento: combate, prova (o ritmo acelera nos últimos 5 segundos), chefe (fica mais intenso a cada estágio) e chuva de meteoros. O volume da trilha é a constante `VOL_MUSICA`, e a preferência de som é lembrada no navegador. Para trocar ou criar temas, veja a tabela `FAIXAS` e as funções `mCombate`, `mProva` e `mChefe`.

---

## Estrutura dos arquivos

```
orbita-do-saber.html   → o jogo inteiro (motor, interface, trilha sonora)
perguntas.js           → o banco de questões
ranking.js             → as 10 melhores partidas (lido pelo jogo, gravado pelo servidor.js)
servidor.js            → servidor local opcional que grava o ranking.js
.github/               → workflow que cria a tag e o Release a cada push na main
```

A separação é intencional: um professor pode editar o banco sem nunca abrir o código do jogo, e o histórico de versões mostra "adicionadas 40 questões de química" em vez de um diff gigante.

---

## O banco de questões

São **250 questões** escritas de acordo com os conteúdos da BNCC do ensino médio, distribuídas assim:

| Área | Questões |
|---|---|
| Matemática | 30 |
| Lógica e programação | 30 |
| Física | 24 |
| Português e literatura | 24 |
| Química | 22 |
| Biologia | 22 |
| História | 20 |
| Desenvolvimento web | 20 |
| Geografia | 18 |
| Dados, redes e sistemas | 16 |
| Filosofia e sociologia | 12 |
| Inglês | 12 |

O sorteio é **equilibrado por matéria**: cada área é embaralhada separadamente e depois intercalada, então as primeiras doze perguntas de uma partida saem sempre de doze matérias diferentes. Nada de cair em cinco de matemática seguidas.

### Como adicionar questões

Abra o `perguntas.js` e copie uma linha:

```js
{
  q: "Qual é o valor de log₂ 32?",   // enunciado, pode ser longo
  a: ["5", "4", "6", "8"],           // a PRIMEIRA é sempre a correta
  e: "2⁵ = 32, então o logaritmo vale 5.",
  m: "matematica"                    // matéria, usada no sorteio equilibrado
},
```

Três regras:

1. **A primeira alternativa é sempre a resposta certa.** O jogo embaralha a ordem sozinho na hora de posicionar os asteroides.
2. **As alternativas precisam ser curtas**, no máximo uns 12 caracteres, porque são escritas dentro dos asteroides. O enunciado pode ser longo à vontade — ele aparece na faixa acima da tela.
3. **O campo `m` pode ser qualquer texto.** Criar uma matéria nova é só usar um nome novo; o sorteio se ajusta automaticamente.

Se o `perguntas.js` estiver faltando ou vazio, o jogo avisa na faixa e desabilita o botão de iniciar, em vez de travar no meio da partida sem explicação.

---

## O ranking

Guarda as dez melhores partidas com iniciais, pontos, onda alcançada, precisão de tiro e aproveitamento nas provas, no arquivo **`ranking.js`**. O jogo o lê por `<script>`, exatamente como lê o `perguntas.js`.

Um navegador não consegue gravar em arquivos do seu computador, então quem escreve no `ranking.js` é o `servidor.js`, um servidor Node.js pequeno e sem dependências:

```
node servidor.js
```

Abra `http://localhost:8080` e jogue. A cada placar novo o servidor mescla com os existentes, mantém os dez melhores e regrava o `ranking.js`. Como o arquivo fica no repositório, o ranking pode ser commitado como qualquer outro arquivo. Há duas variações úteis: `PORT=3000 node servidor.js` para outra porta e `HOST=0.0.0.0 node servidor.js` para a turma acessar pela rede (no PowerShell: `$env:PORT=3000; node servidor.js`).

Sem o servidor, ou seja, abrindo o HTML direto ou numa hospedagem estática como o GitHub Pages, o jogo continua funcionando: o `ranking.js` é lido normalmente, mas os placares novos ficam guardados no navegador de quem jogou, e a tela do ranking avisa isso.

Sobre segurança: o servidor entrega só arquivos soltos da pasta do jogo, aceita gravação apenas de `application/json` vindo da própria origem, valida e limpa cada item (iniciais, pontos, onda) antes de gravar e escuta só em `localhost` por padrão.

---

## Detalhes técnicos

- **Sem dependências.** Nenhuma biblioteca, nenhum build, nenhum `npm install`. O `servidor.js`, opcional, precisa apenas do Node.js 14 ou mais novo.
- **Canvas 2D** para o jogo, HTML e CSS para os menus e o placar.
- **Sprites em pixel art** desenhados por matrizes de texto no próprio código, sem arquivos de imagem.
- **Áudio via Web Audio API**, gerado em tempo real — efeitos e trilha sonora, sem arquivos de som.
- **Fonte Press Start 2P** carregada do Google Fonts, com monoespaçada do sistema como reserva caso não haja internet.
- **Responsivo**, com controles de toque que aparecem automaticamente em telas pequenas.

---

## Escolhas de projeto

**Dificuldade única, sem seletor.** Se cada aluno escolhesse o próprio nível, o ranking não compararia nada. Todo mundo joga com três vidas e a mesma curva de dificuldade.

**O conteúdo não domina o jogo.** A pergunta é uma parada de vinte segundos entre ondas, não o loop principal. Isso mantém a tensão de arcade e faz o acerto parecer recompensa, não obrigação.

**Errar não pune.** Chutar custa apenas o prêmio, nunca uma vida. O objetivo é incentivar a tentativa e mostrar a explicação, não humilhar quem não sabe.

---

## Versões

O projeto segue [versionamento semântico](https://semver.org/lang/pt-BR/) (`MAJOR.MINOR.PATCH`), e o número da versão aparece no canto do letreiro do jogo. O workflow `.github/workflows/versao.yml` cuida disso sozinho: a cada push na `main` ele

1. soma 1 ao patch da última tag (`v1.1.0` vira `v1.1.1`);
2. grava o novo número na constante `VERSAO` do jogo, num commit do bot com `[skip ci]`;
3. cria a tag `vX.Y.Z` e publica um Release no GitHub, com as notas geradas a partir dos commits.

Pushes que só mudam o `ranking.js` ou arquivos `.md` não geram versão.

Para um salto de minor ou major, edite `VERSAO` no jogo para o número desejado (por exemplo `"1.2.0"`) e faça o push. Quando a constante é maior que a última tag, o workflow publica exatamente esse número.

Como o bot commita na `main`, rode `git pull` antes do próximo push. Se a `main` tiver proteção de branch exigindo pull request, o bot não conseguirá gravar: libere o `github-actions[bot]` na regra.

| Versão | O que mudou |
|---|---|
| v1.0.0 | Primeira versão jogável: combate, provas com 250 questões, reforços e ranking |
| v1.1.0 | Trilha sonora chiptune, três novos reforços (tiro perfurante, bomba, pontos em dobro) e fases especiais a cada cinco ondas (chefe e chuva de meteoros) |
| v1.1.1 em diante | Geradas pelo workflow; a lista completa está na página de Releases |

---

## Créditos

Desenvolvido para uso educacional no Ifes. As questões foram escritas originalmente para este projeto, seguindo os conteúdos da BNCC do ensino médio, e não reproduzem provas de vestibular ou ENEM.
