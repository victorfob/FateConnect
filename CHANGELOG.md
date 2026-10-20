# Changelog

Todas as mudanças relevantes deste repositório ficam documentadas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.9.3] - 2026-10-20

### Added

- Adiciona o guia da API, com o que ela precisa para subir, onde ficam a referência das rotas e a verificação de saúde, como rodar os testes e onde mora cada coisa (#701)

## [1.9.2] - 2026-10-20

### Removed

- Remove do repositório os documentos das disciplinas e o Git LFS: o clone deixa de baixar cerca de 100 MB e não pede mais o git-lfs (#700)

## [1.9.1] - 2026-10-20

### Fixed

- Corrige a saída da conta de quem tinha entrado de novo depois da tela de sessão expirada, sem recarregar a página: ela voltava a mostrar essa tela em vez de levar à página inicial (#698) [Frontend]
- Corrige o aviso de ativar as notificações, que continuava na tela quando a permissão era dada fora do pedido, como no aviso discreto do navegador no celular; agora ele some e o aparelho passa a receber as notificações (#698) [Frontend]
- Corrige o interruptor de Notificações em Preferências, que ficava ligado sem inscrever o aparelho quando a permissão era dada fora do pedido; agora a inscrição sai assim que a permissão chega (#698) [Frontend]

## [1.9.0] - 2026-10-20

### Added

- Adiciona ao cadastro a confirmação da senha, que precisa repetir a senha digitada para a conta ser criada (#697) [Frontend]

### Removed

- Remove o gênero da conta: o campo sai do contrato e do banco, e a requisição que ainda o mande é aceita com o valor descartado. A coluna é apagada, então o gênero já informado se perde (#697) [Backend]
- Remove o gênero do cadastro e do Meu perfil; a política de privacidade deixa de citá-lo, e ela e os termos de uso passam a ter o título só com a inicial maiúscula, em nova versão dos dois documentos (#697) [Frontend]

## [1.8.1] - 2026-10-19

### Changed

- Passa a citar nos termos de uso o canal de denúncias entre os fins da plataforma e a abrir com uma frase a lista de quem pode usar, em nova versão do documento, que pede novo aceite (#695) [Frontend]
- Corrige a documentação do gate de cobertura da API, que cobra 90% no código novo como o do front, e do que a API envia ao Sentry, que inclui o e-mail de quem está logado (#695)

## [1.8.0] - 2026-10-19

### Changed

- Renomeia para `isConfidential` o campo de denúncia sigilosa no contrato da API, que se chamava `isAnonymous` e dizia o contrário do que a denúncia faz; o envio e a resposta acompanham (#692) [Frontend] [Backend]

### Fixed

- Corrige o envio de denúncia sem a escolha de sigilo, inclusive com o nome antigo do campo, que a API aceitava e gravava como identificada; agora ele é recusado (#692) [Backend]
- Corrige o cadastro enviado duas vezes ao mesmo tempo com o mesmo e-mail institucional, que criava duas contas; a segunda recebe o aviso de e-mail já cadastrado, e o mesmo vale para a troca de e-mail feita pela administração (#692) [Backend]

## [1.7.1] - 2026-10-16

### Fixed

- Corrige a data de nascimento do perfil, que aparecia um dia antes no fuso do Brasil e perdia mais um dia a cada vez que o perfil era salvo; a API passa a trocar a data sem hora, no formato `aaaa-mm-dd` (#686) [Frontend] [Backend]

## [1.7.0] - 2026-10-15

### Changed

- Passa a publicar o documento da API em OpenAPI 3.1, no mesmo endereço; o campo que pode vir nulo declara o nulo entre os tipos aceitos, em vez da marca `nullable` (#681) [Backend]

## [1.6.0] - 2026-10-15

### Added

- Adiciona o backup automático de produção: nos dias 1 e 16, o banco e as fotos saem cifrados para fora do servidor, ficam as 6 cópias mais recentes, e o monitoramento alerta quando uma execução falha ou não acontece (#659) [Backend]

### Changed

- Passa a enviar ao monitoramento de erros do site e da API o e-mail institucional da conta autenticada; do navegador seguem também a identificação dele e a página de origem, sem o IP (#656) [Frontend] [Backend]
- Passa a declarar na política de privacidade o e-mail, a identificação do navegador e a página de origem enviados ao monitoramento de erros, em nova versão do documento, que pede novo aceite (#656) [Frontend]
- Passa a declarar na política de privacidade o serviço que guarda as cópias de segurança, que um dado apagado segue nas cópias antigas por até 3 meses, e quais serviços guardam dados fora do Brasil (#659) [Frontend]

### Fixed

- Corrige a subida da API antes de a fila aceitar conexão, que deixava no monitoramento um erro de conexão a cada recriação da fila (#656) [Backend]

### Security

- Atualiza as bibliotecas da API para as versões que corrigem falhas de segurança apontadas pelo Dependabot, na leitura de JSON e no cache em memória (#653) [Backend]

## [1.5.0] - 2026-10-15

### Added

- Adiciona as notificações no aplicativo, que chegam na hora, para item arquivado por inatividade, denúncia recebida e carona ofertada para o seu bairro, que compara o nome do bairro e, quando o destino e o perfil a têm, a cidade (#590) [Backend]
- Adiciona os endpoints de listagem paginada, contagem de não lidas e marcação de leitura (individual e em lote) para as notificações in-app (#590) [Backend]
- Adiciona à campainha do topo o número de avisos não lidos, que sobe na hora em que um chega, sem recarregar, e um painel com os 3 não lidos mais recentes e a opção de marcar todos como lidos (#592) [Frontend]
- Adiciona a central de notificações, no lugar da tela de área ainda não disponível, com os avisos paginados, o filtro por situação e por tipo e a opção de marcar um ou todos como lidos (#592) [Frontend]
- Adiciona a ida ao destino de cada aviso: tocar nele o marca como lido e leva às denúncias enviadas, às caronas buscadas pelo destino ou aos seus itens arquivados; a carona já excluída é avisada, e a tela fica (#592) [Frontend]
- Adiciona a rota de saúde da API, que responde sem login se ela alcança o banco e a fila, sem dizer mais nada (#595) [Backend]
- Adiciona ao log da API o login recusado, com o motivo e sem o e-mail, a ação de administração com quem a fez, a troca de senha recusada, as mudanças de foto e a sessão encerrada recusada, cada linha com o identificador da requisição (#598) [Backend]
- Adiciona o envio dos erros internos da API a um projeto próprio no Sentry, só com método, rota e identificador da requisição, sem usuário, IP nem conteúdo; sem a chave do projeto, nada é enviado (#598) [Backend]
- Adiciona a entrega por push dos avisos da central (denúncia recebida, carona para o bairro e item arquivado) a cada aparelho que a pessoa inscrever, com as rotas da chave pública e do aparelho; o aparelho que o serviço do navegador diz não existir mais é apagado (#623) [Backend]
- Adiciona os avisos por push no aparelho: a faixa da área logada e o interruptor Notificações pedem a permissão e inscrevem o aparelho, que se inscreve de novo sozinho a cada login; dispensada, a faixa não volta naquele aparelho (#625) [Frontend]
- Adiciona a abertura do aviso por push: tocar nele leva ao mesmo destino da campainha e o marca como lido, com o app aberto ou fechado, e sem sessão passa antes pelo login (#625) [Frontend]
- Adiciona ao contato de uma carona e de um item a lembrança de que o FateConnect só divulga o anúncio, que o encontro ou a devolução é combinado entre as pessoas e que um lugar movimentado é o mais seguro (#631) [Frontend]
- Adiciona a exclusão, por quem administra, da carona ou do item de outra pessoa, com um dos cinco motivos dos termos de uso e o registro de quem excluiu, o quê e por quê; o item excluído some de todas as listas e não volta pelo Restaurar (#632) [Backend]
- Adiciona ao cartão de carona e de item de outra pessoa, para quem administra, a lixeira que pede o motivo antes de excluir (#632) [Frontend]
- Adiciona o aviso de conteúdo excluído, com o motivo, que chega à central de quem publicou mesmo com Notificações desligado, e por push só aos aparelhos de quem ligou (#632) [Frontend] [Backend]
- Adiciona o aviso de versão nova dos termos de uso ou da política de privacidade: ao entrar, ou ao abrir o app já logado, um diálogo segura o uso até o aceite, diz qual documento mudou, leva ao PDF e oferece sair ou desativar a conta (#633) [Frontend]
- Adiciona as rotas que dizem, por documento, se a pessoa aceitou a versão vigente e que gravam o aceite novo com IP e navegador, como no cadastro (#633) [Backend]

### Changed

- Passa a levar a aba aberta para a tela de sessão expirada assim que a sessão é encerrada em outro aparelho ou pela troca de senha, e o texto da tela passa a citar essas causas (#592) [Frontend]
- Passa a declarar na política de privacidade por quanto tempo as notificações ficam guardadas e o uso do bairro e da cidade do perfil no aviso de carona, em nova versão do documento (#592) [Frontend]
- Renomeia para `Bairro e cidade` o campo do Meu perfil que se chamava `Bairro`, porque ele guarda os dois, e a mensagem de limite de tamanho acompanha (#594) [Frontend] [Backend]
- Passa a reprovar a publicação quando a rota de saúde não responde em 2 minutos, e a API passa a esperar a fila ficar pronta para subir, em vez de falhar a primeira conexão (#595) [Backend]
- Passa a recusar a subida da API sem a conexão com o banco ou sem as configurações da sessão, dizendo qual faltou, em vez de subir com elas vazias (#595) [Backend]
- Passa a registrar no log o método, a rota e o usuário de cada erro tratado, e os campos que a validação recusou, sem os valores (#598) [Backend]
- Passa a apagar o log da API e da fila depois de 14 dias, em vez de guardá-lo até a próxima publicação recriar o contêiner (#603) [Backend]
- Passa a declarar na política de privacidade os registros técnicos do servidor, o que cada um guarda, para quê e o prazo de 14 dias (#603) [Frontend]
- Passa a declarar na política de privacidade os avisos por push: o que se guarda de cada aparelho, o serviço do navegador que os entrega, até quando ficam e como desligar, em nova versão do documento (#622) [Frontend]
- Passa a responder a criação de denúncia com o endereço da denúncia criada, como caronas e achados e perdidos já respondiam (#602) [Backend]
- Passa a publicar as denúncias em `/Reports`, no lugar de `/Denunciations`, e o aviso de denúncia recebida como `ReportReceived`; o caminho antigo deixa de responder, e as imagens já enviadas mudam de endereço sem se perder (#605) [Frontend] [Backend]
- Passa a responder todo erro da API no formato `ProblemDetails`, com a mensagem em `detail` no lugar de `error`; `field`, `code` e `minutesRemaining` mantêm o nome, e as recusas por falta de login, por perfil e por rota inexistente, que vinham sem corpo, passam a trazer um (#609) [Frontend] [Backend]
- Passa a descrever no documento da API cada rota, com resumo, as respostas que ela devolve, os campos e parâmetros, exemplos nos corpos e o que é obrigatório ou pode vir nulo, e a esteira reprova a rota nova que chegar sem essa descrição (#611) [Backend]
- Troca a página de leitura da API, do Swagger UI pelo Scalar, em `/api/scalar/v1`; a página antiga deixa de responder, e o documento continua no mesmo endereço (#611) [Backend]
- Passa a responder as mensagens de erro da API em inglês; nenhuma tela as mostra, porque cada uma escreve o próprio texto (#611) [Backend]
- Passa a recusar a redefinição de senha de conta banida como conta banida mesmo quando o link já venceu ou foi usado, em vez de responder que o link não vale, como a confirmação de e-mail já fazia (#612) [Backend]
- Passa a buscar caronas, achados e perdidos e denúncias por palavra, em qualquer ordem e pelo começo de cada uma, com plural e uma lista curta de sinônimos; pedaço no meio da palavra deixa de achar, e a gestão de usuários segue achando por trecho (#615) [Backend]
- Passa a dizer, nos filtros de caronas e de achados e perdidos, que a busca aceita trechos da descrição, em vez de "parte" (#615) [Frontend]
- Passa a pôr o botão dos cartões de achados e perdidos e de contas da gestão à direita da última linha do cartão no computador, e em largura cheia no celular, em vez de numa linha própria à esquerda (#621) [Frontend]
- Troca o seletor de situação das denúncias, na gestão, por um botão com o próximo passo, iniciar a análise ou marcar como resolvida, e o descarte passa à lixeira no topo do cartão; os três continuam pedindo confirmação (#621) [Frontend]
- Passa a mostrar em vermelho o botão de banir uma conta, como as outras ações destrutivas, e a confirmação ganha o ícone da ação (#621) [Frontend]
- Passa a apagar todos os aparelhos inscritos no push quando a pessoa desliga as notificações (#623) [Backend]
- Passa a recusar a subida da API sem o par de chaves do push, `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`, dizendo qual faltou (#623) [Backend]
- Passa a dizer nos termos de uso o que fica fora da responsabilidade da plataforma, nomeando acidente e crime entre usuários, o dever de devolver o objeto achado, os cuidados no encontro e os telefones de emergência, em nova versão do documento (#631) [Frontend]
- Passa a dizer nos termos e na política que quem administra exclui conteúdo com o motivo notificado e que a mudança dos documentos pede novo aceite, e corrige o que os dois afirmavam sem o produto fazer, como as mensagens de novidades e quem lê a denúncia (#631) [Frontend]
- Passa a declarar na política de privacidade o aviso de conteúdo excluído, que chega mesmo com Notificações desligado, e o registro da exclusão com o anúncio e o motivo (#632) [Frontend]
- Passa a recusar no cadastro o aceite de uma versão dos termos de uso ou da política de privacidade que não seja a vigente (#633) [Backend]

### Fixed

- Corrige a entrada repetida do menu no histórico depois de entrar: voltar a partir dele pedia dois toques (#625) [Frontend]
- Corrige a requisição que a pessoa abandona no meio, que era registrada como erro interno (#598) [Backend]
- Corrige a ajuda do tipo de carona, que juntava Solidária e Igualitária num parágrafo só e, no celular, quebrava a explicação de Igualitária em duas linhas: agora cada tipo ocupa uma linha (#628) [Frontend]

### Security

- Para de gravar no log de acesso do servidor o token dos links de e-mail e o texto das buscas, e passa a gravar o IP com o fim zerado, inclusive nos pedidos que não chegam a nenhum dos sites (#603) [Backend]
- Para de enviar ao monitoramento de erros do front o código e o e-mail dos links enviados por e-mail e o texto das buscas, que iam no fim dos endereços (#631) [Frontend]
- Para de mostrar a carona e o item de conta desativada ou banida a quem abria o endereço direto, inclusive pela notificação; antes eles só saíam das listas (#631) [Backend]
- Para de gravar no log de falhas do servidor o token de sessão que a conexão das notificações leva no endereço (#631) [Backend]
- Passa a conferir o link de redefinição de senha por `POST /Auth/verify-reset-token`, com o código no corpo, em vez de na URL, que o log de falhas grava; o `GET` deixa de responder (#631) [Frontend] [Backend]
- Passa a descartar o e-mail da conta que falha nas 5 tentativas, em vez de guardá-lo sem prazo na fila de erro com o nome, o e-mail e o código do link; quem não recebeu pede outro (#631) [Backend]

## [1.4.0] - 2026-10-12

### Added

- Adiciona a confirmação do e-mail Fatec: o cadastro envia um link de uso único que vale por 8 horas, e o login de quem não confirmou é recusado, inclusive nas contas que já existiam (#553) [Backend]
- Adiciona o reenvio do link de confirmação pelo e-mail Fatec, no máximo um a cada 3 minutos, que invalida o link anterior (#553) [Backend]
- Adiciona a redefinição da senha esquecida: o pedido pelo e-mail Fatec envia um link de uso único que vale por 30 minutos, e a senha nova derruba as sessões abertas e já entra; e-mail sem conta é avisado, e conta banida não redefine (#553) [Backend]
- Adiciona o bloqueio da conta por 30 minutos depois de 3 senhas erradas seguidas, no login ou na reativação, que recusa até a senha certa e diz quantos minutos faltam (#553) [Backend]
- Adiciona o e-mail de desbloqueio, um por bloqueio, com um link de uso único que destrava a conta antes dos 30 minutos (#553) [Backend]
- Adiciona ao login um diálogo de conta bloqueada por senhas erradas, que explica o motivo, quanto tempo falta para ela destravar e o link enviado ao e-mail Fatec como saída (#573) [Frontend]
- Adiciona a página do link de desbloqueio, que destrava a conta ao abrir e leva ao login com o e-mail preenchido; com o link expirado ou já usado, ela avisa que a conta já está liberada (#573) [Frontend]
- Adiciona a foto original à lista de contas da gestão, ao lado da miniatura (#561) [Backend]
- Adiciona a remoção da foto ao editar um item de achados e perdidos, como em Meu perfil: a foto sai ao salvar, e o arquivo é apagado na hora (#563) [Frontend]
- Adiciona à edição de um item de achados e perdidos o pedido de tirar a foto, que apaga o arquivo; com uma foto nova no mesmo pedido, fica a nova (#563) [Backend]
- Adiciona a página do link de confirmação, que confirma o e-mail Fatec ao abrir e já entra; com o link expirado ou já usado, ela oferece um novo link e o caminho para o login (#577) [Frontend]
- Adiciona ao login um diálogo para quem ainda não confirmou o e-mail Fatec, que diz o que falta e reenvia o link de confirmação (#577) [Frontend]
- Adiciona ao login o pedido de redefinição da senha esquecida: a tela leva o e-mail já digitado, avisa quando não há conta e oferece o cadastro, e o link pode ser pedido de novo a cada 3 minutos (#579) [Frontend]
- Adiciona a página do link de redefinição, que confere o link ao abrir, pede a nova senha com confirmação e as regras do cadastro e já entra; com o link vencido, oferece outro, e a conta desativada é levada a reativar com a nova senha (#579) [Frontend]
- Adiciona aos e-mails da conta o símbolo e o nome do FateConnect no topo, um desenho que o Outlook, o Gmail e o Apple Mail mostram igual, a primeira frase na prévia da caixa de entrada e uma versão só em texto enviada junto (#583) [Frontend] [Backend]

### Changed

- Passa a criar a conta sem entrar logado: a sessão só abre quando o link de confirmação do e-mail é aberto (#553) [Backend]
- Passa a declarar nos termos de uso a confirmação do e-mail e o bloqueio por senhas erradas, e na política de privacidade o serviço de envio de e-mail, os links enviados e a contagem de senhas erradas, em nova versão dos termos (#553) [Frontend]
- Passa a abrir os diálogos em tela cheia no celular, com os botões presos no pé da tela e o conteúdo rolando acima deles; no computador eles seguem como antes (#561) [Frontend]
- Passa a centralizar no celular o conteúdo dos diálogos sem formulário, com os botões dividindo a largura, e a pôr um botão Fechar no pé dos que não têm rodapé (#561) [Frontend]
- Passa a abrir a foto original num diálogo ao tocar na miniatura das denúncias, de achados e perdidos, de Meu perfil e das contas na gestão, no lugar do botão de baixar das denúncias; salvar a foto fica com o próprio navegador (#561) [Frontend]
- Passa a mostrar maior a foto no contato de quem publicou (#561) [Frontend]
- Passa a abrir o aplicativo de e-mail ao tocar no e-mail do contato de quem publicou, como no rodapé, no lugar de copiar o endereço (#563) [Frontend]
- Passa a dividir a largura do rodapé entre os botões no celular também nos diálogos com formulário, como os filtros (#563) [Frontend]
- Passa a declarar na política de privacidade que quem cadastrou um item pode trocar ou tirar a foto ao editá-lo, e que a anterior é apagada na hora, em nova versão do documento (#563) [Frontend]
- Passa a mostrar as telas de recado (área ainda não disponível, erro inesperado, sessão expirada e desbloqueio da conta) num cartão, com um ícone pela natureza do recado: informação, sucesso, aviso ou erro (#573) [Frontend]
- Passa a mostrar, nos diálogos que só têm texto, um ícone pela natureza do recado acima da frase, como o cadeado na conta bloqueada e a lixeira na exclusão de carona (#573) [Frontend]
- Passa a criar a conta sem entrar logado: depois do cadastro a tela mostra para qual e-mail o link de confirmação foi, com o reenvio liberado a cada 3 minutos e o caminho para entrar (#577) [Frontend]
- Passa a chamar de `occurredOn` a data do item de achados e perdidos, no cadastro, na edição e na resposta, no lugar de `ocurredOn`, que estava escrito errado; o nome antigo deixa de ser aceito, e a coluna é renomeada sem perder as datas (#584) [Frontend] [Backend]
- Passa a receber em `searchTerm` a busca da lista de usuários da gestão, como os outros filtros; `search` deixa de filtrar (#584) [Frontend] [Backend]
- Passa a editar carona por `PATCH`, como os outros cadastros, no lugar de `PUT`: o que a edição não manda fica como estava, inclusive o veículo, que deixou de ser obrigatório nela (#584) [Frontend] [Backend]

### Removed

- Remove das preferências a escolha de receber os avisos por e-mail: o campo sai do contrato e do banco, e a requisição que ainda o mande é aceita com o valor descartado. A coluna é apagada, então a escolha já guardada se perde (#586) [Backend]
- Remove das Preferências o canal por e-mail, e os avisos ficam só no aplicativo: Tema e Notificações passam a um cartão só, com o interruptor salvando ao ser tocado, sem botão de salvar, e a caixa do cadastro e a política de privacidade deixam de falar em e-mail (#586) [Frontend]

### Fixed

- Corrige Meu perfil, onde o navegador preenchia sozinho a senha atual ao abrir a tela; o login continua preenchido pelo navegador (#561) [Frontend]
- Corrige as etiquetas Em análise, das denúncias, e Arquivado, de achados e perdidos, que apareciam como texto solto ao lado das outras (#561) [Frontend]

## [1.3.0] - 2026-10-06

### Added

- Adiciona às Preferências a escolha de receber os avisos de caronas, achados e perdidos e denúncias no aplicativo, no e-mail para contato, nos dois ou em nenhum, que antes só se fazia no cadastro; a escolha fica guardada até o envio existir (#546) [Frontend]

## [1.2.0] - 2026-10-02

### Added

- Adiciona a instalação do site na tela inicial do celular, como um app, com o ícone do FateConnect e abertura sem a barra do navegador; o app instalado continua dependendo da internet (#539) [Frontend]
- Adiciona a miniatura da foto de perfil ao contato de quem publica uma carona, um item ou uma denúncia identificada, ao perfil e à lista de contas da gestão; quem não tem foto vem sem miniatura (#510) [Backend]
- Adiciona a foto de perfil de quem publicou ao contato de uma carona, de um item ou de uma denúncia, baixada só ao abrir o contato: o círculo pulsa enquanto ela chega, e sem foto ou se ela não carregar ficam as iniciais (#511) [Frontend]
- Adiciona a foto de perfil de cada conta ao cartão da lista de usuários da gestão, com as iniciais para quem não tem foto (#511) [Frontend]
- Adiciona a recusa de ofertar carona, cadastrar item e enviar denúncia sem sigilo para quem está sem contato, que continua entrando, consultando as listas e enviando denúncia sigilosa; a resposta diz qual ação foi barrada e traz um código próprio no corpo do erro (#515) [Backend]
- Adiciona a faixa no topo da área logada para quem está sem contato, com o caminho para o perfil; ela pode ser fechada e volta no próximo login (#517) [Frontend]
- Adiciona o aviso de contatos pendentes ao ofertar carona ou cadastrar item sem contato, no lugar do formulário e também quando a API recusa, com o caminho para o perfil (#517) [Frontend]
- Adiciona o tipo de veículo à carona, carro ou moto, obrigatório ao ofertar e ao editar e devolvido na leitura; as caronas já ofertadas ficam como carro, e a requisição sem o veículo passa a ser recusada (#520) [Backend]
- Adiciona o filtro de caronas pelo tipo de veículo; sem ele, a listagem segue com todas (#520) [Backend]
- Adiciona a escolha do veículo, carro ou moto, ao ofertar e ao editar carona, obrigatória como a API passou a exigir (#521) [Frontend]
- Adiciona ao cartão de carona se ela é de carro ou de moto, com ícone (#521) [Frontend]
- Adiciona o filtro de caronas por veículo, com a escolha guardada no endereço (#521) [Frontend]
- Adiciona a sugestão de bairros de Sorocaba e das cidades vizinhas, cada um com a cidade, ao bairro do perfil e ao destino da carona enquanto se digita; o texto fora da lista continua aceito (#538) [Frontend]
- Adiciona ao destino da carona, ao tocar no campo ainda vazio, a sugestão do bairro cadastrado no perfil e da Fatec Sorocaba, que também aparece ao digitar (#538) [Frontend]
- Adiciona o tema automático, que segue o do aparelho e muda junto com ele, escolhido num menu com Automático, Claro e Escuro nas Preferências e no topo da landing. Sem escolha guardada, o app abre no tema do aparelho, e quem já escolheu claro ou escuro continua com a escolha (#543) [Frontend]

### Changed

- Passa o avatar do topo a baixar a versão reduzida da foto de perfil e a pulsar enquanto ela carrega, em vez de mostrar as iniciais até a foto chegar (#511) [Frontend]
- Passa a declarar na política de privacidade que a foto de perfil continua visível no item encerrado e que a denúncia sigilosa também a esconde de quem analisa, em nova versão do documento (#511) [Frontend]
- Passa a criar a conta sem telefone e e-mail de contato: o cadastro deixa de recebê-los, e quem ainda os envia não recebe erro, mas os perde. O contato entra só pelo perfil, com os dois juntos, e depois de cadastrado não se apaga (#515) [Backend]
- Passa a criar a conta sem pedir telefone e e-mail de contato: os dois entram juntos pelo perfil, opcionais até o primeiro cadastro e sem poder ser apagados depois, e a edição de contas da gestão segue a mesma regra (#517) [Frontend]
- Passa a enviar como sigilosa a denúncia de quem está sem contato, com a opção de sigilo ligada e travada e uma nota dizendo como liberá-la (#517) [Frontend]
- Passa a declarar na política de privacidade e nos termos de uso que o contato é opcional, cadastrado pelo perfil com os dois juntos e sem poder ser apagado, e o que fica bloqueado sem ele, em nova versão dos termos (#517) [Frontend]
- Passa a citar o veículo entre os dados da carona na política de privacidade e nos termos de uso, em nova versão dos dois documentos (#521) [Frontend]
- Passa a mostrar no celular as informações dos cartões de carona, achados e perdidos, denúncias e usuários da gestão uma por linha, em vez de quebrarem conforme o tamanho do texto, e em ordem do texto mais curto ao mais longo, também no desktop (#523) [Frontend]
- Passa a mostrar no celular, nos cartões com foto de achados e perdidos e de denúncias, a etiqueta e as ações no topo e o título e as informações ao lado da miniatura, que antes deixava uma faixa vazia à direita dela (#524) [Frontend]
- Passa a recolher em duas linhas a descrição dos cartões de carona e de achados e perdidos, com o botão de expandir quando há mais texto, como já era na denúncia; a carona sem descrição deixa de reservar espaço para ela (#526) [Frontend]
- Passa a deixar desabilitado o salvar da edição de carona, de item e de conta da gestão até algum campo mudar, como já era em Meu perfil; desfeita a mudança, ele volta a desabilitar, e os cadastros seguem com o botão ativo (#530) [Frontend]
- Passa a explicar no ícone de ajuda do e-mail Fatec, em Meu perfil, que ele identifica a conta e que a troca se pede à administração pelos contatos do rodapé, no lugar da frase fixa embaixo do campo (#529) [Frontend]
- Passa a mostrar o rodapé mais baixo no celular, com o e-mail e o telefone na mesma linha, os termos de uso e a política de privacidade lado a lado e a frase de assinatura mais curta, em uma linha só (#531) [Frontend]
- Passa a desenhar os botões em três alturas, iguais em qualquer variante e com os mesmos cantos arredondados: 36px na maioria, 32px nos de foto e nas ações dos cartões, 40px nos do topo e no Voltar ao menu (#532) [Frontend]
- Passa a esticar o Desativar conta na largura do cartão do perfil, e no celular os botões de foto até a borda dos campos (#532) [Frontend]
- Passa a mostrar o e-mail para contato numa linha inteira e antes do telefone, em Meu perfil e na edição de conta da gestão, para um e-mail longo caber; na gestão, o telefone divide a linha com o perfil e ganha o exemplo de formato (#536) [Frontend]
- Passa a enviar a fonte do site junto com o app, para o texto sair com a mesma letra em todo aparelho: antes só o Mac e o iPhone mostravam a Helvetica Neue, e no Android cada fabricante usava a sua. Enquanto ela carrega, vale a fonte do sistema (#541) [Frontend]

### Fixed

- Corrige o salvamento de Meu perfil com telefone ou e-mail para contato já usado por outra conta, que só avisava que não deu certo; agora o aviso aparece embaixo do campo certo, que recebe o foco (#519) [Frontend]
- Corrige a palavra ou o e-mail sem espaço no título, nas informações ou na descrição de um cartão de lista, que passava da borda do cartão e, no celular, alargava a página inteira; agora o texto quebra dentro do cartão (#523) [Frontend]
- Corrige o botão de expandir a descrição da denúncia, que ficava decidido pela largura em que o cartão apareceu: ao girar o celular, o texto podia ficar cortado sem o botão, ou com um botão que não revelava nada (#526) [Frontend]
- Corrige o botão vermelho preenchido que, no celular, continuava vermelho depois de desabilitar, com o texto apagado: o toque deixa o botão em hover, e o hover pintava o fundo mesmo desabilitado, como o Salvar alterações do perfil depois de salvar (#526) [Frontend]
- Corrige o ícone de menu do topo, que no celular ficava mais para dentro que o conteúdo da página por causa da folga em volta do desenho; agora ele se alinha à borda do conteúdo, sem diminuir a área de toque (#528) [Frontend]
- Corrige o texto que saía na fonte Inter só para quem a tinha instalada no computador, já que o app nunca a enviava; agora todo mundo vê a fonte do sistema, a mesma que o resto já via (#537) [Frontend]
- Corrige Meu perfil quando o navegador preenche sozinho a senha atual: a tela já abria com alterações não salvas e cobrava a nova senha para salvar qualquer dado. A senha atual sozinha passa a não contar, e só a nova senha pede a troca (#538) [Frontend]

## [1.1.1] - 2026-09-30

### Security

- Atualiza o cliente HTTP do site para a versão que corrige falhas de segurança apontadas pelo Dependabot, entre elas injeção de cabeçalho e poluição de protótipo nas requisições (#509) [Frontend]

## [1.1.0] - 2026-09-30

### Added

- Adiciona o registro das ações de administração sobre uma conta: dar ou retirar o acesso de administração, banir e reverter o banimento gravam quem fez, sobre qual conta e quando; ação recusada ou que não muda nada não grava, e o registro fica mesmo se a conta for apagada (#491) [Backend]
- Adiciona a tela do próprio perfil, onde se editam os dados pessoais, o bairro e os contatos e se salva tudo de uma vez, com o aviso de alterações não salvas e a opção de descartá-las; o nome salvo passa a aparecer no topo (#487) [Frontend]
- Adiciona ao perfil a confirmação antes de sair com alterações não salvas, por qualquer caminho: links, voltar do navegador ou do celular e saída da conta; fechar ou recarregar a aba mostra o aviso do próprio navegador (#487) [Frontend]
- Adiciona a foto de perfil, escolhida, trocada e removida na tela do perfil, com o enquadramento ajustado por arraste e zoom antes de ser usada, e que aparece no avatar do topo no lugar das iniciais (#487) [Frontend]
- Adiciona a troca de senha pela tela do perfil, que pede a senha atual e mantém a sessão aberta (#487) [Frontend]
- Adiciona a desativação da própria conta pela tela do perfil, com uma confirmação que diz o que acontece e como voltar (#487) [Frontend]
- Adiciona à gestão a lista das contas, onde a aba de usuários só avisava que a função viria: cada uma com o nome, os contatos e a situação, com busca por nome, e-mail ou telefone e filtro por situação e perfil (#486) [Frontend]
- Adiciona à gestão a edição de uma conta pelo administrador: nome, e-mail institucional, contatos e o acesso de administração, que ele não retira de si mesmo (#486) [Frontend]
- Adiciona à gestão o banimento de uma conta, com confirmação, e a reversão dele; o administrador não bane a própria conta (#486) [Frontend]
- Adiciona ao formulário de ofertar e editar carona a recorrência em dias úteis, semanal ou mensal, com data final de até 6 meses; o formulário continua abrindo na carona de uma vez só (#481) [Frontend]
- Adiciona a edição do próprio perfil, das preferências e da senha, a desativação da conta e a gestão de usuários pelo administrador (#482) [Backend]
- Adiciona a carona com recorrência em dias úteis, toda semana ou todo mês, até uma data final de no máximo 6 meses, pulando feriado e, na de dias úteis, o fim de semana; sem recorrência ela continua valendo uma vez só, e as já ofertadas ficam assim (#480) [Backend]
- Adiciona a consulta dos feriados de um ano, com os nacionais, o estadual de São Paulo e o municipal de Sorocaba, que as caronas com recorrência vão pular; ano ausente ou fora do calendário aceito é recusado com 400 (#479) [Backend]
- Adiciona a miniatura das fotos de achados e perdidos e de denúncias: toda foto enviada ganha uma versão pequena em WebP, servida com a mesma autorização da original, e apagar ou trocar a foto apaga as duas (#465) [Backend]
- Adiciona ao login da landing a oferta de reativar a conta desativada: confirmando, a conta volta ao ar e a pessoa entra com o e-mail e a senha já digitados; desistindo, nada muda (#462) [Frontend]
- Adiciona a reativação da conta desativada pela própria pessoa, que pede o e-mail e a senha de novo, devolve a conta ao ar e já responde o token de acesso, como o login; conta banida continua recusada (#460) [Backend]
- Adiciona às descrições de denúncia, de item perdido e de carona a contagem do que já foi escrito sobre o limite, ao lado do erro quando há um; o leitor de tela anuncia a contagem por extenso quando a digitação para, sem interromper a cada tecla (#461) [Frontend]

### Changed

- Passa a declarar na política de privacidade o registro das ações de administração sobre uma conta, mantido mesmo após o encerramento dela (#491) [Frontend]
- Passa a explicar os tipos de carona também no formulário de ofertar e editar, como o filtro já fazia: solidária é gratuita, e na igualitária os participantes dividem os custos (#489) [Frontend]
- Passa a mostrar no cartão de carona a recorrência ao lado da data e da hora, que passam a ser as da próxima partida (#481) [Frontend]
- Passa a citar a recorrência entre os dados da carona nos termos de uso e na política de privacidade (#481) [Frontend]
- Passa a desabilitar no calendário da carona os feriados e, na recorrência em dias úteis, o fim de semana (#481) [Frontend]
- Passa a recusar a carona que parta em feriado, inclusive a de uma vez só (#481) [Backend]
- Passa a declarar na política de privacidade o bairro e a foto de perfil, que aparece junto do nome nos anúncios e é apagada quando removida, e o que quem administra a plataforma vê da conta para gerenciá-la (#482) [Frontend]
- Passa a dizer nos termos que quem administra a plataforma pode corrigir o nome, o e-mail institucional e os contatos de uma conta e dar ou retirar dela o acesso de administração (#482) [Frontend]
- Passa a manter a carona na listagem enquanto houver partida por vir, com a próxima partida como data, a ordem por ela e o filtro de período valendo para qualquer partida (#480) [Backend]
- Passa a explicar, na lista vazia de achados e perdidos, o que aparece ali e como sair dela, ampliando a busca ou cadastrando um item, como caronas já faz (#472) [Frontend]
- Passa a mostrar o desenho de desktop das telas a partir de 822px, em vez de 965px, que é onde a navegação do topo deixa de caber e decidia por todas as telas; o cabeçalho continua recolhendo a navegação no menu abaixo de 965px (#470) [Frontend]
- Passa a declarar na política de privacidade que a foto do item e a imagem da denúncia são guardadas sem as informações que o aparelho grava no arquivo, como o local onde ele foi feito, em nova versão do documento (#466) [Frontend]
- Passa a exibir a miniatura das fotos em achados e perdidos e nas duas telas de denúncia, em vez de baixar o arquivo inteiro da câmera; o botão de baixar a foto da denúncia busca a original no clique e avisa quando não consegue (#466) [Frontend]
- Passa a guardar a foto enviada sem os metadados, inclusive a localização de onde foi tirada, e com a rotação do celular já aplicada; arquivo que não é imagem de verdade passa a ser recusado com 400, mesmo declarado como imagem (#465) [Backend]
- Passa a deixar de fora das listagens de caronas e de achados e perdidos o que pertence a conta desativada ou banida; nada é apagado, e o registro volta a aparecer se a conta for reativada. As denúncias dessas contas continuam chegando a quem analisa (#463) [Backend]
- Passa a avisar no login que a conta banida foi banida por infringir as regras da plataforma, sem oferecer ação, em vez do aviso genérico de erro (#462) [Frontend]
- Passa a alinhar a frase dos diálogos de confirmação com o título, centralizada no desktop e à esquerda no celular; antes a da exclusão de carona e a de achados e perdidos centralizavam sempre, e a da gestão de denúncias ficava sempre à esquerda (#462) [Frontend]
- Passa a recusar no login a conta banida, com 403 e com a senha certa ou errada, e a conta desativada, com 409 quando a senha confere, para quem chama poder oferecer a reativação; senha errada continua sendo 401 (#460) [Backend]
- Passa a travar a digitação no limite dos nove campos de texto que têm um, em vez de recusar só ao enviar; a mensagem de máximo deixa de aparecer pela digitação, e a de mínimo continua (#461) [Frontend]
- Passa a receber o telefone e o e-mail de contato direto no corpo do cadastro, um de cada por pessoa, em vez de uma lista: o formato antigo é recusado. Quem tinha mais de um contato fica com o mais antigo, que já era o exibido, e os demais se perdem (#456) [Backend]
- Passa a enviar o telefone e o e-mail de contato direto no corpo do cadastro, no formato que a API passou a exigir: o front anterior deixa de conseguir criar conta. A tela e os campos não mudam (#457) [Frontend]

### Removed

- Remove a quantidade de vagas da carona: o campo sai do contrato e do banco, e a requisição que ainda o mande é aceita com o valor descartado. A coluna é apagada, então as vagas das caronas já ofertadas se perdem (#478) [Backend]
- Remove a quantidade de vagas do formulário de ofertar e editar carona e do cartão da lista; os termos e a política deixam de citar as vagas, e os termos passam a dizer que elas se combinam fora da plataforma, em nova versão dos dois documentos (#478) [Frontend]

### Fixed

- Corrige o seletor de data e hora, que não fechava ao escolher o minuto que já vinha marcado, como o 00 de uma hora redonda (#481) [Frontend]
- Corrige na política de privacidade o que fica no navegador, que omitia o identificador da sessão de diagnóstico guardado pelo monitoramento de erros, e a forma como a senha é guardada, que ela dizia cifrada e é um hash sem volta; o documento ganha nova versão (#468) [Frontend]
- Corrige nos termos a descrição do item de achados e perdidos, que aparecia como obrigatória: ela é opcional, como o cadastro do item sempre aceitou; o documento ganha nova versão (#468) [Frontend]

## [1.0.0] - 2026-09-21

### Added

- Adiciona o registro de denúncias, com envio de imagem e acompanhamento de situação pela moderação (#391) [Backend]
- Adiciona controle de permissões hierárquico, permitindo que perfis superiores herdem acessos de níveis inferiores automaticamente (#391) [Backend]
- Adiciona a tela de denúncia, que até aqui só avisava que a função viria em breve: a pessoa escolhe o motivo entre nove opções, conta o que aconteceu e pode anexar uma foto. Ela pode enviar sem que os seus dados cheguem a quem analisa, e nesse caso a tela avisa que a denúncia continua ligada à conta (#407) [Frontend]
- Adiciona a consulta das próprias denúncias, que até aqui respondia só a administrador e recusava os demais: quem não é administrador passa a receber as denúncias que enviou, com os filtros de situação, categoria, período, busca e paginação que já existiam, e sem o endereço da foto guardada; administrador segue recebendo as de todo mundo. O recorte vem do perfil de quem pede, sem campo na consulta (#410) [Backend]
- Adiciona à tela de denúncia a lista do que a própria pessoa enviou, que até aqui não existia em lugar nenhum: a tela passa a ter duas abas, uma com a lista e outra que abre o envio, como caronas e achados e perdidos já fazem. Cada denúncia aparece com o motivo, a data, a situação e os marcadores de sigilo e de foto, e a descrição longa vem recolhida e abre quando a pessoa pede. A lista tem filtro por situação e páginas de 10, com a situação guardada no endereço — copiar a URL devolve a mesma lista filtrada —, e a denúncia recém-enviada entra nela sem recarregar (#422) [Frontend]
- Adiciona a área de gestão para quem é administrador, que até aqui não existia em lugar nenhum: um item `Gestão` no topo e no menu, e a tela com as abas `Usuários` e `Denúncias`. As duas abas ainda avisam que a função vem em uma próxima versão, então o que entra agora é o acesso: quem não é administrador não vê o item e não abre a tela digitando o endereço (#427) [Frontend]
- Adiciona à gestão a lista das denúncias de todo mundo, onde a aba só avisava que a função viria: cada uma com o motivo, a data, a descrição e a situação. A aba de usuários segue avisando (#428) [Frontend]
- Adiciona à gestão o contato de quem denunciou, com o e-mail copiável e a conversa no WhatsApp; denúncia enviada como sigilosa não traz contato nenhum (#428) [Frontend]
- Adiciona a miniatura da foto anexada à denúncia, na gestão, que baixa ao ser clicada; sem foto, o lugar dela continua ocupado (#428) [Frontend]
- Adiciona a mudança de situação da denúncia pela gestão, que oferece só os destinos aceitos a partir da situação atual e pede confirmação, porque nenhuma mudança volta atrás; denúncia já encerrada não oferece ação nenhuma (#428) [Frontend]
- Adiciona à gestão o filtro de denúncias por descrição, período, motivo e situação, com páginas de 10 e as escolhas guardadas no endereço, junto da aba escolhida (#428) [Frontend]
- Adiciona o arquivamento automático do item de achados e perdidos aberto e sem movimentação há 60 dias, que a nota do cartão já sabia descrever e nada escrevia: ele deixa o estado aberto com o motivo registrado como inatividade, e segue visível para quem procura (#438) [Backend]
- Adiciona a exclusão da foto do item de achados e perdidos 30 dias depois de ele ser resolvido ou arquivado, mantendo o registro; item reaberto depois disso volta sem foto. A política de privacidade passa a declarar os dois prazos, em nova versão do documento (#438) [Backend] [Frontend]
- Adiciona a foto anexada ao cartão da lista de denúncias de quem a enviou, que até aqui não a via em lugar nenhum: a miniatura baixa ao ser clicada, e sem foto o lugar dela segue ocupado. O marcador de anexo sai desses cartões, porque a foto passou a estar à vista (#439) [Frontend]
- Adiciona o registro do aceite dos documentos no cadastro, que a API recebia sem guardar: cada documento aceito vira uma linha com a versão, a data, o endereço IP e o navegador que o servidor observou (#444) [Backend]
- Adiciona as preferências de e-mail e de notificação à conta, escolhidas no cadastro e desligadas quando a pessoa não as marca (#444) [Backend]

### Changed

- Separa as rotas de acesso a arquivos enviados, restringindo a visualização de imagens de denúncias estritamente a administradores (#391) [Backend]
- Centraliza o fluxo de upload de arquivos para garantir a exclusão automática de imagens órfãs em caso de falhas de salvamento (#391) [Backend]
- Passa a separar em duas rotas a consulta de denúncias, que era uma só com o recorte decidido pelo perfil de quem pedia: quem denunciou consulta as suas por uma rota própria, e a lista de todas passa a exigir administrador. Os filtros e a paginação seguem os mesmos nas duas (#437) [Backend]
- Passa a servir a foto da denúncia pelo módulo de denúncias, por id, em vez do endereço genérico de arquivos enviados: quem denunciou passa a alcançar a própria foto, que só a gestão via, e a de denúncia alheia é recusada. O endereço antigo deixa de servir foto de denúncia (#437) [Backend] [Frontend]
- Reescreve a promessa da landing sobre denúncia, que oferecia relatar sem se identificar: a denúncia sempre fica ligada à conta de quem a fez, e o que dá para esconder é o contato dela de quem for analisar (#407) [Frontend]
- Passa a servir a landing na raiz do site, que até aqui só redirecionava para `/inicio`: o endereço da página inicial vira o domínio sozinho, e a rota antiga deixa de existir. Link salvo com `/inicio` continua chegando, agora por redirecionamento permanente do servidor em vez de um salto que o navegador só dava depois de carregar a página; o endereço canônico e o sitemap passam a apontar para a raiz (#426) [Frontend]
- Renomeia para `Acompanhar` e `Enviar` as duas abas da tela de denúncias, porque `Minhas denúncias` não cabia na largura de um celular de 375px e quebrava a fileira em duas linhas; o título e o botão do diálogo de envio seguem `Enviar denúncia` (#440) [Frontend]
- Renomeia para `Descartada` a situação da denúncia recusada, que se chamava `Não acolhida` e não dizia o desfecho; a etiqueta, os dois filtros e a confirmação acompanham. O endereço segue o rótulo, então link salvo com a situação antiga abre a lista sem o filtro (#442) [Frontend]
- Passa a abrir o filtro de um campo só num diálogo estreito, com o campo ocupando a largura inteira em vez de metade e o título no singular; hoje é o caso da lista de denúncias de quem denunciou. Os filtros com mais de um campo seguem iguais (#443) [Frontend]
- Passa a enviar no cadastro o aceite dos documentos e a preferência de contato, que o formulário coletava e descartava antes de chamar a API: quem marca as caixas passa a ter a escolha registrada, cada documento com a versão que estava no ar naquele momento (#445) [Frontend]
- Passa a descrever nos termos e na política o módulo de denúncias, que nenhum dos dois mencionava: o que se coleta, que só quem administra lê, e que o envio sigiloso esconde o seu contato de quem analisa sem tornar a denúncia anônima (#447) [Frontend]
- Passa a descrever nos dois documentos a desativação da conta e o banimento, e sobe a versão dos termos por causa disso. ⚠️ O texto antecipa o que as issues de perfil e de gestão vão entregar: por ora ele descreve função que o produto ainda não tem (#447) [Frontend]
- Passa a exigir o aceite dos documentos para criar conta: cadastro sem eles é recusado, e cliente que ainda não os envia para de conseguir criar conta até ser atualizado. A API também passa a registrar o endereço de quem chega pelo proxy, e não mais o do próprio proxy (#444) [Backend]

### Fixed

- Corrige o que o monitoramento relata: a falha ao carregar a gravação de sessão chegava como erro não tratado e de prioridade alta, sem nada quebrar na tela, e passa a chegar como aviso; e os eventos de homologação chegavam marcados como produção, o que impedia separar os dois ambientes (#405) [Frontend]
- Corrige nos termos a descrição do item de achados e perdidos arquivado, que dizia sair da vista dos demais usuários: ele continua visível, como a política já dizia e como o produto sempre fez. O texto também ainda o chamava de cancelado (#447) [Frontend]

## [0.10.0] - 2026-09-13

### Added

- Adiciona a ação às linhas de contato do rodapé, que eram texto para copiar à mão: o e-mail abre o aplicativo de e-mail, o telefone abre o discador e o endereço abre o mapa em nova guia; o ícone entra na área clicável junto do texto, e cada link diz a ação ao leitor de tela (#372) [Frontend]
- Adiciona o filtro por autoria na lista de caronas, por `onlyMine`, que traz só as caronas que a pessoa ofertou; sem o campo a lista segue trazendo as de todo mundo, e carona já partida continua de fora nos dois casos (#348) [Backend]
- Adiciona o filtro por autoria na busca de caronas, com a escolha entre todas as caronas e só as que a pessoa ofertou; sem escolher, a lista segue trazendo as de todo mundo (#350) [Frontend]
- Adiciona o resumo que a landing e o cadastro mostram no resultado de busca, que até agora o Google montava raspando texto da própria página, e o endereço canônico da landing, que junta a raiz e `/inicio` num só (#392) [Frontend]
- Adiciona o `robots.txt` nos dois ambientes e o `sitemap.xml` em produção: produção libera a indexação e aponta o sitemap com as duas telas públicas, e homologação passa a pedir para não ser indexada, o que faltava desde que a verificação do domínio passou a cobrir o subdomínio (#394) [Frontend]

### Changed

- Reescreve a descrição da comunidade verificada na landing, que listava os dois domínios de e-mail aceitos e passa a chamar para criar a conta com o e-mail institucional; os domínios seguem ditos no campo de e-mail do cadastro e do login (#370) [Frontend]
- Passa a filtrar as duas listas por intervalo de datas em vez de uma data exata: as duas pontas trazem o período fechado, uma ponta sozinha traz aquele dia inteiro, e intervalo invertido é recusado com erro; na consulta, `departureDate` e `ocurredOn` dão lugar a `dateFrom` e `dateTo` (#342) [Backend]
- Passa a mostrar menos páginas na paginação das duas listas quando a tela é estreita: a fileira não cabia e quebrava em duas linhas, então fica a página atual entre a primeira e a última. As setas continuam andando de uma em uma, e no desktop os números vizinhos seguem visíveis (#345) [Frontend]
- Passa a filtrar caronas por turno em vez de hora exata, que exigia hora em ponto: `Morning` cobre 04:00–11:59, `Afternoon` 12:00–17:59 e `Night` 18:00–03:59, atravessando a meia-noite; na consulta, `departureTime` dá lugar a `departureShift` (#347) [Backend]
- Passa a chamar o filtro por autoria de `onlyMine` também em achados e perdidos, onde ele era `onlyMyItems`; o comportamento de lá é o mesmo, e a consulta com o nome antigo deixa de filtrar (#348) [Backend]
- Passa a filtrar as duas buscas por período em vez de data exata, e as caronas por turno em vez de hora exata: o período aceita as duas pontas ou só a inicial, que busca aquele dia inteiro, e o turno traz manhã, tarde e noite com a faixa de horas no rótulo. As escolhas continuam no endereço, então o link restaura a busca; link antigo abre a lista sem os filtros que saíram (#350) [Frontend]
- Passa a servir os arquivos estáticos comprimidos e com cache longo: o JavaScript da primeira visita cai de 1,4 MB para 434 KB, e nas visitas seguintes deixa de ser pedido ao servidor, em vez das sete revalidações de hoje. O índice continua sem cache, então a publicação nova segue sendo vista na hora (#377) [Frontend]
- Passa a dar um título próprio a cada tela: antes as nove mostravam `FateConnect` na aba do navegador e no histórico, e quem usa leitor de tela não ouvia a troca ao navegar (#392) [Frontend]
- Passa a servir o site por HTTP/2, em vez de HTTP/1.1, e a responder 404 no endereço com extensão que não existe: hoje qualquer endereço devolve 200 com a página inicial, inclusive os arquivos que um buscador procura por convenção. Endereço sem extensão continua abrindo a página inicial, como as rotas do app exigem (#394) [Frontend]
- Passa a carregar a gravação de sessão depois que a página inicial termina de pintar, em vez de junto com ela: a primeira visita baixa 39 KB comprimidos a menos. O que é gravado não muda, e o monitoramento de erros e de navegação continua ativo desde o primeiro byte (#397) [Frontend]
- Renomeia para `Arquivar` a ação de achados e perdidos que se chamava `Excluir`, e que prometia destruir um item que continua visível para todo mundo — um anúncio arquivado ainda serve a quem procura e fala com quem o cadastrou; a etiqueta, a nota do cartão e o aviso acompanham. A confirmação deixa de existir e o aviso passa a oferecer desfazer por cinco segundos, porque o mural abre em `Aberto` e o item sai da vista no mesmo instante; resolver um item continua pedindo confirmação, que é onde não há volta pela tela (#380) [Frontend]

### Fixed

- Corrige o sublinhado dos links de documentos no rodapé do celular, que media a largura da linha em vez da largura do texto (#372) [Frontend]
- Corrige os destaques do topo da landing: os quatro rótulos quebravam em duas linhas, e a ordem e o texto deles divergiam dos cards de serviço logo abaixo (#370) [Frontend]
- Corrige o cabeçalho numa faixa estreita de larguras de desktop, em que a barra de navegação quebrava em duas linhas e dobrava de altura: o menu recolhido passa a valer até a largura em que a barra cabe (#370) [Frontend]
- Corrige o vão abaixo dos cartões do menu nas telas estreitas, menor que o que separa um cartão do outro (#345) [Frontend]
- Corrige a política de privacidade, que listava o apelido entre os dados coletados no cadastro depois de o campo ter sido removido (#367) [Frontend]
- Corrige a recusa do e-mail institucional, que falava do domínio mesmo quando ele estava certo e o problema era o trecho antes do @; cada um dos dois passa a ter a sua mensagem, e o conjunto de endereços aceitos continua o mesmo (#368) [Frontend] [Backend]
- Corrige o contraste do botão de destaque do topo, abaixo do mínimo de legibilidade nos dois temas: o texto dele vinha do branco translúcido do cabeçalho, que não foi feito para pousar sobre o vermelho do próprio botão, e passa a ser o branco puro dos demais botões preenchidos. Só aparecia no desktop, onde essa fileira de navegação existe (#398) [Frontend]
- Corrige o salto de layout nas listas de caronas e de achados e perdidos, em que a página pulava no momento em que os cartões chegavam: o carregamento reservava espaço para três cartões e a lista traz dez. Só acontecia na área logada, porque na página inicial o conteúdo já nasce alto (#399) [Frontend]

### Removed

- Remove o endereço do cadastro: o campo sai do contrato e do banco, e a requisição que ainda o mande é aceita com o valor descartado. A tabela é apagada, então o endereço de quem já se cadastrou se perde (#365) [Backend]
- Remove o endereço do formulário de cadastro, com a busca automática por CEP que o preenchia; a política de privacidade deixa de declarar a coleta do endereço e o envio do CEP a serviço externo, em nova versão do documento (#367) [Frontend]

## [0.9.0] - 2026-09-09

### Added

- Adiciona a API de achados e perdidos: cadastrar, editar, excluir e listar item, com foto opcional e filtro por nome, tipo, situação, data do ocorrido e autoria; o item excluído guarda o motivo, manual ou por inatividade, que é o que a tela usa para escrever a nota do cartão (#322) [Backend]

### Changed

- Amplia a busca de caronas, que passa a casar também a descrição da carona e não só o destino (#322) [Backend]
- Passa a guardar os itens do mural de achados e perdidos: cadastro, edição, foto, conclusão, exclusão e restauração chegam ao servidor, e o item continua lá depois de recarregar a página — antes nada do que a tela fazia era gravado (#328) [Frontend]
- Passa a buscar item de achados e perdidos por nome ou descrição, com o campo do filtro dizendo isso; o endereço da busca vai de `?nome=` para `?busca=`, e link salvo com o antigo abre a lista sem filtro (#328) [Frontend]
- Passa a buscar carona por destino ou descrição, com o campo do filtro dizendo isso; o endereço da busca vai de `?destino=` para `?busca=`, e link salvo com o antigo abre a lista sem filtro (#329) [Frontend]
- Passa a dizer na confirmação o que resolver um item de achados e perdidos significa: quem cadastrou um perdido marca como encontrado e quem cadastrou um achado marca como devolvido — antes os dois casos diziam só resolver; a situação do item continua se chamando Resolvido (#333) [Frontend]
- Passa a abrir os filtros das duas listas num diálogo, atrás de um botão ao lado do título da página, em vez do painel que ficava aberto ocupando o topo: os campos são os mesmos e na mesma ordem, o aviso de filtro valendo acompanha o botão, filtrar fecha o diálogo, e um botão de limpar — que não existia — devolve a lista ao padrão da tela (#336) [Frontend]
- Passa a mostrar só o ícone no botão de voltar das telas internas quando a tela é estreita: com o texto ao lado a linha do cabeçalho não cabia, e o título mais longo quebrava em duas linhas. O nome do botão continua sendo anunciado por leitor de tela (#336) [Frontend]

### Fixed

- Corrige o instante de criação nas respostas da API, que vinha sem a marca de fuso horário quando lido do banco: um cliente que o interpretasse leria o horário como local, três horas adiantado (#322) [Backend]
- Corrige o contato do cartão de achados e perdidos, que mostrava sempre a mesma pessoa fictícia em vez de quem cadastrou o item (#328) [Frontend]
- Corrige a opção Todas do filtro de situação em achados e perdidos, que voltava para Aberto sem avisar em vez de mostrar as situações todas (#328) [Frontend]
- Corrige a apresentação do diálogo de contato: o nome centraliza também quando quebra em mais de uma linha, o e-mail deixa de quebrar no desktop, e o telefone passa a aparecer com máscara em vez de dígitos corridos (#335) [Frontend]
- Corrige o botão neutro dos diálogos no tema escuro, que era o único do produto com texto escuro: o texto passa a ser branco como nos demais, sobre um fundo um tom mais escuro para ele se manter legível (#336) [Frontend]

## [0.8.0] - 2026-09-05

### Added

- Adiciona o botão de fechar nos diálogos quando a tela é estreita: a faixa em volta deles é curta demais para fechar por toque, e alargá-la deixaria o diálogo apertado. No desktop nada muda (#277) [Frontend]
- Adiciona a marcação da tela atual no topo e no menu lateral, que antes não indicavam onde a pessoa estava; a marca também é anunciada por leitor de tela (#281) [Frontend]
- Adiciona o encerramento de sessão na API, que invalida o token no servidor em vez de apenas descartá-lo no navegador: depois de sair, nenhum token daquela pessoa é aceito, em qualquer aparelho (#298) [Backend]
- Adiciona Denúncias à navegação e ao menu, e faz perfil, denúncias e notificações abrirem uma tela avisando que a área ainda não está disponível, com a volta ao menu — antes os três endereços caíam na página inicial (#300) [Frontend]
- Adiciona o menu da conta no avatar do topo, com o caminho para perfil, para preferências e a saída de sessão — que até aqui não existia em lugar nenhum da área logada; sair invalida o token no servidor, leva à página inicial, e encerra a sessão do mesmo jeito quando a chamada falha (#302) [Frontend]
- Adiciona a campainha de notificações no topo da área logada, com o painel ancorado nela e o caminho para a central; sem notificação ainda, ele mostra o estado vazio, que é o único que existe até a API passar a emiti-las (#307) [Frontend]

### Changed

- Passa a pedir a data por digitação, com o calendário atrás de um botão, na busca de caronas, no mural de achados e perdidos e nos dois formulários; o campo ganha a mesma borda e o mesmo espaçamento dos campos ao lado, dos quais destoava (#274) [Frontend]
- Reduz a altura do rodapé no desktop, que ocupava espaço demais e empurrava o conteúdo para cima (#282) [Frontend]
- Passa a recusar cadastro cujo telefone ou e-mail de contato já pertença a outra pessoa, com o mesmo 409 que o e-mail de login já respondia; a unicidade passa a valer também no banco, e para isso os cadastros que repetiam um contato são apagados junto com as caronas que ofertaram, ficando o mais antigo (#284) [Backend]
- Passa a dizer qual campo está em uso na resposta de conflito do cadastro, que antes trazia só a mensagem (#284) [Backend]
- Passa a exigir 18 anos completos no cadastro também na API, que aceitava conta de menor de idade em requisição feita fora do formulário; quem completa 18 anos no dia é aceito (#285) [Backend]
- Passa a distribuir os campos da conta em dois por linha no cadastro — nascimento com gênero, e-mail com senha —, em vez de três (#287) [Frontend]
- Passa a recusar os tokens emitidos antes desta versão, que não carregam a versão de sessão e por isso não podem ser invalidados; quem estiver com a sessão aberta no momento da publicação entra de novo, uma vez (#298) [Backend]
- Clareia o texto de marca e os blocos de carregamento no tema escuro, que ganham contraste contra o fundo (#297) [Frontend]
- Move a preferência de tema do topo da área logada para uma tela própria, em Preferências, alcançada pelo menu; na página inicial o botão continua no topo, para quem ainda não entrou (#301) [Frontend]
- Divide o menu lateral da área logada em seções — serviços e conta —, cada item com o seu ícone e a saída de sessão separada no rodapé; ele passa a levar também a notificações, ao perfil e às preferências, e abaixo do desktop passa a ser o único caminho para a conta, com o avatar saindo do topo onde o botão de menu aparece (#306) [Frontend]
- Renomeia para `Excluir` a ação que remove item e carona, antes chamada `Cancelar` e lida como desistir da operação em vez de destruir o registro; a confirmação, os avisos, a etiqueta e o filtro acompanham, o botão que dispensa o diálogo volta a ser `Cancelar`, e recuperar um item excluído passa a ser `Restaurar`. A nota do item excluído passa a distinguir a exclusão manual da automática por inatividade, e deixa de existir quando o motivo não vem — antes ela repetia a palavra da etiqueta ao lado (#314) [Frontend]
- Junta data e hora da carona num campo só, digitado com máscara e com um painel que a aplicação desenha, mostrando o dia e a hora um passo por vez com o valor escolhido no topo: o campo de hora usava o seletor do navegador, que saía claro sobre o diálogo escuro e com moldura que não é a dos nossos campos. O formulário passa a recusar a partida escrita pela metade, que antes seguia com a data vazia (#316) [Frontend]
- Troca o ícone da aplicação pelo símbolo da marca e o leva também para o logo do topo, ao lado da palavra, com a inicial de `Connect` na cor da marca; na aba escura do navegador a roda do símbolo clareia, porque no tom original ela sumia contra o fundo da aba (#319) [Frontend]

### Fixed

- Corrige o mural de achados e perdidos, que trocava a tela inteira por um aviso de erro quando a situação de um item não vinha; agora o item aparece com a situação vazia (#280) [Frontend]
- Corrige a data que a busca recebia enquanto ainda se digitava: com o ano pela metade, `25/12/20` valia como o ano 20 e era enviada assim (#274) [Frontend]
- Corrige o indicador de carregamento dos botões, que girava num cinza escuro em vez da cor do texto do próprio botão — sobre o botão preenchido ele mal se distinguia do fundo (#275) [Frontend]
- Aumenta os ícones de ação dos cartões das duas listas, pequenos demais ao lado da etiqueta de situação (#276) [Frontend]
- Corrige o cartão de entrar da página inicial, que era estreito demais para o e-mail institucional completo e o cortava dentro do campo — e é o único formato de e-mail que a tela aceita (#278) [Frontend]
- Corrige a explicação do tipo de carona, inalcançável no celular: ela abria só ao passar o ponteiro, e agora abre ao toque, num alvo grande o bastante e sem levar o foco para o campo (#279) [Frontend]
- Corrige o espaçamento dos botões dentro dos campos — o do calendário e o do relógio —, que ficavam mais para dentro que a seta dos campos de seleção ao lado (#279) [Frontend]
- Corrige os controles que o navegador desenha por conta — como a listinha do campo de hora dos filtros —, que saíam sempre no claro por mais escuro que o tema estivesse (#316) [Frontend]
- Corrige o logo dentro do menu lateral, que navegava e deixava o menu aberto por cima da tela nova (#281) [Frontend]
- Corrige o realce de passar o ponteiro no topo e no menu lateral: no topo ele não chegava a aparecer, e no menu clareava tanto que apagava o próprio rótulo (#281) [Frontend]
- Corrige a recusa de cadastro sem data de nascimento, que respondia em inglês enquanto os outros erros da API já vinham em português (#285) [Backend]
- Corrige o erro de cadastro já em uso, que avisava sempre sobre o e-mail mesmo quando o repetido era o telefone; agora ele aparece embaixo do campo certo, que recebe o foco (#287) [Frontend]
- Corrige o atraso ao sair da conta: a sessão só era encerrada depois da resposta do servidor, então o clique ficava esperando a rede; agora ela sai no clique e a invalidação segue por trás (#304) [Frontend]
- Corrige a cor do campo preenchido pelo autocompletar no tema escuro, que o navegador pintava de azul e destoava do resto da tela; o tema claro segue como estava (#305) [Frontend]
- Corrige a oferta de carona, que aceitava data e hora já passadas e deixava a recusa para a API: o formulário passa a recusar no próprio campo, no mesmo fuso em que a API valida, e o calendário não oferece mais dia anterior a hoje (#312) [Frontend]
- Corrige o cadastro, que aceitava texto acima do limite da API em sete campos e recebia de volta um erro que não dizia qual deles reprovou; cada campo passa a avisar o máximo que aceita (#312) [Frontend]
- Corrige o campo preenchido pelo navegador, que saía em dois tons quando tem botão dentro dele: a faixa atrás do olho da senha ficava com o branco do cartão enquanto o resto do campo era pintado. No tema escuro já estava correto (#319) [Frontend]

### Removed

- Remove o apelido do cadastro: o campo sai do contrato e do banco, e a requisição que ainda o mande é aceita com o valor descartado. A coluna é apagada, então o apelido de quem já se cadastrou se perde (#283) [Backend]
- Remove o campo de apelido do formulário de cadastro, que era opcional e não aparecia em nenhuma tela (#287) [Frontend]

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
