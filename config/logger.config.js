// config/logger.config.js
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// Créer le dossier logs s'il n'existe pas
const fs = require("fs");
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  }),
);

// Transport pour les logs d'historique
const historiqueTransport = new DailyRotateFile({
  filename: path.join(logDir, "historique-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  format: logFormat,
  level: "info", // ← CORRECT : string
});

// Transport pour les erreurs
const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  format: logFormat,
  level: "error", // ← CORRECT : string
});

// Transport console
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
});

// Création du logger
const logger = winston.createLogger({
  level: "debug", // ← CORRECT : string
  transports: [historiqueTransport, errorTransport],
});

// Ajouter la console en développement
if (process.env.NODE_ENV !== "production") {
  logger.add(consoleTransport);
}

// Tester que le logger fonctionne
logger.info("✅ Logger initialisé avec succès");

module.exports = logger;
