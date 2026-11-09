# Help Flow | Azure Function de Métricas

Azure Function responsável pelo processamento e cálculo de indicadores dos chamados do sistema _Help Flow_, desenvolvido como parte do Projeto PJBL de Arquitetura e Soluções Cloud, do curso de Engenharia de Software da PUCPR.

Desenvolvida em _Node.js e JavaScript, utilizando \*\*HTTP Trigger_, a função representa o componente Serverless da arquitetura distribuída.

Sua principal responsabilidade é receber dados de chamados enviados pelo Backend for Frontend (BFF), calcular indicadores operacionais e retornar as métricas em formato JSON.

### Integrantes

- Erick Misturi Machado
- Jean Inácio Praes Moura
- João Gabriel de Lima Coltre
- Stefany Carlos de Oliveira

A Azure Function complementa a arquitetura distribuída do Help Flow, sendo responsável pelo cálculo e disponibilização de indicadores operacionais dos chamados.

## 1. Tecnologias utilizadas

- Node.js
- JavaScript
- Azure Functions
- Azure Functions Core Tools
- HTTP Trigger
- Azure Application Insights
- Azurite para execução local
- Microsoft Azure
- Git e GitHub

## 2. Arquitetura e funcionamento

A função utiliza o modelo _Serverless Computing_, permitindo executar o processamento dos indicadores sob demanda, por meio de requisições HTTP.

O processamento ocorre em três etapas:

1. Recebimento da lista de chamados enviada pelo BFF.
2. Processamento dos dados e cálculo dos indicadores.
3. Retorno de uma resposta JSON com as métricas calculadas.

### Indicadores calculados

- Quantidade total de chamados.
- Quantidade de chamados abertos.
- Quantidade de chamados em andamento.
- Quantidade de chamados resolvidos.
- Quantidade de chamados fechados.
- Total de chamados concluídos.
- Percentual de resolução.
- Distribuição de chamados por prioridade.

A função não realiza operações de persistência no MongoDB Atlas ou no Azure SQL Database.

Sua responsabilidade é processar os dados recebidos e retornar os indicadores ao BFF.

## 3. Endpoint HTTP

A função utiliza HTTP Trigger para receber requisições POST.

| Método | Endpoint              | Descrição                                 |
| ------ | --------------------- | ----------------------------------------- |
| POST   | /api/getticketmetrics | Processar chamados e calcular indicadores |

### Endpoint público no Azure

https://help-flow-metrics-c0dddcd0fvfpdkdp.brazilsouth-01.azurewebsites.net/api/getticketmetrics

O endpoint recebe uma lista de chamados no corpo da requisição e retorna as métricas calculadas.

_Observação:_ a rota utiliza o método POST. Acessá-la diretamente pela barra de endereços do navegador, que normalmente realiza uma requisição GET, não representa um teste válido do processamento.

## 4. Processamento dos indicadores

A função recebe uma lista de chamados e calcula as quantidades conforme seus respectivos status e prioridades.

### Exemplo de requisição

json
{
"chamados": [
{
"status": "ABERTO",
"prioridade": "ALTA"
},
{
"status": "RESOLVIDO",
"prioridade": "MEDIA"
}
]
}

### Exemplo de resposta

json
{
"totalChamados": 2,
"chamadosAbertos": 1,
"chamadosEmAndamento": 0,
"chamadosResolvidos": 1,
"chamadosFechados": 0,
"chamadosConcluidos": 1,
"percentualResolucao": 50,
"distribuicaoPorPrioridade": {
"BAIXA": 0,
"MEDIA": 1,
"ALTA": 1,
"CRITICA": 0
},
"processadoEm": "2026-11-08T00:00:00.000Z"
}

Os dados apresentados são ilustrativos.

O campo processadoEm representa a data e hora em que o processamento foi realizado.

### Regras de processamento

A função consolida os chamados recebidos e calcula:

- Total de registros recebidos.
- Quantidade de registros por status.
- Total de chamados concluídos.
- Percentual de resolução em relação ao total.
- Distribuição por prioridade.

O processamento é realizado sob demanda, sem necessidade de manter um servidor dedicado para a execução dessa lógica.

## 5. Integração com o Help Flow

A Azure Function é acionada pelo BFF durante a agregação de dados do sistema.

### Fluxo de integração

