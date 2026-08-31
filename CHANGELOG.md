# Changelog

Todas as mudanças relevantes deste repositório ficam documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.7.0] - 2026-08-31

### Changed

- Passa a responder a listagem de caronas em páginas de 10, com o total e a quantidade de páginas, e aceita escolher a página e o tamanho dela até um teto de 50; antes devolvia todas as caronas ativas de uma vez (#236) [Backend]
- Passa a mostrar a lista de caronas em páginas de 10, com a busca guardada no endereço: copiar a URL e abrir noutra aba devolve a mesma página, com os mesmos filtros preenchidos; enquanto a lista carrega, o lugar dos cartões fica marcado em vez de um indicador girando (#239) [Frontend]
- Passa a mostrar o mural de achados e perdidos em páginas de 10, com a mesma busca guardada no endereço da tela de caronas — inclusive o filtro de quem cadastrou e o de situação (#241) [Frontend]

### Fixed

- Corrige a listagem de caronas, que continuava exibindo — e no topo — as caronas cujo horário de partida já tinha passado (#236) [Backend]
- Corrige o controle de páginas da lista de caronas e do mural de achados e perdidos no celular: ele quebrava em duas fileiras, deixava a página seguinte sem número para clicar em parte das páginas, levava a tela ao topo a cada clique e flutuava afastado da lista (#244) [Frontend]

## [0.6.0] - 2026-08-30

### Changed

- Passa a devolver quem ofertou a carona, com nome e contato, e a indicar se ela é de quem consultou (#201) [Backend]
- Passa a mostrar quem ofertou cada carona, com nome e contato reais, e a reconhecer as suas — com marcação própria e os botões de editar e excluir (#203) [Frontend]
- Passa a responder os erros da API em português; validação de carona e de cadastro, formato de hora e o erro genérico vinham em inglês (#218) [Backend]
- Passa a atender o cadastro e o login com o contrato em inglês: muda o endereço do cadastro e todas as chaves das duas chamadas, na requisição e na resposta (#222) [Backend]
- Passa a enviar o cadastro e o login no contrato em inglês, acompanhando a API (#224) [Frontend]
- Padroniza o texto de toda a interface: cada ação passa a ter um nome só, os títulos vão para sentence case, os erros dizem a saída e as listas vazias dizem o que fazer; o aviso de boas-vindas do login sai, porque estar no app já é a confirmação (#229) [Frontend]
- Passa a entrar no app direto depois do cadastro, sem pedir de novo o e-mail e a senha recém-criados; o login e o cadastro passam a responder só o token (#230) [Frontend] [Backend]
- Passa a abrir a tela que a sessão permite: quem já entrou não vê mais a landing nem o cadastro, quem não entrou não alcança as telas internas, e quem volta com a sessão vencida é avisado em vez de entrar e ver tudo falhar (#232) [Frontend] [Backend]

### Fixed

- Corrige o cadastro, que aceitava requisição sem data de nascimento e gravava `01/01/0001` no lugar de recusar (#205) [Backend]
- Corrige a documentação do erro de cadastro, que anunciava um corpo com `mensagem` enquanto a API sempre devolveu `error` (#222) [Backend]

### Security

- Restringe editar e excluir carona a quem a ofertou; antes qualquer pessoa autenticada alterava a carona de outra (#201) [Backend]

## [0.5.0] - 2026-08-28

### Changed

- Passa a atender as caronas pela mesma API do cadastro, em `/Rides`, com o contrato em inglês: mudam os nomes dos filtros e os valores de tipo de carona e de gênero (#186) [Backend]
- Passa a consumir as caronas pela mesma API do cadastro e a enviar os valores novos de tipo de carona e de gênero; os rótulos na tela não mudam (#194) [Frontend]

### Fixed

- Corrige a busca de carona por destino, que respondia erro em vez de listar o resultado (#186) [Backend]
- Corrige a ordem da listagem de caronas, que ignorava a hora da partida e podia variar entre duas consultas iguais (#186) [Backend]

### Security

- Passa a exigir token nas caronas: listar, ver, ofertar, editar e excluir eram atendidos para qualquer pessoa com o endereço, sem identificação; entrar e cadastrar seguem abertos (#191) [Backend]

## [0.4.1] - 2026-08-27

### Fixed

- Corrige a análise de qualidade da branch principal, que reprovava sem ter código novo para avaliar (#182) [Frontend]

## [0.4.0] - 2026-08-27

### Added

- Adiciona a tela de sessão expirada: token recusado leva ao aviso e ao caminho de volta ao login, em vez da mensagem genérica de erro com a sessão vencida ainda guardada (#167) [Frontend]
- Adiciona os termos de uso e a política de privacidade, que os links do cadastro só prometiam para breve: agora abrem em nova guia, sem perder o formulário preenchido, e o rodapé também leva a eles (#177) [Frontend]

## [0.3.0] - 2026-08-27

### Added

- Adiciona as iniciais de quem está logado no topo da área logada (#91) [Frontend]
- Adiciona o contato de quem ofertou a carona, com o e-mail copiável e a conversa no WhatsApp (#94) [Frontend]
- Adiciona ofertar e editar carona, que antes só avisavam que a função viria em breve (#97) [Frontend]
- Adiciona o mural de achados e perdidos, com filtros e a lista de itens, no lugar do aviso de área em breve (#131) [Frontend]
- Adiciona o cadastro e a edição de item de achados e perdidos, em diálogo sobre a própria lista (#133) [Frontend]
- Adiciona as ações de quem cadastrou o item de achados e perdidos — concluir, reabrir e excluir, com confirmação onde ela protege (#132) [Frontend]
- Adiciona o contato de quem cadastrou o item de achados e perdidos, com e-mail copiável e conversa no WhatsApp (#134) [Frontend]
- Adiciona o monitoramento de erros e de navegação no Sentry, com gravação de sessão mascarada e sem enviar corpo de requisição nem dado de usuário (#141) [Frontend]
- Adiciona o rótulo dos botões de ícone, que passam a dizer o que fazem ao ponteiro e ao leitor de tela (#146) [Frontend]
- Adiciona a publicação da aplicação em homologação e produção, cada uma com endereço, banco e segredos próprios, servidas por HTTPS (#152) [Frontend] [Backend]

### Changed

- Unifica os campos de todos os formulários num componente único do design system, com o visual preservado e medido (#96) [Frontend]
- Passa a exigir e-mail do domínio institucional e endereço completo no cadastro, recusando no próprio formulário (#99) [Frontend]
- Reúne caronas numa tela só: ofertar abre o formulário sobre a lista, em vez de levar a uma tela e a um endereço próprios (#128) [Frontend]
- Avisa no painel de filtros de caronas que ele recolhe e quando há filtro valendo (#131) [Frontend]
- Fixa os recuos e vãos das telas, que acompanhavam a largura da janela e cresciam sem limite em monitor grande, e antecipa a divisão entre apresentação e login na tela inicial (#148) [Frontend]
- Alinha o espaçamento dos cartões de carona e de achados e perdidos, que separavam as informações e a descrição com medidas diferentes (#148) [Frontend]
- Aproxima as informações dos cartões de carona e de achados e perdidos, separadas agora por uma barra vertical em vez do vão que as fazia parecer colunas distintas (#149) [Frontend]
- Passa a abrir a aplicação no tema escolhido na última visita, em vez de voltar ao claro a cada recarga (#149) [Frontend]
- Junta a etiqueta e as ações no topo do cartão de carona e de achados e perdidos também no celular, onde a etiqueta descia sozinha para o rodapé (#150) [Frontend]
- Passa a marcar a carona de quem a ofertou e a oferecer editar e excluir só nela; enquanto a API não disser de quem é cada carona, nenhuma é reconhecida como sua (#150) [Frontend]
- Padroniza o vermelho das ações, que alternava entre dois tons e destoava dentro da mesma tela, principalmente no tema escuro (#158) [Frontend]

### Fixed

- Corrige o aviso, que encolhia até o texto e movia o botão de dispensar de lugar (#94) [Frontend]
- Corrige o campo de hora do filtro de caronas, que mostrava dois ícones de relógio (#96) [Frontend]
- Corrige a contagem de vagas, que dizia "1 vagas" quando havia uma só (#97) [Frontend]
- Corrige a comunicação com a API, que falhava por divergência de caminho e por origem bloqueada (#99) [Backend]
- Corrige a recusa de carona marcada para as próximas horas, tratada como data passada (#99) [Backend]
- Corrige ofertar e editar carona, que falhavam quando a hora vinha sem os segundos (#99) [Backend]
- Corrige a atualização de carona, que apagava a descrição quando o campo não era reenviado (#101) [Backend]
- Corrige a página branca quando a aplicação quebra por inteiro: agora aparece a mesma tela de erro das rotas, com o caminho de volta ao início (#141) [Frontend]
- Corrige o HTML das telas, que trazia atributos inválidos vindos de propriedades usadas só para estilo (#145) [Frontend]
- Corrige a largura de 768px, em que o topo já estava no modo estreito enquanto o cadastro ainda usava a grade larga (#148) [Frontend]
- Corrige o canto superior direito do cartão, que parava antes da borda em lugar diferente a cada cartão da lista, e o título comprido, que corria por cima da etiqueta e dos ícones (#150) [Frontend]
- Corrige o diálogo de contato, que encostava o conteúdo à esquerda enquanto o título ficava centralizado (#150) [Frontend]
- Corrige as APIs, que subiam sem criar as tabelas do banco e só falhavam no primeiro acesso (#152) [Backend]
- Corrige o cadastro de usuário, que devolvia erro interno ao gravar a data de nascimento (#152) [Backend]
- Corrige o botão de voltar das telas de caronas e de achados e perdidos, que mantinha a cor do tema claro no tema escuro em vez de acompanhar o topo e o menu (#159) [Frontend]
- Corrige o texto dos botões vermelhos e das iniciais do avatar no tema escuro, que saía escuro em vez de branco (#161) [Frontend]
- Corrige o contraste de textos, bordas e do botão de escolher foto que não alcançavam o mínimo de legibilidade — no diálogo do tema escuro e nos textos de apoio do tema claro (#161) [Frontend]

## [0.2.0] - 2026-08-20

### Changed

- Reescreve o front em React + Vite, com design system próprio e paridade visual medida (#84)
