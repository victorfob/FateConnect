# Changelog

Todas as mudanças relevantes deste repositório ficam documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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

## [0.2.0] - 2026-08-20

### Changed

- Reescreve o front em React + Vite, com design system próprio e paridade visual medida (#84)
