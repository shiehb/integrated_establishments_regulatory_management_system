// Establishment-related constants

// Allowed provinces (Ilocos Region)
export const ALLOWED_PROVINCES = [
  "LA UNION",
  "ILOCOS SUR", 
  "ILOCOS NORTE",
  "PANGASINAN",
];

// Predefined Nature of Business options
export const NATURE_OF_BUSINESS_OPTIONS = [
  "RESTAURANT/FOOD SERVICE",
  "RETAIL/WHOLESALE",
  "MANUFACTURING",
  "CONSTRUCTION",
  "TRANSPORTATION",
  "HEALTHCARE/MEDICAL",
  "EDUCATION/TRAINING",
  "HOSPITALITY/TOURISM",
  "AGRICULTURE/FARMING",
  "FISHING/AQUACULTURE",
  "MINING",
  "ENERGY/POWER",
  "TELECOMMUNICATIONS",
  "BANKING/FINANCE",
  "INSURANCE",
  "REAL ESTATE",
  "CONSULTING SERVICES",
  "LEGAL SERVICES",
  "ACCOUNTING SERVICES",
  "MARKETING/ADVERTISING",
  "INFORMATION TECHNOLOGY",
  "RESEARCH & DEVELOPMENT",
  "WASTE MANAGEMENT",
  "WATER SUPPLY",
  "GOVERNMENT SERVICES",
  "NON-PROFIT/CHARITY",
  "ENTERTAINMENT/RECREATION",
  "SPORTS/FITNESS",
  "BEAUTY/COSMETICS",
  "AUTOMOTIVE SERVICES",
  "REPAIR SERVICES",
  "CLEANING SERVICES",
  "SECURITY SERVICES",
  "OTHERS"
];

// Ilocos Region coordinates for auto-zoom
export const ILOCOS_REGION_BOUNDS = {
  north: 18.6,
  south: 15.4,
  east: 121.2,
  west: 119.2
};

// Ilocos Region center coordinates
export const ILOCOS_REGION_CENTER = {
  latitude: 16.5,
  longitude: 120.2
};

// Comprehensive mapping of provinces to their cities/municipalities in Ilocos Region
export const ILOCOS_CITIES_BY_PROVINCE = {
  "LA UNION": [
    "SAN FERNANDO",
    "AGOO",
    "ARINGAY",
    "BACNOTAN",
    "BAGULIN",
    "BALAOAN",
    "BANGAR",
    "BAUANG",
    "BURGOS",
    "CABA",
    "LUNA",
    "NAGUILIAN",
    "PUGO",
    "ROSARIO",
    "SAN GABRIEL",
    "SAN JUAN",
    "SANTO TOMAS",
    "SANTOL",
    "SUDIPEN",
    "TUBAO"
  ],
  "ILOCOS SUR": [
    "VIGAN",
    "CANDON",
    "ALILEM",
    "BANAYOYO",
    "BANTAY",
    "BURGOS",
    "CABUGAO",
    "CAOAYAN",
    "CERVANTES",
    "GALIMUYOD",
    "GREGORIO DEL PILAR",
    "LIDLIDDA",
    "MAGSINGAL",
    "NAGBUKEL",
    "NARVACAN",
    "QUIRINO",
    "SALCEDO",
    "SAN EMILIO",
    "SAN ESTEBAN",
    "SAN ILDEFONSO",
    "SAN JUAN",
    "SAN VICENTE",
    "SANTA",
    "SANTA CATALINA",
    "SANTA CRUZ",
    "SANTA LUCIA",
    "SANTA MARIA",
    "SANTIAGO",
    "SANTO DOMINGO",
    "SIGAY",
    "SINAIT",
    "SUGPON",
    "SUYO",
    "TAGUDIN"
  ],
  "ILOCOS NORTE": [
    "LAOAG",
    "BATAC",
    "ADAMS",
    "BACARRA",
    "BADOC",
    "BANGUI",
    "BANNA",
    "BURGOS",
    "CARASI",
    "CURRIMAO",
    "DINGRAS",
    "DUMALNEG",
    "MARCOS",
    "NUEVA ERA",
    "PAGUDPUD",
    "PAOAY",
    "PASUQUIN",
    "PIDDIG",
    "PINILI",
    "SAN NICOLAS",
    "SARRAT",
    "SOLSONA",
    "VINTAR"
  ],
  "PANGASINAN": [
    "ALAMINOS",
    "DAGUPAN",
    "SAN CARLOS",
    "URDANETA",
    "AGNO",
    "AGUILAR",
    "ALCALA",
    "ANDA",
    "ASINGAN",
    "BALUNGAO",
    "BANI",
    "BASISTA",
    "BAUTISTA",
    "BAYAMBANG",
    "BINALONAN",
    "BINMALEY",
    "BOLINAO",
    "BUGALLON",
    "BURGOS",
    "CALASIAO",
    "DASOL",
    "INFANTA",
    "LABRADOR",
    "LAOAC",
    "LINGAYEN",
    "MABINI",
    "MALASIQUI",
    "MANAOAG",
    "MANGALDAN",
    "MANGATAREM",
    "MAPANDAN",
    "NATIVIDAD",
    "POZORRUBIO",
    "ROSALES",
    "SAN FABIAN",
    "SAN JACINTO",
    "SAN MANUEL",
    "SAN NICOLAS",
    "SAN QUINTIN",
    "SANTA BARBARA",
    "SANTA MARIA",
    "SANTO TOMAS",
    "SISON",
    "SUAL",
    "TAYUG",
    "UMINGAN",
    "URBIZTONDO",
    "VILLASIS"
  ]
};

// Postal codes for Ilocos Region cities
export const POSTAL_CODES_BY_CITY = {
  "LA UNION": {
    "SAN FERNANDO": "2500",
    "AGOO": "2504",
    "ARINGAY": "2503",
    "BACNOTAN": "2515",
    "BAGULIN": "2512",
    "BALAOAN": "2517",
    "BANGAR": "2519",
    "BAUANG": "2501",
    "BURGOS": "2510",
    "CABA": "2502",
    "LUNA": "2518",
    "NAGUILIAN": "2511",
    "PUGO": "2508",
    "ROSARIO": "2506",
    "SAN GABRIEL": "2513",
    "SAN JUAN": "2514",
    "SANTO TOMAS": "2505",
    "SANTOL": "2516",
    "SUDIPEN": "2509",
    "TUBAO": "2507"
  },
  "ILOCOS SUR": {
    "VIGAN": "2700",
    "CANDON": "2710",
    "ALILEM": "2706",
    "BANAYOYO": "2708",
    "BANTAY": "2727",
    "BURGOS": "2724",
    "CABUGAO": "2732",
    "CAOAYAN": "2731",
    "CERVANTES": "2718",
    "GALIMUYOD": "2709",
    "GREGORIO DEL PILAR": "2720",
    "LIDLIDDA": "2723",
    "MAGSINGAL": "2730",
    "NAGBUKEL": "2725",
    "NARVACAN": "2704",
    "QUIRINO": "2721",
    "SALCEDO": "2711",
    "SAN EMILIO": "2722",
    "SAN ESTEBAN": "2708",
    "SAN ILDEFONSO": "2728",
    "SAN JUAN": "2734",
    "SAN VICENTE": "2726",
    "SANTA": "2703",
    "SANTA CATALINA": "2701",
    "SANTA CRUZ": "2713",
    "SANTA LUCIA": "2712",
    "SANTA MARIA": "2705",
    "SANTIAGO": "2707",
    "SANTO DOMINGO": "2729",
    "SIGAY": "2719",
    "SINAIT": "2733",
    "SUGPON": "2715",
    "SUYO": "2714",
    "TAGUDIN": "2716"
  },
  "ILOCOS NORTE": {
    "LAOAG": "2900",
    "BATAC": "2906",
    "ADAMS": "2922",
    "BACARRA": "2916",
    "BADOC": "2904",
    "BANGUI": "2920",
    "BANNA": "2908",
    "BURGOS": "2918",
    "CARASI": "2911",
    "CURRIMAO": "2912",
    "DINGRAS": "2913",
    "DUMALNEG": "2921",
    "MARCOS": "2907",
    "NUEVA ERA": "2909",
    "PAGUDPUD": "2919",
    "PAOAY": "2902",
    "PASUQUIN": "2917",
    "PIDDIG": "2914",
    "PINILI": "2905",
    "SAN NICOLAS": "2901",
    "SARRAT": "2915",
    "SOLSONA": "2910",
    "VINTAR": "2915"
  },
  "PANGASINAN": {
    "ALAMINOS": "2404",
    "DAGUPAN": "2400",
    "SAN CARLOS": "2420",
    "URDANETA": "2428",
    "AGNO": "2408",
    "AGUILAR": "2415",
    "ALCALA": "2425",
    "ANDA": "2405",
    "ASINGAN": "2439",
    "BALUNGAO": "2442",
    "BANI": "2407",
    "BASISTA": "2422",
    "BAUTISTA": "2424",
    "BAYAMBANG": "2423",
    "BINALONAN": "2436",
    "BINMALEY": "2417",
    "BOLINAO": "2406",
    "BUGALLON": "2416",
    "BURGOS": "2410",
    "CALASIAO": "2418",
    "DASOL": "2411",
    "INFANTA": "2412",
    "LABRADOR": "2402",
    "LAOAC": "2437",
    "LINGAYEN": "2401",
    "MABINI": "2409",
    "MALASIQUI": "2421",
    "MANAOAG": "2430",
    "MANGALDAN": "2432",
    "MANGATAREM": "2413",
    "MAPANDAN": "2427",
    "NATIVIDAD": "2446",
    "POZORRUBIO": "2435",
    "ROSALES": "2441",
    "SAN FABIAN": "2433",
    "SAN JACINTO": "2431",
    "SAN MANUEL": "2438",
    "SAN NICOLAS": "2447",
    "SAN QUINTIN": "2444",
    "SANTA BARBARA": "2419",
    "SANTA MARIA": "2440",
    "SANTO TOMAS": "2426",
    "SISON": "2434",
    "SUAL": "2414",
    "TAYUG": "2445",
    "UMINGAN": "2443",
    "URBIZTONDO": "2414",
    "VILLASIS": "2429"
  }
};

