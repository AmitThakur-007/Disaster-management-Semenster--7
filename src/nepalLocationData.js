// Authoritative Administrative Hierarchy of Nepal
// 7 Provinces, 77 Districts, Municipalities, Rural Municipalities, and Wards

export const PROVINCES = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province'
];

export const DISTRICTS_BY_PROVINCE = {
  'Koshi Province': [
    'Bhojpur',
    'Dhankuta',
    'Ilam',
    'Jhapa',
    'Khotang',
    'Morang',
    'Okhaldhunga',
    'Panchthar',
    'Sankhuwasabha',
    'Solukhumbu',
    'Sunsari',
    'Taplejung',
    'Terhathum',
    'Udayapur'
  ],
  'Madhesh Province': [
    'Bara',
    'Dhanusha',
    'Mahottari',
    'Parsa',
    'Rautahat',
    'Saptari',
    'Sarlahi',
    'Siraha'
  ],
  'Bagmati Province': [
    'Bhaktapur',
    'Chitwan',
    'Dhading',
    'Dolakha',
    'Kathmandu',
    'Kavrepalanchok',
    'Lalitpur',
    'Makwanpur',
    'Nuwakot',
    'Ramechhap',
    'Rasuwa',
    'Sindhuli',
    'Sindhupalchok'
  ],
  'Gandaki Province': [
    'Baglung',
    'Gorkha',
    'Kaski',
    'Lamjung',
    'Manang',
    'Mustang',
    'Myagdi',
    'Nawalpur',
    'Parbat',
    'Syangja',
    'Tanahun'
  ],
  'Lumbini Province': [
    'Arghakhanchi',
    'Banke',
    'Bardiya',
    'Dang',
    'Gulmi',
    'Kapilvastu',
    'Nawalparasi West',
    'Palpa',
    'Pyuthan',
    'Rolpa',
    'Rukum East',
    'Rupandehi'
  ],
  'Karnali Province': [
    'Dailekh',
    'Dolpa',
    'Humla',
    'Jajarkot',
    'Jumla',
    'Kalikot',
    'Mugu',
    'Rukum West',
    'Salyan',
    'Surkhet'
  ],
  'Sudurpashchim Province': [
    'Achham',
    'Baitadi',
    'Bajhang',
    'Bajura',
    'Dadeldhura',
    'Darchula',
    'Doti',
    'Kailali',
    'Kanchanpur'
  ]
};

// District coordinates for map centering and defaults
export const DISTRICT_COORDINATES = {
  // Koshi (14)
  'Bhojpur': { lat: 27.1706, lng: 87.0456 },
  'Dhankuta': { lat: 26.9823, lng: 87.3369 },
  'Ilam': { lat: 26.9103, lng: 87.9262 },
  'Jhapa': { lat: 26.6346, lng: 87.9942 },
  'Khotang': { lat: 27.2045, lng: 86.7865 },
  'Morang': { lat: 26.6534, lng: 87.4475 },
  'Okhaldhunga': { lat: 27.3103, lng: 86.5029 },
  'Panchthar': { lat: 27.2000, lng: 87.8333 },
  'Sankhuwasabha': { lat: 27.6000, lng: 87.2000 },
  'Solukhumbu': { lat: 27.7500, lng: 86.7000 },
  'Sunsari': { lat: 26.6500, lng: 87.1667 },
  'Taplejung': { lat: 27.3500, lng: 87.6667 },
  'Terhathum': { lat: 27.1333, lng: 87.5333 },
  'Udayapur': { lat: 26.9000, lng: 86.5167 },

  // Madhesh (8)
  'Bara': { lat: 27.0333, lng: 85.0000 },
  'Dhanusha': { lat: 26.7500, lng: 85.9500 },
  'Mahottari': { lat: 26.8833, lng: 85.8333 },
  'Parsa': { lat: 27.1333, lng: 84.8333 },
  'Rautahat': { lat: 26.9833, lng: 85.3333 },
  'Saptari': { lat: 26.6500, lng: 86.7500 },
  'Sarlahi': { lat: 26.9833, lng: 85.5833 },
  'Siraha': { lat: 26.7000, lng: 86.2000 },

  // Bagmati (13)
  'Bhaktapur': { lat: 27.6710, lng: 85.4298 },
  'Chitwan': { lat: 27.5291, lng: 84.3542 },
  'Dhading': { lat: 27.8667, lng: 84.9000 },
  'Dolakha': { lat: 27.7667, lng: 86.0667 },
  'Kathmandu': { lat: 27.7172, lng: 85.3240 },
  'Kavrepalanchok': { lat: 27.5333, lng: 85.5500 },
  'Lalitpur': { lat: 27.6644, lng: 85.3188 },
  'Makwanpur': { lat: 27.4167, lng: 85.0333 },
  'Nuwakot': { lat: 27.9167, lng: 85.1667 },
  'Ramechhap': { lat: 27.3333, lng: 86.0833 },
  'Rasuwa': { lat: 28.1167, lng: 85.2833 },
  'Sindhuli': { lat: 27.2500, lng: 85.9667 },
  'Sindhupalchok': { lat: 27.9500, lng: 85.6833 },

  // Gandaki (11)
  'Baglung': { lat: 28.2667, lng: 83.6000 },
  'Gorkha': { lat: 28.0000, lng: 84.6333 },
  'Kaski': { lat: 28.2096, lng: 83.9856 },
  'Lamjung': { lat: 28.2333, lng: 84.4000 },
  'Manang': { lat: 28.6667, lng: 84.0167 },
  'Mustang': { lat: 28.7833, lng: 83.7333 },
  'Myagdi': { lat: 28.3500, lng: 83.5667 },
  'Nawalpur': { lat: 27.6500, lng: 84.1167 },
  'Parbat': { lat: 28.2333, lng: 83.7000 },
  'Syangja': { lat: 28.1000, lng: 83.8667 },
  'Tanahun': { lat: 27.9667, lng: 84.2500 },

  // Lumbini (12)
  'Arghakhanchi': { lat: 27.9000, lng: 83.0833 },
  'Banke': { lat: 28.1500, lng: 81.7000 },
  'Bardiya': { lat: 28.3333, lng: 81.3333 },
  'Dang': { lat: 28.0500, lng: 82.3000 },
  'Gulmi': { lat: 28.0833, lng: 83.2500 },
  'Kapilvastu': { lat: 27.5500, lng: 83.0500 },
  'Nawalparasi West': { lat: 27.5333, lng: 83.6667 },
  'Palpa': { lat: 27.8667, lng: 83.5500 },
  'Pyuthan': { lat: 28.1000, lng: 82.8333 },
  'Rolpa': { lat: 28.3167, lng: 82.6333 },
  'Rukum East': { lat: 28.6167, lng: 82.6667 },
  'Rupandehi': { lat: 27.5000, lng: 83.4500 },

  // Karnali (10)
  'Dailekh': { lat: 28.8333, lng: 81.7167 },
  'Dolpa': { lat: 29.0000, lng: 82.9167 },
  'Humla': { lat: 29.9667, lng: 81.8333 },
  'Jajarkot': { lat: 28.7000, lng: 82.2000 },
  'Jumla': { lat: 29.2744, lng: 82.1838 },
  'Kalikot': { lat: 29.1500, lng: 81.7667 },
  'Mugu': { lat: 29.5833, lng: 82.1667 },
  'Rukum West': { lat: 28.6333, lng: 82.4833 },
  'Salyan': { lat: 28.3667, lng: 82.1667 },
  'Surkhet': { lat: 28.6000, lng: 81.6333 },

  // Sudurpashchim (9)
  'Achham': { lat: 29.1167, lng: 81.3000 },
  'Baitadi': { lat: 29.5333, lng: 80.5000 },
  'Bajhang': { lat: 29.5667, lng: 81.2000 },
  'Bajura': { lat: 29.5167, lng: 81.5667 },
  'Dadeldhura': { lat: 29.3000, lng: 80.5833 },
  'Darchula': { lat: 29.8500, lng: 80.5333 },
  'Doti': { lat: 29.2667, lng: 80.9833 },
  'Kailali': { lat: 28.7167, lng: 80.9167 },
  'Kanchanpur': { lat: 28.8333, lng: 80.3333 }
};

