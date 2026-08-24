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

### Changed

- Unifica os campos de todos os formulários num componente único do design system, com o visual preservado e medido (#96) [Frontend]
- Passa a exigir e-mail do domínio institucional e endereço completo no cadastro, recusando no próprio formulário (#99) [Frontend]
- Reúne caronas numa tela só: ofertar abre o formulário sobre a lista, em vez de levar a uma tela e a um endereço próprios (#128) [Frontend]
- Avisa no painel de filtros de caronas que ele recolhe e quando há filtro valendo (#131) [Frontend]

### Fixed

- Corrige o aviso, que encolhia até o texto e movia o botão de dispensar de lugar (#94) [Frontend]
- Corrige o campo de hora do filtro de caronas, que mostrava dois ícones de relógio (#96) [Frontend]
- Corrige a contagem de vagas, que dizia "1 vagas" quando havia uma só (#97) [Frontend]
- Corrige a comunicação com a API, que falhava por divergência de caminho e por origem bloqueada (#99) [Backend]
- Corrige a recusa de carona marcada para as próximas horas, tratada como data passada (#99) [Backend]
- Corrige ofertar e editar carona, que falhavam quando a hora vinha sem os segundos (#99) [Backend]
- Corrige a atualização de carona, que apagava a descrição quando o campo não era reenviado (#101) [Backend]

## [0.2.0] - 2026-08-20

### Changed

- Reescreve o front em React + Vite, com design system próprio e paridade visual medida (#84)
