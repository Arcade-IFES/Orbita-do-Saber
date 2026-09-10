# Órbita do Saber

Jogo arcade educativo em HTML, CSS e JavaScript puros, no estilo dos fliperamas dos anos 1980. O jogador pilota uma nave contra ondas de invasores e, a cada onda limpa, enfrenta um campo de asteroides com uma pergunta de conhecimentos gerais. Acertar rende pontos e um reforço de combate.

O placar final entra em um ranking de dez posições com iniciais de três letras, como nas máquinas originais.

---

## Como jogar

Baixe os dois arquivos, deixe-os **na mesma pasta** e abra o `orbita-do-saber.html` no navegador. Não precisa instalar nada, nem servidor, nem internet.

### Controles

| Ação | Teclado | Celular |
|---|---|---|
| Mover a nave | `←` `→` ou `A` `D` | botões ◀ ▶ ou arrastar o dedo na tela |
| Atirar | `espaço` | botão ATIRAR |
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

A ordem ser fixa é proposital: o aluno aprende a sequência e passa a calcular se vale arriscar um chute quando o próximo prêmio é a nave extra.

Errar **não custa vida**. Você só perde o reforço daquela rodada, e a resposta correta aparece na tela com a explicação. No fim da partida, todas as questões erradas são listadas com a justificativa — é o momento didático do jogo.

---

## Estrutura dos arquivos

```
orbita-do-saber.html   → o jogo inteiro (motor, interface, ranking)
perguntas.js           → o banco de questões
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

Guarda as dez melhores partidas com iniciais, pontos, onda alcançada, precisão de tiro e aproveitamento nas provas.

O código de persistência está isolado em duas funções, no topo do script do jogo:

```js
const ranking = {
  async carregar(){ /* devolve um array de placares */ },
  async gravar(lista){ /* persiste o array */ }
};
```

Por padrão ele usa o armazenamento do navegador, o que significa que **cada máquina guarda o próprio ranking**. Para uma tabela única da turma, hospede o jogo e troque o corpo das duas funções por chamadas à sua API:

```js
const ranking = {
  async carregar(){
    const r = await fetch("/api/ranking");
    return await r.json();
  },
  async gravar(lista){
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lista)
    });
    return true;
  }
};
```

Nenhuma outra parte do jogo precisa ser alterada.

---

## Detalhes técnicos

- **Sem dependências.** Nenhuma biblioteca, nenhum build, nenhum `npm install`.
- **Canvas 2D** para o jogo, HTML e CSS para os menus e o placar.
- **Sprites em pixel art** desenhados por matrizes de texto no próprio código, sem arquivos de imagem.
- **Áudio via Web Audio API**, gerado em tempo real — sem arquivos de som.
- **Fonte Press Start 2P** carregada do Google Fonts, com monoespaçada do sistema como reserva caso não haja internet.
- **Responsivo**, com controles de toque que aparecem automaticamente em telas pequenas.

---

## Escolhas de projeto

**Dificuldade única, sem seletor.** Se cada aluno escolhesse o próprio nível, o ranking não compararia nada. Todo mundo joga com três vidas e a mesma curva de dificuldade.

**O conteúdo não domina o jogo.** A pergunta é uma parada de vinte segundos entre ondas, não o loop principal. Isso mantém a tensão de arcade e faz o acerto parecer recompensa, não obrigação.

**Errar não pune.** Chutar custa apenas o prêmio, nunca uma vida. O objetivo é incentivar a tentativa e mostrar a explicação, não humilhar quem não sabe.

---

## Créditos

Desenvolvido para uso educacional no Ifes. As questões foram escritas originalmente para este projeto, seguindo os conteúdos da BNCC do ensino médio, e não reproduzem provas de vestibular ou ENEM.