export const BARANGAYS_BY_CITY = {
  "LA UNION": {
    "SAN FERNANDO": [
      "Abut", "Apaleng", "Baraoas", "Baraoas Norte", "Baraoas Sur", "Barangay I", 
      "Barangay II", "Barangay III", "Barangay IV", "Bato", "Biday", "Birunget", 
      "Bungro", "Cabaroan", "Cabarsican", "Cadaclan", "Calabugao", "Camaso", 
      "Canaoay", "Carlatan", "Catbangen", "Dallangayan Este", "Dallangayan Oeste", 
      "Dalumpinas Este", "Dalumpinas Oeste", "Ilocanos Norte", "Ilocanos Sur", 
      "Langiden", "Lingsat", "Mameltac", "Masicong", "Nagyubuyuban", "Namtutan", 
      "Nalvo Norte", "Nalvo Sur", "Nilombot", "Oaig Daya", "Oaig Daya", "Paco", 
      "Pagdalagan", "Pagdaraoan", "Pagdaraoan Norte", "Pagdaraoan Sur", "Pagbennecan", 
      "Paguetpet", "Paldit", "Paratong", "Pias", "Poro", "Puspus", "Sacyud", 
      "Sagayad", "San Agustin", "San Francisco", "San Vicente", "Santiago Norte", 
      "Santiago Sur", "Saoay", "Sevilla", "Siboan-Otong", "Taboc", "Tanquigan", 
      "Tanqui", "Urayong"
    ],
    "AGOO": [
      "Ambitacay", "Balawarte", "Capas", "Consolacion", "Macalva Central", 
      "Macalva Norte", "Macalva Sur", "Nazareno", "Poblacion East", "Poblacion West", 
      "San Agustin East", "San Agustin West", "San Antonio East", "San Antonio West", 
      "San Francisco East", "San Francisco West", "San Isidro", "San Jose Norte", 
      "San Jose Sur", "San Juan", "San Julian East", "San Julian West", 
      "San Manuel Norte", "San Manuel Sur", "San Marcos", "San Miguel", 
      "San Nicolas", "San Pedro", "San Roque", "San Vicente Norte", 
      "San Vicente Sur", "Santa Ana", "Santa Barbara", "Santa Fe", "Santa Maria", 
      "Santa Monica", "Santa Rita East", "Santa Rita Norte", "Santa Rita Sur", 
      "Santa Rita West", "Santo Tomas", "Suguidan Norte", "Suguidan Sur"
    ],
    "ARINGAY": [
      "Alabang", "Alaska", "Basca", "Dulao", "Gallano", "Gueguesangen", 
      "Macabato", "Poblacion", "San Antonio", "San Benito Norte", 
      "San Benito Sur", "San Eugenio", "San Juan", "San Juan East", 
      "San Juan West", "San Simon East", "San Simon West", "Santa Cecilia", 
      "Santa Lucia", "Santa Rita East", "Santa Rita West", "Santo Rosario East", 
      "Santo Rosario West", "Suguidan Norte", "Suguidan Sur", "Tanglag", 
      "Turod", "Ubbog"
    ],
    "BACNOTAN": [
      "Agtipal", "Bacsil", "Balasiao", "Baroro", "Cabaroan", "Cabarsican", 
      "Cabugao", "Casiaman", "Guinabang", "Linuan", "Mabanengbeng 1st", 
      "Mabanengbeng 2nd", "Poblacion", "Sagap"
    ],
    "BAGULIN": [
      "Alibangsay", "Baay", "Cambaly", "Cardiz", "Dagup", "Libtong", 
      "Poblacion", "Suyo", "Tagudtud", "Tio-angan", "Wallayan"
    ],
    "BALAOAN": [
      "Almeida", "Antolin", "Bungol", "Butubut Norte", "Butubut Sur", 
      "Calliat", "Calungbuyan", "Camiling", "Daramuangan", "Guillermo", 
      "Masupe", "Montalban", "Nagsabaran", "Nagsimbanan", "Nalasin", 
      "Napaset", "Oaig Daya", "Paguetpet", "Paraoir", "Patpata", 
      "Sablut", "San Pablo", "Santa Cruz", "Santiago", "Tallipugo", 
      "Tubod"
    ],
    "BANGAR": [
      "Agdeppa", "Alzate", "Bangaoilan", "Barraca", "Dadaeman", "Gonzalo", 
      "General Prim", "Consuegra", "Rissing", "San Cristobal", "San Blas", 
      "Santiago", "Sobredillo", "Ubbog"
    ],
    "BAUANG": [
      "Acap", "Baccuit Norte", "Baccuit Sur", "Bagbag", "Ballay", "Bawanta", 
      "Boy-utan", "Bucayab", "Cabaloan", "Cabiscuela", "Calumbaya", "Carmen", 
      "Casilagan", "Central East", "Central West", "Dili", "Disso-or", "Guinabang", 
      "Lesseb", "Lomboy", "Mabuhay", "Mameltac", "Nagrebcan", "Pagal", "Paldit", 
      "Palugsi-Limmansangan", "Parian Oeste", "Parian Este", "Paringao", "Payocpoc Norte Este", 
      "Payocpoc Norte Oeste", "Payocpoc Sur", "Pilar", "Pottot", "Pugo", "Risal", 
      "San Agustin", "San Francisco", "San Juan", "San Vicente", "Santiago", 
      "Santa Monica", "Santo Tomas", "Taberna", "Tibno", "Urayong"
    ],
    "BURGOS": [
      "Agpay", "Bayabas", "Bobon", "Cacabugaoan", "Concepcion", "Daldagan", 
      "Laoag", "Linuan", "Lipay", "Lomboy", "Luco", "Lunoy", "Nagsabaran", 
      "Nagsimbanan", "Poblacion Norte", "Poblacion Sur", "Saoay", "Sobredillo", 
      "San Juan", "San Miguel", "Santiago", "Taliao", "Upper Tumapoc"
    ],
    "CABA": [
      "Bautista", "Gana", "Juan Cartas", "Las-ud", "Marga", "Maygaway", 
      "Poblacion Norte", "Poblacion Sur", "San Carlos", "San Cornelio", 
      "San Fernando", "San Gregorio", "San Jose", "Santiago", "Sobredillo", 
      "Urayong", "Wenceslao"
    ],
    "LUNA": [
      "Alcala", "Apayao", "Barangobong", "Barrientos", "Bungro", "Buselbusel", 
      "Cabusican", "Carisquis", "Darigayos", "Magallanes", "Magsiping", 
      "Mabunot", "Nagrebcan", "Nalvo Norte", "Nalvo Sur", "Namaltugan", 
      "Oaqui", "Pila", "Rimos", "Rissing", "Salcedo", "Santo Domingo Norte", 
      "Santo Domingo Sur", "Sucoc Norte", "Sucoc Sur", "Suya", "Tallaoen", 
      "Victoria", "Viga"
    ],
    "NAGUILIAN": [
      "Aguioas", "Al-alinao Norte", "Al-alinao Sur", "Ambaracao Norte", 
      "Ambaracao Sur", "Balecbec", "Bancagan", "Baraoas Norte", "Baraoas Sur", 
      "Bariquir", "Bato", "Bimmotobot", "Cabaritan Norte", "Cabaritan Sur", 
      "Casilagan", "Dal-lipaoen", "Daramuangan", "Guesset", "Gusing Norte", 
      "Gusing Sur", "Imelda", "Lioac", "Magsiping", "Mamat-ing", "Nagsidorisan", 
      "Natividad", "Ortiz", "Reyes", "Rimos", "Rissing", "San Antonio", 
      "San Isidro", "San Mariano", "Santo Rosario", "Sobredillo", "Sucoc", 
      "Sulvec", "Surrey", "Tallaoen", "Unzad", "San Francisco"
    ],
    "PUGO": [
      "Ambalite", "Ambulong", "Cares", "Cuenca", "Duplas", "Maasin", 
      "Magpiet", "Palina", "Poblacion East", "Poblacion West", "Risal", 
      "San Luis", "San Juan", "Tavora", "Temple", "Viejo"
    ],
    "ROSARIO": [
      "Alipang", "Ambangonan", "Ambitacay", "Bacani", "Bangug", "Bani", 
      "Benteng-Sapilang", "Cadumanian", "Camp One", "Carunuan East", 
      "Carunuan West", "Casilagan", "Coliat", "Concepcion", "Damortis", 
      "Gumot-Nagcolaran", "Inabaan Norte", "Inabaan Sur", "Lingsat", 
      "Lubnac", "Mabunot", "Nagsabaran", "Nagsimbanan", "Palong", 
      "Poblacion East", "Poblacion West", "Podis", "Sablut", "San Antonio", 
      "San Jose", "San Juan", "Santiago", "Santo Tomas", "Sucoc", "Tagudin", 
      "Tandoc", "Tay-ac", "Ud-Udiao", "Villa"
    ],
    "SAN GABRIEL": [
      "Ampusongan", "Bayabas", "Bocboc", "Bonga", "Buselbusel", "Cabu", 
      "Caggao", "Cayat", "Balbalayang", "Lusod", "Mabanengbeng", "Mabayan", 
      "Pac-o", "Poblacion", "Polipol", "Sagubo", "Tacadang", "Talinguroy", 
      "Lenneng"
    ],
    "SAN JUAN": [
      "Aludaid", "Bacsil", "Balballosa", "Bambanay", "Baraoas", "Baraoas Norte", 
      "Baraoas Sur", "Basca", "Baybay", "Bocboc", "Bugnay", "Caarusipan", 
      "Cacapian", "Caculangan", "Caggao", "Calincamasan", "Camanggaan", 
      "Campos", "Capacuan", "Carisquis", "Carpenter", "Casilagan", "Catdongan", 
      "Culiong", "Dadayag", "Dagup", "Dardarat", "Guinguinabang", "Ipay", 
      "Libtong", "Malamin", "Masantol", "Nagsabaran", "Nagsimbanan", 
      "Naguirangan", "Nangalisan", "Narra", "Oaig Daya", "Paco", "Paglalangan", 
      "Palao", "Poblacion", "Resurreccion", "San Felipe", "San Isidro", 
      "San Mariano", "Santo Rosario", "Saracat", "Sinapangan", "Sulvec", 
      "Taboc", "Talogtog", "Urayong"
    ],
    "SANTO TOMAS": [
      "Bail", "Balaoc", "Balsaan", "Baybay", "Cabaroan", "Casantaan", 
      "Cupang", "Damacuag", "Fernandez", "Luna", "Namacpacan", "Namagbagan", 
      "Nangalisan", "Poblacion", "Pudoc", "San Jose", "San Juan", "San Mateo", 
      "Santiago", "Saoat", "Sibalay", "Suyo", "Temple", "Ubod"
    ],
    "SANTOL": [
      "Corrooy", "Lettac", "Mabunot", "Paagan", "Poblacion", "Puguil", 
      "Ramot", "Rara", "Rioeng", "Sapdaan", "Sasaba", "Tubo"
    ],
    "SUDIPEN": [
      "Bigbiga", "Caroan", "Old Central", "Namaltugan", "Poblacion", 
      "Porporiket", "San Jose Norte", "San Jose Sur", "San Juan", 
      "Sulbec", "Suyo"
    ],
    "TUBAO": [
      "Amallapay", "Anduyan", "Caggao", "Caggaowan", "Camanggaan", 
      "Concordia", "Liptong", "Poblacion", "Pugo", "Rissing", "San Pablo", 
      "Santo Domingo", "Siguem", "Tubao", "Viejo"
    ]
  },
  "ILOCOS SUR": {
  "VIGAN": [
    "Ayusan Norte", "Ayusan Sur", "Barangay I", "Barangay II", "Barangay III", 
    "Barangay IV", "Barangay V", "Barangay VI", "Barangay VII", "Barangay VIII", 
    "Barangay IX", "Rugsuanan", "Raois", "Capangpangan", "Tamag", "Cabalitocan", 
    "Camangaan", "Beddeng Laud", "Bedeng Daya", "Mindoro", "Nagsangalan", 
    "Pantay Fatima", "Pantay Tay-ac", "Paoa", "Pong-ol", "Purok-a-bassit", 
    "Purok-a-dackel", "Raois", "San Jose", "San Julian Norte", "San Julian Sur", 
    "San Pedro", "Saoay"
  ],
  "CANDON": [
    "Bagani", "Bagani Gabor", "Bagani Tocgo", "Bagani Ubbog", "Balingaoan", 
    "Bugnay", "Calaoa-an", "Calongbuyan", "Caterman", "Cubcubbuot", "Darapidap", 
    "Langlangca", "Lussoc", "Manlio", "Nagalangan", "Nagbagbag", "Nagbetted", 
    "Nagsangalan", "Oaig Daya", "Palacapac", "Paras", "Paypayad", "Salvador", 
    "San Agustin", "San Andres", "San Antonio", "San Isidro", "San Jose", 
    "San Juan", "San Nicolas", "San Pedro", "Santa Lucia", "Santo Tomas", 
    "Talbeng", "Tay-ac"
  ],
  "ALILEM": [
    "Alilem Daya", "Amilongan", "An-annam", "Apang", "Apaya", "Batbato", 
    "Daddaay", "Dalawa", "Kiat", "Laang", "Masadipe", "Poblacion", "Saco", 
    "San Juan", "Suyo", "Ubbog"
  ],
  "BANAYOYO": [
    "Bagbagotot", "Banbanaal", "Bisangol", "Cadanglaan", "Casanayan", 
    "Casilagan", "Eleleng", "Guardia", "Lintic", "Lopez", "Montero", 
    "Naguimba", "Poblacion", "Quirino", "Ranget", "Salacpec", "San Jose", 
    "San Juan", "Santa Cruz", "Santiago", "Taleb", "Ubasa"
  ],
  "BANTAY": [
    "Aggay", "An-annam", "Balaleng", "Banaoang", "Bulag", "Buentiempo", 
    "Cabaroan", "Cabugao", "Capitol", "Caoayan", "Guimod", "Lingsat", 
    "Malingeb", "Mira", "Naguiddayan", "Ora", "Paing", "Puro", "Quirino", 
    "Rizal", "Sagneb", "San Isidro", "San Julian", "San Mariano", "San Pedro", 
    "Santa Lucia", "Santo Domingo", "Sapang", "Suca", "Tamurong", "Tay-ac"
  ],
  "BURGOS": [
    "Ambugat", "Balbalayang", "Bangbangar", "Bessang", "Cablisan", "Callitong", 
    "Dayanki", "Lesseb", "Lubing", "Lucaban", "Luna", "Macaoayan", "Mambog", 
    "Manaboc", "Poblacion", "Saoat", "Tabac", "Talia", "Turod"
  ],
  "CABUGAO": [
    "Alinaay", "Aragan", "Arnap", "Baclig", "Bato", "Bonifacio", "Bungro", 
    "Cacadiran", "Cael-layan", "Carusipan", "Catucdaan", "Cuancabal", 
    "Cuantacla", "Daclapan", "Dardarat", "Lipit", "Maradodon", "Margaa", 
    "Nagsantaan", "Nagsincaoan", "Namruangan", "Pila", "Poblacion", "Priesta", 
    "Reyes", "Rizal", "Sabangan", "Salapasap", "Salomague", "Sisim", "Turod"
  ],
  "CAOAYAN": [
    "Anonang", "Baggoc", "Callaguip", "Caparacadan", "Fuerte", "Guimod", 
    "Linao", "Magsaysay", "Naguilian", "Nansuagao", "Panay", "Pandayan", 
    "Patpata", "Sergio", "Sobol", "Tamurong", "Turod", "Vira"
  ],
  "CERVANTES": [
    "Aluling", "Comillas North", "Comillas South", "Concepcion", "Dinwede East", 
    "Dinwede West", "Libang", "Pilipil", "Poblacion", "Remedios", "Rosario", 
    "San Juan", "Villamor"
  ],
  "GALIMUYOD": [
    "Abaya", "Baracbac", "Bidbiday", "Bitong", "Boron", "Cabuloan", "Daldagan", 
    "Kilang", "Lacong", "Lucaban", "Namalangan", "Pacpaco", "Paguetpet", 
    "Poblacion", "Reyes", "San Jose", "San Vicente", "Sibsib", "Soquib", "Ubasa"
  ],
  "GREGORIO DEL PILAR": [
    "Bussot", "Concepcion", "Dapiaw", "Lusong", "Poblacion", "Sulbec"
  ],
  "LIDLIDDA": [
    "Banga", "Balbalabag", "Cacandongan", "Culiong", "Laoingen", "Lemon", 
    "Maglana", "Nagpakalan", "Poblacion", "San Vicente", "Sucoc", "Tay-ac"
  ],
  "MAGSINGAL": [
    "Alangan", "Bacnar", "Barbarit", "Barsat", "Bungro", "Cabalitan", 
    "Cadayogan", "Cristo", "Dacutan", "Labut", "Maas-asin", "Macatcatud", 
    "Malaya", "Mapuroc", "Nagsincaoan", "Namalpalan", "Paldit", "Puro", 
    "San Basilio", "San Clemente", "San Julian", "San Lucas", "San Ramon", 
    "San Vicente", "Santa Monica", "Sarsarac", "Sibbo"
  ],
  "NAGBUKEL": [
    "Balaweg", "Bandril", "Bantugo", "Cadacad", "Casanayan", "Casilagan", 
    "Lapting", "Mapisi", "Poblacion", "Sagayaden", "Turod"
  ],
  "NARVACAN": [
    "Abuor", "Ambulogan", "Aquib", "Bantay Abot", "Bantog", "Baraoas", 
    "Barga", "Batong", "Bicfer", "Bulgara", "Cabangaran", "Cabaruan", 
    "Cabigbigaan", "Cadacad", "Cagayungan", "Capariaan", "Casilagan", 
    "Codoog", "Dasay", "Dinalaoan", "Estancia", "Lanipao", "Lungog", 
    "Margaa", "Marozo", "Naguneg", "Ora", "Paduros", "Pantal", "Paratong", 
    "Parparia", "Quinarayan", "Rivadavia", "San Antonio", "San Jose", 
    "San Pablo", "San Pedro", "Santa Lucia", "Sarmingan", "Sucoc", 
    "Sulvec", "Turod", "Uguis"
  ],
  "QUIRINO": [
    "Banoen", "Caggao", "Capatayan", "Cayus", "Lamag", "Malideg", "Namitpit", 
    "Patiacan", "Legleg", "Suagayan", "Tongotong", "Villaviciosa"
  ],
  "SALCEDO": [
    "Atabay", "Baluarte", "Bubug", "Cabalayangan", "Caggao", "Calangcuasan", 
    "Caudillo", "Concepcion", "Dinaratan", "Lusong", "Mabini", "Maldit", 
    "Malingeb", "Mattu", "Poblacion", "San Gaspar", "San Tiburcio", "Soyong"
  ],
  "SAN EMILIO": [
    "Bacag", "Barangobong", "Batang-buang", "Bugsoc", "Cabaritan", "Cabusligan", 
    "Cadanglaan", "Calamay", "Dinawegan", "Lettac", "Lungon", "Matibuey", 
    "Paltoc", "Pongpong", "San Miliano", "Sibsib", "Tibursag"
  ],
  "SAN ESTEBAN": [
    "Ansad", "Apatot", "Bateria", "Buneg", "Cabaroan", "Cappa-cappa", 
    "Dinaratan", "Lane", "Lapting", "Nagpanaoan", "Poblacion", "San Nicolas", 
    "San Pablo", "San Rafael", "Villa Quirino"
  ],
  "SAN ILDEFONSO": [
    "Bantaoay", "Baun", "Bugnay", "Bungro", "Busabus", "Camatagan", 
    "Capannorian", "Dintar", "Gabor", "Liboy", "Lubong", "Mabanengbeng", 
    "Magsingal", "Namnama", "Olo-olo", "Poblacion", "Sagneb", "Sagpat", 
    "San Julian", "San Vicente", "Santa Monica", "Sapang", "Tay-ac"
  ],
  "SAN JUAN": [
    "Bacsil", "Baliw", "Bannuar", "Barbar", "Cabanglotan", "Cacandongan", 
    "Camanggaan", "Camindoroan", "Caronoan", "Darao", "Dardarat", "Guimod", 
    "Lapong", "Lira", "Malamin", "Mura", "Nagsabaran", "Nagsupotan", 
    "Pandayan", "Poblacion", "Resurreccion", "Sabangan", "San Isidro", 
    "Santo Tomas", "Saracat", "Sinait", "Sulvec", "Tay-ac", "Tubtuba", 
    "Vigan"
  ],
  "SAN VICENTE": [
    "Bantaoay", "Bayubay Norte", "Bayubay Sur", "Cabolalaan", "Lubong", 
    "Poblacion", "San Sebastian", "Saoang", "Tay-ac"
  ],
  "SANTA": [
    "Ambugat", "Banaao", "Basug", "Bucalag", "Cabulalaan", "Calungboyan", 
    "Casiawan", "Dalajican", "Damacuag", "Lubing", "Magsaysay", "Manueva", 
    "Paing", "Poblacion", "Quirino", "Sagayaden", "San Juan", "San Pablo", 
    "San Pedro", "Santiago", "Santo Tomas", "Sived", "Tamorong", "Ubbog"
  ],
  "SANTA CATALINA": [
    "Cabaroan", "Cabuluan", "Pangada", "Paratong", "Poblacion", "Sinabaan", 
    "Tamorong"
  ],
  "SANTA CRUZ": [
    "Abuleg", "Babalasiwan", "Bago", "Bayugao", "Besalan", "Bucalag", 
    "Cabalangan", "Calabugao", "Camanggaan", "Candalican", "Capariaan", 
    "Casilagan", "Coscosnong", "Dalin", "Gabor", "Lantag", "Lublub", 
    "Lucaban", "Mambog", "Oring", "Osmena", "Poblacion", "Quinsoriano", 
    "Quirino", "Rizal", "Sabangan", "San Antonio", "San Jose", "San Pedro", 
    "Saoat", "Sebasti-an", "Sinait", "Tampugo", "Tuquib"
  ],
  "SANTA LUCIA": [
    "Angkileng", "Arnap", "Bani", "Banoen", "Basar", "Bucalag", "Cabalangan", 
    "Capatayan", "Cauplasan", "Concepcion", "Damacuag", "Luba", "Lubong", 
    "Nagrebcan", "Nagtablaan", "Namalangan", "Nambaran", "Nangalisan", 
    "Palali", "Paoc", "Paratong", "Pila", "Poblacion", "Ronda", "Sabuanan", 
    "San Juan", "San Pedro", "Sulbec", "Ubbog", "Vigan"
  ],
  "SANTA MARIA": [
    "Baliw", "Basug", "Bucalag", "Cabalangan", "Calangcuasan", "Calungbuyan", 
    "Capariaan", "Casilagan", "Danuman", "Dunglayan", "Gusing", "Lubong", 
    "Magsaysay", "Malayugan", "Nagsayaoan", "Namagbagan", "Napu", "Pacang", 
    "Poblacion", "Pug-os", "Quirino", "San Antonio", "San Isidro", "San Jose", 
    "San Juan", "San Pedro", "San Rafael", "San Vicente", "Santa Cruz", 
    "Santiago", "Santo Tomas", "Sued", "Tampugo", "Tangaoan", "Tay-ac"
  ],
  "SANTIAGO": [
    "Al-aludig", "Ambucao", "San Jose", "Babalasian", "Balugang", "Banaao", 
    "Bannuar", "Baybayabas", "Biguis", "Bimmuaya", "Bingao", "Bucalag", 
    "Bugnay", "Cabalitan", "Dan-ar", "Lubong", "Mambug", "Nalasin", "Olo-olo", 
    "Poblacion", "Sabangan", "Salincob", "San Roque", "Ubbog"
  ],
  "SANTO DOMINGO": [
    "Binalayan", "Binongan", "Borobor", "Cabaroan", "Calautit", "Camestizoan", 
    "Casili", "Flora", "Lagatit", "Lubong", "Magsaysay", "Malaya", "Naglaoa-an", 
    "Nalasin", "Nambaran", "Nanerman", "Napolitan", "Paguetpet", "Poblacion", 
    "Puerta", "Pussuac", "San Pablo", "San Pedro", "Sapang", "Sulquí", "Suyo"
  ],
  "SIGAY": [
    "Abaccan", "Mabileg", "Matallucod", "Poblacion", "San Elias", "San Ramon", 
    "Seco", "Sibay", "Suyo"
  ],
  "SINAIT": [
    "Ammuag", "Bacag", "Baringcucurong", "Barong", "Bato", "Bulbulala", 
    "Cabulalaan", "Cacadiran", "Calanutian", "Calongbuyan", "Camandingan", 
    "Camanggaan", "Caraisan", "Casma", "Dirdirig", "Kalbay", "Oaig Daya", 
    "Paco", "Paratong", "Poblacion", "Quibit-quibit", "Quimmallogong", 
    "Rang-ay", "Ricudo", "Sabo", "Sagpat", "Santa Cruz", "Sapang", "Tapao", 
    "Teppang", "Ubbog", "Zapat"
  ],
  "SUGPON": [
    "Babanawag", "Caoayan", "Laban", "Poblacion", "Suyo"
  ],
  "SUYO": [
    "Abugao", "Bakaket", "Balballosa", "Concepcion", "Divisoria", "Lussoc", 
    "Mabborang", "Poblacion", "San Luis", "San Vicente", "Santa Cruz", 
    "Uso"
  ],
  "TAGUDIN": [
    "Ag-aguman", "Ambagat", "Baracbac", "Bario-an", "Baro", "Bitalag", 
    "Borono", "Bucao", "Cabulanglangan", "Dacutan", "Dardarat", "Del Pilar", 
    "Farola", "Gabur", "Garitan", "Jardin", "Lacong", "Lantag", "Las-ud", 
    "Libtong", "Lubnac", "Magsaysay", "Malacañang", "Pacac", "Poblacion", 
    "San Miguel", "Saoat", "Sibay", "Suyo", "Tala-octao", "Tandoc", "Tapao", 
    "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5"
  ]
},
 "ILOCOS NORTE": {
  "LAOAG": [
    "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", 
    "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", 
    "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15", 
    "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", 
    "Barangay 21", "Barangay 22", "Barangay 23", "Barangay 24", "Barangay 25", 
    "Barangay 26", "Barangay 27", "Barangay 28", "Barangay 29", "Barangay 30", 
    "Barangay 31", "Barangay 32", "Barangay 33", "Barangay 34", "Barangay 35", 
    "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39", "Barangay 40", 
    "Barangay 41", "Barangay 42", "Barangay 43", "Barangay 44", "Barangay 45", 
    "Barangay 46", "Barangay 47", "Barangay 48", "Barangay 49", "Barangay 50", 
    "Barangay 51", "Barangay 52", "Barangay 53", "Barangay 54", "Barangay 55", 
    "Barangay 56", "Barangay 57", "Barangay 58", "Barangay 59", "Barangay 60", 
    "Barangay 61", "Barangay 62", "Barangay 63", "Barangay 64", "Barangay 65", 
    "Barangay 66", "Barangay 67", "Barangay 68", "Barangay 69", "Barangay 70", 
    "Barangay 71", "Barangay 72", "Barangay 73", "Barangay 74", "Barangay 75", 
    "Barangay 76", "Barangay 77", "Barangay 78", "Barangay 79", "Barangay 80", 
    "Barangay 81", "Apaya", "Aring", "Balacad", "Balatong", "Bequibel", 
    "Bgy. Buttong", "Bil-loca", "Bungon", "Calaoaan", "Camangaan", "Casili", 
    "Cavit", "Darayday", "Dicabasa", "Dilavo", "Dilavo", "Gabu Norte", 
    "Gabu Sur", "La Paz East", "La Paz West", "Lagui", "Lagui", "Mabuti", 
    "Nalbo", "Nangalisan", "Pila", "Raraburan", "Rioeng", "Salet-Bulgara", 
    "San Francisco", "San Mateo", "San Vicente", "Santa Cayetana", "Suyo", 
    "Talingaan", "Tangid", "Vira"
  ],
  "BATAC": [
    "Ablan", "Acosta", "Aglipay", "Baay", "Baligat", "Baoa East", "Baoa West", 
    "Barani", "Ben-agan", "Bil-loca", "Biningan", "Callaguip", "Camandingan", 
    "Camguidan", "Cangrunaan", "Capacuan", "Colo", "Dariwdiw", "Lacub", 
    "Mabaleng", "Magnuang", "Maipalig", "Nagtrigoan", "Palongpong", "Palpalicong", 
    "Parangopong", "Payao", "Pimentel", "Quiling", "Quiom", "Rayuray", "Ricarte", 
    "San Julian", "San Mateo", "San Pedro", "Sarrat", "Sua", "Sumader", 
    "Tabug", "Valdez"
  ],
  "PAOAY": [
    "Bacsil", "Cabuusan", "Calingayan", "Candao", "Dakay", "Darat", "Guisit", 
    "Laoa", "Masintoc", "Monte", "Mumulaan", "Nagbangonan", "Nalasin", 
    "Nanguyudan", "Oaig-Upay", "Pambaran", "Paoay", "Paratong", "Pasil", 
    "Salbang", "San Agustin", "San Blas", "San Juan", "San Pedro", "San Roque", 
    "Sangladan", "Santa Rita", "Sideg", "Suba", "Sulbec", "Surong", "Veronica"
  ],
  "BACARRA": [
    "Bani", "Buyon", "Cabburaan", "Cabaruan", "Cabugao", "Calamay", "Casilian", 
    "Corocor", "Duripes", "Ganagan", "Labut", "Libtong", "Macupit", "Nambaran", 
    "Natba", "Paninaan", "Pasiocan", "Paz", "Pigquiran", "Pungto", "San Agustin", 
    "San Andres", "San Isidro", "San Juan", "San Pedro", "San Simon", "San Vicente", 
    "Santa Filomena", "Santa Rita", "Santo Cristo", "Tamugan", "Tebguen", "Tubburan"
  ],
  "BANGUI": [
    "Abaca", "Bacsil", "Baduang", "Bayubay", "Bingao", "Bulao", "Bungol", 
    "Cabaruan", "Cabaruyan", "Caggao", "Caynan", "Culao", "Dadaor", "Lanao", 
    "Lapaz", "Macupit", "Magsaysay", "Manayon", "Masikil", "Nagbalagan", 
    "Payac", "San Lorenzo", "San Miguel", "Santa Lina", "Santa Rosa", "Taguiporo", 
    "Tay-ac", "Ubong"
  ],
  "BANNA": [
    "Balio", "Bacsil", "Caparispisan", "Canaan", "Caribquib", "Catagtaguen", 
    "Crispina", "Hilario", "Imelda", "Lorenzo", "Macayepyep", "Marcos", 
    "Nagpatayan", "Valdez", "San Isidro", "San Jose", "San Julian", "Santa Cruz", 
    "Santo Niño", "Valenciano", "Virbira"
  ],
  "BURGOS": [
    "Ablan", "Agaga", "Bayog", "Bobon", "Buduan", "Nagsurot", "Paayas", 
    "Pagali", "Poblacion", "Saoit", "Tanap"
  ],
  "CARASI": [
    "Angset", "Barbar", "Cafe", "Calaan", "Carasi", "Dacal", "Libtong", 
    "Macatel", "Mabuti", "Manalpiti", "Masi", "Poblacion", "Sibsib", "Tadao"
  ],
  "CURRIMAO": [
    "Anggapang Norte", "Anggapang Sur", "Bimmanga", "Cabuusan", "Comcomloong", 
    "Gaang", "Lang-ayan-Baramban", "Maglaoi Centro", "Maglaoi Norte", 
    "Maglaoi Sur", "Paguludan", "Pangil", "Pias", "Poblacion I", "Poblacion II", 
    "Salugan", "San Simeon", "Santa Cruz", "Tapao-Tigue", "Torre"
  ],
  "DINGRAS": [
    "Albano", "Bacsil", "Bagut", "Baresbes", "Barong", "Bungcag", "Calabayan", 
    "Capasan", "Dancel", "Foz", "Guerrero", "Lanas", "Lumbad", "Madamba", 
    "Mandaloque", "Medina", "Ver", "Parado", "Peralta", "Puruganan", "Root", 
    "Sagpatan", "Saludares", "San Esteban", "San Francisco", "San Marcelino", 
    "San Marcos", "Sulquiano", "Suyo"
  ],
  "DUMALNEG": [
    "Cabangaran", "Culit", "Dumalneg", "Quibel", "San Isidro"
  ],
  "MARCOS": [
    "Cacafean", "Cadapli", "Cubol", "Escoda", "Ferdinand", "Fortuna", 
    "Lipa", "Mabuti", "Pacifico", "San Pedro", "Santiago", "Tabucbuc", 
    "Valdez"
  ],
  "NUEVA ERA": [
    "Acnam", "Barangobong", "Barikir", "Bugayong", "Cabittauran", "Caray", 
    "Culao", "Darat", "Guiliguili", "Laniaw", "Malay", "Malikes", "Mina-ut", 
    "Poblacion", "Rizal", "San Jose", "San Juan", "Santa Cruz", "Uguis", 
    "Viejo"
  ],
  "PAGUDPUD": [
    "Aguid", "Baduang", "Balaoi", "Burayoc", "Caparispisan", "Caudalan", 
    "Dampig", "Ligaya", "Pancian", "Poblacion", "Saguigui", "Saud", 
    "Subec", "Tarrag"
  ],
  "PASUQUIN": [
    "Batlac", "Binsang", "Caruan", "Carusikis", "Carusipan", "Dadaeman", 
    "Darupidip", "Davila", "Dilavo", "Laoa", "Maglaoi", "Magsaysay", 
    "Mataguisi", "Nagsanga", "Ngabangab", "Pilas", "Poblacion", "Pragata", 
    "Puyupuyan", "Sobol", "Surong", "Susugen", "Tabungao", "Tadao"
  ],
  "PIDDIG": [
    "Ab-abut", "Abraca", "Anao", "Arua-ay", "Bimmanga", "Boyboy", "Cabaroan", 
    "Calambeg", "Callusa", "Dupitac", "Estancia", "Gayamat", "Lagandit", 
    "Libnaoan", "Loing", "Maab-abaca", "Maguiling", "Namuac", "Maruaya", 
    "San Antonio", "Santa Maria", "Sucsuquen", "Tangaoan", "Tonoton"
  ],
  "PINILI": [
    "Aguirre", "Apao", "Bulag", "Buanga", "Cabaroan", "Cabaruan", "Cacafean", 
    "Culiong", "Dilavo", "Estancia", "Lumbad", "Maguet", "Nagtrigoan", 
    "Pagdilao", "Pugaoan", "Puro", "Saoang", "Sulbec", "Uguis", "Valbuena"
  ],
  "SAN NICOLAS": [
    "San Baltazar", "San Bartolome", "San Cayetano", "San Eugenio", "San Fernando", 
    "San Gregorio", "San Guillermo", "San Ildefonso", "San Jose", "San Juan", 
    "San Lorenzo", "San Lucas", "San Marcos", "San Miguel", "San Pablo", 
    "San Paulo", "San Pedro", "San Rufino", "San Silvestre", "Santa Asuncion", 
    "Santa Cecilia", "Santa Elena", "Santa Monica", "Santo Tomas", "San Francisco"
  ],
  "SARRAT": [
    "San Agustin", "San Andres", "San Antonio", "San Bernabe", "San Cristobal", 
    "San Felipe", "San Francisco", "San Isidro", "San Joaquin", "San Jose", 
    "San Juan", "San Leandro", "San Lorenzo", "San Manuel", "San Marcos", 
    "San Nicolas", "San Pedro", "San Roque", "San Vicente", "Santa Barbara", 
    "Santa Magdalena", "Santa Rosa", "Santo Santiago", "Santo Tomas"
  ],
  "SOLSONA": [
    "Aguitap", "Bagbag", "Barcelona", "Bubuos", "Capurictan", "Catangraran", 
    "Daruandac", "Juan", "Laureta", "Lipay", "Maananteng", "Manalpac", 
    "Mariquet", "Nagpatpatan", "Nalasin", "Puttao", "San Juan", "San Julian", 
    "Santa Ana", "Santiago", "Talugtog"
  ],
  "VINTAR": [
    "Alepgo", "Alilia", "Annabuculan", "Asilang", "Bago", "Bulag", "Cabangaran", 
    "Cabayo", "Cabisocolan", "Canaam", "Colabaoan", "Dariwdiw", "Esmagat", 
    "Gabut", "Ipag", "Lalong", "Lebang", "Mabnang", "Macooc", "Magsaysay", 
    "Manarang", "Margaa", "Namoroc", "Malampa", "Parut", "Parparia", "Salsalamagui", 
    "San Jose", "San Nicolas", "San Pedro", "San Ramon", "San Roque", "Santa Maria", 
    "Tamdagan", "Visaya"
  ],
  "ADAMS": [
    "Adams", "Bulag", "Cabaruan", "Cadapli", "Linao", "Mabuti", "Nagpatpatan", 
    "Poblacion"
  ],
  "BADOC": [
    "Alogoog", "Aring", "Balbaldez", "Bato", "Cabulalaan", "Cabusligan", 
    "Caraitan", "Gabut Norte", "Gabut Sur", "Garreta", "La Virgen Milagrosa", 
    "Labut", "Lacuben", "Lubigan", "Mabusag Norte", "Mabusag Sur", "Madupayas", 
    "Morong", "Nagrebcan", "Napu", "Pagsanahan Norte", "Pagsanahan Sur", 
    "Paltit", "Parang", "Pasuc", "Santa Cruz Norte", "Santa Cruz Sur", 
    "Saud", "Turod"
  ]
},
"PANGASINAN": {
  "ALAMINOS": [
    "Alos", "Amandiego", "Amangbangan", "Balangobong", "Balayang", "Bisocol", 
    "Bolaney", "Bued", "Cabatuan", "Cayucay", "Dulacac", "Inerangan", 
    "Landoc", "Linmansangan", "Lucap", "Maawi", "Macatiw", "Magsaysay", 
    "Mona", "Palamis", "Pandan", "Pangapisan", "Poblacion", "Pocalpocal", 
    "Pogo", "Polo", "Quibuar", "Sabangan", "San Antonio", "San Jose", 
    "San Roque", "San Vicente", "Santa Maria", "Tanaytay", "Tangcarang", 
    "Tawin-tawin", "Telbang", "Victoria"
  ],
  "AGNO": [
    "Allabon", "Aloleng", "Bangan-Oda", "Baruan", "Bayabas", "Cayungnan", 
    "Dangley", "Gayusan", "Macaboboni", "Magsaysay", "Namaltangan", 
    "Patar", "Poblacion East", "Poblacion West", "San Juan", "Tupa", 
    "Viga"
  ],
  "AGUILAR": [
    "Bayaoas", "Baybay", "Bocacliw", "Bocboc East", "Bocboc West", 
    "Buer", "Calsib", "Niñoy", "Panacol", "Poblacion", "Pogomboa", 
    "Potot", "San Jose", "Tampac", "Tanolong", "Umingan"
  ],
  "ALCALA": [
    "Alos", "Amancoro", "Bantog", "Baybay", "Bersamin", "Cabulalaan", 
    "Cacaritan", "Calaoagan", "Caranglaan", "Curareng", "Gualsic", 
    "Kasikis", "Labney", "Mabangon", "Macayo", "Pindangan", "Poblacion", 
    "San Juan", "San Nicolas", "San Pedro", "San Vicente", "Tombod", 
    "Villegas"
  ],
  "ANDA": [
    "Awile", "Awag", "Badiang", "Brasil", "Carot", "Dolaoan", "Imbo", 
    "Macaleeng", "Mal-ong", "Namagbagan", "Poblacion", "Roxas", "Sablig", 
    "San Jose", "Siapar", "Tondol", "Toritori"
  ],
  "ASINGAN": [
    "Ariston Este", "Ariston Weste", "Bantog", "Baro", "Bogtoc", "Cabalitian", 
    "Calepaan", "Carosucan Norte", "Carosucan Sur", "Coldit", "Domanpot", 
    "Dupac", "Macalong", "Palaris", "Poblacion East", "Poblacion West", 
    "San Vicente", "Santa Lucia", "Topdac", "Zamora"
  ],
  "BALUNGAO": [
    "Angayan", "Cabaruan", "Calingcuan", "Carosalesan", "Esmeralda", 
    "Kitang", "Mabini", "Mauban", "Poblacion", "Pugaro", "Rajal", 
    "San Aurelio 1st", "San Aurelio 2nd", "San Aurelio 3rd", "San Miguel", 
    "San Vicente", "Sta. Maria"
  ],
  "BANI": [
    "Ambabaay", "Aporao", "Arwas", "Ballag", "Banaan", "Bancagan", 
    "Barlo", "Bataquil", "Buang", "Calcutta", "Centro Toma", "Colayo", 
    "Dacap Norte", "Dacap Sur", "Garrita", "Luac", "Macabit", "Masidem", 
    "Mobia", "Nibaliw", "Nibaliw East", "Nibaliw West", "Poblacion", 
    "Quinaoayanan", "Ranao", "Ranom Iloco", "San Jose", "San Miguel", 
    "San Simon", "San Vicente", "Tara", "Tocok", "Viga"
  ],
  "BASISTA": [
    "Anambongan", "Bacnono", "Bayoyong", "Cabeldatan", "Dumpay", "Malimpec", 
    "Mapolopolo", "Nalneran", "Naval", "Obong", "Osmeña", "Pangalangan", 
    "Poblacion", "San Pedro", "Villages"
  ],
  "BAUTISTA": [
    "Artacho", "Baluyot", "Cabuaan", "Cacandongan", "Diaz", "Nandacan", 
    "Nibaliw", "Palisoc", "Poblacion East", "Poblacion West", "Primicias", 
    "Santa Catalina", "Santa Rosa", "Villacorta", "Villanueva"
  ],
  "BAYAMBANG": [
    "Alangagan", "Amamperez", "Amancosiling Norte", "Amancosiling Sur", 
    "Ambayat", "Apalen", "Asin", "Ataynan", "Bacnono", "Balanday", 
    "Bani", "Batangcawa", "Beleng", "Bical Norte", "Bical Sur", "Bongato East", 
    "Bongato West", "Buayaen", "Buenlag", "Bueno", "Cabayaoasan", "Carungay", 
    "Caturay", "Darawey", "Duera", "Dusoc", "Hermosa", "Idong", "Inanlorenzana", 
    "Iton", "Langiran", "Ligue", "M. H. del Pilar", "Macayocayo", "Magsaysay", 
    "Maigpa", "Malimpec", "Malioer", "Managos", "Manambong Norte", "Manambong Parte", 
    "Manambong Sur", "Mangayao", "Nalsian Norte", "Nalsian Sur", "Pangdel", 
    "Pantol", "Paragos", "Poblacion Sur", "Pugo", "Reynado", "San Gabriel", 
    "San Vicente", "Sangcagulis", "Sanlibo", "Sapang", "Tamaro", "Tambac", 
    "Tampog", "Tanolong", "Tatarao", "Telbang", "Tococ", "Tococ East", 
    "Tococ West", "Warding", "Wawa", "Zone I", "Zone II", "Zone III", 
    "Zone IV", "Zone V", "Zone VI", "Zone VII"
  ],
  "BINALONAN": [
    "Balangobong", "Bued", "Bugayong", "Camililing", "Canarvacanan", 
    "Capas", "Cili", "Dumayat", "Linmansangan", "Mangcasuy", "Moreno", 
    "Paitan", "Pangley", "Papagueyan", "Poblacion", "San Felipe", 
    "San Pablo", "Santa Catalina", "Santo Niño", "Tebuel", "Vaccation", 
    "Viejo"
  ],
  "BINMALEY": [
    "Amancoro", "Bacayao Norte", "Bacayao Sur", "Balagan", "Balogo", 
    "Basing", "Baybay Lopez", "Baybay Polong", "Biec", "Buenglat", 
    "Calit", "Caloocan Norte", "Caloocan Sur", "Camaley", "Canaoalan", 
    "Dulag", "Gayaman", "Linoc", "Lomboy", "Nagpalangan", "Naguilayan", 
    "Pallas", "Papagueyan", "Parayao", "Poblacion", "Potpot", "Sabangan", 
    "Salapingao", "San Isidro Norte", "San Isidro Sur", "Santa Rosa", 
    "Tombor"
  ],
  "BOLINAO": [
    "Arnedo", "Balingasay", "Binabalian", "Cabaruan", "Catuday", "Caudillo", 
    "Concordia", "Culang", "Dewey", "Estanza", "Germinal", "Goyoden", 
    "Ilog Malino", "Ilog Matino", "Lambes", "Liwa-liwa", "Lucero", 
    "Luciente 1.0", "Luciente 2.0", "Luna", "Patar", "Pilar", "Salvador", 
    "Samang Norte", "Samang Sur", "Sampaloc", "San Roque", "Tara", "Tupa", 
    "Victory", "Zaragoza"
  ],
  "BUGALLON": [
    "Angarian", "Asinan", "Banaga", "Bolaoen", "Buayaen", "Cabalitian", 
    "Cayanga", "Gueguesangen", "Hacienda", "Laguit Centro", "Laguit Padilla", 
    "Magtaking", "Pangascasan", "Poblacion", "Polong", "Portic", "Salasa", 
    "Salomague", "San Isidro", "Umanday"
  ],
  "BURGOS": [
    "Anapao", "Cacayasen", "Concordia", "Ilio-ilio", "Papallasen", 
    "Poblacion", "San Miguel", "San Pascual", "San Vicente", "Sapa", 
    "Tambacan"
  ],
  "CALASIAO": [
    "Ambuetel", "Bacnono", "Bued", "Cabilocaan", "Dinalaoan", "Lumbang", 
    "Macabito", "Malabago", "Mancup", "Nagsaing", "Nalsian", "Poblacion", 
    "Quesban", "San Miguel", "Talbeng", "Tobor", "Tococ"
  ],
  "DAGUPAN": [
    "Bacayao Norte", "Bacayao Sur", "Barangay I", "Barangay II", "Barangay III", 
    "Barangay IV", "Barangay V", "Barangay VI", "Barangay VII", "Barangay VIII", 
    "Barangay IX", "Barangay X", "Barangay XI", "Barangay XII", "Barangay XIII", 
    "Barangay XIV", "Barangay XV", "Barangay XVI", "Barangay XVII", "Barangay XVIII", 
    "Barangay XIX", "Barangay XX", "Barangay XXI", "Barangay XXII", "Barangay XXIII", 
    "Barangay XXIV", "Barangay XXV", "Barangay XXVI", "Barangay XXVII", "Barangay XXVIII", 
    "Barangay XXIX", "Barangay XXX", "Barangay XXXI", "Bolosan", "Bonuan Binloc", 
    "Bonuan Boquig", "Bonuan Gueset", "Carael", "Herrero", "Lasip Chico", 
    "Lasip Grande", "Lomboy", "Lucao", "Malued", "Mamalingling", "Mangin", 
    "Mayombo", "Pantal", "Poblacion Oeste", "Salapingao", "Salisay", "Tambac"
  ],
  "DASOL": [
    "Alilao", "Amalbalan", "Bobonot", "Eguia", "Gais-Guipe", "Hermosa", 
    "Macalang", "Magsaysay", "Malacapas", "Malimpin", "Osmeña", "Petal", 
    "Poblacion", "San Vicente", "Tambo", "Tocok"
  ],
  "INFANTA": [
    "Bamban", "Batol", "Bayambang", "Cato", "Doliman", "Fatima", "Nangalisan", 
    "Pita", "Poblacion", "Potol", "Sobol", "Toboy", "Ungib"
  ],
  "LABRADOR": [
    "Bana-ao", "Bongalon", "Dulig", "Gomez", "Laois", "Magsaysay", 
    "Poblacion", "San Felipe", "San Gonzalo", "San Jose", "Tobuan", 
    "Uyong"
  ],
  "LINGAYEN": [
    "Aliwekwek", "Baay", "Balangobong", "Balococ", "Bantayan", "Basing", 
    "Capandanan", "Domalandan Center", "Domalandan East", "Domalandan West", 
    "Dorongan", "Dulag", "Estanza", "Lasip", "Libsong East", "Libsong West", 
    "Malawa", "Malimpuec", "Maniboc", "Matalava", "Naguelguel", "Namolan", 
    "Pangapisan North", "Pangapisan Sur", "Poblacion", "Quibaol", "Rosario", 
    "Sabangan", "Talogtog", "Tonton", "Tumbar", "Wawa"
  ],
  "MABINI": [
    "Bacnit", "Barlo", "Caabiangaan", "Cabanaetan", "Cabinuangan", 
    "Calzada", "Caranglaan", "De Guzman", "Luna", "Magalong", "Nibaliw", 
    "Patar", "Poblacion", "San Pedro", "Tagudin", "Villacorta"
  ],
  "MALASIQUI": [
    "Abonagan", "Agdao", "Alacan", "Aliaga", "Amacalan", "Anolid", 
    "Apaya", "Asin Este", "Asin Weste", "Bacundao Este", "Bacundao Weste", 
    "Bakitiw", "Balite", "Banawang", "Barang", "Bawer", "Binalay", 
    "Bobon", "Bolaoit", "Bongar", "Butao", "CabatuAN", "Cabueldatan", 
    "Calbueg", "Canan Norte", "Canan Sur", "Cawayan Bogtong", "Don Pedro", 
    "Gatang", "Goliman", "Gomez", "Guileb", "Ican", "Inlambo", "Lareg-lareg", 
    "Lasip", "Lepa", "Loqueb Este", "Loqueb Weste", "Lunec", "Mabulitec", 
    "Malimpec", "Manggan-Dampay", "Nalsian", "Nansangaan", "Olea", "Pacuan", 
    "Palapar Norte", "Palapar Sur", "Palong", "Pamaranum", "Pasima", 
    "Payar", "Poblacion", "Polong Norte", "Polong Sur", "Potiocan", 
    "San Julian", "Tabo-Sili", "Tocok", "Vegues", "Viillanueva", "Waig"
  ],
  "MANAOAG": [
    "Bacnit", "Baritao", "Bisal", "Bucao", "Cabanbanan", "Calawit", 
    "Inamotan", "Lelemaan", "Licsi", "Lipit Norte", "Lipit Sur", "Matolong", 
    "Mermer", "Nalsian", "Oraan East", "Oraan West", "Pacdal", "Palid", 
    "Panganiban", "Parian", "Poblacion", "San Ramon", "Santa Cruz", 
    "Sapang", "Tebuel", "Tulnac"
  ],
  "MANGALDAN": [
    "Alitaya", "Amansabina", "Anolid", "Banaoang", "Bantayan", "Bari", 
    "Bateng", "Buenlag", "David", "Embarcadero", "Gueguesangen", "Guesang", 
    "Guiguilonen", "Guilig", "Inlambo", "Lanas", "Landas", "Maasin", 
    "Macayug", "Malabago", "Navaluan", "Nibaliw", "Osiem", "Palua", 
    "Poblacion", "Pogo", "Salay", "Talbeng", "Tebag"
  ],
  "MANGATAREM": [
    "Andangin", "Arellano Street", "Bantay", "Bantocaling", "Baracbac", 
    "Bogtong Bolo", "Bogtong Bunao", "Bogtong Centro", "Bogtong Niog", 
    "Bogtong Silag", "Buaya", "Buenlag", "Bueno", "Bunagan", "Bunlalacao", 
    "Burgos Street", "Cabaluyan 1st", "Cabaluyan 2nd", "Cabarabuan", 
    "Cabayaoasan", "Cabayugan", "Cabisilan", "Cacaoiten", "Calumboyan Norte", 
    "Calumboyan Sur", "Canaan", "Capandanan", "Carangian", "Cayabyab", 
    "Cayanan", "Cayasan", "Don Pedro", "Gangan", "General Luna", "Guesang", 
    "Guevara Street", "Guiguilonen", "Guilig", "Inlambo", "Lanas", 
    "Landas", "Lapero", "Lepa", "Loqueb Este", "Loqueb Weste", "Lunec", 
    "Mabini", "Macayug", "Malabago", "Malanay", "Malawi", "Mangin", 
    "Marmol", "Mendez", "Naguilayan", "Nibaliw", "Osiem", "Paco", 
    "Paglabanan", "Palanas", "Paldit", "Palua", "Poblacion", "Pogo", 
    "Pogoru", "Real", "Rizal", "Salavante", "Salay", "San Agustin", 
    "San Andres", "San Antonio", "San Carlos", "San Francisco", "San Isidro", 
    "San Jose", "San Juan", "San Miguel", "San Nicolas", "San Pedro", 
    "San Ramon", "San Vicente", "Santa Maria", "Sapang", "Sinabaan", 
    "Talbeng", "Tebag", "Tococ", "Togedo", "Torres", "Umangan", "Zamora"
  ],
  "MAPANDAN": [
    "Amina", "Balanoy", "Coral", "Golden", "Jimenez", "Lambayan", 
    "Nilombot", "Poblacion", "Primicias", "Santa Maria", "Torres"
  ],
  "NATIVIDAD": [
    "Barangobong", "Batchelor East", "Batchelor West", "Burgos", "Cacandungan", 
    "Calapugan", "Canarem", "Luna", "Poblacion East", "Poblacion West", 
    "Rizal", "Salud", "San Eugenio", "San Macario", "San Maximo", 
    "San Miguel", "Silag"
  ],
  "POZORRUBIO": [
    "Alipangpang", "Amagbagan", "Balacag", "Banding", "Bantugan", 
    "Batang", "Bued", "Cablong", "Castillo", "Dilan", "Don Benito", 
    "Haway", "Imbalbalatong", "Inoman", "Lobong", "Malokiat", "Managos", 
    "Nantangalan", "Palacpalac", "Paldit", "Palguyod", "Poblacion", 
    "Rosario", "Sugcong", "Talogtog", "Tococ", "Tulnac", "Villagracia", 
    "Villamar"
  ],
  "ROSALES": [
    "Acop", "Balingcanaway", "Bari", "Bayambang", "Burgos", "Carmay", 
    "Don Antonio Village", "Guiling", "Pallac", "Panganiban", "Zone I", 
    "Zone II", "Zone III", "Zone IV", "Zone V"
  ],
  "SAN CARLOS": [
    "Alongalong", "Ambalangan", "Balaya", "Balayong", "Baldog", "Balite Sur", 
    "Bani", "Bical", "Bogaoan", "Bolingit", "Bued", "Cabalitian", 
    "Cacaritan", "Caingal", "Calobaoan", "Camlutan", "Capataan", "Cobol", 
    "Coliling", "Curareng", "Dinalaoan", "Landoc", "Lepa", "Libas", 
    "Lunec", "Mabalbalino", "Mabalite", "Malacañang", "Maliwara", "Mamarlao", 
    "Manzon", "Matagdem", "Mestizo Norte", "Naguilayan", "Nilentap", 
    "Padre Garcia", "Pagal", "Palaming", "Palaris", "Palospos", "Pangalangan", 
    "Pangoloan", "Pangpang", "Paitan", "Poblacion", "Quezon", "Quintong", 
    "Rizal", "Roxas", "San Juan", "San Pedro", "Saul", "Sobol", "Tagac", 
    "Tandoc", "Tarece", "Tarectec", "Tayambani", "Tebag", "Turac", "Anando"
  ],
  "SAN FABIAN": [
    "Alacan", "Ambalangan-Dalin", "Angio", "Anonang", "Aramal", "Bigbiga", 
    "Binday", "Bolo", "Bolaoen", "Cabaruan", "Cayanga", "Colisao", 
    "Gomot", "Inmalog", "Lelemaan", "Lipit-Tomeeng", "Longos", "Mabilao", 
    "Nibaliw", "Palapad", "Poblacion", "Rabon", "Sagud-Bahley", "Sobol", 
    "Tempra-Guilig", "Tiblong", "Tocok"
  ],
  "SAN JACINTO": [
    "Awai", "Bolo", "Capaoay", "Casibong", "Guibel", "Imelda", 
    "Labney", "Magsaysay", "Poblacion", "San Guillermo", "San Juan", 
    "San Roque", "San Vicente", "Santa Cruz", "Santo Tomas"
  ],
  "SAN MANUEL": [
    "Baracbac", "Cabaluyan", "Cabaruan", "Flores", "Guiset", "Nagsaing", 
    "Nampalcan", "Narvas", "San Bonifacio", "San Juan", "San Roque", 
    "San Vicente", "Santa Maria", "Sindalan"
  ],
  "SAN NICOLAS": [
    "Alianza", "Bensican", "Cabitin", "Cacabugaoan", "Calaocan", "Camanggaan", 
    "Camindoroan", "Casaratan", "Dalumpinas", "Fianza", "Malico", 
    "Nagkaysa", "Nining", "Poblacion East", "Poblacion West", "Salapingao", 
    "San Felipe", "San Francisco", "San Isidro", "San Jose", "San Rafael", 
    "San Roque", "Santa Maria", "Santo Tomas", "Siblot", "Sobol", 
    "Tayac"
  ],
  "SAN QUINTIN": [
    "Alac", "Baligayan", "Bantog", "Bulag", "Cabalaoangan", "Calomboyan", 
    "Carayacan", "Casantamariaan", "Gonzalo", "Labuan", "Lagasit", 
    "Lumayao", "Mabini", "Mantacdang", "Nangapugan", "Poblacion", 
    "San Pedro", "Ungib"
  ],
  "SANTA BARBARA": [
    "Alibago", "Balingueo", "Banaoang", "Banzal", "Botao", "Cablong", 
    "Carusocan", "Dalongue", "Erfe", "Gueguesangen", "Leet", "Malanay", 
    "Maningding", "Maronong", "Maticmatic", "Minien East", "Minien West", 
    "Nilombot", "Patayac", "Payas", "Poblacion", "Sapang", "Sonquil", 
    "Tebag", "Tuliao"
  ],
  "SANTA MARIA": [
    "Bal-loy", "Bantog", "Bued", "Cabalitian", "Cal-litang", "Capandanan", 
    "Cauplasan", "Dalayap", "Libsong", "Namagbagan", "Paitan", "Pataquid", 
    "Poblacion", "Pugot", "San Alejandro", "San Mariano", "San Pablo", 
    "San Patricio", "San Vicente", "Santa Cruz", "Santa Rosa", "Santo Niño", 
    "Sapang", "Villabuena"
  ],
  "SANTO TOMAS": [
    "La Luna", "Poblacion", "Salvacion", "San Agustin", "San Antonio", 
    "San Jose", "San Miguel", "Santo Domingo", "Santo Niño"
  ],
  "SISON": [
    "Agat", "Alibeng", "Amagbagan", "Artacho", "Asan Norte", "Asan Sur", 
    "Bantay Insik", "Bila", "Binmeckeg", "Bulaoen", "Cablong", "Calunetan", 
    "Camangaan", "Cauringan", "Dungon", "Esperanza", "Killo", "Labayug", 
    "Paldit", "Panganiban", "Poblacion Norte", "Poblacion Sur", "Sagunto", 
    "Tara-tara"
  ],
  "SUAL": [
    "Baquioen", "Baybay Norte", "Baybay Sur", "Bolaoen", "Cabalitian", 
    "Calumbuyan", "Camagsingalan", "Caoayan", "Capantolan", "Macaycayawan", 
    "Paitan East", "Paitan West", "Pangascasan", "Poblacion", "San Vicente", 
    "Santo Domingo", "Seselangen", "Sioasio East", "Sioasio West", 
    "Victoria"
  ],
  "TAYUG": [
    "Barangobong", "Carriedo", "C. Lichauco", "Evangelista", "Guzon", 
    "Lawak", "Legaspi", "Libertad", "Magallanes", "Panganiban", "Poblacion", 
    "Saleng", "Santo Domingo", "Toketec", "Trento", "Zamora"
  ],
  "UMINGAN": [
    "Abot Molina", "Alo-o", "Amaronan", "Annague", "Bantug", "Baracbac", 
    "Barat", "Buenavista", "Cabalitian", "Cabangaran", "Cabaruan", 
    "Cabatan", "Cadiz", "Calitlitan", "Capas", "Carayungan", "Carosalesan", 
    "Casanfernandoan", "Casanfuenteban", "Cataisan", "Cupang", "Dacap", 
    "Diket", "Don Justo Abalos", "Don Montano", "Esperanza", "Evangelista", 
    "Garcia", "Gomez", "Inmalog", "Luna", "Mabini", "Maseil-seil", 
    "Nampalcan", "Nancalabasaan", "Pangangaan", "Papallasen", "Pemienta", 
    "Poblacion", "Prado", "Resurreccion", "Ricos", "San Andres", 
    "San Angel", "San Juan", "San Leon", "San Pablo", "San Vicente", 
    "Santa Maria", "Santa Rosa", "Santo Domingo", "Sapang", "Segundo", 
    "Solano", "Tombod", "Torre", "Union"
  ],
  "URBIZTONDO": [
    "Angatel", "Batac", "Baug", "Bayaoas", "Bituag", "Camambugan", 
    "Dalangiring", "Duplac", "Galarin", "Gueteb", "Malaca", "Malayo", 
    "Malibong", "Pangascasan", "Poblacion", "Real", "Salavante", "San Pascual", 
    "San Vicente", "Silva", "Talbeng", "Tampog", "Unzad"
  ],
  "URDANETA": [
    "Anonas", "Bactad East", "Bactad West", "Bayaoas", "Bolaoen", 
    "Cabalitian", "Cabusao", "Camantiles", "Casantaan", "Catablan", 
    "Cayambanan", "Consolacion", "Dilan Paurido", "Labit Proper", 
    "Labit West", "Mabanogbog", "Macalong", "Nancalabasaan", "Nancamaliran East", 
    "Nancamaliran West", "Nancayasan", "Oltama", "Palina East", "Palina West", 
    "Pinmaludpod", "Poblacion", "San Jose", "San Vicente", "Santa Lucia", 
    "Santo Domingo", "Sugcong", "Tiposu", "Tulong"
  ],
  "VILLASIS": [
    "Amamperez", "Bacag", "Barangobong", "Barraca", "Capulaan", "Caramutan", 
    "La Paz", "Labit", "Lipay", "Lomboy", "Piaz", "Poblacion", "San Blas", 
    "San Nicolas", "Sonquil", "Unzad"
  ]
}
};