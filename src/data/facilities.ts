export interface FacilityPoint {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'PHARMACY' | 'HOTEL' | 'RESTAURANT' | 'FUEL' | 'POLICE';
  district: string;
  lat: number;
  lng: number;
  phone?: string;
  address: string;
  is24x7: boolean;
}

export const FACILITIES: FacilityPoint[] = [
  // Hospitals
  {
    id: 'fac-hosp-01',
    name: 'Thanjavur Medical College Hospital & Trauma Care',
    type: 'HOSPITAL',
    district: 'Thanjavur',
    lat: 10.7584,
    lng: 79.1064,
    phone: '+91 4362 240024',
    address: 'Medical College Rd, Thanjavur',
    is24x7: true,
  },
  {
    id: 'fac-hosp-02',
    name: 'Kumbakonam Government District Headquarters Hospital',
    type: 'HOSPITAL',
    district: 'Kumbakonam',
    lat: 10.9632,
    lng: 79.3854,
    phone: '+91 435 2430225',
    address: 'Court Road, Kumbakonam',
    is24x7: true,
  },
  {
    id: 'fac-hosp-03',
    name: 'Apollo Speciality Clinic & Emergency Care',
    type: 'HOSPITAL',
    district: 'Thanjavur',
    lat: 10.7785,
    lng: 79.1352,
    phone: '+91 4362 277777',
    address: 'Trichy Main Rd, Thanjavur',
    is24x7: true,
  },

  // Pharmacies
  {
    id: 'fac-pharm-01',
    name: 'Apollo Pharmacy 24x7',
    type: 'PHARMACY',
    district: 'Thanjavur',
    lat: 10.7842,
    lng: 79.1345,
    phone: '+91 4362 231122',
    address: 'Near Big Temple Arch, South Rampart',
    is24x7: true,
  },
  {
    id: 'fac-pharm-02',
    name: 'MedPlus Pharmacy Kumbakonam',
    type: 'PHARMACY',
    district: 'Kumbakonam',
    lat: 10.9601,
    lng: 79.3821,
    phone: '+91 435 2420101',
    address: 'TSR Big Street, Kumbakonam',
    is24x7: true,
  },

  // Hotels & Heritage Stays
  {
    id: 'fac-hotel-01',
    name: 'Svatma Heritage Luxury Chola Hotel',
    type: 'HOTEL',
    district: 'Thanjavur',
    lat: 10.7725,
    lng: 79.1412,
    phone: '+91 4362 273222',
    address: 'Blake High School Rd, Thanjavur',
    is24x7: true,
  },
  {
    id: 'fac-hotel-02',
    name: 'Mantra Koodam (CGH Earth Kumbakonam)',
    type: 'HOTEL',
    district: 'Kumbakonam',
    lat: 10.9782,
    lng: 79.4385,
    phone: '+91 435 2444455',
    address: 'Bagavathapuram, Veppathur, Kumbakonam',
    is24x7: true,
  },
  {
    id: 'fac-hotel-03',
    name: 'Hotel Gnanam (Comfort Standard)',
    type: 'HOTEL',
    district: 'Thanjavur',
    lat: 10.7885,
    lng: 79.1394,
    phone: '+91 4362 278501',
    address: 'Anna Salai, Thanjavur',
    is24x7: true,
  },

  // Fuel Stations
  {
    id: 'fac-fuel-01',
    name: 'Indian Oil 24x7 Retail Outlet',
    type: 'FUEL',
    district: 'Thanjavur',
    lat: 10.7812,
    lng: 79.1254,
    phone: '+91 4362 234567',
    address: 'Court Road, Thanjavur',
    is24x7: true,
  },
  {
    id: 'fac-fuel-02',
    name: 'Bharat Petroleum Kumbakonam Bypass',
    type: 'FUEL',
    district: 'Kumbakonam',
    lat: 10.9525,
    lng: 79.3688,
    phone: '+91 435 2415522',
    address: 'Thanjavur Main Road, Kumbakonam',
    is24x7: true,
  },

  // Police & Emergency
  {
    id: 'fac-police-01',
    name: 'Thanjavur West Police Station & Tourist Assistance Booth',
    type: 'POLICE',
    district: 'Thanjavur',
    lat: 10.7839,
    lng: 79.1305,
    phone: '100 / +91 4362 230100',
    address: 'Near Old Bus Stand, Thanjavur',
    is24x7: true,
  },
  {
    id: 'fac-police-02',
    name: 'Kumbakonam Town Police Station',
    type: 'POLICE',
    district: 'Kumbakonam',
    lat: 10.9615,
    lng: 79.3842,
    phone: '100 / +91 435 2400100',
    address: 'Katchery Road, Kumbakonam',
    is24x7: true,
  },
];
