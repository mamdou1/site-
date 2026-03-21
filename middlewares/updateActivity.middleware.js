const { Agent } = require("../models");

exports.updateActivity = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await Agent.update(
        {
          last_activity: new Date(),
          is_on_line: true,
        },
        {
          where: { id: req.user.id },
        },
      );
    }
  } catch (err) {
    console.error("Erreur updateActivity:", err.message);
  }

  next();
};
