# FateConnect

Plataforma de caronas. Este repositório reúne o produto — front-end e API — e os documentos das disciplinas mantidos junto dele.

## Estrutura

```
FateConnect/
  Web/                    front-end em React + Vite       → FateConnect/Web/README.md
  FateConnect.Api/        API .NET em módulos (Achados, Auth, Common, Denuncias, Rides, Usuarios)
  FateConnect.Api.Tests/  suíte xUnit da API, pasta irmã e não filha
.claude/                  contexto que um agente de código carrega ao trabalhar aqui
.github/workflows/        validação de PR e criação da tag de release
.githooks/                hooks locais de lint, build e teste
deploy/                   publicação em homologação e produção → deploy/README.md
scripts/                  scripts de manutenção do repositório
ESII/  ESIII/  LBD/       documentos das disciplinas, versionados por entrega
CHANGELOG.md              histórico de mudanças no formato Keep a Changelog
CONTRIBUTING.md           como propor uma mudança
CODE_OF_CONDUCT.md        o que se espera de quem participa
SECURITY.md               como relatar vulnerabilidade
LICENSE                   MIT
package.json              a versão do projeto, e nada mais
```

## Idioma

- Interface, URLs e copy de produto: **pt-BR**
- Código e estrutura — identificadores, arquivos, pastas: **inglês**
- Mensagem de commit, nome de branch e **título** de PR em inglês. A **descrição** do PR é o único texto do fluxo git em pt-BR
- Issues em pt-BR: são documento de planejamento lido pelo time

## Como contribuir

O caminho de quem vai propor uma mudança está em **[CONTRIBUTING.md](CONTRIBUTING.md)**; o que se espera de quem participa, no **[Código de Conduta](CODE_OF_CONDUCT.md)**. Vulnerabilidade **não** vai para issue pública — o canal está em **[SECURITY.md](SECURITY.md)**.

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

| Workflow          | Quando                                        | O que faz                                                                   |
| ----------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| `check-front.yml` | todo PR                                       | valida o front: versão, tipos, lint, testes, build e Sonar                   |
| `check-api.yml`   | todo PR                                       | valida a API: compilação, testes e Sonar                                    |
| `check-version.yml` | PR para a `main`                            | reprova quando a versão da raiz já tem tag                                  |
| `deploy.yml`      | push na `develop`                             | publica em homologação                                                      |
| `release.yml`     | push na `main`                                | cria a tag, publica em produção e devolve a `main` para a `develop`         |
| `sonar-main.yml`  | push na `main`                                | analisa a `main` dos dois projetos, linha de base do código novo de cada PR |
| `publish.yml`     | chamado pelos dois de publicação              | constrói o front e sobe um ambiente — os passos que homologação e produção compartilham |

Os checks de front e de API disparam em todo PR, e cada um decide se tem o que fazer olhando os arquivos alterados: PR que só mexe no back-end não paga a suíte de front, nem o contrário. Mudança só de documentação não roda suíte nenhuma: nenhum `.md` é importado pelo código, então não há o que validar. `React front (Web)` e `.NET API` são exigidos para mergear, e um check que não teve o que fazer reporta verde do mesmo jeito.

A validação de versão tem workflow próprio porque a versão é do repositório, não de um lado dele. Como passo do check do front ela dependia do recorte daquele job, e PR para a `main` que não tocasse o front nem o `package.json` a pulava em silêncio — que é exatamente o bump esquecido que ela existe para pegar. Ela é a única que filtra pela branch de destino no próprio gatilho, porque é a única cuja condição é a branch: só aparece em PR para a `main`.

Cada check é um workflow, e não um job dentro de um arquivo só, para que cada assunto tenha o seu. Cada um leva grupo de concorrência próprio: compartilhá-lo faria um cancelar o outro, já que execução nova na mesma branch cancela a anterior.

