# Régua de copy

O glossário decidido e as proibições de uma linha estão na rule `product-copy.md`; aqui está o resto da régua, para aplicar durante a escrita.

## A voz

**Direta** (o mais importante primeiro, na menor frase), **transparente** (diz o porquê de recusa, limite e bloqueio), **prática** (orienta a saída) e **ponderada** (trata quem lê como adulto, sobretudo na falha).

## Landing: vender sem hipérbole

- Persuadir é ser específico, não entusiasmado: a versão objetiva de um mesmo site rendeu +27% de usabilidade, e +124% somada a concisão e escaneabilidade ([Nielsen Norman Group](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/)).
- O teste de cada frase: ela sobrevive a "como assim?". `Divida o custo` sobrevive; `total praticidade` não.
- Benefício, não recurso. Sem autoelogio (`nossa plataforma`, `total`, `o melhor`), sem "!", frase curta, chamada com verbo primeiro e o ganho junto (nunca `Saiba mais` solto).
- A landing pode anunciar funcionalidade de milestone aberta (escopo acadêmico público), com a mesma régua.

## Título de documento e resumo de busca

- Moram em `FateConnect/Web/src/routes/pageMetadata.ts`, uma entrada por rota. Título distinto por rota, inclusive a interna (a WCAG 2.4.2 pede, e num SPA é o que avisa o leitor de tela que a tela mudou).
- Padrão `<Tela> | FateConnect`; só a landing põe a marca à frente. A palavra que distingue vem primeiro.
- O título não é o `<h1>`: nomeia o destino, não o estado da tela, com o nome que o produto já usa na navegação.
- `meta description` só em rota pública, com a régua da landing. Cortes: título ~60 caracteres no resultado (20 a 30 na aba), resumo ~160.

## Diálogo

- O nome da ação aparece uma vez: `Confirmar exclusão` / `Excluir`, ou `Marcar como encontrado` / `Confirmar`. Nunca a ação nos dois; título que só emoldura devolve o verbo ao botão.
- Ação reversível pela tela troca o diálogo por `Desfazer` no aviso; ação sem volta mantém o diálogo.
- O verbo nomeia o resultado, não o gesto: pergunte o que sobra depois da ação.

## Nomes

- Um conceito, uma palavra, em etiqueta, botão, título e aviso: varra o artefato inteiro.
- O tell de que a distinção de ação vazou para o estado é um rótulo de estado que só se escreve tendo um item na mão.
- Palavra com dono fora do produto (conceito jurídico, técnico, regulatório) se confere na definição antes de batizar.
- Cabeçalho de seção é frase nominal com o conteúdo (`Dados para contato`), não a natureza do ajuste (`Ajustes do sistema`), e não repete o nome de um item de dentro. Nomeie pelo que a seção vai reunir.

## Peças

- **Aviso que some** (o toast) é uma frase curta: o recado com motivo, prazo e saída vira diálogo, como o da conta bloqueada.
- **Aviso de envio que a tela não confirma** (a API responde igual para tudo) condiciona o fato no particípio: `Se a conta ainda não foi confirmada, um novo link foi enviado ao seu e-mail Fatec.` ⛔ Condicione só o que nenhuma outra resposta do mesmo fluxo revela: o pedido de redefinição responde `404` para e-mail sem conta, então a tela de link enviado afirma (`Para escolher a nova senha, abra o link enviado para {e-mail}.`).
- **Tela que espera uma ação** tem por título a ação, com o verbo do e-mail que a pessoa vai abrir: `Confirme seu e-mail`, como o assunto, e não `Confira seu e-mail`, que só manda olhar.
- **Tooltip** complementa, não repete; no botão só de ícone ele é o nome e repete o rótulo acessível. Até duas linhas.
- **Nota ao lado de etiqueta** diz o que a etiqueta não diz; havendo só repetição, a nota não existe. Texto de reserva é onde a repetição nasce.
- **Estado vazio:** status, o que apareceria ali e a saída. Nunca "Ops", nunca parecer erro.
- **Verbos:** `Acesse`/`Selecione` (não `Clique`/`Toque`), `Insira` (não `Digite`), `Confira`/`Consulte` (não `Veja`); âncora diz para onde vai (nunca `Clique aqui`).
- **Pontuação:** onde o `—` apareceria cabe ponto, dois pontos, ou nada porque a frase encurtou.
- **Neutro e acessível:** linguagem neutra ("a pessoa responsável"), nunca `x` ou `@`; o texto funciona só ouvido; sem jargão nem metáfora.

## E-mail transacional

O e-mail que a conta dispara (confirmação, redefinição, aviso de segurança) segue o [manual de serviço do GOV.UK](https://www.gov.uk/service-manual/design/sending-emails-and-text-messages):

- **Assunto** com a ação ou o fato primeiro e a marca no fim (`Confirme seu e-mail do FateConnect`): o celular corta o fim.
- **A primeira frase diz por que a pessoa recebeu o e-mail**, a ação que ela fez; é a que aparece na prévia da caixa de entrada.
- Abre com `Olá, {nome}.`, o nome por extenso, igual em todos: o nome completo dificulta a imitação.
- **Uma ação por e-mail**: o botão segue a régua de botão, e abaixo dele vai o endereço inteiro, para quem desconfia do botão ver para onde ele leva.
- **A versão só em texto diz `link` onde o HTML diz `botão`** (`confirme seu e-mail pelo link abaixo`), e o endereço vem depois do rótulo do botão (`Confirmar e-mail: https://…`); a frase de quem desconfia do botão sai dela.
- Diz o prazo e o uso único do link, e o que acontece se não foi a pessoa (`Se não foi você, pode ignorar este e-mail. Sua senha continua a mesma.`).
- **"Se não foi você" depende do que aconteceu:** pedido que talvez não seja da pessoa (confirmação, senha) se ignora; fato consumado (bloqueio) pede uma saída ativa, como trocar a senha, e nunca "responda", que o rodapé desmente.
- Prazo e contagem vêm das constantes da regra, nunca escritos à mão no texto, e o número decide o plural da palavra ao lado (`1 minuto`, `30 minutos`): com a constante em 1, o plural fixo sai "1 minutos" sem erro nenhum.
- Dois-pontos só antes de lista ou do endereço do link; no meio da frase, ponto. Os dois-pontos cortam a leitura e deixam o texto com cara de formulário.

## Largura

Copy que carrega número, faixa ou unidade se mede no contêiner real, a 375px, antes de ir às candidatas. O método de medir e a assimetria de custo por lugar estão na skill `visual-validation`, `references/measurement-pitfalls.md` §"Largura de texto".
