const { Temoignage, Notifications, Users, Service } = require("../models");

// =========================
// ✅ CREATE
// =========================
exports.createTemoignage = async (req, res, next) => {
    try {
        const temoignage = await Temoignage.create({
            ...req.body,
            statut: "EN_ATTENTE",
        });

        const users = await Users.findAll({ where: { role: "admin" } });

        const notifications = users.map(user => ({
            user_id: user.id,
            type: "temoignage",
            temoignage_id: temoignage.id,
        }));

        await Notifications.bulkCreate(notifications).catch(err => {
            console.error("Erreur notifications:", err);
        });

        res.status(201).json({
            success: true,
            message: "Témoignage envoyé (en attente de validation)",
            data: temoignage,
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// ✅ GET ALL
// =========================
exports.getAllTemoignages = async (req, res, next) => {
    try {
        const { limit = 10, offset = 0, search } = req.query;
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { poste: { [Op.like]: `%${search}%` } },
                    { statut: { [Op.like]: `%${search}%` } },
                ]
            }

        }
        const temoignages = await Temoignage.findAndCountAll({
            where,
            include: [
                {
                    model: Service,
                    as: "service",
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            total: temoignages.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: temoignages.rows
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// ✅ GET BY ID
// =========================
exports.getTemoignageById = async (req, res, next) => {
    try {
        const temoignage = await Temoignage.findByPk(req.params.id, {
            include: [
                {
                    model: Service,
                    as: "service",
                },
            ],
        });

        if (!temoignage) {
            return res.status(404).json({
                message: "Témoignage non trouvé",
            });
        }

        res.json({
            success: true,
            data: temoignage,
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// ✅ UPDATE
// =========================
exports.updateTemoignage = async (req, res, next) => {
    try {
        const temoignage = await Temoignage.findByPk(req.params.id);

        if (!temoignage) {
            return res.status(404).json({
                message: "Témoignage non trouvé",
            });
        }

        await temoignage.update(req.body);

        res.json({
            success: true,
            message: "Témoignage mis à jour",
            data: temoignage,
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// ✅ DELETE
// =========================
exports.deleteTemoignage = async (req, res, next) => {
    try {
        const temoignage = await Temoignage.findByPk(req.params.id);

        if (!temoignage) {
            return res.status(404).json({
                message: "Témoignage non trouvé",
            });
        }

        await temoignage.destroy();

        res.json({
            success: true,
            message: "Témoignage supprimé",
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// ✅ VALIDATE
// =========================
exports.validateTemoignage = async (req, res, next) => {
    try {
        const temoignage = await Temoignage.findByPk(req.params.id);

        if (!temoignage) {
            return res.status(404).json({
                message: "Témoignage non trouvé",
            });
        }

        await temoignage.update({ statut: "VALIDER" }); // ✅ ENUM corrigé

        res.json({
            success: true,
            message: "Témoignage validé",
            data: temoignage,
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// ❌ REFUSE
// =========================
exports.refuseTemoignage = async (req, res, next) => {
    try {
        const temoignage = await Temoignage.findByPk(req.params.id);

        if (!temoignage) {
            return res.status(404).json({
                message: "Témoignage non trouvé",
            });
        }

        await temoignage.update({ statut: "REJETTER" }); // ✅ ENUM corrigé

        res.json({
            success: true,
            message: "Témoignage refusé",
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// 🌍 PUBLIC (VALIDÉS SEULEMENT)
// =========================
exports.getPublicTemoignages = async (req, res, next) => {
    try {
        const temoignages = await Temoignage.findAll({
            where: { statut: "VALIDER" }, // ✅ corrigé
            include: [
                {
                    model: Service,
                    as: "service",
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: temoignages,
        });
    } catch (error) {
        next(error);
    }
};

// =========================
// 📸 UPLOAD PHOTO
// =========================
exports.uploadPhotoTemoignage = async (req, res, next) => {
    try {
        const temoignage = await Temoignage.findByPk(req.params.id);

        if (!temoignage) {
            return res.status(404).json({
                message: "Témoignage non trouvé",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Aucune photo envoyée",
            });
        }

        const photoPath = req.file.path;

        await temoignage.update({ photo: photoPath });

        res.json({
            success: true,
            message: "Photo ajoutée",
            data: temoignage,
        });
    } catch (error) {
        next(error);
    }
};