Os três jobs da release moram no mesmo workflow porque acontecem no mesmo evento: o push que a `main` recebe quando a release entra. A tag não depende de ninguém — falha ao marcá-la não impede a publicação nem a sincronização, e vice-versa. O back-merge, esse, espera a publicação terminar: o push que ele faz na `develop` é o que dispara a publicação de homologação, e as duas usam o mesmo checkout na VPS. Publicação reprovada não perde o back-merge, porque a correção entra na `main` e esse push refaz o workflow inteiro.

O job de back-merge do `release.yml` empurra **direto na `develop`**, sem PR: a ruleset da `develop` concede bypass a uma **deploy key** de escrita, que o workflow usa no checkout, e a da `main` não concede a ninguém — a release continua exigindo PR e review. Bypass para o app GitHub Actions resolveria sem chave nenhuma, mas ele exige repositório de organização: em conta pessoal a API recusa o ator. O caminho comum é fast-forward, porque a `develop` normalmente não andou desde o corte da release. Quando andou, o job faz o merge de verdade; se conflitar, ele para e reporta, porque escolher qual lado vale é decisão humana.

São **dois projetos no Sonar**, um por lado: um `projectKey` não se divide entre dois scanners, porque o front usa a action genérica e C# exige o SonarScanner for .NET em volta do `dotnet build`. Os gates diferem numa linha — o do front cobra cobertura de código novo, o da API ainda não.

Quem reprova por cobertura é o **quality gate do Sonar**, que mede o código novo do PR, somado ao limite do Vitest dentro do `test:ci`. Não há envio para o Code Quality do GitHub: ele exige repositório de organização em plano Team ou Enterprise Cloud, e este é de conta pessoal.

A análise da `main` existe para dar ao Sonar a **linha de base** da branch principal, sobre a qual o código novo da própria `main` é medido. Análise de PR não depende dela: o código novo de um PR é o diff dele contra a base, que o Sonar tira do git. Ela declara a versão do `package.json` da raiz porque a definição de código novo do projeto é *previous_version*: sem versão declarada não há fronteira, nenhuma métrica de código novo é calculada, e o gate reprova por não ter o que avaliar.

## Configuração do agente de código

A pasta **`.claude/`** guarda o contexto que um agente de código carrega ao trabalhar aqui. Ela é **versionada de propósito**: a orientação vale igual para quem clonar o repo, e mudar uma regra passa por review no PR como qualquer código.

| Artefato            | O que é                                                               | Quando carrega                                                         |
| ------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `CLAUDE.md`         | Instruções do repositório: idioma, fluxo de trabalho, stack, comandos | sempre                                                                 |
| `rules/*.md`        | Padrão que vale para uma área do código                               | pelo `paths:` do arquivo — ao abrir um arquivo que casa                |
| `skills/*/SKILL.md` | Procedimento sob demanda, com passos                                  | quando a tarefa casa com a `description`, ou pelo nome (`/pr-creator`) |

As skills de hoje: **`spec-issue`** (especificar uma issue e dividir em sub-issues), **`pr-creator`** (abrir e atualizar PR), **`resolve-pr-comments`** (triar e responder review), **`write-review-comment`** (comentar o PR de outra pessoa), **`write-commit`** (mensagem de commit e agrupamento em commits), **`changelog-writer`** (entrada do `CHANGELOG.md`), **`create-release`** (cortar uma versão e publicar), **`ux-writing`** (texto de interface) e **`fateconnect-create-component`** (criar componente no front).

### Como mexer nela

- **Escope a rule pelo `paths:`.** Sem ele a rule carrega em toda sessão e custa contexto para sempre, inclusive nas que não tocam aquela pasta.
- **A rule anda junto com o código.** Padrão novo e a regra que o descreve entram no mesmo PR — separar os dois é como eles divergem.
- **É conteúdo público.** Vale a mesma restrição do resto do repositório: nada de nome de empregador, repositório interno, pacote privado ou ferramenta corporativa. Quando a orientação vier de fonte interna, registre só a decisão e a justificativa.

O raciocínio completo — quando uma correção merece virar regra, e onde cada coisa mora — está em `.claude/rules/harness-evolution.md`.

## Licença

[MIT](LICENSE). O aviso de copyright acompanha qualquer cópia ou trecho reaproveitado.
