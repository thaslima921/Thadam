-- =========================================================================
-- THADAM TN — SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY
-- Explore Beyond the Famous. Empower the Local.
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('tourist', 'partner', 'admin')) DEFAULT 'tourist',
  language TEXT DEFAULT 'English',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  travel_style TEXT CHECK (travel_style IN ('Relaxed', 'Balanced', 'Packed')) DEFAULT 'Balanced',
  crowd_preference TEXT CHECK (crowd_preference IN ('Low', 'Moderate', 'Any')) DEFAULT 'Low',
  destination_preference TEXT DEFAULT 'Mixed',
  famous_ratio INT DEFAULT 20,
  moderate_ratio INT DEFAULT 40,
  hidden_ratio INT DEFAULT 40,
  budget_preference INT DEFAULT 10000,
  transport_preference TEXT DEFAULT 'Car',
  accommodation_preference TEXT DEFAULT 'Standard',
  food_preferences TEXT[] DEFAULT '{}',
  accessibility_preferences JSONB DEFAULT '{"wheelchair": false, "seniorFriendly": false, "familyFriendly": true}',
  facility_requirements JSONB DEFAULT '{"hospitalNearby": true, "hotelNearby": true, "pharmacyNearby": true, "fuelNearby": true}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DESTINATIONS
CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL,
  description TEXT NOT NULL,
  history TEXT,
  cultural_significance TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  popularity_type TEXT CHECK (popularity_type IN ('famous', 'moderate', 'hidden')) NOT NULL,
  verification_status TEXT CHECK (verification_status IN ('verified', 'pending', 'unverified')) DEFAULT 'verified',
  trust_score INT CHECK (trust_score BETWEEN 0 AND 100) DEFAULT 95,
  discovery_score INT CHECK (discovery_score BETWEEN 0 AND 100) DEFAULT 80,
  capacity INT DEFAULT 1000,
  opening_hours TEXT NOT NULL,
  entry_fee INT DEFAULT 0,
  accessibility JSONB DEFAULT '{"wheelchair": true, "seniorFriendly": true, "familyFriendly": true}',
  image TEXT,
  source TEXT NOT NULL,
  source_updated_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DESTINATION STATUS (REALTIME SIGNALS)
CREATE TABLE IF NOT EXISTS destination_status (
  destination_id TEXT PRIMARY KEY REFERENCES destinations(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('OPEN', 'CLOSED', 'PAUSED', 'RESTRICTED')) DEFAULT 'OPEN',
  pressure_level TEXT CHECK (pressure_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')) DEFAULT 'LOW',
  reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- 5. DESTINATION FACILITIES
CREATE TABLE IF NOT EXISTS destination_facilities (
  destination_id TEXT PRIMARY KEY REFERENCES destinations(id) ON DELETE CASCADE,
  hospital_km DOUBLE PRECISION NOT NULL,
  pharmacy_km DOUBLE PRECISION NOT NULL,
  hotel_km DOUBLE PRECISION NOT NULL,
  restaurant_km DOUBLE PRECISION NOT NULL,
  fuel_km DOUBLE PRECISION NOT NULL,
  police_km DOUBLE PRECISION NOT NULL,
  transport_km DOUBLE PRECISION NOT NULL,
  coverage TEXT CHECK (coverage IN ('GREEN', 'YELLOW', 'RED')) DEFAULT 'GREEN'
);

-- 6. PROVIDERS (LOCAL PARTNERS)
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  verification_status TEXT CHECK (verification_status IN ('verified', 'pending', 'rejected')) DEFAULT 'verified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXPERIENCES
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  provider_id TEXT REFERENCES providers(id) ON DELETE CASCADE,
  destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Artisan', 'Food', 'Guide', 'Rural', 'Culture', 'Craft', 'Homestay')) NOT NULL,
  description TEXT NOT NULL,
  price INT NOT NULL,
  duration_minutes INT NOT NULL,
  capacity INT NOT NULL,
  available_slots INT NOT NULL,
  status TEXT CHECK (status IN ('ACTIVE', 'PAUSED', 'FULL')) DEFAULT 'ACTIVE',
  rating DOUBLE PRECISION DEFAULT 4.9,
  reviews_count INT DEFAULT 20,
  languages TEXT[] DEFAULT '{"Tamil", "English"}',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRIPS
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget INT NOT NULL,
  estimated_spend INT NOT NULL,
  days_count INT NOT NULL,
  status TEXT CHECK (status IN ('DRAFT', 'SAVED', 'ACTIVE', 'COMPLETED')) DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TRIP STOPS
CREATE TABLE IF NOT EXISTS trip_stops (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  destination_id TEXT REFERENCES destinations(id) ON DELETE CASCADE,
  experience_id TEXT REFERENCES experiences(id) ON DELETE SET NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  order_index INT NOT NULL,
  status TEXT CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'DISRUPTED', 'REPLACED')) DEFAULT 'PLANNED',
  estimated_cost INT DEFAULT 0,
  score_match INT DEFAULT 90,
  ai_reasons TEXT[] DEFAULT '{}',
  crowd_status TEXT DEFAULT 'LOW',
  data_freshness TEXT DEFAULT 'LIVE'
);

-- 10. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  experience_id TEXT REFERENCES experiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  people_count INT NOT NULL,
  total_price INT NOT NULL,
  status TEXT CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLED')) DEFAULT 'CONFIRMED',
  booking_reference TEXT UNIQUE NOT NULL,
  qr_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ACTIVE TRIP SESSIONS
CREATE TABLE IF NOT EXISTS active_trip_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id TEXT REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_day INT DEFAULT 1,
  current_stop_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 12. ALERTS & LIVE SIGNALS
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_trip_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for verified destinations, facilities, and experiences
CREATE POLICY "Public read verified destinations" ON destinations FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "Public read destination status" ON destination_status FOR SELECT USING (true);
CREATE POLICY "Public read destination facilities" ON destination_facilities FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON experiences FOR SELECT USING (status != 'PAUSED');
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);

-- Tourist own-record access
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users access own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own trips" ON trips FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookings" ON bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own active session" ON active_trip_sessions FOR ALL USING (auth.uid() = user_id);

-- Partner management
CREATE POLICY "Partners manage own experiences" ON experiences FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'partner')
);

-- Admin unrestricted access
CREATE POLICY "Admins full management" ON destinations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
