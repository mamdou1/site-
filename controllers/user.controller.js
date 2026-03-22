const { Users } = require("../models");
const bcrypt = require("bcrypt");

// =========================
// ✅ CREATE USER
// =========================
exports.createUser = async (req, res, next) => {
    try {
        const { nom, prenom, username, email, password, telephone, role } = req.body;

        const existingUser = await Users.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Users.create({
            nom,
            prenom,
            username,
            email,
            password: hashedPassword,
            telephone,
            role
        });

        user.password = undefined;

        res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};


// =========================
// ✅ GET ALL USERS
// =========================
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await Users.findAll({
            attributes: { exclude: ["password"] }
        });

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        next(error);
    }
};


// =========================
// ✅ GET USER BY ID
// =========================
exports.getUserById = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });

        if (!user) {
            return res.status(404).json({ message: "User non trouvé" });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};


// =========================
// ✅ UPDATE USER
// =========================
exports.updateUser = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User non trouvé" });
        }

        // Si password est modifié
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        await user.update(req.body);

        user.password = undefined;

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};


// =========================
// ✅ DELETE USER
// =========================
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User non trouvé" });
        }

        await user.destroy();

        res.json({
            success: true,
            message: "User supprimé"
        });

    } catch (error) {
        next(error);
    }
};

exports.uploadPhoto = async (req, res, next) => {
    try {
        const user = await Users.findByPk(req.params.id);
        console.log(req.file)

        if (!user) {
            return res.status(404).json({ message: "User non trouvé" });
        }

        // 🔥 Vérification obligatoire
        if (!req.file) {
            return res.status(400).json({
                message: "Aucun fichier envoyé"
            });
        }

        const photoPath = req.file.path;

        await user.update({ photo_profil: photoPath });

        res.json({
            success: true,
            message: "Photo uploadée",
            data: user
        });

    } catch (error) {
        next(error);
    }
};