-- ==============================================================================
-- SMART FISHING REGULATION SYSTEM - GOA SEED DATA
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE catch_records;
TRUNCATE TABLE catch_limits;
TRUNCATE TABLE fish_population;
TRUNCATE TABLE zone_adjacency;
TRUNCATE TABLE risk_alerts;
TRUNCATE TABLE fishing_sessions;
TRUNCATE TABLE fishing_zones;
TRUNCATE TABLE ports;
TRUNCATE TABLE fish_species;
-- Leaving users untruncated as requested, just inserting new ones
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- 1. USERS (Mock Fisherman & Researcher)
-- Password for all: password123 
-- --------------------------------------------------------
INSERT IGNORE INTO users (user_id, username, full_name, email, password_hash, role) VALUES
(2, 'rudresh_g', 'Rudresh Gaonkar', 'rudresh@fisherman.in', '$2a$10$wT333u8A.1uQ/gBv6wT8/e3JkP1.D/R.GvX/b.O/P/k/P/k/P/k/P', 'fisherman'),
(3, 'anjali_d', 'Dr. Anjali Desai', 'anjali@nio.goa.in', '$2a$10$wT333u8A.1uQ/gBv6wT8/e3JkP1.D/R.GvX/b.O/P/k/P/k/P/k/P', 'researcher'),
(4, 'mangesh_k', 'Mangesh Kadam', 'mangesh@fisherman.in', '$2a$10$wT333u8A.1uQ/gBv6wT8/e3JkP1.D/R.GvX/b.O/P/k/P/k/P/k/P', 'fisherman');

-- --------------------------------------------------------
-- 1.5 PORTS (Goa Ports)
-- --------------------------------------------------------
INSERT INTO ports (port_id, name, latitude, longitude) VALUES
(1, 'Panaji Port', 15.5011, 73.8242),
(2, 'Mormugao Port', 15.3997, 73.7932),
(3, 'Betul Port', 15.1481, 73.9575),
(4, 'Old Goa Jetty', 15.5049, 73.9116);

-- --------------------------------------------------------
-- 2. FISHING ZONES (Goa Coastline)
-- --------------------------------------------------------
INSERT INTO fishing_zones (zone_id, zone_name, zone_code, latitude, longitude, zone_type, water_type, port_id) VALUES
(1, 'Mandovi Estuary', 'Z-MAN', 15.5036, 73.8058, 'restricted', 'estuary', 1),
(2, 'Calangute Inshore', 'Z-CAL', 15.5494, 73.7535, 'open', 'ocean', 1),
(3, 'Vasco Deep Sea', 'Z-VAS', 15.3960, 73.7500, 'open', 'ocean', 2),
(4, 'Zuari Bay', 'Z-ZUA', 15.4211, 73.8166, 'open', 'backwater', 2),
(5, 'Palolem Protected Reef', 'Z-PAL', 15.0100, 74.0232, 'closed', 'ocean', 3),
(6, 'Chapora Coast', 'Z-CHA', 15.6061, 73.7360, 'open', 'ocean', 1);

-- --------------------------------------------------------
-- 3. ZONE ADJACENCY (For BFS/Dijkstra Graph - Distances in KM)
-- --------------------------------------------------------
INSERT INTO zone_adjacency (zone_from, zone_to, distance_km) VALUES
(1, 2, 8.5),  (2, 1, 8.5),   -- Mandovi <-> Calangute
(1, 4, 12.0), (4, 1, 12.0),  -- Mandovi <-> Zuari
(4, 3, 10.2), (3, 4, 10.2),  -- Zuari <-> Vasco
(3, 5, 45.0), (5, 3, 45.0),  -- Vasco <-> Palolem
(2, 6, 11.5), (6, 2, 11.5);  -- Calangute <-> Chapora

-- --------------------------------------------------------
-- 4. FISH SPECIES (Local Goan Varieties)
-- --------------------------------------------------------
INSERT INTO fish_species (species_id, common_name, scientific_name, is_protected, risk_level) VALUES
(1, 'Kingfish (Surmai)', 'Scomberomorus commerson', FALSE, 0),
(2, 'Indian Mackerel (Bangda)', 'Rastrelliger kanagurta', FALSE, 0),
(3, 'Silver Pomfret (Paplet)', 'Pampus argenteus', FALSE, 3), -- Vulnerable
(4, 'Tiger Prawns (Sungat)', 'Penaeus monodon', FALSE, 2), -- Near Threatened
(5, 'Red Snapper (Tamaso)', 'Lutjanus campechanus', FALSE, 0);

-- --------------------------------------------------------
-- 5. FISH POPULATION (Calculates stock_percentage automatically)
-- --------------------------------------------------------
INSERT INTO fish_population (zone_id, species_id, current_stock, estimated_total, risk_status) VALUES
-- Mandovi Estuary (Restricted - low prawn stock)
(1, 4, 3550, 10000, 'warning'),  -- Will generate 35.50%
(1, 2, 8500, 10000, 'safe'),     -- Will generate 85.00%

-- Calangute Inshore (Healthy)
(2, 1, 7800, 10000, 'safe'),
(2, 2, 9200, 10000, 'safe'),
(2, 3, 6500, 10000, 'safe'),

-- Vasco Deep Sea (Pomfret is overfished here)
(3, 1, 8800, 10000, 'safe'),
(3, 3, 2250, 10000, 'critical'), -- Will generate 22.50%
(3, 5, 7500, 10000, 'safe'),

-- Palolem Protected Reef (Closed, high stock)
(5, 4, 9500, 10000, 'safe'),
(5, 5, 9000, 10000, 'safe');

-- --------------------------------------------------------
-- 6. CATCH LIMITS (Daily units/kg limits per species per zone)
-- --------------------------------------------------------
INSERT INTO catch_limits (zone_id, species_id, max_per_day) VALUES
(2, 1, 500), -- Calangute: 500 limit of Surmai
(2, 2, 800), -- Calangute: 800 limit of Bangda
(3, 3, 50),  -- Vasco: Pomfret highly restricted (50 limit)
(1, 4, 0);   -- Mandovi: Prawn catching banned (0 limit)

-- --------------------------------------------------------
-- 7. RISK ALERTS (System generated warnings)
-- --------------------------------------------------------
INSERT INTO risk_alerts (zone_id, species_id, alert_type, severity, message, is_resolved) VALUES
(3, 3, 'low_stock', 'critical', 'Silver Pomfret population has dropped below 25% in Vasco Deep Sea. Immediate restriction advised.', FALSE),
(1, 4, 'low_stock', 'warning', 'Tiger Prawn levels declining in Mandovi Estuary due to high seasonal effort.', FALSE);