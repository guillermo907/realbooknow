-- Select the Jazzbook database in phpMyAdmin first. Compatible with MySQL/MariaDB.
-- Additive: does not alter any insulin calculator or guitar site tables.
CREATE TABLE IF NOT EXISTS jazzbook_users (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 google_sub VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 email VARCHAR(320) NOT NULL,
 display_name VARCHAR(200) NOT NULL DEFAULT '',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(id), UNIQUE KEY jazzbook_google_sub (google_sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS jazzbook_libraries (
 user_id BIGINT UNSIGNED NOT NULL,
 revision BIGINT UNSIGNED NOT NULL DEFAULT 0,
 payload LONGTEXT NOT NULL,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(user_id),
 CONSTRAINT jazzbook_library_user FOREIGN KEY(user_id) REFERENCES jazzbook_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS jazzbook_global_charts (
 id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 payload MEDIUMTEXT NOT NULL,
 updated_by BIGINT UNSIGNED NOT NULL,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(id), KEY jazzbook_chart_editor(updated_by),
 CONSTRAINT jazzbook_chart_user FOREIGN KEY(updated_by) REFERENCES jazzbook_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS jazzbook_meta (
 name VARCHAR(80) NOT NULL, value BIGINT UNSIGNED NOT NULL DEFAULT 0,
 PRIMARY KEY(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO jazzbook_meta(name,value) VALUES ('schema',1),('catalog_revision',0);

-- Additional site-management storage. Existing users, libraries and charts remain intact.
CREATE TABLE IF NOT EXISTS jazzbook_site (
 id TINYINT UNSIGNED NOT NULL,
 revision BIGINT UNSIGNED NOT NULL DEFAULT 0,
 payload MEDIUMTEXT NOT NULL,
 updated_by BIGINT UNSIGNED NULL,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(id),
 CONSTRAINT jazzbook_site_editor FOREIGN KEY(updated_by) REFERENCES jazzbook_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO jazzbook_site(id,revision,payload) VALUES(1,0,'{}');
UPDATE jazzbook_meta SET value=2 WHERE name='schema';
