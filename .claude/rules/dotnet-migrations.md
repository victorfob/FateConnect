---
description: Migration do EF que renomeia — o `dotnet ef` gera dropar e recriar, que apaga produção; como reescrever e como provar que os dados sobrevivem
paths:
  - "FateConnect/FateConnect.Api/**"
---

# Migration que renomeia

⛔ **O `dotnet ef migrations add` não gera rename.** Para uma tabela ou coluna que troca de nome ele emite `DropTable` e `CreateTable` — que em homologação e produção **apaga todas as linhas**. O aviso que ele imprime é uma frase fácil de passar batido:

```
An operation was scaffolded that may result in the loss of data.
```

**Leia o `Up()` gerado antes de qualquer outra coisa.** Havendo `DropTable`, `DropColumn` ou um `DropColumn` seguido de `AddColumn` para o mesmo campo, reescreva à mão com `RenameTable` e `RenameColumn`, que preservam o conteúdo.

**O `Down()` também.** O gerado dropa tabela e, se a migration mexer em anotação de banco, pode dropar extensão junto — na #209 ele removia a `unaccent`, o que quebraria a busca de carona sem acento num rollback.

## O que acompanha um rename de tabela

Renomear a tabela **não** renomeia o que aponta para ela. Cada um destes precisa de linha própria, senão o banco fica com o nome velho enquanto o modelo espera o novo:

- chave primária — `PK_Usuarios` vira `PK_Users`
- chave estrangeira, **inclusive as de outros módulos** — `FK_rides_Usuarios_DriverId` vira `FK_rides_Users_DriverId`
- índice — `RenameIndex`, não drop e create

⚠️ **A de outro módulo é a que escapa.** Na #209 a `FK_rides_…` não estava no mapa da issue, porque o mapa descrevia o módulo de usuários; ela apareceu ao comparar o SQL gerado com o escrito à mão.

## Provar que os dados sobrevivem

⛔ **Suíte verde não prova nada aqui.** Os testes rodam em `Microsoft.EntityFrameworkCore.InMemory`, que não executa DDL nem gera SQL de Postgres. A prova é aplicar num Postgres de verdade, na versão que a VPS roda:

```bash
docker run -d --name mig-probe -e POSTGRES_HOST_AUTH_METHOD=trust -p 55432:5432 postgres:<versão da VPS>
dotnet ef migrations script <migration anterior> <migration nova> --output up.sql
```

O roteiro, na ordem:

1. Aplique as migrations **anteriores** e semeie linhas em toda tabela que a migration toca — inclusive as de outros módulos que apontam para ela.
2. Tire uma impressão digital: `md5(string_agg(...))` por tabela, com `ORDER BY` explícito.
3. Aplique o `up.sql` e confira que `grep -E "DROP TABLE|DELETE FROM|TRUNCATE"` não acha nada.
4. Recalcule a impressão digital **pelos nomes novos**. Igual = nada perdido.
5. Aplique o `down.sql` e recalcule pelos nomes velhos. Igual = rollback seguro.

A versão do Postgres se descobre no servidor, não se presume: `psql --version` na VPS.

## Depois de reescrever, confira o drift

Reescrever o `Up()` à mão não mexe no `.Designer.cs` nem no `FateConnectDbContextModelSnapshot.cs`, e é fácil deixá-los descrevendo um modelo que não existe mais — sobretudo se a branch rebaseou depois de outra migration entrar na base.

```bash
dotnet ef migrations add _Drift && grep "migrationBuilder\." Infrastructure/Database/Migrations/*_Drift.cs
```

Saída vazia é o que se espera. Apague a `_Drift` depois — `dotnet ef migrations remove` nem sempre apaga o arquivo, então confira com `git status`.

⚠️ **Migration gerada na base errada mente sem avisar.** Se a branch rebaseou, o `.Designer.cs` pode ser anterior à migration que entrou na base — ele compila, passa nos testes, e só o teste de drift acusa.
