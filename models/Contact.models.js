module.exports = (sequelize, DataTypes) => {
    const Contact = sequelize.define(
        "Contact",
        {
            nom_complet: DataTypes.STRING,
            societe: DataTypes.STRING,
            telephone: DataTypes.STRING,
            email: DataTypes.STRING,
            message: DataTypes.TEXT, 
            fonction: DataTypes.STRING,
            objet: DataTypes.STRING,
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
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
            }
        },
        {
            tableName: "contacts",
            timestamps: true,
        }
    );

    Contact.associate = (models) => {
        Contact.belongsTo(models.Users, {
            as: "user",
            foreignKey: "user_id"
        });
        
        Contact.belongsTo(models.Enterprise, {
            as: "enterprise",
            foreignKey: "enterprise_id"
        });
        
        Contact.hasMany(models.Notifications, {
            as: "notifications",
            foreignKey: "contact_id"
        });
    }
    return Contact;
};