const { app } = require("@azure/functions");

app.http("GetTicketMetrics", {
  methods: ["POST"],
  authLevel: "anonymous",

  handler: async (request, context) => {
    try {
      // Recebe os chamados enviados pelo BFF
      const body = await request.json();

      // Aceita tanto uma lista direta quanto { chamados: [...] }
      const chamados = Array.isArray(body) ? body : body?.chamados;

      if (!Array.isArray(chamados)) {
        return {
          status: 400,
          jsonBody: {
            erro: "O corpo da requisição deve conter uma lista de chamados.",
          },
        };
      }

      // Contagem por status
      const porStatus = {
        ABERTO: 0,
        EM_ANDAMENTO: 0,
        RESOLVIDO: 0,
        FECHADO: 0,
      };

      // Contagem por prioridade
      const porPrioridade = {
        BAIXA: 0,
        MEDIA: 0,
        ALTA: 0,
        CRITICA: 0,
      };

      chamados.forEach((chamado) => {
        const status = String(chamado.status || "").toUpperCase();
        const prioridade = String(chamado.prioridade || "").toUpperCase();

        if (Object.prototype.hasOwnProperty.call(porStatus, status)) {
          porStatus[status]++;
        }

        if (Object.prototype.hasOwnProperty.call(porPrioridade, prioridade)) {
          porPrioridade[prioridade]++;
        }
      });

      const total = chamados.length;

      // RESOLVIDO e FECHADO são considerados concluídos
      const concluidos = porStatus.RESOLVIDO + porStatus.FECHADO;

      const percentualResolucao =
        total > 0 ? Number(((concluidos / total) * 100).toFixed(2)) : 0;

      const resultado = {
        totalChamados: total,

        chamadosAbertos: porStatus.ABERTO,
        chamadosEmAndamento: porStatus.EM_ANDAMENTO,
        chamadosResolvidos: porStatus.RESOLVIDO,
        chamadosFechados: porStatus.FECHADO,

        chamadosConcluidos: concluidos,

        percentualResolucao,

        distribuicaoPorPrioridade: porPrioridade,

        processadoEm: new Date().toISOString(),
      };

      context.log("Indicadores de chamados calculados com sucesso.");

      return {
        status: 200,
        jsonBody: resultado,
      };
    } catch (error) {
      context.log("Erro ao calcular indicadores:", error);

      return {
        status: 400,
        jsonBody: {
          erro: "Não foi possível processar os dados dos chamados.",
        },
      };
    }
  },
});
