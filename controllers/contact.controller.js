const { Op } = require("sequelize");
const { Contact, Notifications, Users } = require("../models");


exports.getContacts = async (req, res, next) => {
    try {
        const { limit = 10, offset = 0, search } = req.query;
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { nom_complet: { [Op.like]: `%${search}%` } },
                    { societe: { [Op.like]: `%${search}%` } },
                    { telephone: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            }

        }
        const contacts = await Contact.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
        });

        if (!contacts) return res.json({ message: "Aucun contact" });

        res.json({
            success: true,
            total: contacts.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: contacts.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createContact = async (req, res, next) => {
    try {
        const contact = await Contact.create(req.body);

        const users = await Users.findAll({ where: { role: "admin" } });

        const notifications = users.map(user => ({
            user_id: user.id,
            type: "contact",
            contact_id: contact.id,
        }));

        await Notifications.bulkCreate(notifications).catch(err => {
            console.error("Erreur notifications:", err);
        });

        res.status(201).json({
            success: true,
            data: contact
        })
    } catch (error) {
        next(error);
    }
}

exports.deleteContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByPk(req.params.id);

        if (!contact) return res.status(404).json({ message: "Contact non trouvé" });

        await contact.destroy();

        res.json({
            success: true,
            message: "Contact supprimé"
        });
    } catch (error) {
        next(error);
    }
}