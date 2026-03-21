const multer = require("multer");
const path = require("path");
const fs = require("fs");

// s'assure que le dossier uploads existe

const uploadDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Utilitaire le chemin absolu
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSurfixe = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, "user-" + uniqueSurfixe + fileExtension);
  },
});

// 🎯 Filtre : accepter images + PDF
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images et les PDF sont autorisés"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5MB max
  },
});

module.exports = upload;
