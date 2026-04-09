-- ============================================================
--  Smart Fishing System — Database Schema
--  Engine  : MySQL 8.0+
--  Charset : utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_fishing_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_fishing_db;

-- ============================================================
-- 1. USERS
--    Covers all three roles: fisherman, admin, researcher
-- ============================================================
CREATE TABLE users (
  user_id       INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(60)     NOT NULL UNIQUE,
  email         VARCHAR(120)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('fisherman','admin','researcher') NOT NULL DEFAULT 'fisherman',
  full_name     VARCHAR(120),
  phone         VARCHAR(20),
  is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. FISH_SPECIES
--    Master list of fish; drives Priority Queue by risk_level
-- ============================================================
CREATE TABLE fish_species (
  species_id        INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  common_name       VARCHAR(100)    NOT NULL,
  scientific_name   VARCHAR(150)    NOT NULL UNIQUE,
  description       TEXT,
  is_protected      BOOLEAN         NOT NULL DEFAULT FALSE,
  risk_level        TINYINT UNSIGNED NOT NULL DEFAULT 0
                    COMMENT '0=least concern … 5=critically endangered',
  min_catch_size_cm DECIMAL(5,2)    COMMENT 'Minimum legal size to keep',
  daily_catch_limit INT UNSIGNED    COMMENT 'Max units a fisherman may catch per day',
  season_start      DATE            COMMENT 'Open season start (NULL = year-round)',
  season_end        DATE            COMMENT 'Open season end   (NULL = year-round)',
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2.5 PORTS
--     Master list of ports for zone anchoring
-- ============================================================
CREATE TABLE ports (
  port_id       INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)    NOT NULL,
  latitude      DECIMAL(10,7)   NOT NULL,
  longitude     DECIMAL(10,7)   NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. FISHING_ZONES
--    Geographic zones; graph edges stored in zone_adjacency
-- ============================================================
CREATE TABLE fishing_zones (
  zone_id       INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_name     VARCHAR(100)    NOT NULL,
  zone_code     VARCHAR(20)     NOT NULL UNIQUE,
  description   TEXT,
  latitude      DECIMAL(10,7)   NOT NULL COMMENT 'Zone centre latitude',
  longitude     DECIMAL(10,7)   NOT NULL COMMENT 'Zone centre longitude',
  area_km2      DECIMAL(10,2),
  depth_m       DECIMAL(7,2)    COMMENT 'Average water depth',
  zone_type     ENUM('open','restricted','protected','closed') NOT NULL DEFAULT 'open',
  water_type    ENUM('ocean','river','estuary','backwater') NOT NULL DEFAULT 'ocean',
  port_id       INT UNSIGNED,
  is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_zone_port FOREIGN KEY (port_id) REFERENCES ports(port_id) ON DELETE SET NULL
);

-- ============================================================
-- 4. ZONE_ADJACENCY
--    Graph edges for the "nearest safe zone" DSA algorithm
-- ============================================================
CREATE TABLE zone_adjacency (
  adjacency_id  INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_from     INT UNSIGNED    NOT NULL,
  zone_to       INT UNSIGNED    NOT NULL,
  distance_km   DECIMAL(8,2)    NOT NULL COMMENT 'Edge weight for graph traversal',
  travel_time_h DECIMAL(5,2)    COMMENT 'Estimated travel time in hours',
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_adj_from FOREIGN KEY (zone_from) REFERENCES fishing_zones(zone_id) ON DELETE CASCADE,
  CONSTRAINT fk_adj_to   FOREIGN KEY (zone_to)   REFERENCES fishing_zones(zone_id) ON DELETE CASCADE,
  CONSTRAINT uq_adj_pair UNIQUE (zone_from, zone_to)
);

-- ============================================================
-- 5. FISH_POPULATION
--    Current stock levels per species per zone
--    Updated after every catch; drives risk detection
-- ============================================================
CREATE TABLE fish_population (
  population_id     INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_id           INT UNSIGNED    NOT NULL,
  species_id        INT UNSIGNED    NOT NULL,
  current_stock     INT UNSIGNED    NOT NULL DEFAULT 0,
  estimated_total   INT UNSIGNED    COMMENT 'Scientific estimate of total stock',
  stock_percentage  DECIMAL(5,2)    AS (
                      IF(estimated_total > 0,
                         ROUND((current_stock / estimated_total) * 100, 2),
                         NULL)
                    ) STORED        COMMENT 'Auto-computed stock health %',
  risk_status       ENUM('safe','warning','critical','depleted') NOT NULL DEFAULT 'safe',
  last_surveyed     DATE,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_pop_zone    FOREIGN KEY (zone_id)    REFERENCES fishing_zones(zone_id)  ON DELETE CASCADE,
  CONSTRAINT fk_pop_species FOREIGN KEY (species_id) REFERENCES fish_species(species_id) ON DELETE CASCADE,
  CONSTRAINT uq_pop_zone_species UNIQUE (zone_id, species_id)
);

-- ============================================================
-- 6. FISHING_SESSIONS
--    One row per fishing trip (zone + effort level chosen by fisherman)
-- ============================================================
CREATE TABLE fishing_sessions (
  session_id    INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED    NOT NULL,
  zone_id       INT UNSIGNED    NOT NULL,
  departure_port VARCHAR(150),
  effort_level  ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  started_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at      TIMESTAMP,
  status        ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
  notes         TEXT,

  CONSTRAINT fk_sess_user FOREIGN KEY (user_id) REFERENCES users(user_id)         ON DELETE CASCADE,
  CONSTRAINT fk_sess_zone FOREIGN KEY (zone_id) REFERENCES fishing_zones(zone_id) ON DELETE CASCADE
);

-- ============================================================
-- 7. CATCH_RECORDS
--    Individual catch events within a session
--    Triggers catch-limit enforcement logic in the app layer
-- ============================================================
CREATE TABLE catch_records (
  catch_id        INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id      INT UNSIGNED    NOT NULL,
  species_id      INT UNSIGNED    NOT NULL,
  quantity        INT UNSIGNED    NOT NULL DEFAULT 1,
  weight_kg       DECIMAL(8,3),
  size_cm         DECIMAL(5,2),
  is_within_limit BOOLEAN         NOT NULL DEFAULT TRUE  COMMENT 'Set by catch-limit service',
  is_released     BOOLEAN         NOT NULL DEFAULT FALSE COMMENT 'Catch-and-release flag',
  caught_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_catch_session FOREIGN KEY (session_id) REFERENCES fishing_sessions(session_id) ON DELETE CASCADE,
  CONSTRAINT fk_catch_species FOREIGN KEY (species_id) REFERENCES fish_species(species_id)     ON DELETE RESTRICT
);

-- ============================================================
-- 8. CATCH_LIMITS
--    Admin-configurable limits per role / zone / species
--    Takes precedence over species-level daily_catch_limit
-- ============================================================
CREATE TABLE catch_limits (
  limit_id      INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_id       INT UNSIGNED    COMMENT 'NULL = applies to all zones',
  species_id    INT UNSIGNED    COMMENT 'NULL = applies to all species',
  user_role     ENUM('fisherman','researcher','all') NOT NULL DEFAULT 'all',
  max_per_day   INT UNSIGNED    NOT NULL,
  max_per_trip  INT UNSIGNED,
  effective_from DATE           NOT NULL DEFAULT (CURRENT_DATE),
  effective_to   DATE           COMMENT 'NULL = indefinite',
  created_by    INT UNSIGNED    COMMENT 'Admin who set the limit',
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lim_zone    FOREIGN KEY (zone_id)   REFERENCES fishing_zones(zone_id)   ON DELETE SET NULL,
  CONSTRAINT fk_lim_species FOREIGN KEY (species_id) REFERENCES fish_species(species_id) ON DELETE SET NULL,
  CONSTRAINT fk_lim_admin   FOREIGN KEY (created_by) REFERENCES users(user_id)           ON DELETE SET NULL
);

-- ============================================================
-- 9. RISK_ALERTS
--    Generated when stock_percentage drops below threshold
--    or a protected species is caught
-- ============================================================
CREATE TABLE risk_alerts (
  alert_id      INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_id       INT UNSIGNED    NOT NULL,
  species_id    INT UNSIGNED,
  alert_type    ENUM('low_stock','protected_catch','limit_exceeded','zone_closed') NOT NULL,
  severity      ENUM('info','warning','critical') NOT NULL DEFAULT 'warning',
  message       TEXT            NOT NULL,
  is_resolved   BOOLEAN         NOT NULL DEFAULT FALSE,
  resolved_by   INT UNSIGNED    COMMENT 'Admin user who resolved',
  resolved_at   TIMESTAMP,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_alert_zone    FOREIGN KEY (zone_id)    REFERENCES fishing_zones(zone_id)   ON DELETE CASCADE,
  CONSTRAINT fk_alert_species FOREIGN KEY (species_id) REFERENCES fish_species(species_id) ON DELETE SET NULL,
  CONSTRAINT fk_alert_admin   FOREIGN KEY (resolved_by) REFERENCES users(user_id)          ON DELETE SET NULL
);

-- ============================================================
-- 10. ZONE_SUGGESTIONS
--     Output of the Graph DSA — safest nearby zones recommended
--     to a fisherman after their current zone is flagged
-- ============================================================
CREATE TABLE zone_suggestions (
  suggestion_id     INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id        INT UNSIGNED    NOT NULL,
  suggested_zone_id INT UNSIGNED    NOT NULL,
  reason            TEXT            COMMENT 'Why this zone was suggested',
  distance_km       DECIMAL(8,2)    COMMENT 'Distance from current zone',
  safety_score      DECIMAL(5,2)    COMMENT '0–100 composite score',
  is_accepted       BOOLEAN         COMMENT 'Did fisherman navigate to this zone?',
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_sug_session FOREIGN KEY (session_id)        REFERENCES fishing_sessions(session_id) ON DELETE CASCADE,
  CONSTRAINT fk_sug_zone    FOREIGN KEY (suggested_zone_id) REFERENCES fishing_zones(zone_id)       ON DELETE CASCADE
);

-- ============================================================
-- 11. RESEARCH_REPORTS
--     Researcher-generated analysis snapshots
-- ============================================================
CREATE TABLE research_reports (
  report_id     INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  researcher_id INT UNSIGNED    NOT NULL,
  title         VARCHAR(200)    NOT NULL,
  summary       TEXT,
  report_data   JSON            COMMENT 'Chart.js-ready payload or raw stats',
  zone_id       INT UNSIGNED    COMMENT 'NULL = system-wide report',
  species_id    INT UNSIGNED    COMMENT 'NULL = all species',
  period_start  DATE,
  period_end    DATE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_rep_user    FOREIGN KEY (researcher_id) REFERENCES users(user_id)           ON DELETE CASCADE,
  CONSTRAINT fk_rep_zone    FOREIGN KEY (zone_id)       REFERENCES fishing_zones(zone_id)   ON DELETE SET NULL,
  CONSTRAINT fk_rep_species FOREIGN KEY (species_id)    REFERENCES fish_species(species_id) ON DELETE SET NULL
);

-- ============================================================
-- 12. AUDIT_LOG
--     Immutable trail of important actions (admin changes,
--     limit overrides, alert resolutions)
-- ============================================================
CREATE TABLE audit_log (
  log_id        INT             UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED,
  action        VARCHAR(100)    NOT NULL  COMMENT 'e.g. UPDATE_LIMIT, RESOLVE_ALERT',
  target_table  VARCHAR(60),
  target_id     INT UNSIGNED,
  old_value     JSON,
  new_value     JSON,
  ip_address    VARCHAR(45),
  logged_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================
-- INDEXES  (beyond primary / unique keys)
-- ============================================================

-- Fast lookup of sessions by user
CREATE INDEX idx_sessions_user  ON fishing_sessions(user_id);
-- Fast lookup of catches by session
CREATE INDEX idx_catches_session ON catch_records(session_id);
-- Population queries filtered by zone or species
CREATE INDEX idx_pop_zone       ON fish_population(zone_id);
CREATE INDEX idx_pop_species    ON fish_population(species_id);
-- Alerts by zone and resolved status
CREATE INDEX idx_alerts_zone    ON risk_alerts(zone_id, is_resolved);
-- Audit log by user and time
CREATE INDEX idx_audit_user_ts  ON audit_log(user_id, logged_at);
-- Suggestions by session
CREATE INDEX idx_sug_session    ON zone_suggestions(session_id);