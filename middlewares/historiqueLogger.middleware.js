// const HistoriqueService = require("../services/historique.service");

// const mapAction = (method) => {
//   switch (method) {
//     case "POST":
//       return "create";
//     case "GET":
//       return "read";
//     case "PUT":
//     case "PATCH":
//       return "update";
//     case "DELETE":
//       return "delete";
//     default:
//       return "other";
//   }
// };

// module.exports = (req, res, next) => {
//   const start = Date.now();

//   res.on("finish", async () => {
//     try {
//       if (res.statusCode >= 400) return;

//       if (req.originalUrl.includes("/auth")) return;

//       const user = req.user || null;

//       await HistoriqueService.log({
//         agent_id: user?.id || null,
//         action: mapAction(req.method),
//         resource: req.baseUrl.split("/")[2] || "system",
//         resource_id: req.params?.id || null,
//         method: req.method,
//         path: req.originalUrl,
//         status: res.statusCode,
//         ip: req.ip,
//         user_agent: req.headers["user-agent"],
//         data: {
//           duration: Date.now() - start,
//         },
//       });
//     } catch (e) {
//       console.error("❌ Historique middleware error:", e.message);
//     }
//   });

//   next();
// };
// middlewares/historiqueLogger.middleware.js

// middlewares/historiqueLogger.middleware.js

// middlewares/historiqueLogger.middleware.js
const HistoriqueService = require("../services/historique.service");
const logger = require("../config/logger.config"); // ← AJOUTEZ CECI

const mapAction = (method) => {
  switch (method) {
    case "POST":
      return "create";
    case "GET":
      return "read";
    case "PUT":
      return "update";
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "other";
  }
};

module.exports = (req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  let responseData = null;

  res.json = function (data) {
    responseData = data;
    return originalJson.call(this, data);
  };

  res.on("finish", async () => {
    if (res.statusCode === 304) return;

    try {
      if (req.originalUrl.includes("/auth")) return;

      const user = req.user || null;
      const action = mapAction(req.method);

      if (action === "other") return;

      // ✅ SEULS LES GET DE SIDEBAR OU AVEC ID SONT LOGUÉS
      if (req.method === "GET") {
        const isSidebarNavigation =
          req.headers["x-sidebar-navigation"] === "true";
        const hasId = !!req.params.id;

        // Log détaillé
        logger.debug("🔍 GET DÉTECTÉ:", {
          url: req.originalUrl,
          method: req.method,
          params: req.params,
          hasId,
          isSidebarNavigation,
          headers: req.headers,
        });

        if (!isSidebarNavigation && !hasId) {
          logger.debug("⏭️ GET ignoré - SORTIE ANTICIPÉE:", req.originalUrl);
          return; // Sortie anticipée
        } else {
          logger.debug("✅ GET accepté - SERA LOGUÉ:", {
            url: req.originalUrl,
            raison: isSidebarNavigation ? "sidebar" : "a un ID",
          });
        }
      }

      const segments = req.originalUrl.split("/").filter(Boolean);
      let resource = "system";

      for (const segment of segments) {
        if (segment !== "api" && !/^\d+$/.test(segment)) {
          resource = segment;
          break;
        }
      }

      const logData = {
        agent_id: user?.id || null,
        action,
        resource,
        resource_id: req.params?.id || null,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        data: {
          duration: Date.now() - start,
          query: req.query,
          params: req.params,
        },
      };

      if (action === "read" && req.params.id) {
        logData.description = `Consultation de ${resource} #${req.params.id}`;
      }

      await HistoriqueService.log(logData);
    } catch (e) {
      logger.error("❌ Historique middleware error:", e.message);
    }
  });

  next();
};
