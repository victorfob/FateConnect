# Controle e atribuição

## O controle positivo

- **Force o defeito no mesmo alvo.** Sonda incapaz de produzir o defeito de propósito devolve verde sobre nada. A guarda de "sem Docker" só aparece parando o Docker de verdade.
- **Desligar por variável de ambiente não desliga.** Ferramenta com descoberta automática (Docker, proxy, DNS, resolvedor de pacote) trata a variável como preferência: `DOCKER_HOST` para porta morta e o Testcontainers cai no socket do Desktop. Tire o recurso do ar.
- **Controle em outro alvo prova o instrumento, não o caminho.** O controle que vale é da própria conexão ou do próprio alvo medido.
- **Controle que passa quando você esperava falha:** algo mais pode ter consertado aquele caminho antes (um listener de `resize` que recalculou o valor com o painel aberto). Liste o que mais produz o resultado antes de remover a correção.

## Atribuição

- **Antes de dizer que o efeito é seu, remova a sua mudança** e recarregue frio. O tell é *"isso apareceu depois que eu mexi"*.
- **Comportamento de biblioteca se lê no `node_modules`**, não se infere da tela.

## Remover um contorno

O comentário diz por que o contorno nasceu, não tudo o que ele sustenta. Antes de apagar, enumere os motivos e meça a consequência (painel estreito no celular também por proporção, não só pela seta).

## Alcance de uma troca de token

`grep` responde quem **referencia** a chave; não responde quem **renderiza**. Confira se o caminho chega à tela (o símbolo que pinta com `currentColor` não lê a chave; chave lida só em teste não tem consumidor). Medição que elimina quase todas as opções pede conferir a premissa de alcance antes de aceitar.

## Relato contra medição

Quem vê o produto olha o conjunto; você olhou um arquivo. O tell é o sujeito da sua afirmação ser mais largo que o que você abriu ("a tela mostra" tendo lido o interceptor). Liste as camadas entre a medição e a tela, e abra cada uma.
