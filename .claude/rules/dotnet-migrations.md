---
description: Migration do EF que renomeia ou move dado entre tabelas — o `dotnet ef` gera dropar e recriar, que apaga produção; como reescrever, como provar que os dados sobrevivem, e a chave da relação 1:1
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

⛔ **Suíte verde não prova isto.** A suíte aplica as migrations num PostgreSQL de verdade, então migration que não roda derruba teste — mas sempre num banco **vazio**: nada ali diz se os dados sobreviveram ao rename. A prova é aplicar num Postgres com linhas dentro, na versão que a VPS roda:

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

### Mover dado de uma tabela para outra é o mesmo risco, com outra forma

⛔ **Migration que leva colunas de uma tabela para outra sai do gerador com o `DropTable` na frente**, antes de qualquer cópia. Não há rename a escrever: a reescrita é de **ordem** — criar as colunas novas, copiar com `migrationBuilder.Sql`, e só então derrubar o formato antigo. O `Down()` faz o caminho inverso, na mesma ordem.

Aconteceu em 25/09/2026, na #454, ao levar os contatos para o `User` e as preferências para `UserPreferences`: o `Up()` gerado abria com `DropTable("Contacts")`.

⚠️ **Aqui o passo 3 do roteiro acusa, e é esperado.** Os `DROP` existem de propósito, e o que se confere é que eles vêm **depois** das cópias no `up.sql`.

⛔ **E a impressão digital passa a comparar formas diferentes.** Antes e depois não têm as mesmas tabelas, então não dá para recalcular "pelos nomes novos": cada lado se projeta no **mesmo conjunto de campos**, com a regra de escolha explícita. Na #454 a forma antiga juntava o contato mais antigo por `LEFT JOIN LATERAL ... ORDER BY "Id" LIMIT 1`, e a nova lia as colunas do `User`. Semeie o caso que perde dado por decisão (ali, o usuário com dois contatos) e o caso vazio (o sem contato): são eles que a projeção precisa separar.

A versão do Postgres se descobre no servidor, não se presume: `psql --version` na VPS.

## Depois de reescrever, confira o drift

Reescrever o `Up()` à mão não mexe no `.Designer.cs` nem no `FateConnectDbContextModelSnapshot.cs`, e é fácil deixá-los descrevendo um modelo que não existe mais — sobretudo se a branch rebaseou depois de outra migration entrar na base.

```bash
dotnet ef migrations add _Drift && grep "migrationBuilder\." Infrastructure/Database/Migrations/*_Drift.cs
```

Saída vazia é o que se espera. **Apague os dois arquivos da sonda à mão** — o `.cs` e o `.Designer.cs` — e confira com `git status`.

⚠️ **E a sonda reescreve o `FateConnectDbContextModelSnapshot.cs`.** Com zero operações, o snapshot ainda pode sair modificado: o que mudou no modelo sem mudar o banco, como uma navegação que saiu, só aparece ali. Leia esse diff em vez de descartá-lo. Se ele for legítimo, o `.Designer.cs` da sua migration precisa da mesma mudança, para os dois descreverem o mesmo modelo.

⛔ **`dotnet ef migrations remove` não apaga a sonda neste repositório.** Ele reconstrói o projeto antes de remover, e a sonda não compila: o analisador reprova o nome com sublinhado (`S101`) e o **método vazio** (`S1186`), e o `TreatWarningsAsErrors` do `.csproj` transforma os dois em erro.

⚠️ **Renomear a sonda não resolve, e isso foi medido com controle** em 11/09/2026: com `DriftProbe` o `S101` some, o `S1186` fica sozinho, e o `remove` reprova igual. Migration de sonda é vazia por definição, e é o vazio que o analisador recusa.

⚠️ **Migration gerada na base errada mente sem avisar.** Se a branch rebaseou, o `.Designer.cs` pode ser anterior à migration que entrou na base — ele compila, passa nos testes, e só o teste de drift acusa.

## Migration de rename estoura o limite de duplicação do Sonar

⛔ **`Up` e `Down` são blocos espelhados**, então uma migration de rename bate sozinha no teto de 3% de duplicação em código novo. Na #209 deu **32,8%** e reprovou o quality gate com o código correto.

A chave que resolve é **`sonar.cpd.exclusions`**, separada da de cobertura — as duas existem nos dois workflows:

```
/d:sonar.coverage.exclusions=**/Migrations/**,**/obj/**
/d:sonar.cpd.exclusions=**/Migrations/**
```

⚠️ **Não fundir as duas em `sonar.exclusions`.** Isso tiraria `Migrations/` da análise inteira, escondendo bug de verdade junto com a duplicação.

## Relação 1:1: a chave primária é a do dono

⛔ **Na tabela dependente de um 1:1, a chave primária é a própria chave estrangeira.** `UserPreferences` não tem `Id`: a chave é o `UserId`, e é isso que impede existir uma segunda linha para o mesmo usuário. Com `Id` próprio e um `UserId` único ao lado, a regra dependeria de um índice que alguém pode esquecer.

```csharp
builder.HasKey(p => p.UserId);

builder.HasOne<User>()
       .WithOne(u => u.Preferences)
       .HasForeignKey<UserPreferences>(p => p.UserId)
       .OnDelete(DeleteBehavior.Cascade);
```

Decidido pelo Victor em 25/09/2026, na #453, para **todo** 1:1 do projeto: *"faz isso pra todo relacionamento 1:1"*.

⚠️ **A navegação vai só do dono para o dependente.** `HasOne<User>()` sem navegação de volta é o mesmo desenho de caronas e achados e perdidos, que apontam para o `User` com `.WithMany()` sem coleção. Navegação que nada lê é linha que nenhum teste cobre: foi ela que deixou a `UserPreferences` abaixo de 90%.

## O nome da tabela vem do `DbSet`, não de `ToTable`

⛔ **Não declare `builder.ToTable(...)` para dizer o nome.** Sem ele, o EF usa o nome do `DbSet` — que é PascalCase, como as classes. É de onde saem `Users`, `Rides`, `LostAndFoundRecords` e `Denunciations`.

`ToTable` só entra quando o nome **precisa** divergir do `DbSet`, e aí o motivo vai junto.

⚠️ Aconteceu com `rides`: uma linha `builder.ToTable("rides")` no `RideConfiguration` deixou a tabela minúscula entre três PascalCase, sem decisão registrada em lugar nenhum — sobra de quando o módulo de caronas foi acoplado à API. Uniformizado em 30/08/2026, por migration de `RenameTable`.

## Comentário gerado sai da migration

⛔ **O `dotnet ef` escreve `/// <inheritdoc />` no arquivo da migration, e a `comments.md` proíbe comentário em C#.** Apague os três depois de gerar.

⚠️ **O `.Designer.cs` e o `FateConnectDbContextModelSnapshot.cs` ficam como saíram**, `// <auto-generated />` incluído: ali o marcador é funcional — é ele que faz os analisadores pularem o arquivo.