// All 77 Districts flat array with their province mapping
export const ALL_DISTRICTS = Object.entries(DISTRICTS_BY_PROVINCE).flatMap(([province, districts]) =>
  districts.map(name => ({
    name,
    province,
    coordinates: DISTRICT_COORDINATES[name] || { lat: 27.7172, lng: 85.3240 }
  }))
);

// Comprehensive Local Governments (Municipalities & Rural Municipalities) with ward counts
export const MUNICIPALITIES_BY_DISTRICT = {
  // ── Koshi Province (14) ──
  'Bhojpur': [
    { name: 'Bhojpur Municipality', wards: 12 },
    { name: 'Shadananda Municipality', wards: 14 },
    { name: 'Hatuwagadhi Rural Municipality', wards: 9 },
    { name: 'Ramprasad Rai Rural Municipality', wards: 8 },
    { name: 'Aamchok Rural Municipality', wards: 10 },
    { name: 'Tyamke Maiyum Rural Municipality', wards: 9 },
    { name: 'Arun Rural Municipality', wards: 7 },
    { name: 'Pauwadungma Rural Municipality', wards: 6 },
    { name: 'Salpasilichho Rural Municipality', wards: 6 }
  ],
  'Dhankuta': [
    { name: 'Dhankuta Municipality', wards: 10 },
    { name: 'Pakhribas Municipality', wards: 10 },
    { name: 'Mahalaxmi Municipality', wards: 9 },
    { name: 'Sangurigadhi Rural Municipality', wards: 10 },
    { name: 'Khalsa Chhintang Sahidbhumi Rural Municipality', wards: 7 },
    { name: 'Chhathar Jorpati Rural Municipality', wards: 6 },
    { name: 'Chaubise Rural Municipality', wards: 8 }
  ],
  'Ilam': [
    { name: 'Ilam Municipality', wards: 12 },
    { name: 'Deumai Municipality', wards: 9 },
    { name: 'Mai Municipality', wards: 10 },
    { name: 'Suryodaya Municipality', wards: 14 },
    { name: 'Fakfokthum Rural Municipality', wards: 7 },
    { name: 'Chulachuli Rural Municipality', wards: 6 },
    { name: 'Maijogmai Rural Municipality', wards: 6 },
    { name: 'Mangsebung Rural Municipality', wards: 6 },
    { name: 'Rong Rural Municipality', wards: 6 },
    { name: 'Sandakpur Rural Municipality', wards: 5 }
  ],
  'Jhapa': [
    { name: 'Bhadrapur Municipality', wards: 10 },
    { name: 'Birtamod Municipality', wards: 10 },
    { name: 'Damak Municipality', wards: 10 },
    { name: 'Mechinagar Municipality', wards: 15 },
    { name: 'Arjundhara Municipality', wards: 11 },
    { name: 'Kankai Municipality', wards: 9 },
    { name: 'Shivasatakshi Municipality', wards: 11 },
    { name: 'Gauradaha Municipality', wards: 9 },
    { name: 'Barhadashi Rural Municipality', wards: 7 },
    { name: 'Jhapa Rural Municipality', wards: 7 },
    { name: 'Haldibari Rural Municipality', wards: 5 },
    { name: 'Kachankawal Rural Municipality', wards: 7 },
    { name: 'Kamal Rural Municipality', wards: 7 }
  ],
  'Khotang': [
    { name: 'Diktel Rupakot Majhuwagadhi Municipality', wards: 15 },
    { name: 'Halesi Tuwachung Municipality', wards: 11 },
    { name: 'Khotehang Rural Municipality', wards: 9 },
    { name: 'Diprung Chuichumma Rural Municipality', wards: 7 },
    { name: 'Aiselukharka Rural Municipality', wards: 7 },
    { name: 'Jantedhunga Rural Municipality', wards: 6 },
    { name: 'Kepilasgadhi Rural Municipality', wards: 7 },
    { name: 'Barahapokhari Rural Municipality', wards: 6 },
    { name: 'Rawabesi Rural Municipality', wards: 6 },
    { name: 'Sakela Rural Municipality', wards: 5 }
  ],
  'Morang': [
    { name: 'Biratnagar Metropolitan City', wards: 19 },
    { name: 'Belbari Municipality', wards: 11 },
    { name: 'Letang Municipality', wards: 9 },
    { name: 'Pathari Shanischare Municipality', wards: 10 },
    { name: 'Rangeli Municipality', wards: 9 },
    { name: 'Ratuwamai Municipality', wards: 10 },
    { name: 'Sunworshi Municipality', wards: 9 },
    { name: 'Urlabari Municipality', wards: 9 },
    { name: 'Sundar Haraicha Municipality', wards: 12 },
    { name: 'Budhiganga Rural Municipality', wards: 7 },
    { name: 'Dhanpalthan Rural Municipality', wards: 7 },
    { name: 'Gramthan Rural Municipality', wards: 7 },
    { name: 'Jahada Rural Municipality', wards: 7 },
    { name: 'Kanepokhari Rural Municipality', wards: 7 },
    { name: 'Katahari Rural Municipality', wards: 7 },
    { name: 'Kerabari Rural Municipality', wards: 10 },
    { name: 'Miklajung Rural Municipality', wards: 9 }
  ],
  'Okhaldhunga': [
    { name: 'Siddhicharan Municipality', wards: 12 },
    { name: 'Khijidemba Rural Municipality', wards: 9 },
    { name: 'Champadevi Rural Municipality', wards: 10 },
    { name: 'Chisankhugadhi Rural Municipality', wards: 8 },
    { name: 'Manebhanjyang Rural Municipality', wards: 9 },
    { name: 'Molung Rural Municipality', wards: 8 },
    { name: 'Likhu Rural Municipality', wards: 9 },
    { name: 'Sunkoshi Rural Municipality', wards: 10 }
  ],
  'Panchthar': [
    { name: 'Phidim Municipality', wards: 14 },
    { name: 'Phalelung Rural Municipality', wards: 8 },
    { name: 'Phalgunanda Rural Municipality', wards: 7 },
    { name: 'Hilihang Rural Municipality', wards: 7 },
    { name: 'Kummayak Rural Municipality', wards: 5 },
    { name: 'Miklajung Rural Municipality', wards: 8 },
    { name: 'Tumbewa Rural Municipality', wards: 5 },
    { name: 'Yangwarak Rural Municipality', wards: 6 }
  ],
  'Sankhuwasabha': [
    { name: 'Khandbari Municipality', wards: 11 },
    { name: 'Chainpur Municipality', wards: 11 },
    { name: 'Dharmadevi Municipality', wards: 9 },
    { name: 'Madi Municipality', wards: 9 },
    { name: 'Panchakhapan Municipality', wards: 9 },
    { name: 'Bhotkhola Rural Municipality', wards: 5 },
    { name: 'Chichila Rural Municipality', wards: 5 },
    { name: 'Makalu Rural Municipality', wards: 6 },
    { name: 'Sabapokhari Rural Municipality', wards: 6 },
    { name: 'Silichong Rural Municipality', wards: 5 }
  ],
  'Solukhumbu': [
    { name: 'Solududhkunda Municipality', wards: 11 },
    { name: 'Khumbu Pasanglhamu Rural Municipality', wards: 5 },
    { name: 'Dudhkaushika Rural Municipality', wards: 9 },
    { name: 'Nechasalyan Rural Municipality', wards: 5 },
    { name: 'Dudhkoshi Rural Municipality', wards: 7 },
    { name: 'Maha Kulung Rural Municipality', wards: 5 },
    { name: 'Sotang Rural Municipality', wards: 5 },
    { name: 'Likhu Pikey Rural Municipality', wards: 5 }
  ],
  'Sunsari': [
    { name: 'Itahari Sub-Metropolitan City', wards: 20 },
    { name: 'Dharan Sub-Metropolitan City', wards: 20 },
    { name: 'Inaruwa Municipality', wards: 10 },
    { name: 'Duhabi Municipality', wards: 12 },
    { name: 'Ramdhuni Municipality', wards: 9 },
    { name: 'Barahachhetra Municipality', wards: 11 },
    { name: 'Dewanganj Rural Municipality', wards: 7 },
    { name: 'Koshi Rural Municipality', wards: 8 },
    { name: 'Gadhi Rural Municipality', wards: 6 },
    { name: 'Barju Rural Municipality', wards: 6 },
    { name: 'Bhokraha Narsingh Rural Municipality', wards: 8 },
    { name: 'Harinagar Rural Municipality', wards: 7 }
  ],
  'Taplejung': [
    { name: 'Phungling Municipality', wards: 11 },
    { name: 'Aathrai Tribeni Rural Municipality', wards: 5 },
    { name: 'Sidingba Rural Municipality', wards: 7 },
    { name: 'Faktanglung Rural Municipality', wards: 7 },
    { name: 'Mikwakhola Rural Municipality', wards: 5 },
    { name: 'Meringden Rural Municipality', wards: 6 },
    { name: 'Maiwakhola Rural Municipality', wards: 6 },
    { name: 'Pathibhara Yangwarak Rural Municipality', wards: 6 },
    { name: 'Sirijangha Rural Municipality', wards: 8 }
  ],
  'Terhathum': [
    { name: 'Myanglung Municipality', wards: 10 },
    { name: 'Laligurans Municipality', wards: 9 },
    { name: 'Aathrai Rural Municipality', wards: 7 },
    { name: 'Chhathar Rural Municipality', wards: 6 },
    { name: 'Fedap Rural Municipality', wards: 5 },
    { name: 'Menchayayem Rural Municipality', wards: 6 }
  ],
  'Udayapur': [
    { name: 'Triyuga Municipality', wards: 16 },
    { name: 'Katari Municipality', wards: 14 },
    { name: 'Chaudandigadhi Municipality', wards: 10 },
    { name: 'Belaka Municipality', wards: 9 },
    { name: 'Udayapurgadhi Rural Municipality', wards: 8 },
    { name: 'Tapli Rural Municipality', wards: 5 },
    { name: 'Rautamai Rural Municipality', wards: 8 },
    { name: 'Limchungbung Rural Municipality', wards: 5 }
  ],

  // ── Madhesh Province (8) ──
  'Bara': [
    { name: 'Kalaiya Sub-Metropolitan City', wards: 27 },
    { name: 'Jitpursimara Sub-Metropolitan City', wards: 24 },
    { name: 'Kolhabi Municipality', wards: 11 },
    { name: 'Nijgadh Municipality', wards: 13 },
    { name: 'Mahagadhimai Municipality', wards: 11 },
    { name: 'Simroungadh Municipality', wards: 11 },
    { name: 'Pacharauta Municipality', wards: 9 },
    { name: 'Adarshkotwal Rural Municipality', wards: 8 },
    { name: 'Karaiyamai Rural Municipality', wards: 8 },
    { name: 'Devtal Rural Municipality', wards: 7 },
    { name: 'Parwanipur Rural Municipality', wards: 5 },
    { name: 'Prasauni Rural Municipality', wards: 7 },
    { name: 'Pheta Rural Municipality', wards: 7 },
    { name: 'Baragadhi Rural Municipality', wards: 6 },
    { name: 'Suwarna Rural Municipality', wards: 8 },
    { name: 'Bishrampur Rural Municipality', wards: 5 }
  ],
  'Dhanusha': [
    { name: 'Janakpurdham Sub-Metropolitan City', wards: 25 },
    { name: 'Chhireshwarnath Municipality', wards: 10 },
    { name: 'Ganeshman Charnath Municipality', wards: 11 },
    { name: 'Dhanusadham Municipality', wards: 9 },
    { name: 'Nagarain Municipality', wards: 9 },
    { name: 'Bideha Municipality', wards: 9 },
    { name: 'Mithila Municipality', wards: 11 },
    { name: 'Shahidnagar Municipality', wards: 9 },
    { name: 'Sabaila Municipality', wards: 13 },
    { name: 'Kamala Municipality', wards: 9 },
    { name: 'Mithila Bihari Municipality', wards: 10 },
    { name: 'Hansapur Municipality', wards: 9 },
    { name: 'Janaknandani Rural Municipality', wards: 6 },
    { name: 'Bateshwar Rural Municipality', wards: 5 },
    { name: 'Mukhiyapatti Musharniya Rural Municipality', wards: 6 },
    { name: 'Lakshminiya Rural Municipality', wards: 7 },
    { name: 'Aurahi Rural Municipality', wards: 6 },
    { name: 'Dhanauji Rural Municipality', wards: 5 }
  ],
  'Mahottari': [
    { name: 'Jaleshwar Municipality', wards: 12 },
    { name: 'Bardibas Municipality', wards: 14 },
    { name: 'Gaushala Municipality', wards: 12 },
    { name: 'Loharpatti Municipality', wards: 9 },
    { name: 'Ramgopalpur Municipality', wards: 9 },
    { name: 'Manara Shiswa Municipality', wards: 10 },
    { name: 'Matihani Municipality', wards: 9 },
    { name: 'Bhangaha Municipality', wards: 9 },
    { name: 'Balwa Municipality', wards: 11 },
    { name: 'Aurahi Municipality', wards: 9 },
    { name: 'Ekdara Rural Municipality', wards: 6 },
    { name: 'Sonama Rural Municipality', wards: 8 },
    { name: 'Samsi Rural Municipality', wards: 7 },
    { name: 'Pipra Rural Municipality', wards: 7 },
    { name: 'Mahottari Rural Municipality', wards: 6 }
  ],
  'Parsa': [
    { name: 'Birgunj Metropolitan City', wards: 32 },
    { name: 'Pokhariya Municipality', wards: 10 },
    { name: 'Bahudaramai Municipality', wards: 9 },
    { name: 'Parsagadhi Municipality', wards: 9 },
    { name: 'Thori Rural Municipality', wards: 5 },
    { name: 'Jagarnathpur Rural Municipality', wards: 6 },
    { name: 'Dhobini Rural Municipality', wards: 5 },
    { name: 'Chhipaharmai Rural Municipality', wards: 5 },
    { name: 'Pakahamainpur Rural Municipality', wards: 5 },
    { name: 'Bindabasini Rural Municipality', wards: 5 },
    { name: 'Sakhuwa Prasauni Rural Municipality', wards: 6 },
    { name: 'Paterwasugauli Rural Municipality', wards: 5 },
    { name: 'Kalikamai Rural Municipality', wards: 5 },
    { name: 'Jirabhawani Rural Municipality', wards: 5 }
  ],
  'Rautahat': [
    { name: 'Gaur Municipality', wards: 9 },
    { name: 'Garuda Municipality', wards: 9 },
    { name: 'Chandrapur Municipality', wards: 10 },
    { name: 'Dewahi Gonahi Municipality', wards: 9 },
    { name: 'Brindaban Municipality', wards: 9 },
    { name: 'Fatuwa Bijayapur Municipality', wards: 11 },
    { name: 'Gadhimai Municipality', wards: 9 },
    { name: 'Madhav Narayan Municipality', wards: 9 },
    { name: 'Maulapur Municipality', wards: 9 },
    { name: 'Baudhimai Municipality', wards: 9 },
    { name: 'Paroha Municipality', wards: 9 },
    { name: 'Ishnath Municipality', wards: 9 },
    { name: 'Gujara Municipality', wards: 9 },
    { name: 'Katahariya Municipality', wards: 9 },
    { name: 'Rajdevi Municipality', wards: 9 },
    { name: 'Rajpur Municipality', wards: 9 },
    { name: 'Durga Bhagwati Rural Municipality', wards: 5 },
    { name: 'Yamunamai Rural Municipality', wards: 5 }
  ],
  'Saptari': [
    { name: 'Rajbiraj Municipality', wards: 16 },
    { name: 'Kanchanrup Municipality', wards: 12 },
    { name: 'Dakneshwori Municipality', wards: 10 },
    { name: 'Bodebarsain Municipality', wards: 10 },
    { name: 'Khadak Municipality', wards: 11 },
    { name: 'Surunga Municipality', wards: 11 },
    { name: 'Hanumannagar Kankalini Municipality', wards: 14 },
    { name: 'Saptakoshi Municipality', wards: 11 },
    { name: 'Shambhunath Municipality', wards: 12 },
    { name: 'Tilathi Koiladi Rural Municipality', wards: 8 },
    { name: 'Balan-Bihul Rural Municipality', wards: 6 },
    { name: 'Bishnupur Rural Municipality', wards: 7 },
    { name: 'Rupani Rural Municipality', wards: 6 },
    { name: 'Mahadeva Rural Municipality', wards: 6 },
    { name: 'Tirhut Rural Municipality', wards: 5 },
    { name: 'Agnisair Krishna Savaran Rural Municipality', wards: 6 },
    { name: 'Chhinnamasta Rural Municipality', wards: 7 },
    { name: 'Rajgadh Rural Municipality', wards: 6 }
  ],
  'Sarlahi': [
    { name: 'Malangwa Municipality', wards: 12 },
    { name: 'Harion Municipality', wards: 11 },
    { name: 'Barahathawa Municipality', wards: 18 },
    { name: 'Ishwarpur Municipality', wards: 15 },
    { name: 'Lalbandi Municipality', wards: 17 },
    { name: 'Bagmati Municipality', wards: 12 },
    { name: 'Kabilasi Municipality', wards: 10 },
    { name: 'Godaita Municipality', wards: 12 },
    { name: 'Balara Municipality', wards: 11 },
    { name: 'Haripur Municipality', wards: 9 },
    { name: 'Haripurwa Municipality', wards: 9 },
    { name: 'Chakraghatta Rural Municipality', wards: 9 },
    { name: 'Chandranagar Rural Municipality', wards: 7 },
    { name: 'Dhankaul Rural Municipality', wards: 7 },
    { name: 'Brahmapuri Rural Municipality', wards: 9 },
    { name: 'Ramnagar Rural Municipality', wards: 7 },
    { name: 'Kaudena Rural Municipality', wards: 7 },
    { name: 'Basbariya Rural Municipality', wards: 6 },
    { name: 'Bishnu Rural Municipality', wards: 8 },
    { name: 'Parsa Rural Municipality', wards: 6 }
  ],
  'Siraha': [
    { name: 'Siraha Municipality', wards: 22 },
    { name: 'Lahan Municipality', wards: 24 },
    { name: 'Golbazar Municipality', wards: 13 },
    { name: 'Mirchaiya Municipality', wards: 12 },
    { name: 'Kalyanpur Municipality', wards: 12 },
    { name: 'Karjanha Municipality', wards: 11 },
    { name: 'Sukhipur Municipality', wards: 10 },
    { name: 'Dhangadhimai Municipality', wards: 14 },
    { name: 'Bhagawanpur Rural Municipality', wards: 5 },
    { name: 'Aurahi Rural Municipality', wards: 5 },
    { name: 'Bishnupur Rural Municipality', wards: 5 },
    { name: 'Bariyarpatti Rural Municipality', wards: 5 },
    { name: 'Lakshmipur Patari Rural Municipality', wards: 6 },
    { name: 'Naraha Rural Municipality', wards: 5 },
    { name: 'Sakhuwanankarkatti Rural Municipality', wards: 5 },
    { name: 'Arnama Rural Municipality', wards: 5 },
    { name: 'Navarajpur Rural Municipality', wards: 5 }
  ],

  // ── Bagmati Province (13) ──
  'Kathmandu': [
    { name: 'Kathmandu Metropolitan City', wards: 32 },
    { name: 'Kirtipur Municipality', wards: 10 },
    { name: 'Gokarneshwor Municipality', wards: 9 },
    { name: 'Dakshinkali Municipality', wards: 9 },
    { name: 'Nagarjun Municipality', wards: 10 },
    { name: 'Tokha Municipality', wards: 11 },
    { name: 'Tarakeshwor Municipality', wards: 11 },
    { name: 'Budhanilkantha Municipality', wards: 13 },
    { name: 'Chandragiri Municipality', wards: 15 },
    { name: 'Madhyapur Thimi Municipality', wards: 9 },
    { name: 'Shankharapur Municipality', wards: 9 },
    { name: 'Kageshwori Manohara Municipality', wards: 9 }
  ],
  'Lalitpur': [
    { name: 'Lalitpur Metropolitan City', wards: 29 },
    { name: 'Godawari Municipality', wards: 14 },
    { name: 'Mahalaxmi Municipality', wards: 10 },
    { name: 'Konjyosom Rural Municipality', wards: 5 },
    { name: 'Bagmati Rural Municipality', wards: 7 },
    { name: 'Mahankal Rural Municipality', wards: 6 }
  ],
  'Bhaktapur': [
    { name: 'Bhaktapur Municipality', wards: 10 },
    { name: 'Madhyapur Thimi Municipality', wards: 9 },
    { name: 'Suryabinayak Municipality', wards: 10 },
    { name: 'Changunarayan Municipality', wards: 9 }
  ],
  'Chitwan': [
    { name: 'Bharatpur Metropolitan City', wards: 29 },
    { name: 'Ratnanagar Municipality', wards: 16 },
    { name: 'Khairahani Municipality', wards: 13 },
    { name: 'Madi Municipality', wards: 9 },
    { name: 'Rapti Municipality', wards: 13 },
    { name: 'Kalika Municipality', wards: 11 },
    { name: 'Ichhyakamana Rural Municipality', wards: 7 }
  ],
  'Dhading': [
    { name: 'Nilkantha Municipality', wards: 14 },
    { name: 'Dhunibeshi Municipality', wards: 9 },
    { name: 'Benighat Rorang Rural Municipality', wards: 10 },
    { name: 'Galchhi Rural Municipality', wards: 8 },
    { name: 'Gajuri Rural Municipality', wards: 8 },
    { name: 'Jwalamukhi Rural Municipality', wards: 7 },
    { name: 'Thakre Rural Municipality', wards: 11 },
    { name: 'Netrawati Dabjong Rural Municipality', wards: 5 },
    { name: 'Tripurasundari Rural Municipality', wards: 7 },
    { name: 'Siddhalek Rural Municipality', wards: 7 },
    { name: 'Gangajamuna Rural Municipality', wards: 7 },
    { name: 'Rubi Valley Rural Municipality', wards: 6 },
    { name: 'Khaniyabas Rural Municipality', wards: 5 }
  ],
  'Dolakha': [
    { name: 'Bhimeshwar Municipality', wards: 9 },
    { name: 'Jiri Municipality', wards: 9 },
    { name: 'Kalinchok Rural Municipality', wards: 9 },
    { name: 'Gaurishankar Rural Municipality', wards: 9 },
    { name: 'Baiteshwor Rural Municipality', wards: 8 },
    { name: 'Sailung Rural Municipality', wards: 8 },
    { name: 'Melung Rural Municipality', wards: 7 },
    { name: 'Bigu Rural Municipality', wards: 8 },
    { name: 'Tamakoshi Rural Municipality', wards: 7 }
  ],
  'Kavrepalanchok': [
    { name: 'Dhulikhel Municipality', wards: 12 },
    { name: 'Banepa Municipality', wards: 14 },
    { name: 'Panauti Municipality', wards: 12 },
    { name: 'Panchkhal Municipality', wards: 13 },
    { name: 'Namobuddha Municipality', wards: 11 },
    { name: 'Mandandeupur Municipality', wards: 12 },
    { name: 'Roshi Rural Municipality', wards: 12 },
    { name: 'Temal Rural Municipality', wards: 9 },
    { name: 'Bhumlu Rural Municipality', wards: 10 },
    { name: 'Mahabharat Rural Municipality', wards: 8 },
    { name: 'Chaurideurali Rural Municipality', wards: 9 },
    { name: 'Khanikhola Rural Municipality', wards: 7 },
    { name: 'Bethanchowk Rural Municipality', wards: 6 }
  ],
  'Makwanpur': [
    { name: 'Hetauda Sub-Metropolitan City', wards: 19 },
    { name: 'Thaha Municipality', wards: 12 },
    { name: 'Bhimfedi Rural Municipality', wards: 9 },
    { name: 'Makawanpurgadhi Rural Municipality', wards: 8 },
    { name: 'Manahari Rural Municipality', wards: 9 },
    { name: 'Raksirang Rural Municipality', wards: 9 },
    { name: 'Bakaiya Rural Municipality', wards: 12 },
    { name: 'Bagmati Rural Municipality', wards: 9 },
    { name: 'Kailash Rural Municipality', wards: 10 },
    { name: 'Indrasarowar Rural Municipality', wards: 5 }
  ],
  'Nuwakot': [
    { name: 'Bidur Municipality', wards: 13 },
    { name: 'Belkotgadhi Municipality', wards: 13 },
    { name: 'Kakani Rural Municipality', wards: 8 },
    { name: 'Panchakanya Rural Municipality', wards: 5 },
    { name: 'Likhu Rural Municipality', wards: 6 },
    { name: 'Dupcheshwar Rural Municipality', wards: 7 },
    { name: 'Shivapuri Rural Municipality', wards: 8 },
    { name: 'Tadi Rural Municipality', wards: 6 },
    { name: 'Suryagadhi Rural Municipality', wards: 5 },
    { name: 'Tarkeshwar Rural Municipality', wards: 6 },
    { name: 'Kispang Rural Municipality', wards: 5 },
    { name: 'Myagang Rural Municipality', wards: 6 }
  ],
  'Ramechhap': [
    { name: 'Manthali Municipality', wards: 14 },
    { name: 'Ramechhap Municipality', wards: 9 },
    { name: 'Khandadevi Rural Municipality', wards: 9 },
    { name: 'Likhu Tamakoshi Rural Municipality', wards: 7 },
    { name: 'Doramba Sailung Rural Municipality', wards: 7 },
    { name: 'Gokulganga Rural Municipality', wards: 6 },
    { name: 'Sunapati Rural Municipality', wards: 5 },
    { name: 'Umakunda Rural Municipality', wards: 7 }
  ],
  'Rasuwa': [
    { name: 'Uttargaya Rural Municipality', wards: 5 },
    { name: 'Kalika Rural Municipality', wards: 5 },
    { name: 'Gosaikunda Rural Municipality', wards: 6 },
    { name: 'Naukunda Rural Municipality', wards: 6 },
    { name: 'Aamachhodingmo Rural Municipality', wards: 5 }
  ],
  'Sindhuli': [
    { name: 'Kamalamai Municipality', wards: 14 },
    { name: 'Dudhauli Municipality', wards: 14 },
    { name: 'Sunkoshi Rural Municipality', wards: 7 },
    { name: 'Hariharpurgadhi Rural Municipality', wards: 8 },
    { name: 'Tinpatan Rural Municipality', wards: 11 },
    { name: 'Marin Rural Municipality', wards: 7 },
    { name: 'Golanjor Rural Municipality', wards: 7 },
    { name: 'Phikkal Rural Municipality', wards: 6 },
    { name: 'Ghyanglekh Rural Municipality', wards: 5 }
  ],
  'Sindhupalchok': [
    { name: 'Chautara Sangachokgadhi Municipality', wards: 14 },
    { name: 'Barhabise Municipality', wards: 9 },
    { name: 'Melamchi Municipality', wards: 13 },
    { name: 'Balephi Rural Municipality', wards: 8 },
    { name: 'Sunkoshi Rural Municipality', wards: 7 },
    { name: 'Indrawati Rural Municipality', wards: 12 },
    { name: 'Jugal Rural Municipality', wards: 7 },
    { name: 'Panchpokhari Thangpal Rural Municipality', wards: 8 },
    { name: 'Bhotekoshi Rural Municipality', wards: 5 },
    { name: 'Lisankhu Pakhar Rural Municipality', wards: 7 },
    { name: 'Helambu Rural Municipality', wards: 7 },
    { name: 'Tripurasundari Rural Municipality', wards: 6 }
  ],

  // ── Gandaki Province (11) ──
  'Kaski': [
    { name: 'Pokhara Metropolitan City', wards: 33 },
    { name: 'Annapurna Rural Municipality', wards: 11 },
    { name: 'Machhapuchhre Rural Municipality', wards: 9 },
    { name: 'Madi Rural Municipality', wards: 12 },
    { name: 'Rupa Rural Municipality', wards: 7 }
  ],
  'Baglung': [
    { name: 'Baglung Municipality', wards: 14 },
    { name: 'Galkot Municipality', wards: 11 },
    { name: 'Jaimini Municipality', wards: 10 },
    { name: 'Dhorpatan Municipality', wards: 9 },
    { name: 'Bareng Rural Municipality', wards: 5 },
    { name: 'Kathekhola Rural Municipality', wards: 8 },
    { name: 'Tamankhola Rural Municipality', wards: 6 },
    { name: 'Tarakhola Rural Municipality', wards: 5 },
    { name: 'Nisikhola Rural Municipality', wards: 7 },
    { name: 'Badigad Rural Municipality', wards: 10 }
  ],
  'Gorkha': [
    { name: 'Gorkha Municipality', wards: 14 },
    { name: 'Palungtar Municipality', wards: 10 },
    { name: 'Sulikot (Barpak Sulikot) Rural Municipality', wards: 8 },
    { name: 'Siranchok Rural Municipality', wards: 8 },
    { name: 'Ajirkot Rural Municipality', wards: 5 },
    { name: 'Aarughat Rural Municipality', wards: 10 },
    { name: 'Gandaki Rural Municipality', wards: 8 },
    { name: 'Dharche Rural Municipality', wards: 7 },
    { name: 'Bhimsen Thapa Rural Municipality', wards: 8 },
    { name: 'Sahid Lakhan Rural Municipality', wards: 9 },
    { name: 'Chumanubri Rural Municipality', wards: 7 }
  ],
  'Lamjung': [
    { name: 'Besisahar Municipality', wards: 11 },
    { name: 'Madhyanepal Municipality', wards: 10 },
    { name: 'Rainas Municipality', wards: 10 },
    { name: 'Sundarbazar Municipality', wards: 11 },
    { name: 'Kwholosothar Rural Municipality', wards: 9 },
    { name: 'Dudhpokhari Rural Municipality', wards: 6 },
    { name: 'Dordi Rural Municipality', wards: 9 },
    { name: 'Marsyangdi Rural Municipality', wards: 9 }
  ],
  'Manang': [
    { name: 'Chame Rural Municipality', wards: 5 },
    { name: 'Narphu Rural Municipality', wards: 5 },
    { name: 'Nasong Rural Municipality', wards: 9 },
    { name: 'Manang Ngisyang Rural Municipality', wards: 9 }
  ],
  'Mustang': [
    { name: 'Gharapjhong Rural Municipality', wards: 5 },
    { name: 'Thasang Rural Municipality', wards: 5 },
    { name: 'Baragung Muktichhetra Rural Municipality', wards: 5 },
    { name: 'Lomanthang Rural Municipality', wards: 5 },
    { name: 'Lo-Ghekar Damodarkunda Rural Municipality', wards: 5 }
  ],
  'Myagdi': [
    { name: 'Beni Municipality', wards: 10 },
    { name: 'Annapurna Rural Municipality', wards: 8 },
    { name: 'Dhaulagiri Rural Municipality', wards: 7 },
    { name: 'Mangala Rural Municipality', wards: 5 },
    { name: 'Malika Rural Municipality', wards: 7 },
    { name: 'Raghuganga Rural Municipality', wards: 8 }
  ],
  'Nawalpur': [
    { name: 'Kawasoti Municipality', wards: 17 },
    { name: 'Gaindakot Municipality', wards: 18 },
    { name: 'Devachuli Municipality', wards: 17 },
    { name: 'Madhyabindu Municipality', wards: 15 },
    { name: 'Baudikali Rural Municipality', wards: 6 },
    { name: 'Bulingtar Rural Municipality', wards: 6 },
    { name: 'Binayi Tribeni Rural Municipality', wards: 7 },
    { name: 'Hupsekot Rural Municipality', wards: 6 }
  ],
  'Parbat': [
    { name: 'Kushma Municipality', wards: 14 },
    { name: 'Phalebas Municipality', wards: 11 },
    { name: 'Jaljala Rural Municipality', wards: 9 },
    { name: 'Paiyun Rural Municipality', wards: 7 },
    { name: 'Mahashila Rural Municipality', wards: 6 },
    { name: 'Modi Rural Municipality', wards: 8 },
    { name: 'Bihadi Rural Municipality', wards: 6 }
  ],
  'Syangja': [
    { name: 'Putalibazar Municipality', wards: 14 },
    { name: 'Waling Municipality', wards: 14 },
    { name: 'Chapakot Municipality', wards: 10 },
    { name: 'Galyang Municipality', wards: 11 },
    { name: 'Bhirkot Municipality', wards: 9 },
    { name: 'Arjunchhauk Rural Municipality', wards: 6 },
    { name: 'Kaligandaki Rural Municipality', wards: 7 },
    { name: 'Phedikhola Rural Municipality', wards: 5 },
    { name: 'Biruwa Rural Municipality', wards: 8 },
    { name: 'Harinas Rural Municipality', wards: 7 },
    { name: 'Aandhikhola Rural Municipality', wards: 6 }
  ],
  'Tanahun': [
    { name: 'Byas Municipality', wards: 14 },
    { name: 'Shuklagandaki Municipality', wards: 12 },
    { name: 'Bhimad Municipality', wards: 9 },
    { name: 'Bhanu Municipality', wards: 13 },
    { name: 'Anbukhaireni Rural Municipality', wards: 6 },
    { name: 'Rishing Rural Municipality', wards: 8 },
    { name: 'Ghiring Rural Municipality', wards: 5 },
    { name: 'Devghat Rural Municipality', wards: 5 },
    { name: 'Myagde Rural Municipality', wards: 7 },
    { name: 'Bandipur Rural Municipality', wards: 6 }
  ],

  // ── Lumbini Province (12) ──
  'Rupandehi': [
    { name: 'Butwal Sub-Metropolitan City', wards: 19 },
    { name: 'Siddharthanagar Municipality', wards: 13 },
    { name: 'Tilottama Municipality', wards: 17 },
    { name: 'Sainamaina Municipality', wards: 11 },
    { name: 'Devdaha Municipality', wards: 12 },
    { name: 'Lumbini Sanskritik Municipality', wards: 13 },
    { name: 'Gaidahawa Rural Municipality', wards: 9 },
    { name: 'Kanchan Rural Municipality', wards: 5 },
    { name: 'Kotahimai Rural Municipality', wards: 7 },
    { name: 'Marchawari Rural Municipality', wards: 7 },
    { name: 'Mayadevi Rural Municipality', wards: 8 },
    { name: 'Omsatiya Rural Municipality', wards: 6 },
    { name: 'Rohini Rural Municipality', wards: 7 },
    { name: 'Sammarimai Rural Municipality', wards: 7 },
    { name: 'Siyari Rural Municipality', wards: 7 },
    { name: 'Suddhodhan Rural Municipality', wards: 7 }
  ],
  'Arghakhanchi': [
    { name: 'Sandhikharka Municipality', wards: 12 },
    { name: 'Sitganga Municipality', wards: 14 },
    { name: 'Bhumikasthan Municipality', wards: 10 },
    { name: 'Chhatradev Rural Municipality', wards: 8 },
    { name: 'Panini Rural Municipality', wards: 8 },
    { name: 'Malarani Rural Municipality', wards: 9 }
  ],
  'Banke': [
    { name: 'Nepalgunj Sub-Metropolitan City', wards: 23 },
    { name: 'Kohalpur Municipality', wards: 15 },
    { name: 'Narainapur Rural Municipality', wards: 6 },
    { name: 'Raptisonari Rural Municipality', wards: 9 },
    { name: 'Baijanath Rural Municipality', wards: 8 },
    { name: 'Khajura Rural Municipality', wards: 8 },
    { name: 'Duduwa Rural Municipality', wards: 6 },
    { name: 'Janaki Rural Municipality', wards: 6 }
  ],
  'Bardiya': [
    { name: 'Gulariya Municipality', wards: 12 },
    { name: 'Madhuwan Municipality', wards: 9 },
    { name: 'Rajapur Municipality', wards: 10 },
    { name: 'Thakurbaba Municipality', wards: 9 },
    { name: 'Bansgadhi Municipality', wards: 9 },
    { name: 'Barbardiya Municipality', wards: 11 },
    { name: 'Badhaiyatal Rural Municipality', wards: 9 },
    { name: 'Geruwa Rural Municipality', wards: 6 }
  ],
  'Dang': [
    { name: 'Ghorahi Sub-Metropolitan City', wards: 19 },
    { name: 'Tulsipur Sub-Metropolitan City', wards: 19 },
    { name: 'Lamahi Municipality', wards: 9 },
    { name: 'Gadhawa Rural Municipality', wards: 8 },
    { name: 'Rajpur Rural Municipality', wards: 7 },
    { name: 'Shantinagar Rural Municipality', wards: 7 },
    { name: 'Sisne Rural Municipality', wards: 8 },
    { name: 'Babai Rural Municipality', wards: 7 },
    { name: 'Dangisharan Rural Municipality', wards: 7 },
    { name: 'Rapti Rural Municipality', wards: 9 },
    { name: 'Bangalachuli Rural Municipality', wards: 8 }
  ],
  'Gulmi': [
    { name: 'Resunga Municipality', wards: 14 },
    { name: 'Musikot Municipality', wards: 9 },
    { name: 'Isma Rural Municipality', wards: 6 },
    { name: 'Kaligandaki Rural Municipality', wards: 7 },
    { name: 'Gulmidarbar Rural Municipality', wards: 7 },
    { name: 'Satyawati Rural Municipality', wards: 8 },
    { name: 'Chandrakot Rural Municipality', wards: 8 },
    { name: 'Rurukshetra Rural Municipality', wards: 6 },
    { name: 'Chhatrakot Rural Municipality', wards: 6 },
    { name: 'Dhurkot Rural Municipality', wards: 7 },
    { name: 'Madane Rural Municipality', wards: 7 },
    { name: 'Malika Rural Municipality', wards: 8 }
  ],
  'Kapilvastu': [
    { name: 'Kapilvastu Municipality', wards: 12 },
    { name: 'Banganga Municipality', wards: 11 },
    { name: 'Buddhabhumi Municipality', wards: 10 },
    { name: 'Shivaraj Municipality', wards: 11 },
    { name: 'Krishnanagar Municipality', wards: 12 },
    { name: 'Maharajgunj Municipality', wards: 11 },
    { name: 'Mayadevi Rural Municipality', wards: 8 },
    { name: 'Yashodhara Rural Municipality', wards: 8 },
    { name: 'Suddhodhan Rural Municipality', wards: 6 },
    { name: 'Bijayanagar Rural Municipality', wards: 7 }
  ],
  'Nawalparasi West': [
    { name: 'Ramgram Municipality', wards: 18 },
    { name: 'Sunwal Municipality', wards: 13 },
    { name: 'Bardaghat Municipality', wards: 16 },
    { name: 'Palhinandan Rural Municipality', wards: 6 },
    { name: 'Pratappur Rural Municipality', wards: 9 },
    { name: 'Sarawal Rural Municipality', wards: 7 },
    { name: 'Susta Rural Municipality', wards: 5 }
  ],
  'Palpa': [
    { name: 'Tansen Municipality', wards: 14 },
    { name: 'Rampur Municipality', wards: 10 },
    { name: 'Rainadevi Chhahara Rural Municipality', wards: 8 },
    { name: 'Ripdikot Rural Municipality', wards: 8 },
    { name: 'Bagnaskali Rural Municipality', wards: 9 },
    { name: 'Rambha Rural Municipality', wards: 5 },
    { name: 'Purbakhola Rural Municipality', wards: 6 },
    { name: 'Nisdi Rural Municipality', wards: 7 },
    { name: 'Mathagadhi Rural Municipality', wards: 8 },
    { name: 'Tinau Rural Municipality', wards: 6 }
  ],
  'Pyuthan': [
    { name: 'Pyuthan Municipality', wards: 10 },
    { name: 'Swargadwari Municipality', wards: 9 },
    { name: 'Gaumukhi Rural Municipality', wards: 7 },
    { name: 'Mandavi Rural Municipality', wards: 5 },
    { name: 'Sarumarani Rural Municipality', wards: 6 },
    { name: 'Mallarani Rural Municipality', wards: 5 },
    { name: 'Naubahini Rural Municipality', wards: 8 },
    { name: 'Jhimruk Rural Municipality', wards: 8 },
    { name: 'Ayirabati Rural Municipality', wards: 6 }
  ],
  'Rolpa': [
    { name: 'Rolpa Municipality', wards: 10 },
    { name: 'Runtigadhi Rural Municipality', wards: 9 },
    { name: 'Triveni Rural Municipality', wards: 7 },
    { name: 'Sunil Smriti Rural Municipality', wards: 8 },
    { name: 'Lungri Rural Municipality', wards: 7 },
    { name: 'Duikholi (Paribartan) Rural Municipality', wards: 6 },
    { name: 'Thabang Rural Municipality', wards: 5 },
    { name: 'Madi Rural Municipality', wards: 6 },
    { name: 'Gajul (Gangadev) Rural Municipality', wards: 7 },
    { name: 'Sukidaha Rural Municipality', wards: 7 }
  ],
  'Rukum East': [
    { name: 'Sisne Rural Municipality', wards: 8 },
    { name: 'Bhume Rural Municipality', wards: 9 },
    { name: 'Putha Uttarganga Rural Municipality', wards: 14 }
  ],

  // ── Karnali Province (10) ──
  'Surkhet': [
    { name: 'Birendranagar Municipality', wards: 16 },
    { name: 'Bheriganga Municipality', wards: 13 },
    { name: 'Gurbhakot Municipality', wards: 14 },
    { name: 'Panchapuri Municipality', wards: 11 },
    { name: 'Lekbeshi Municipality', wards: 10 },
    { name: 'Chaukune Rural Municipality', wards: 10 },
    { name: 'Barahatal Rural Municipality', wards: 10 },
    { name: 'Chingad Rural Municipality', wards: 6 },
    { name: 'Simta Rural Municipality', wards: 9 }
  ],
  'Dailekh': [
    { name: 'Narayan Municipality', wards: 11 },
    { name: 'Dullu Municipality', wards: 13 },
    { name: 'Chamunda Bindrasaini Municipality', wards: 9 },
    { name: 'Aathbis Municipality', wards: 9 },
    { name: 'Bhagawatimai Rural Municipality', wards: 7 },
    { name: 'Gurans Rural Municipality', wards: 8 },
    { name: 'Dungeshwar Rural Municipality', wards: 6 },
    { name: 'Naumule Rural Municipality', wards: 8 },
    { name: 'Mahabu Rural Municipality', wards: 6 },
    { name: 'Bhairabi Rural Municipality', wards: 7 },
    { name: 'Thantikandh Rural Municipality', wards: 6 }
  ],
  'Dolpa': [
    { name: 'Thuli Bheri Municipality', wards: 11 },
    { name: 'Tripurasundari Municipality', wards: 11 },
    { name: 'Dolpo Buddha Rural Municipality', wards: 6 },
    { name: 'Shey Phoksundo Rural Municipality', wards: 9 },
    { name: 'Jagadulla Rural Municipality', wards: 6 },
    { name: 'Mudkechula Rural Municipality', wards: 9 },
    { name: 'Kaike Rural Municipality', wards: 7 },
    { name: 'Chharka Tangsong Rural Municipality', wards: 6 }
  ],
  'Humla': [
    { name: 'Simkot Rural Municipality', wards: 8 },
    { name: 'Namkha Rural Municipality', wards: 6 },
    { name: 'Kharpunath Rural Municipality', wards: 5 },
    { name: 'Sarkegad Rural Municipality', wards: 8 },
    { name: 'Chankheli Rural Municipality', wards: 6 },
    { name: 'Adanchuli Rural Municipality', wards: 6 },
    { name: 'Tanjakot Rural Municipality', wards: 5 }
  ],
  'Jajarkot': [
    { name: 'Bheri Municipality', wards: 13 },
    { name: 'Chhedagad Municipality', wards: 13 },
    { name: 'Nalgad Municipality', wards: 13 },
    { name: 'Barekot Rural Municipality', wards: 9 },
    { name: 'Kushe Rural Municipality', wards: 9 },
    { name: 'Junichande Rural Municipality', wards: 11 },
    { name: 'Shivalaya Rural Municipality', wards: 9 }
  ],
  'Jumla': [
    { name: 'Chandannath Municipality', wards: 10 },
    { name: 'Kankasundari Rural Municipality', wards: 8 },
    { name: 'Sinja Rural Municipality', wards: 6 },
    { name: 'Hima Rural Municipality', wards: 7 },
    { name: 'Tila Rural Municipality', wards: 9 },
    { name: 'Guthichaur Rural Municipality', wards: 5 },
    { name: 'Tatopani Rural Municipality', wards: 8 },
    { name: 'Patarasi Rural Municipality', wards: 7 }
  ],
  'Kalikot': [
    { name: 'Khandachakra Municipality', wards: 11 },
    { name: 'Raskot Municipality', wards: 9 },
    { name: 'Tilagufa Municipality', wards: 11 },
    { name: 'Pachaljharana Rural Municipality', wards: 9 },
    { name: 'Sanni Triveni Rural Municipality', wards: 9 },
    { name: 'Naraharinath Rural Municipality', wards: 9 },
    { name: 'Shubha Kalika Rural Municipality', wards: 8 },
    { name: 'Mahawai Rural Municipality', wards: 7 },
    { name: 'Palata Rural Municipality', wards: 9 }
  ],
  'Mugu': [
    { name: 'Chhayanath Rara Municipality', wards: 14 },
    { name: 'Mugum Karmarong Rural Municipality', wards: 9 },
    { name: 'Soru Rural Municipality', wards: 11 },
    { name: 'Khatyad Rural Municipality', wards: 11 }
  ],
  'Rukum West': [
    { name: 'Musikot Municipality', wards: 14 },
    { name: 'Chaurjahari Municipality', wards: 14 },
    { name: 'Aathbiskot Municipality', wards: 14 },
    { name: 'Banfikot Rural Municipality', wards: 10 },
    { name: 'Tribeni Rural Municipality', wards: 10 },
    { name: 'Sani Bheri Rural Municipality', wards: 11 }
  ],
  'Salyan': [
    { name: 'Sharada Municipality', wards: 15 },
    { name: 'Bagchaur Municipality', wards: 12 },
    { name: 'Bangad Kupinde Municipality', wards: 12 },
    { name: 'Kalimati Rural Municipality', wards: 7 },
    { name: 'Triveni Rural Municipality', wards: 6 },
    { name: 'Kapurkot Rural Municipality', wards: 6 },
    { name: 'Chatreshwari Rural Municipality', wards: 7 },
    { name: 'Siddha Kumakh Rural Municipality', wards: 5 },
    { name: 'Kumakh Rural Municipality', wards: 7 },
    { name: 'Darma Rural Municipality', wards: 6 }
  ],

  // ── Sudurpashchim Province (9) ──
  'Kailali': [
    { name: 'Dhangadhi Sub-Metropolitan City', wards: 19 },
    { name: 'Tikapur Municipality', wards: 9 },
    { name: 'Ghodaghodi Municipality', wards: 12 },
    { name: 'Lamki Chuha Municipality', wards: 10 },
    { name: 'Bhajani Municipality', wards: 9 },
    { name: 'Godawari Municipality', wards: 12 },
    { name: 'Gauriganga Municipality', wards: 11 },
    { name: 'Janaki Rural Municipality', wards: 9 },
    { name: 'Bardagoriya Rural Municipality', wards: 6 },
    { name: 'Mohanyal Rural Municipality', wards: 7 },
    { name: 'Kailari Rural Municipality', wards: 9 },
    { name: 'Joshipur Rural Municipality', wards: 7 },
    { name: 'Chure Rural Municipality', wards: 6 }
  ],
  'Kanchanpur': [
    { name: 'Bhimdatta Municipality', wards: 19 },
    { name: 'Punarbas Municipality', wards: 11 },
    { name: 'Belauri Municipality', wards: 10 },
    { name: 'Bedkot Municipality', wards: 10 },
    { name: 'Mahakali (Doddhara Chandani) Municipality', wards: 10 },
    { name: 'Shuklaphanta Municipality', wards: 12 },
    { name: 'Krishnapur Municipality', wards: 9 },
    { name: 'Beldandi Rural Municipality', wards: 5 },
    { name: 'Laljhadi Rural Municipality', wards: 6 }
  ],
  'Achham': [
    { name: 'Mangalsen Municipality', wards: 14 },
    { name: 'Kamalbazar Municipality', wards: 10 },
    { name: 'Sanfebagar Municipality', wards: 14 },
    { name: 'Panchadewal Binayak Municipality', wards: 9 },
    { name: 'Chaurpati Rural Municipality', wards: 7 },
    { name: 'Mellekh Rural Municipality', wards: 8 },
    { name: 'Bannigadhi Jayagadh Rural Municipality', wards: 6 },
    { name: 'Ramaroshan Rural Municipality', wards: 8 },
    { name: 'Dhakari Rural Municipality', wards: 8 },
    { name: 'Turmakhand Rural Municipality', wards: 8 }
  ],
  'Baitadi': [
    { name: 'Dasharathchand Municipality', wards: 11 },
    { name: 'Patan Municipality', wards: 10 },
    { name: 'Melauli Municipality', wards: 9 },
    { name: 'Purchaudi Municipality', wards: 10 },
    { name: 'Sunary Rural Municipality', wards: 9 },
    { name: 'Sigas Rural Municipality', wards: 9 },
    { name: 'Shivanath Rural Municipality', wards: 6 },
    { name: 'Pancheshwar Rural Municipality', wards: 6 },
    { name: 'Dogadakedar Rural Municipality', wards: 8 },
    { name: 'Dilasaini Rural Municipality', wards: 7 }
  ],
  'Bajhang': [
    { name: 'Jayaprithvi Municipality', wards: 11 },
    { name: 'Bungal Municipality', wards: 11 },
    { name: 'Talkot Rural Municipality', wards: 7 },
    { name: 'Masta Rural Municipality', wards: 7 },
    { name: 'Khaptadchhanna Rural Municipality', wards: 7 },
    { name: 'Thalara Rural Municipality', wards: 9 },
    { name: 'Bitthadchir Rural Municipality', wards: 9 },
    { name: 'Surma Rural Municipality', wards: 5 },
    { name: 'Chhabispathibhera Rural Municipality', wards: 7 },
    { name: 'Durgathali Rural Municipality', wards: 7 },
    { name: 'Kedarsyoo Rural Municipality', wards: 9 },
    { name: 'Saipal Rural Municipality', wards: 5 }
  ],
  'Bajura': [
    { name: 'Badimalika Municipality', wards: 9 },
    { name: 'Tribeni Municipality', wards: 9 },
    { name: 'Budhiganga Municipality', wards: 10 },
    { name: 'Budhinanda Municipality', wards: 10 },
    { name: 'Gaumul Rural Municipality', wards: 6 },
    { name: 'Pandavgufa (Jagnnath) Rural Municipality', wards: 6 },
    { name: 'Swami Kartik Khapar Rural Municipality', wards: 5 },
    { name: 'Chhededaha (Khaptad Chhededaha) Rural Municipality', wards: 7 },
    { name: 'Himali Rural Municipality', wards: 7 }
  ],
  'Dadeldhura': [
    { name: 'Amargadhi Municipality', wards: 11 },
    { name: 'Parshuram Municipality', wards: 12 },
    { name: 'Aalital Rural Municipality', wards: 8 },
    { name: 'Bhageshwar Rural Municipality', wards: 5 },
    { name: 'Navadurga Rural Municipality', wards: 5 },
    { name: 'Ajayameru Rural Municipality', wards: 6 },
    { name: 'Ganyapdhura Rural Municipality', wards: 5 }
  ],
  'Darchula': [
    { name: 'Mahakali Municipality', wards: 9 },
    { name: 'Shailyashikhar Municipality', wards: 9 },
    { name: 'Malikarjun Rural Municipality', wards: 8 },
    { name: 'Apihimal Rural Municipality', wards: 6 },
    { name: 'Duhun Rural Municipality', wards: 5 },
    { name: 'Naugad Rural Municipality', wards: 6 },
    { name: 'Marma Rural Municipality', wards: 6 },
    { name: 'Lekam Rural Municipality', wards: 6 },
    { name: 'Vyans Rural Municipality', wards: 6 }
  ],
  'Doti': [
    { name: 'Dipayal Silgadhi Municipality', wards: 9 },
    { name: 'Shikhar Municipality', wards: 11 },
    { name: 'Purbichauki Rural Municipality', wards: 7 },
    { name: 'Badikedar Rural Municipality', wards: 5 },
    { name: 'Jorayal Rural Municipality', wards: 6 },
    { name: 'Sayal Rural Municipality', wards: 6 },
    { name: 'Aadarsha Rural Municipality', wards: 7 },
    { name: 'K.I. Singh Rural Municipality', wards: 7 },
    { name: 'Bogatan Phudsil Rural Municipality', wards: 7 }
  ]
};

// Helper utilities for cascading queries
export function getDistrictsForProvince(province) {
  return DISTRICTS_BY_PROVINCE[province] || [];
}

export function getMunicipalitiesForDistrict(district) {
  return MUNICIPALITIES_BY_DISTRICT[district] || [];
}

export function getWardsForMunicipality(district, municipalityName) {
  const list = MUNICIPALITIES_BY_DISTRICT[district] || [];
  const found = list.find(m => m.name === municipalityName);
  const count = found ? found.wards : 9; // reasonable default if unlisted
  return Array.from({ length: count }, (_, i) => `Ward ${i + 1}`);
}

export function getProvinceForDistrict(district) {
  for (const [province, districts] of Object.entries(DISTRICTS_BY_PROVINCE)) {
    if (districts.includes(district)) return province;
  }
  return null;
}