text
Usuário
|
v
Microfrontend (React + Vite)
|
v
Nginx (Proxy Reverso)
|
v
AWS API Gateway
|
v
BFF (Node.js + Express)
|
+---------------------------+
| | |
v v v
Chamados Usuários Azure Function
| | |
v v v
MongoDB Azure SQL Indicadores
Atlas Database calculados
| | |
+-------------+-------------+
|
v
Resposta consolidada
|
v
Dashboard React

A função recebe os chamados consultados pelo BFF e retorna os indicadores calculados.

O BFF incorpora essas informações à resposta do endpoint:

GET /aggregated-data

### Responsabilidades

_Microfrontend:_

- Apresentar os indicadores ao usuário.
- Consumir o endpoint de agregação do BFF.

_BFF:_

- Consultar os microserviços.
- Encaminhar os dados necessários à Azure Function.
- Consolidar os resultados.
- Retornar as informações ao frontend.

_Azure Function:_

- Receber os chamados.
- Calcular os indicadores.
- Retornar os resultados em JSON.

Essa separação mantém o processamento de métricas independente das operações de persistência dos microserviços.

## 6. Configuração do ambiente

### Pré-requisitos

- Node.js compatível com o projeto.
- npm.
- Azure Functions Core Tools.
- Azurite, quando necessário para armazenamento local.

### Instalar dependências

bash
npm install

No Windows PowerShell, caso a política de execução bloqueie o npm:

powershell
npm.cmd install

### Configurações locais

Para executar a função localmente, é necessário disponibilizar as configurações de ambiente utilizadas pelo Azure Functions.

O arquivo local.settings.json armazena as configurações locais.

Um exemplo básico de estrutura é:

json
{
"IsEncrypted": false,
"Values": {
"AzureWebJobsStorage": "UseDevelopmentStorage=true",
"FUNCTIONS_WORKER_RUNTIME": "node"
}
}

Esse exemplo pressupõe um serviço de armazenamento local compatível, como o Azurite, quando exigido pela configuração da função.

O arquivo local.settings.json deve permanecer fora do controle de versão, pois pode conter configurações locais e informações sensíveis.

## 7. Execução local

Para iniciar a Azure Function:

bash
func start

### Endpoint local

http://localhost:7071/api/getticketmetrics

A função pode ser testada por meio de uma requisição HTTP POST.

### Exemplo de teste com curl

bash
curl -X POST http://localhost:7071/api/getticketmetrics \
 -H "Content-Type: application/json" \
 -d '{"chamados":[{"status":"ABERTO","prioridade":"ALTA"},{"status":"RESOLVIDO","prioridade":"MEDIA"}]}'

O exemplo utiliza a sintaxe de continuação de linha de um shell compatível com Bash.

No Windows PowerShell, também é possível realizar o teste utilizando Postman ou outro cliente HTTP.

## 8. Implantação no Azure

A função está implantada no Microsoft Azure.

### Configuração da Function App

| Configuração | Valor                 |
| ------------ | --------------------- |
| Function App | help-flow-metrics     |
| Região       | Brazil South          |
| Plano        | Flex Consumption      |
| Linguagem    | JavaScript            |
| Runtime      | Node.js               |
| Gatilho      | HTTP Trigger          |
| Método       | POST                  |
| Rota         | /api/getticketmetrics |

### Endpoint de produção

https://help-flow-metrics-c0dddcd0fvfpdkdp.brazilsouth-01.azurewebsites.net/api/getticketmetrics

O plano Flex Consumption permite executar a função sob demanda, utilizando o modelo de computação Serverless.

A função é consumida pelo BFF, que disponibiliza os resultados ao frontend por meio do endpoint de agregação.

## 9. Integração com o AWS API Gateway e BFF

O Help Flow utiliza o AWS API Gateway como ponto de entrada das requisições do frontend.

### AWS API Gateway

https://op5937r48e.execute-api.us-east-2.amazonaws.com

### BFF público

https://helpflow-bff.victoriousground-a72b89ca.centralus.azurecontainerapps.io

### Swagger do BFF

https://helpflow-bff.victoriousground-a72b89ca.centralus.azurecontainerapps.io/api-docs/

_Observação:_ os endereços-base do AWS API Gateway e do BFF não possuem uma página inicial configurada. Por isso, o acesso direto à rota / pode retornar Not Found, sem indicar indisponibilidade dos serviços.

Para verificar o funcionamento, utilize os endpoints disponibilizados:

- AWS API Gateway: GET /aggregated-data (requer autenticação JWT).
- BFF: GET /health.
- Swagger do BFF: /api-docs/.

### Endpoint de agregação

GET /aggregated-data

O frontend encaminha as requisições ao AWS API Gateway, que direciona as chamadas ao BFF.

