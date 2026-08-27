# FateConnect

Plataforma de caronas. Este repositório reúne o produto — front-end e APIs — e os documentos das disciplinas mantidos junto dele.

## Estrutura

```
FateConnect/
  Web/                front-end em React + Vite       → FateConnect/Web/README.md
  FateConnect.Api/    API .NET em módulos (Auth, Caronas, Achados, Denuncias, Usuarios)
  Carona/             microsserviço de caronas em .NET 8 com DDD → FateConnect/Carona/README.md
.claude/              contexto que um agente de código carrega ao trabalhar aqui
.github/workflows/    validação de PR e criação da tag de release
.githooks/            hooks locais de lint e teste
deploy/               publicação em homologação e produção → deploy/README.md
ESII/  ESIII/  LBD/   documentos das disciplinas, versionados por entrega
CHANGELOG.md          histórico de mudanças no formato Keep a Changelog
package.json          a versão do projeto, e nada mais
```

## Idioma

- Interface, URLs e copy de produto: **pt-BR**
- Código e estrutura — identificadores, arquivos, pastas: **inglês**
- Mensagem de commit, nome de branch e **título** de PR em inglês. A **descrição** do PR é o único texto do fluxo git em pt-BR
- Issues em pt-BR: são documento de planejamento lido pelo time

## Fluxo de trabalho

Branch base é a **`develop`**, e o nome da branch sai da issue: `<tipo>/<número>` — `chore/48`, `feat/56`. Toda alteração começa por uma issue no GitHub, e o número dela alimenta a branch, o título e o corpo do PR.

Release sobe por `develop` → `release/x.y.z` → `main`, e a `main` volta para a `develop` sozinha depois do merge.

Os hooks não vêm habilitados no clone, porque o repositório usa `core.hooksPath` em vez de instalar um gerenciador de hooks — o que reapontaria o caminho e desligaria os hooks do Git LFS:

```bash
git config core.hooksPath .githooks
```

## Versão e tag

A versão do projeto é a do **`package.json` da raiz**. Os pacotes de dentro têm versão própria — a do front não diz nada sobre a release.

PR para a `main` reprova quando essa versão já tem tag: ou o bump foi esquecido, ou a versão foi reaproveitada, e nos dois casos a release entraria sem tag nova. Depois do merge, o push na `main` cria a tag `vX.Y.Z` anotada no commit publicado, sem passo manual.

A validação consulta as tags no **remoto**. Consultar localmente aprovaria qualquer versão em silêncio: o checkout do CI traz um commit e nenhuma tag, então uma busca local nunca acharia nada.

## Integração contínua

| Workflow      | Quando                                       | O que faz                                                          |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| `check.yml`   | PR que toca `FateConnect/Web/**` ou a versão | valida a versão, tipos, lint, testes e build do front              |
| `release.yml` | push na `main`                               | cria a tag da versão publicada e devolve a `main` para a `develop` |

O `check.yml` não roda em PR que não mexe no front: mudança de back-end não tem por que pagar a suíte de front. O `package.json` da raiz entra no filtro por causa da validação de versão — mudança de versão não pode escapar dela.

Os dois passos da release moram no mesmo workflow porque acontecem no mesmo evento: o push que a `main` recebe quando a release entra. Eles não dependem um do outro — falha ao marcar a tag não impede a sincronização, e vice-versa.

O job de back-merge do `release.yml` empurra **direto na `develop`**, sem PR: a ruleset da `develop` concede bypass a uma **deploy key** de escrita, que o workflow usa no checkout, e a da `main` não concede a ninguém — a release continua exigindo PR e review. Bypass para o app GitHub Actions resolveria sem chave nenhuma, mas ele exige repositório de organização: em conta pessoal a API recusa o ator. O caminho comum é fast-forward, porque a `develop` normalmente não andou desde o corte da release. Quando andou, o job faz o merge de verdade; se conflitar, ele para e reporta, porque escolher qual lado vale é decisão humana.

Não há envio de cobertura para o GitHub: o Code Quality exige repositório de organização em plano Team ou Enterprise Cloud, e este é de conta pessoal. Quem reprova por cobertura é o limite do Vitest, dentro do `test:ci`.

## Configuração do agente de código

A pasta **`.claude/`** guarda o contexto que um agente de código carrega ao trabalhar aqui. Ela é **versionada de propósito**: a orientação vale igual para quem clonar o repo, e mudar uma regra passa por review no PR como qualquer código.

| Artefato            | O que é                                                               | Quando carrega                                                         |
| ------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `CLAUDE.md`         | Instruções do repositório: idioma, fluxo de trabalho, stack, comandos | sempre                                                                 |
| `rules/*.md`        | Padrão que vale para uma área do código                               | pelo `paths:` do arquivo — ao abrir um arquivo que casa                |
| `skills/*/SKILL.md` | Procedimento sob demanda, com passos                                  | quando a tarefa casa com a `description`, ou pelo nome (`/pr-creator`) |

As skills de hoje: **`pr-creator`** (abrir e atualizar PR), **`write-commit`** (mensagem de commit e agrupamento em commits), **`changelog-writer`** (entrada do `CHANGELOG.md`) e **`fateconnect-create-component`** (criar componente no front).

### Como mexer nela

- **Escope a rule pelo `paths:`.** Sem ele a rule carrega em toda sessão e custa contexto para sempre, inclusive nas que não tocam aquela pasta.
- **A rule anda junto com o código.** Padrão novo e a regra que o descreve entram no mesmo PR — separar os dois é como eles divergem.
- **É conteúdo público.** Vale a mesma restrição do resto do repositório: nada de nome de empregador, repositório interno, pacote privado ou ferramenta corporativa. Quando a orientação vier de fonte interna, registre só a decisão e a justificativa.

O raciocínio completo — quando uma correção merece virar regra, e onde cada coisa mora — está em `.claude/rules/harness-evolution.md`.
