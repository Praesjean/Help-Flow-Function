# Help Flow | Azure Function de Métricas

Azure Function responsável pelo processamento e cálculo de indicadores dos chamados do sistema Help Flow.

Desenvolvida em Node.js, utilizando HTTP Trigger, a função integra a arquitetura distribuída por meio do Backend for Frontend (BFF), disponibilizando métricas para acompanhamento dos atendimentos.

## 1. Tecnologias utilizadas

- Node.js
- Azure Functions
- Azure Functions Core Tools
- JavaScript
- HTTP Trigger
- Azure Application Insights
- Azurite para execução local

## 2. Arquitetura e funcionamento

A função utiliza o modelo Serverless Computing, permitindo executar o processamento dos indicadores sob demanda, por meio de requisições HTTP.

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

## 3. Endpoint HTTP

A função utiliza HTTP Trigger para receber requisições POST.

| Método | Endpoint              | Descrição                                 |
| ------ | --------------------- | ----------------------------------------- |
| POST   | /api/getticketmetrics | Processar chamados e calcular indicadores |

### Endpoint publicado no Azure

https://help-flow-metrics-c0dddcd0fvfpdkdp.brazilsouth-01.azurewebsites.net/api/getticketmetrics

## 4. Processamento dos indicadores

A função recebe uma lista de chamados e calcula as quantidades conforme seus respectivos status e prioridades.

### Exemplo de requisição

```json
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
```

### Exemplo de resposta

```json
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
```

Os dados apresentados são ilustrativos. O campo `processadoEm` representa a data e hora em que o processamento foi realizado.

## 5. Integração com o Help Flow

A Azure Function é acionada pelo BFF durante a agregação de dados do sistema.

### Fluxo de integração

```text
Microfrontend (React)
        |
        v
API Gateway
        |
        v
BFF (Node.js)
        |
        +-----------------------+
        |           |           |
        v           v           v
   Chamados     Usuários    Azure Function
        |           |           |
        v           v           v
    MongoDB     Azure SQL   Indicadores
     Atlas                  calculados
```

A função recebe os chamados consultados pelo BFF e retorna os indicadores calculados, que são incorporados à resposta do endpoint `GET /aggregated-data`.

## 6. Configuração do ambiente

### Pré-requisitos

- Node.js
- npm
- Azure Functions Core Tools
- Azurite para armazenamento local, quando necessário.

Instale as dependências do projeto:

```bash
npm install
```

Para executar a função localmente, é necessário disponibilizar as configurações de ambiente utilizadas pelo Azure Functions, incluindo as configurações de armazenamento local quando aplicáveis.

O arquivo `local.settings.json` deve permanecer fora do controle de versão, pois pode conter configurações locais e informações sensíveis.

## 7. Execução local

Iniciar a função:

```bash
func start
```

### Endpoint local

http://localhost:7071/api/getticketmetrics

A função pode ser testada por meio de uma requisição HTTP POST, enviando a lista de chamados no corpo da requisição.

## 8. Implantação no Azure

A função está implantada no Microsoft Azure, utilizando:

| Configuração | Valor                 |
| ------------ | --------------------- |
| Function App | help-flow-metrics     |
| Região       | Brazil South          |
| Plano        | Flex Consumption      |
| Gatilho      | HTTP Trigger          |
| Método       | POST                  |
| Rota         | /api/getticketmetrics |

O plano Flex Consumption permite executar a função sob demanda, seguindo o modelo de computação Serverless.

## 9. Segurança e monitoramento

A função utiliza o nível de autorização `anonymous`, permitindo chamadas HTTP sem uma chave própria da Azure Function.

O controle de acesso deve ser considerado na camada responsável pela exposição do serviço, conforme a arquitetura do sistema.

O Azure Application Insights é utilizado para apoiar o monitoramento e a observabilidade da aplicação.

## 10. Integração com a arquitetura distribuída

A Azure Function representa o componente Serverless da arquitetura Help Flow.

Sua responsabilidade é realizar o processamento dos indicadores, evitando concentrar essa lógica nos microserviços responsáveis pela persistência dos dados.

A comunicação ocorre por meio do BFF, que encaminha os dados necessários e incorpora o resultado à resposta consolidada do sistema.

## 11. Contexto acadêmico

Componente desenvolvido para o projeto Help Flow, na disciplina de Arquitetura de Soluções Cloud.

A solução demonstra a utilização de:

- Serverless Computing.
- Azure Functions.
- HTTP Trigger.
- Integração entre serviços distribuídos.
- Backend for Frontend (BFF).
- Observabilidade com Azure Application Insights.

A Azure Function complementa a arquitetura distribuída do Help Flow, sendo responsável pelo cálculo e disponibilização de indicadores operacionais dos chamados.
