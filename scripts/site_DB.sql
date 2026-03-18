-- Création de la base de données
CREATE DATABASE IF NOT EXISTS site_db; 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE solidaire;

-- Table users
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    nombre_visite INT DEFAULT 0,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'VISITEUR', 'SUPER_ADMIN') DEFAULT 'VISITEUR',
    code_verification VARCHAR(255),
    reset_code_expiry DATETIME,
    is_verified_for_reset BOOLEAN DEFAULT FALSE,
    photo_profil VARCHAR(255) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_telephone (telephone),
    FULLTEXT INDEX idx_users_nom_prenom (nom, prenom)
) ENGINE=InnoDB;

-- Table entreprises
CREATE TABLE IF NOT EXISTS entreprises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_visite INT DEFAULT 0,
    adresse TEXT NOT NULL,
    localisation VARCHAR(255) NOT NULL,
    created_by INT,
    updated_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_entreprises_email (email),
    INDEX idx_entreprises_localisation (localisation),
    INDEX idx_entreprises_created_by (created_by),
    FULLTEXT INDEX idx_entreprises_nom (nom, prenom)
) ENGINE=InnoDB;

-- Table contacts
CREATE TABLE IF NOT EXISTS contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom_complet VARCHAR(255) NOT NULL,
    societe VARCHAR(255),
    telephone VARCHAR(255),
    email VARCHAR(255),
    message TEXT,
    fonction VARCHAR(255),
    objet VARCHAR(255),
    user_id INT,
    enterprise_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (enterprise_id) REFERENCES entreprises(id) ON DELETE SET NULL,
    INDEX idx_contacts_email (email),
    INDEX idx_contacts_user_id (user_id),
    INDEX idx_contacts_enterprise_id (enterprise_id),
    INDEX idx_contacts_telephone (telephone),
    INDEX idx_contacts_created_at (created_at)
) ENGINE=InnoDB;

-- Table services
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    duree INT NOT NULL COMMENT 'Durée en jours',
    technologie TEXT NOT NULL,
    enterprise_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    INDEX idx_services_enterprise_id (enterprise_id),
    INDEX idx_services_nom (nom),
    INDEX idx_services_prix (prix),
    FULLTEXT INDEX idx_services_description (description)
) ENGINE=InnoDB;

-- Table solutions
CREATE TABLE IF NOT EXISTS solutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    enterprise_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    INDEX idx_solutions_enterprise_id (enterprise_id),
    INDEX idx_solutions_titre (titre),
    FULLTEXT INDEX idx_solutions_description (description)
) ENGINE=InnoDB;

-- Table service_solution (table de liaison)
CREATE TABLE IF NOT EXISTS service_solution (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    solution_id INT NOT NULL,
    quantite INT DEFAULT 1,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_service_solution (service_id, solution_id),
    INDEX idx_service_solution_service_id (service_id),
    INDEX idx_service_solution_solution_id (solution_id)
) ENGINE=InnoDB;

-- Table videos
CREATE TABLE IF NOT EXISTS videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail VARCHAR(255) NOT NULL,
    type ENUM('PRESENTATION', 'MARKETING', 'DEMO', 'TUTORIEL') DEFAULT 'PRESENTATION',
    enterprise_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    INDEX idx_videos_enterprise_id (enterprise_id),
    INDEX idx_videos_type (type),
    INDEX idx_videos_titre (titre),
    FULLTEXT INDEX idx_videos_description (description)
) ENGINE=InnoDB;

-- Table video_services (table de liaison)
CREATE TABLE IF NOT EXISTS video_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    video_id INT NOT NULL,
    service_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_video_service (video_id, service_id),
    INDEX idx_video_services_video_id (video_id),
    INDEX idx_video_services_service_id (service_id)
) ENGINE=InnoDB;

-- Table temoignages
CREATE TABLE IF NOT EXISTS temoignages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    poste VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    photo VARCHAR(255) NOT NULL,
    enterprise_id INT NOT NULL,
    service_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_temoignages_enterprise_id (enterprise_id),
    INDEX idx_temoignages_service_id (service_id),
    INDEX idx_temoignages_created_at (created_at),
    FULLTEXT INDEX idx_temoignages_message (message)
) ENGINE=InnoDB;

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type ENUM('info', 'success', 'warning', 'error', 'alert', 'message', 'update') NOT NULL,
    lue BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INT,
    contact_id INT,
    enterprise_id INT,
    temoignage_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (enterprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    FOREIGN KEY (temoignage_id) REFERENCES temoignages(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_contact_id (contact_id),
    INDEX idx_notifications_enterprise_id (enterprise_id),
    INDEX idx_notifications_temoignage_id (temoignage_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_lue (lue),
    INDEX idx_notifications_date (date)
) ENGINE=InnoDB;

-- Exemples de requêtes avec jointures

-- 1. Récupérer tous les services d'une entreprise avec leurs solutions
SELECT s.*, sol.titre as solution_titre, sol.description as solution_description
FROM services s
LEFT JOIN service_solution ss ON s.id = ss.service_id
LEFT JOIN solutions sol ON ss.solution_id = sol.id
WHERE s.enterprise_id = 1;

-- 2. Récupérer toutes les vidéos d'une entreprise avec leurs services associés
SELECT v.*, sv.nom as service_nom
FROM videos v
LEFT JOIN video_services vs ON v.id = vs.video_id
LEFT JOIN services sv ON vs.service_id = sv.id
WHERE v.enterprise_id = 1;

-- 3. Récupérer tous les témoignages avec les informations de l'entreprise et du service
SELECT t.*, e.nom as entreprise_nom, e.prenom as entreprise_prenom, s.nom as service_nom
FROM temoignages t
JOIN entreprises e ON t.enterprise_id = e.id
LEFT JOIN services s ON t.service_id = s.id
WHERE t.enterprise_id = 1;

-- 4. Récupérer toutes les notifications non lues pour un utilisateur
SELECT n.*, 
       c.nom_complet as contact_nom,
       e.nom as entreprise_nom,
       t.message as temoignage_message
FROM notifications n
LEFT JOIN contacts c ON n.contact_id = c.id
LEFT JOIN entreprises e ON n.enterprise_id = e.id
LEFT JOIN temoignages t ON n.temoignage_id = t.id
WHERE n.user_id = 1 AND n.lue = FALSE
ORDER BY n.date DESC;

-- 5. Récupérer le nombre de visites par entreprise
SELECT e.nom, e.prenom, e.nombre_visite,
       COUNT(DISTINCT s.id) as nombre_services,
       COUNT(DISTINCT v.id) as nombre_videos,
       COUNT(DISTINCT t.id) as nombre_temoignages
FROM entreprises e
LEFT JOIN services s ON e.id = s.enterprise_id
LEFT JOIN videos v ON e.id = v.enterprise_id
LEFT JOIN temoignages t ON e.id = t.enterprise_id
GROUP BY e.id;

-- 6. Recherche full-text dans les témoignages
SELECT * FROM temoignages 
WHERE MATCH(message) AGAINST('excellent service' IN NATURAL LANGUAGE MODE);

-- 7. Statistiques des notifications par type
SELECT type, 
       COUNT(*) as total,
       SUM(CASE WHEN lue = TRUE THEN 1 ELSE 0 END) as lues,
       SUM(CASE WHEN lue = FALSE THEN 1 ELSE 0 END) as non_lues
FROM notifications
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY type;