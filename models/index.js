const { Sequelize, DataTypes } = require("sequelize"); 
const sequelize = require("../config/database");

const db = {};

db.Contact = require("./Contact.models")(sequelize, DataTypes);
db.Enterprise = require("./Entreprise.models")(sequelize, DataTypes);
db.Notifications = require("./Notifications.models")(sequelize, DataTypes); 
db.Service = require("./Service.models")(sequelize, DataTypes);
db.Solution = require("./Solution.models")(sequelize, DataTypes);
db.ServiceSolution = require("./ServiceSolution.models")(sequelize, DataTypes);
db.Temoignage = require("./Temoinage.models")(sequelize, DataTypes); 
db.Users = require("./Users.models")(sequelize, DataTypes);
db.Video = require("./Video.models")(sequelize, DataTypes);
db.Token = require("./token.model")(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;