---
description: Migration do EF que renomeia ou move dado entre tabelas — o `dotnet ef` gera dropar e recriar, que apaga produção; como reescrever, provar que os dados sobrevivem, conferir o drift, a coluna obrigatória nova e a chave da relação 1:1
paths:
  - "FateConnect/FateConnect.Api/Infrastructure/Database/**"
  - "FateConnect/FateConnect.Api/Modules/*/Infrastructure/**"
---

# Migration

## `migrations add` não gera rename

⛔ **Para tabela ou coluna que troca de nome, o gerador emite drop e create, que apaga as linhas em produção.** O aviso é uma frase fácil de perder (`An operation was scaffolded that may result in the loss of data.`).

- Leia o `Up()` gerado antes de tudo. `DropTable`, `DropColumn`, ou `DropColumn` + `AddColumn` do mesmo campo: reescreva com `RenameTable`/`RenameColumn`.
- Leia o `Down()` também: ele pode dropar tabela e até a extensão `unaccent`, o que quebraria a busca sem acento num rollback.

Renomear a tabela não renomeia o que aponta para ela; cada um leva linha própria:

- a chave primária (`PK_Usuarios` → `PK_Users`);
- ⛔ a chave estrangeira, **inclusive a de outro módulo** (`FK_rides_Usuarios_DriverId`), que é a que escapa;
- o índice, com `RenameIndex`.

⛔ **Mover dado entre tabelas sai do gerador com o `DropTable` na frente.** A reescrita é de ordem: criar o destino, copiar com `migrationBuilder.Sql`, só então dropar a origem; o `Down()` faz o inverso na mesma ordem.

## Provar que os dados sobrevivem

⛔ **Suíte verde não prova isto:** ela migra um banco vazio. Aplique num Postgres com linhas, na versão da VPS (`psql --version` lá, não presuma).

```bash
docker run -d --name mig-probe -e POSTGRES_HOST_AUTH_METHOD=trust -p 55432:5432 postgres:<versão da VPS>
dotnet ef migrations script <migration anterior> <migration nova> --output up.sql
```

1. Aplique as migrations anteriores e semeie toda tabela que a migration toca, inclusive as de outros módulos que apontam para ela.
2. Impressão digital por tabela: `md5(string_agg(...))` com `ORDER BY` explícito.
3. Aplique o `up.sql`; `grep -E "DROP TABLE|DELETE FROM|TRUNCATE"` não acha nada (ao mover dado, os `DROP` existem e vêm **depois** das cópias).
4. Recalcule pelos nomes novos. Igual = nada perdido.
5. Aplique o `down.sql` e recalcule pelos nomes velhos. Igual = rollback seguro.

Ao mover dado, antes e depois têm formas diferentes: projete os dois lados no **mesmo conjunto de campos**, com a regra de escolha explícita, e semeie o caso que perde dado por decisão e o caso vazio.

## Depois de reescrever, confira o drift

Reescrever o `Up()` à mão não mexe no `.Designer.cs` nem no snapshot, e a branch rebaseada pode deixá-los descrevendo outro modelo.

```bash
dotnet ef migrations add _Drift && grep "migrationBuilder\." Infrastructure/Database/Migrations/*_Drift.cs
```

- Saída vazia é o esperado.
- ⛔ Apague os dois arquivos da sonda à mão e confira com `git status`: o `migrations remove` reconstrói o projeto, e a sonda não compila (o S1186 recusa o método vazio; renomear não resolve).
- Leia o diff do `FateConnectDbContextModelSnapshot.cs` que a sonda reescreveu: mudança só de modelo (navegação que saiu) aparece ali, e se for legítima o `.Designer.cs` da sua migration precisa da mesma mudança.
- ⛔ A sonda compara o modelo com o snapshot, não com o banco: o `DEFAULT` que uma `AlterColumn` com `defaultValue` deixou quando tornou a coluna obrigatória não aparece nela. Coluna que volta a aceitar nulo: confira `column_default` em `information_schema.columns` no banco de prova e tire o padrão no `Up()`.

## Coluna obrigatória nova

⛔ O gerador preenche a coluna `NOT NULL` nova das linhas existentes com o zero do tipo (`defaultValue: 0`), que num enum começado em 1 é valor inválido. Preencha com o valor de negócio, numa constante da própria migration (o enum do domínio muda depois, a migration não), e tire o padrão logo em seguida com `ALTER COLUMN ... DROP DEFAULT`, para o banco não aceitar inserção sem o campo.

## Duplicação

`Up` e `Down` de rename são blocos espelhados, por isso `Migrations/` sai da duplicação e da cobertura por chaves próprias no `check-api.yml` e no `sonar-main.yml`. ⛔ Não funda as duas em `sonar.exclusions`: isso tira `Migrations/` da análise inteira.

## Relação 1:1: a chave primária é a do dono

⛔ Na tabela dependente, a chave primária é a própria chave estrangeira; vale para todo 1:1 do projeto.

```csharp
builder.HasKey(p => p.UserId);

builder.HasOne<User>()
       .WithOne(u => u.Preferences)
       .HasForeignKey<UserPreferences>(p => p.UserId)
       .OnDelete(DeleteBehavior.Cascade);
```

A navegação vai só do dono para o dependente: navegação que nada lê é linha que nenhum teste cobre.

## SQL à mão no banco

⚠️ **`now()` não é `DateTime.UtcNow`.** A VPS roda em `America/Sao_Paulo` e a API grava UTC em `timestamp without time zone`: timestamp escrito à mão é `timezone('UTC', now())`, senão fica três horas fora e nada reclama.

## O nome da tabela vem do `DbSet`

⛔ Não declare `builder.ToTable(...)` para dar nome: o EF usa o do `DbSet`, em PascalCase. `ToTable` só entra quando o nome precisa divergir, com o motivo junto.
