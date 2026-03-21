module.exports = function slugify(text) {
  return text
    .normalize("NFD")                // supprime accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")   // enlève caractères spéciaux
    .trim()
    .replace(/\s+/g, "_");           // espaces → _
};
