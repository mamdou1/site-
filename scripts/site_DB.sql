-- =====================================================
-- ORDRE DE CRÉATION DES TABLES
-- =====================================================

-- 1. TABLE users (aucune dépendance)
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `prenom` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `nombre_visite` INT NULL DEFAULT '0',
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'VISITEUR') NULL DEFAULT 'VISITEUR',
    `code_verification` VARCHAR(255) NULL DEFAULT NULL,
    `reset_code_expiry` DATETIME NULL DEFAULT NULL,
    `is_verified_for_reset` TINYINT(1) NULL DEFAULT '0',
    `photo_profil` VARCHAR(255) NULL DEFAULT '',
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email` (`email`),
    UNIQUE INDEX `telephone` (`telephone`),
    UNIQUE INDEX `username` (`username`),
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_telephone` (`telephone`),
    FULLTEXT INDEX `idx_users_nom_prenom` (`nom`, `prenom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2. TABLE services (aucune dépendance)
-- =====================================================
CREATE TABLE IF NOT EXISTS `services` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `prix` DECIMAL(10,2) NOT NULL,
    `duree` INT NOT NULL COMMENT 'Durée en jours',
    `technologie` TEXT NOT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_services_nom` (`nom`),
    INDEX `idx_services_prix` (`prix`),
    FULLTEXT INDEX `idx_services_description` (`description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 3. TABLE contacts (aucune dépendance)
-- =====================================================
CREATE TABLE IF NOT EXISTS `contacts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nom_complet` VARCHAR(255) NOT NULL,
    `societe` VARCHAR(255) NULL DEFAULT NULL,
    `telephone` VARCHAR(255) NULL DEFAULT NULL,
    `email` VARCHAR(255) NULL DEFAULT NULL,
    `message` TEXT NULL DEFAULT NULL,
    `fonction` VARCHAR(255) NULL DEFAULT NULL,
    `objet` VARCHAR(255) NULL DEFAULT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_contacts_email` (`email`),
    INDEX `idx_contacts_telephone` (`telephone`),
    INDEX `idx_contacts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 4. TABLE entreprises (dépend de users)
-- =====================================================
CREATE TABLE IF NOT EXISTS `entreprises` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NOT NULL,
    `sigle` VARCHAR(255) NOT NULL,
    `slogan` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(255) NOT NULL,
    `adresse` TEXT NOT NULL,
    `localisation` VARCHAR(255) NOT NULL,
    `created_by` INT NULL DEFAULT NULL,
    `updated_by` INT NULL DEFAULT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email` (`email`),
    UNIQUE INDEX `telephone` (`telephone`),
    INDEX `updated_by` (`updated_by`),
    INDEX `idx_entreprises_email` (`email`),
    INDEX `idx_entreprises_localisation` (`localisation`),
    INDEX `idx_entreprises_created_by` (`created_by`),
    FULLTEXT INDEX `idx_entreprises_nom` (`nom`),
    CONSTRAINT `entreprises_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `entreprises_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 5. TABLE solutions (dépend de entreprises)
-- =====================================================
CREATE TABLE IF NOT EXISTS `solutions` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `enterprise_id` INT NOT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_solutions_enterprise_id` (`enterprise_id`),
    INDEX `idx_solutions_titre` (`titre`),
    FULLTEXT INDEX `idx_solutions_description` (`description`),
    CONSTRAINT `solutions_ibfk_1` FOREIGN KEY (`enterprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 6. TABLE temoignages (dépend de services)
-- =====================================================
CREATE TABLE IF NOT EXISTS `temoignages` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `poste` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `photo` VARCHAR(255) NOT NULL,
    `service_id` INT NULL DEFAULT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_temoignages_service_id` (`service_id`),
    INDEX `idx_temoignages_created_at` (`created_at`),
    FULLTEXT INDEX `idx_temoignages_message` (`message`),
    CONSTRAINT `temoignages_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 7. TABLE notifications (dépend de users, contacts, entreprises, temoignages)
-- =====================================================
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `type` ENUM('info', 'success', 'warning', 'error', 'alert', 'message', 'update') NOT NULL,
    `lue` TINYINT(1) NOT NULL DEFAULT '0',
    `user_id` INT NULL DEFAULT NULL,
    `contact_id` INT NULL DEFAULT NULL,
    `enterprise_id` INT NULL DEFAULT NULL,
    `temoignage_id` INT NULL DEFAULT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_notifications_user_id` (`user_id`),
    INDEX `idx_notifications_contact_id` (`contact_id`),
    INDEX `idx_notifications_enterprise_id` (`enterprise_id`),
    INDEX `idx_notifications_temoignage_id` (`temoignage_id`),
    INDEX `idx_notifications_type` (`type`),
    INDEX `idx_notifications_lue` (`lue`),
    INDEX `idx_notifications_date` (`date`),
    CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`enterprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE,
    CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`temoignage_id`) REFERENCES `temoignages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 8. TABLE service_solution (dépend de services et solutions)
-- =====================================================
CREATE TABLE IF NOT EXISTS `service_solution` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `service_id` INT NOT NULL,
    `solution_id` INT NOT NULL,
    `quantite` INT NULL DEFAULT '1',
    `details` TEXT NULL DEFAULT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `unique_service_solution` (`service_id`, `solution_id`),
    INDEX `idx_service_solution_service_id` (`service_id`),
    INDEX `idx_service_solution_solution_id` (`solution_id`),
    CONSTRAINT `service_solution_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
    CONSTRAINT `service_solution_ibfk_2` FOREIGN KEY (`solution_id`) REFERENCES `solutions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 9. TABLE videos (dépend de entreprises et services)
-- =====================================================
CREATE TABLE IF NOT EXISTS `videos` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(255) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `thumbnail` VARCHAR(255) NOT NULL,
    `type` ENUM('PRESENTATION', 'MARKETING', 'DEMO', 'TUTORIEL') NULL DEFAULT 'PRESENTATION',
    `enterprise_id` INT NOT NULL,
    `service_id` INT NOT NULL,
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_videos_enterprise_id` (`enterprise_id`),
    INDEX `idx_videos_type` (`type`),
    INDEX `idx_videos_titre` (`titre`),
    INDEX `fk_service` (`service_id`),
    FULLTEXT INDEX `idx_videos_description` (`description`),
    CONSTRAINT `fk_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
    CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`enterprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 10. TABLE token (dépend de users)
-- =====================================================
CREATE TABLE IF NOT EXISTS `token` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NOT NULL,
    `user_id` INT NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `user_id` (`user_id`),
    CONSTRAINT `token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 11. TABLE historiquelog (dépend de users)
-- =====================================================
CREATE TABLE IF NOT EXISTS `historiquelog` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NULL DEFAULT NULL,
    `action` VARCHAR(255) NOT NULL,
    `resource` VARCHAR(255) NOT NULL,
    `resource_id` INT NULL DEFAULT NULL,
    `resource_identifier` VARCHAR(255) NULL DEFAULT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `method` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `status` INT NOT NULL,
    `ip` VARCHAR(255) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `old_data` JSON NULL DEFAULT NULL,
    `new_data` JSON NULL DEFAULT NULL,
    `deleted_data` JSON NULL DEFAULT NULL,
    `data` JSON NULL DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_historique_agent_id` (`user_id`),
    INDEX `idx_historique_action` (`action`),
    INDEX `idx_historique_resource` (`resource`),
    INDEX `idx_historique_created_at` (`created_at`),
    CONSTRAINT `historiquelog_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;