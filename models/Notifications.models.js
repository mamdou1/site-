module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define('Notifications', {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'temoignage', 'error', 'alert', 'message', 'update'),
      allowNull: false
    },
    lue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    contact_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'contacts',
        key: 'id'
      }
    },
    enterprise_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'entreprises',
        key: 'id'
      }
    },
    temoignage_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'temoignages',
        key: 'id'
      }
    }
  }, {
    tableName: "notifications",
    underscored: true,
    timestamps: true
  });

  Notifications.associate = (models) => {
    Notifications.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Notifications.belongsTo(models.Contact, {
      foreignKey: 'contact_id',
      as: 'contact'
    });
    
    Notifications.belongsTo(models.Enterprise, {
      foreignKey: 'enterprise_id',
      as: 'enterprise'
    });
    
    Notifications.belongsTo(models.Temoignage, {
      foreignKey: 'temoignage_id',
      as: 'temoignage'
    });
  };

  return Notifications;
};