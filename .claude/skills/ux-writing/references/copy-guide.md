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

- **Tooltip** complementa, não repete; no botão só de ícone ele é o nome e repete o rótulo acessível. Até duas linhas.
- **Nota ao lado de etiqueta** diz o que a etiqueta não diz; havendo só repetição, a nota não existe. Texto de reserva é onde a repetição nasce.
- **Estado vazio:** status, o que apareceria ali e a saída. Nunca "Ops", nunca parecer erro.
- **Verbos:** `Acesse`/`Selecione` (não `Clique`/`Toque`), `Insira` (não `Digite`), `Confira`/`Consulte` (não `Veja`); âncora diz para onde vai (nunca `Clique aqui`).
- **Pontuação:** onde o `—` apareceria cabe ponto, dois pontos, ou nada porque a frase encurtou.
- **Neutro e acessível:** linguagem neutra ("a pessoa responsável"), nunca `x` ou `@`; o texto funciona só ouvido; sem jargão nem metáfora.

## Largura

Copy que carrega número, faixa ou unidade se mede no contêiner real, a 375px, antes de ir às candidatas. O método de medir e a assimetria de custo por lugar estão na skill `visual-validation`, `references/measurement-pitfalls.md` §"Largura de texto".
