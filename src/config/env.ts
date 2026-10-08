export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo-thadam.supabase.co',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-thadam-tn',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  aiApiUrl: process.env.AI_API_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  // Service modes (Specification Section 57: Real vs Demo mode fallback)
  mapMode: (process.env.MAP_MODE || 'demo') as 'real' | 'demo',
  aiMode: (process.env.AI_MODE || 'demo') as 'real' | 'demo',
  facilityMode: (process.env.FACILITY_MODE || 'demo') as 'real' | 'demo',
  isDemo: true, // Prototype honest indicator
};
