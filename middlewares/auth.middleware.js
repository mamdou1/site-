// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  console.log('🔍 Middleware verifyToken exécuté pour:', req.method, req.originalUrl);
  
  const authHeader = req.headers["authorization"];
  console.log('🔍 Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(" ")[1];
  console.log('🔍 Token extrait:', token ? token.substring(0, 20) + '...' : 'AUCUN');
  
  if (!token) {
    console.log('❌ Token manquant pour:', req.originalUrl);
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('❌ Token invalide:', err.message);
      return res.status(403).json({ message: "Token invalide" });
    }

    console.log('✅ Token valide pour user:', decoded.id);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  });
};