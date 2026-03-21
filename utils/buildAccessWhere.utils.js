const { Op } = require("sequelize");

module.exports = (accessList) => {
  if (!accessList || !accessList.length) return {};

  const conditions = [];

  for (const a of accessList) {
    if (a.entitee_type === "UN")
      conditions.push({ entitee_un_id: a.entitee_id });

    if (a.entitee_type === "DEUX")
      conditions.push({ entitee_deux_id: a.entitee_id });

    if (a.entitee_type === "TROIS")
      conditions.push({ entitee_trois_id: a.entitee_id });
  }

  return { [Op.or]: conditions };
};