O BFF consulta os microserviços e aciona a Azure Function por HTTP para calcular os indicadores.

A Azure Function não precisa ser acessada diretamente pelo microfrontend para disponibilizar as métricas do dashboard.

## 10. Segurança

A função utiliza o nível de autorização:

anonymous

Isso significa que o endpoint HTTP da Azure Function não exige uma chave de função para ser invocado.

O acesso às funcionalidades protegidas do Help Flow é controlado nas demais camadas da arquitetura, incluindo autenticação JWT e autorização no backend.

_Importante:_ a autorização anonymous permite chamadas diretas ao endpoint da função. A autenticação do BFF não protege automaticamente essa URL pública.

A configuração é adequada à demonstração acadêmica realizada, mas uma implantação com requisitos mais rigorosos de segurança pode utilizar autenticação da função, restrições de rede ou outros mecanismos de proteção.

## 11. Monitoramento e observabilidade

O Azure Application Insights é utilizado para apoiar o monitoramento da Azure Function.

O serviço permite acompanhar informações como:

- Execuções da função.
- Requisições HTTP.
- Erros de execução.
- Exceções.
- Tempo de processamento.
- Registros de diagnóstico.

Essas informações auxiliam na identificação de problemas e na análise do comportamento da função em produção.

## 12. Relação com Event-Driven Architecture

O Help Flow também implementa comunicação orientada a eventos utilizando Azure Service Bus.

Entretanto, a Azure Function GetTicketMetrics utiliza _HTTP Trigger_, não um gatilho do Service Bus.

As responsabilidades são distintas:

| Componente                      | Responsabilidade                              |
| ------------------------------- | --------------------------------------------- |
| Azure Function GetTicketMetrics | Calcular indicadores mediante requisição HTTP |
| Microserviço de Chamados        | Publicar eventos relacionados aos chamados    |
| Azure Service Bus               | Transportar mensagens assíncronas             |
| Consumer Node.js                | Receber e processar eventos da fila           |

### Eventos implementados no sistema

- ChamadoCriado
- ChamadoAtualizado
- ChamadoExcluido

### Fluxo de eventos

text
Microfrontend
|
v
AWS API Gateway
|
v
BFF
|
v
Microserviço de Chamados
|
+----> MongoDB Atlas
|
v
Azure Service Bus
|
v
Consumer Node.js
|
v
Processamento dos eventos

A Azure Function de métricas e o consumidor de eventos são componentes independentes, com responsabilidades diferentes dentro da arquitetura distribuída.

## 13. Padrões arquiteturais aplicados

### Serverless Computing

A Azure Function executa o processamento de métricas sob demanda, sem necessidade de administrar diretamente um servidor dedicado.

### Backend for Frontend

O BFF integra a Azure Function com os demais serviços e disponibiliza os resultados consolidados ao frontend.

### Microservices

Os microserviços de Chamados e Usuários possuem responsabilidades independentes.

### Database per Service

Cada microserviço utiliza seu próprio banco de dados:

- Chamados: MongoDB Atlas.
- Usuários: Azure SQL Database.

### API Gateway

O AWS API Gateway centraliza a entrada das requisições realizadas pelo microfrontend.

### Event-Driven Architecture

O Azure Service Bus permite comunicação assíncrona entre o microserviço de Chamados e o consumidor de eventos.

A Azure Function complementa essa arquitetura com processamento Serverless acionado por HTTP.

## 14. Repositórios relacionados

O Help Flow é organizado em repositórios independentes, integrados ao repositório principal por meio de submódulos Git.

### Repositório principal

https://github.com/Praesjean/Help-Flow.git

### Componentes

- Help-Flow-Microfrontend
- Help-Flow-BFF
- Help-Flow-Chamados
- Help-Flow-Usuarios
- Help-Flow-AzureFunction

Os endereços específicos dos sub-repositórios podem ser consultados no arquivo .gitmodules do repositório principal.

## 15. Contexto acadêmico

Componente desenvolvido para o projeto _Help Flow, na disciplina de **Arquitetura e Soluções Cloud, do curso de Engenharia de Software da **Pontifícia Universidade Católica do Paraná (PUCPR)_.

A solução demonstra a utilização de:

- Serverless Computing.
- Azure Functions.
- HTTP Trigger.
- Integração entre serviços distribuídos.
- Backend for Frontend.
- API Gateway.
- Microservices.
- Database per Service.
- Event-Driven Architecture.
- Observabilidade com Azure Application Insights.
