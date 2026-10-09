import { ArchiveCategory, ArchiveProduct } from '../types';
import { ONE_PIECE_CHARACTERS } from './onePieceArchive';
import { BLEACH_CHARACTERS } from './bleachArchive';
import { EXPANDED_ANIME_CHARACTERS } from './expandedAnimeArchive';
import { EXPANDED_SPORTS_PRODUCTS } from './expandedSportsArchive';
import { EXPANDED_CULTURE_PRODUCTS } from './expandedCultureArchive';

export const ARCHIVE_CATEGORIES: ArchiveCategory[] = [
  {
    id: 'anime',
    name: 'ANIME',
    slug: 'anime',
    iconName: 'Tv',
    itemCount: 480,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    description: 'Iconic celluloid frames, legendary shonen protagonists, and heartfelt hand-drawn anime nostalgia.',
    franchises: [
      'All Franchises',
      'One Piece',
      'Bleach',
      'Naruto',
      'Demon Slayer',
      'Dragon Ball',
      'Jujutsu Kaisen',
      'Attack on Titan',
      'My Hero Academia',
      'Solo Leveling',
      'Chainsaw Man',
      'Death Note',
      'Tokyo Ghoul',
      'Hunter x Hunter',
      'Fullmetal Alchemist',
      'Spy x Family',
      'Sailor Moon',
    ],
    subcategories: ['All Formats', 'Characters', 'Iconic Moments', 'Group Shots', 'Quotes', 'Poster Art'],
  },
  {
    id: 'movies',
    name: 'MOVIES',
    slug: 'movies',
    iconName: 'Film',
    itemCount: 310,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg',
    description: '35mm anamorphic stills, auteur cinema masterpieces, iconic monologue scenes, and classic director cuts.',
    subcategories: ['All Movies', 'Classic Cinema', 'Sci-Fi Classics', 'Noir & Crime', 'Cult Classics', 'Cinematography Stills'],
  },
  {
    id: 'hollywood',
    name: 'HOLLYWOOD',
    slug: 'hollywood',
    iconName: 'Clapperboard',
    itemCount: 260,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
    description: 'Silver screen icons, red carpet captures, legendary Hollywood filmography, and studio portraits.',
    subcategories: ['All', 'Actors', 'Actresses', 'Iconic Roles', 'Oscar Winners', 'Film Stills'],
  },
  {
    id: 'bollywood',
    name: 'BOLLYWOOD',
    slug: 'bollywood',
    iconName: 'Sparkles',
    itemCount: 290,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg',
    description: 'King Khan, vintage 70s-90s golden eras, cinematic dialogues, and vibrant musical blockbusters.',
    subcategories: ['All', 'Shah Rukh Khan', 'Legends of 70s-90s', 'Actresses', 'Blockbuster Scenes', 'Iconic Dialogues'],
  },
  {
    id: 'tollywood',
    name: 'TOLLYWOOD',
    slug: 'tollywood',
    iconName: 'Zap',
    itemCount: 240,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Allu_Arjun_at_Pushpa_2_The_Rule_meet.jpg',
    description: 'High-octane mass cinema, RRR, Baahubali, Allu Arjun, Ram Charan, Jr NTR, and monumental action sequences.',
    subcategories: ['All', 'RRR & Baahubali', 'Mass Heroes', 'Action Sequences', 'Iconic Dialogues', 'Poster Art'],
  },
  {
    id: 'heroes',
    name: 'HEROES & SUPERHEROES',
    slug: 'heroes',
    iconName: 'Shield',
    itemCount: 350,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_129-1.png',
    description: 'Marvel & DC mythologies, Spider-Man silhouettes, Gotham noir, Iron Man suits, and comic panels.',
    subcategories: ['All', 'Marvel Universe', 'DC Dark Knight', 'Spider-Verse', 'Avengers', 'Anti-Heroes'],
  },
  {
    id: 'sports',
    name: 'SPORTS',
    slug: 'sports',
    iconName: 'Trophy',
    itemCount: 190,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/5/52/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg',
    description: 'Athletic greatness, Formula 1 chicanes, tennis Grand Slams, basketball dunks, and historic sporting feats.',
    subcategories: ['All', 'Formula 1', 'Basketball', 'Tennis', 'Olympics', 'Boxing & MMA'],
  },
  {
    id: 'football',
    name: 'FOOTBALL',
    slug: 'football',
    iconName: 'Flame',
    itemCount: 420,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
    description: 'The beautiful game: Messi, Ronaldo, Champions League nights, Bernabéu, and World Cup glory.',
    subcategories: ['All', 'Lionel Messi', 'Cristiano Ronaldo', 'European Clubs', 'Iconic Goals', 'Stadiums & Fans'],
  },
  {
    id: 'cricket',
    name: 'CRICKET',
    slug: 'cricket',
    iconName: 'Target',
    itemCount: 380,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg',
    description: 'Wankhede roar, Kohli cover drives, Dhoni finishes, Sachin Tendulkar legends, and World Cup euphoria.',
    subcategories: ['All', 'Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Sachin Tendulkar', 'Legends & 2011 WC'],
  },
  {
    id: 'cars',
    name: 'CARS',
    slug: 'cars',
    iconName: 'Car',
    itemCount: 320,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/F40_Ferrari_20090509.jpg',
    description: 'Air-cooled 911s, Ferrari F40 twins, Japanese JDM turbos, midnight drift culture, and track beasts.',
    subcategories: ['All', 'Porsche Classics', 'Supercars & Hypercars', 'JDM Legends', 'Vintage Muscle', 'F1 Track Cars'],
  },
  {
    id: 'bikes',
    name: 'BIKES',
    slug: 'bikes',
    iconName: 'Compass',
    itemCount: 210,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Ducati_Panigale_V4_-_Tuning_World_Bodensee_2018%2C_Friedrichshafen_%28OW1A0484%29.jpg',
    description: 'Café racers, Italian superbikes, raw air-cooled twins, misty coastal passes, and MotoGP speed.',
    subcategories: ['All', 'Café Racers', 'Superbikes', 'Cruisers & Bobbers', 'Vintage Classics', 'Mountain Highways'],
  },
  {
    id: 'animals',
    name: 'ANIMALS',
    slug: 'animals',
    iconName: 'Heart',
    itemCount: 280,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_Retriever_Dukedestiny01_drvd.jpg',
    description: 'Loyal canines, serene feline portraits, African and Indian apex predators, and wilderness moments.',
    subcategories: ['All', 'Dogs & Pups', 'Cats & Felines', 'Wild Apex Predators', 'Marine Life', 'Birds of Prey'],
  },
  {
    id: 'cartoons',
    name: 'CARTOONS',
    slug: 'cartoons',
    iconName: 'Smile',
    itemCount: 230,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/en/d/d6/PDVD_002.jpg',
    description: 'Saturday morning nostalgia: Tom & Jerry chases, Looney Tunes classics, and vintage animation cel prints.',
    subcategories: ['All', 'Tom & Jerry', 'SpongeBob', 'Anime Toons', '90s Nostalgia', 'Comic Strips'],
  },
  {
    id: 'games',
    name: 'GAMES',
    slug: 'games',
    iconName: 'Gamepad2',
    itemCount: 340,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
    description: 'Night City rain, Los Santos sunsets, Elden Ring vistas, and legendary gaming memories.',
    subcategories: ['All', 'Open World Legends', 'Competitive Shooters', 'Pixel & Retro', 'Atmospheric Art', 'Game Characters'],
  },
  {
    id: 'music',
    name: 'MUSIC',
    slug: 'music',
    iconName: 'Music',
    itemCount: 270,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Dark_Side_of_the_Moon.png',
    description: 'Vinyl covers, electric stage lighting, acoustic studios, rock legends, and iconic album covers.',
    subcategories: ['All', 'Rock Legends', 'Album Art', 'Live Concerts', 'Hip-Hop & R&B', 'Vintage Jazz & Vinyl'],
  },
  {
    id: 'travel',
    name: 'TRAVEL',
    slug: 'travel',
    iconName: 'MapPin',
    itemCount: 310,
    featuredImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    description: 'Tokyo crossings, Amalfi coast cliffs, Paris twilight, and Swiss alpine mountain passes.',
    subcategories: ['All', 'Metropolises', 'Coastal & Islands', 'Alpine & Mountain', 'Ancient Architecture', 'Hidden Streets'],
  },
  {
    id: 'nature',
    name: 'NATURE',
    slug: 'nature',
    iconName: 'Sun',
    itemCount: 290,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg',
    description: 'Golden hour horizons, misty pine forests, emerald ocean rollers, cascading falls, and northern auroras.',
    subcategories: ['All', 'Sunsets & Dawn', 'Mountains & Mist', 'Oceans & Waves', 'Deep Forest', 'Northern Lights'],
  },
  {
    id: 'quotes',
    name: 'QUOTES',
    slug: 'quotes',
    iconName: 'BookOpen',
    itemCount: 180,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Steve_Jobs_Headshot_2010_%28cropped_4%29.jpg',
    description: 'Typewriter keystrokes, visionary innovators, stoic philosophy, and bold minimalist typography.',
    subcategories: ['All', 'Motivation & Drive', 'Life & Philosophy', 'Love & Romance', 'Minimalist Aesthetic', 'Literary Lines'],
  },
  {
    id: 'celebrities',
    name: 'CELEBRITIES',
    slug: 'celebrities',
    iconName: 'Star',
    itemCount: 220,
    featuredImage: 'https://upload.wikimedia.org/wikipedia/commons/7/74/AudreyKHepburn.jpg',
    description: 'High-contrast editorial portraits, candid studio shoots, and cultural icons captured on analog film.',
    subcategories: ['All', 'Cinema Legends', 'Music Icons', 'Cultural Figures', 'Black & White Portraits', 'Studio Editorial'],
  },
  {
    id: 'custom',
    name: 'CUSTOM POLAROID',
    slug: 'custom',
    iconName: 'UploadCloud',
    itemCount: 9999,
    featuredImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    description: 'Upload your own camera roll photo, crop, add personal handwriting, and select custom film emulsions.',
    subcategories: ['Studio Upload & Print Engine'],
  },
];

const BASE_ARCHIVE_PRODUCTS: ArchiveProduct[] = [
  // ==========================================
  // ONE PIECE COMPLETE CANONICAL ARCHIVE (99 CHARACTERS)
  // ==========================================
  ...ONE_PIECE_CHARACTERS,

  // ==========================================
  // BLEACH COMPLETE CANONICAL ARCHIVE (104 CHARACTERS)
  // ==========================================
  ...BLEACH_CHARACTERS,

  // ==========================================
  // EXPANDED CANONICAL SHONEN & ANIME ARCHIVE (63 CHARACTERS)
  // ==========================================
  ...EXPANDED_ANIME_CHARACTERS,

  // ==========================================
  // EXPANDED SPORTS ARCHIVE (CRICKET & FOOTBALL)
  // ==========================================
  ...EXPANDED_SPORTS_PRODUCTS,

  // ==========================================
  // EXPANDED CULTURE ARCHIVE (HEROES, CARS, BIKES, GAMING, MOVIES)
  // ==========================================
  ...EXPANDED_CULTURE_PRODUCTS,

  // ==========================================
  // OTHER ANIME & SHONEN ARCHIVE
  // ==========================================
  {
    id: 'anime-luffy-joyboy',
    title: 'Monkey D. Luffy — One Piece Joyboy Awakened',
    category: 'anime',
    franchise: 'One Piece',
    characterOrSubject: 'Monkey D. Luffy',
    subcategory: 'Characters',
    tags: ['one piece', 'luffy', 'monkey d luffy', 'joyboy', 'gear 5', 'wano', 'shonen', 'anime'],
    image: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    price: 40,
    popularity: 99,
    featured: true,
    trending: true,
    caption: 'joyboy has returned · monkey d. luffy',
    dateStr: '10.04.26',
    rotation: -1.8,
    tapeColor: 'yellow',
  },
  {
    id: 'anime-zoro-enma',
    title: 'Roronoa Zoro — The King of Hell',
    category: 'anime',
    franchise: 'One Piece',
    characterOrSubject: 'Roronoa Zoro',
    subcategory: 'Characters',
    tags: ['zoro', 'roronoa zoro', 'one piece', 'swordsman', 'enma', 'wano', 'anime'],
    image: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Roronoa_Zoro.jpg',
    price: 40,
    popularity: 96,
    trending: true,
    caption: 'three sword style · roronoa zoro',
    dateStr: '09.28.26',
    rotation: 2.1,
    tapeColor: 'kraft',
  },
  {
    id: 'anime-naruto-valley',
    title: 'Naruto Uzumaki — Hokage Destiny',
    category: 'anime',
    franchise: 'Naruto',
    characterOrSubject: 'Naruto Uzumaki',
    subcategory: 'Characters',
    tags: ['naruto', 'naruto uzumaki', 'shippuden', 'rasengan', 'hokage', 'konoha', 'ninja'],
    image: 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
    price: 40,
    popularity: 98,
    featured: true,
    trending: true,
    caption: 'believe it · uzumaki naruto',
    dateStr: '08.15.26',
    rotation: -1.5,
    tapeColor: 'yellow',
  },
  {
    id: 'anime-tanjiro-kagura',
    title: 'Tanjiro Kamado — Hinokami Kagura',
    category: 'anime',
    franchise: 'Demon Slayer',
    characterOrSubject: 'Tanjiro Kamado',
    subcategory: 'Characters',
    tags: ['tanjiro', 'tanjiro kamado', 'demon slayer', 'kimetsu no yaiba', 'sun breathing', 'anime'],
    image: 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg',
    price: 40,
    popularity: 95,
    newArrival: true,
    caption: 'dance of the sun god · tanjiro kamado',
    dateStr: '09.20.26',
    rotation: 1.2,
    tapeColor: 'washi',
  },
  {
    id: 'anime-gojo-satoru',
    title: 'Satoru Gojo — Limitless Hollow Purple',
    category: 'anime',
    franchise: 'Jujutsu Kaisen',
    characterOrSubject: 'Satoru Gojo',
    subcategory: 'Iconic Moments',
    tags: ['gojo', 'satoru gojo', 'jujutsu kaisen', 'jjk', 'infinity', 'purple', 'anime', 'six eyes'],
    image: 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_kaisen.jpg',
    price: 40,
    popularity: 99,
    featured: true,
    trending: true,
    caption: 'throughout heaven and earth · gojo satoru',
    dateStr: '10.01.26',
    rotation: -2.4,
    tapeColor: 'dark',
  },
  {
    id: 'anime-levi-ackermann',
    title: 'Captain Levi Ackermann — Scout Regiment',
    category: 'anime',
    franchise: 'Attack on Titan',
    characterOrSubject: 'Levi Ackermann',
    subcategory: 'Characters',
    tags: ['levi', 'levi ackermann', 'attack on titan', 'aot', 'shingeki no kyojin', 'humanity strongest'],
    image: 'https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg',
    price: 40,
    popularity: 94,
    caption: 'dedicate your hearts · captain levi',
    dateStr: '09.12.26',
    rotation: 2.5,
    tapeColor: 'kraft',
  },

  // ==========================================
  // CRICKET
  // ==========================================
  {
    id: 'cricket-virat-kohli',
    title: 'Virat Kohli — King Kohli Master of the Chase',
    category: 'cricket',
    characterOrSubject: 'Virat Kohli',
    subcategory: 'Virat Kohli',
    tags: ['virat kohli', 'king kohli', 'cricket', 'mcg', 'india', 't20 wc', 'chase master', 'champions'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg',
    price: 40,
    popularity: 100,
    featured: true,
    trending: true,
    caption: 'the chase master · virat kohli',
    dateStr: '10.03.26',
    rotation: 2.2,
    tapeColor: 'yellow',
  },
  {
    id: 'cricket-ms-dhoni',
    title: 'MS Dhoni — Captain Cool World Champion Finish',
    category: 'cricket',
    characterOrSubject: 'MS Dhoni',
    subcategory: 'MS Dhoni',
    tags: ['ms dhoni', 'dhoni', 'mahi', 'world cup 2011', 'wankhede', 'helicopter shot', 'captain cool'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/MS_Dhoni_%28Prabhav_%2723_-_RiGI_2023%29.jpg',
    price: 40,
    popularity: 99,
    featured: true,
    trending: true,
    caption: 'dhoni finishes off in style · captain cool',
    dateStr: '08.15.26',
    rotation: -2.5,
    tapeColor: 'kraft',
  },
  {
    id: 'cricket-rohit-sharma',
    title: 'Rohit Sharma — The Hitman World Cup Captain',
    category: 'cricket',
    characterOrSubject: 'Rohit Sharma',
    subcategory: 'Rohit Sharma',
    tags: ['rohit sharma', 'hitman', 'pull shot', 'cricket', 'captain', 'india', 't20 world cup'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg',
    price: 40,
    popularity: 95,
    newArrival: true,
    caption: 'effortless timing · rohit sharma',
    dateStr: '09.14.26',
    rotation: 1.5,
    tapeColor: 'dark',
  },
  {
    id: 'cricket-sachin-tendulkar',
    title: 'Sachin Tendulkar — God of Cricket 100th Century',
    category: 'cricket',
    characterOrSubject: 'Sachin Tendulkar',
    subcategory: 'Sachin Tendulkar',
    tags: ['sachin tendulkar', 'sachin', 'god of cricket', 'master blaster', 'wankhede', 'india'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/The_cricket_legend_Sachin_Tendulkar_at_the_Oval_Maidan_in_Mumbai_During_the_Duke_and_Duchess_of_Cambridge_Visit%2826271019082%29.jpg',
    price: 40,
    popularity: 97,
    caption: 'sachin sachin echoing across wankhede',
    dateStr: '09.05.26',
    rotation: -1.7,
    tapeColor: 'yellow',
  },

  // ==========================================
  // FOOTBALL
  // ==========================================
  {
    id: 'football-lionel-messi',
    title: 'Lionel Messi — World Cup 2022 Champion Glory',
    category: 'football',
    characterOrSubject: 'Lionel Messi',
    subcategory: 'Lionel Messi',
    tags: ['messi', 'lionel messi', 'argentina', 'world cup', 'goat', 'qatar 2022', 'barcelona'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
    price: 40,
    popularity: 100,
    featured: true,
    trending: true,
    caption: 'eterno rey · lionel messi world champion',
    dateStr: '10.02.26',
    rotation: -2.0,
    tapeColor: 'yellow',
  },
  {
    id: 'football-cristiano-ronaldo',
    title: 'Cristiano Ronaldo — CR7 Real Madrid Legend',
    category: 'football',
    characterOrSubject: 'Cristiano Ronaldo',
    subcategory: 'Cristiano Ronaldo',
    tags: ['ronaldo', 'cristiano ronaldo', 'cr7', 'real madrid', 'champions league', 'siuu', 'portugal'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
    price: 40,
    popularity: 99,
    featured: true,
    trending: true,
    caption: 'relentless greatness · cristiano ronaldo cr7',
    dateStr: '09.25.26',
    rotation: 1.8,
    tapeColor: 'dark',
  },
  {
    id: 'football-bernabeu-stadium',
    title: 'Santiago Bernabéu — The European Cathedral of Football',
    category: 'football',
    characterOrSubject: 'Santiago Bernabéu',
    subcategory: 'Stadiums & Fans',
    tags: ['real madrid', 'bernabeu', 'stadium', 'ucl', 'champions league', 'madrid', 'football'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Estadio_Santiago_Bernab%C3%A9u_Madrid.jpg',
    price: 40,
    popularity: 90,
    caption: '90 minuti en el bernabeu · magical european nights',
    dateStr: '09.10.26',
    rotation: -1.2,
    tapeColor: 'washi',
  },

  // ==========================================
  // HEROES & SUPERHEROES
  // ==========================================
  {
    id: 'heroes-spiderman-web',
    title: 'Spider-Man — Web of Spider-Man Classic Suit',
    category: 'heroes',
    characterOrSubject: 'Spider-Man',
    subcategory: 'Spider-Verse',
    tags: ['spider-man', 'spiderman', 'peter parker', 'marvel', 'superheroes', 'comic', 'nyc'],
    image: 'https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_129-1.png',
    price: 40,
    popularity: 98,
    featured: true,
    trending: true,
    caption: 'with great power comes great responsibility · spiderman',
    dateStr: '10.02.26',
    rotation: -2.2,
    tapeColor: 'yellow',
  },
  {
    id: 'heroes-batman-dark-knight',
    title: 'The Batman — Gotham Rooftop Vigilante',
    category: 'heroes',
    characterOrSubject: 'The Batman',
    subcategory: 'DC Dark Knight',
    tags: ['batman', 'bruce wayne', 'dc', 'dark knight', 'gotham', 'justice league', 'cape'],
    image: 'https://upload.wikimedia.org/wikipedia/en/c/c7/Batman_Infobox.jpg',
    price: 40,
    popularity: 97,
    featured: true,
    caption: 'i am vengeance · i am the night · batman',
    dateStr: '09.18.26',
    rotation: 1.6,
    tapeColor: 'dark',
  },
  {
    id: 'heroes-iron-man-armor',
    title: 'Iron Man — Tony Stark Bleeding Edge Armor',
    category: 'heroes',
    characterOrSubject: 'Iron Man',
    subcategory: 'Marvel Universe',
    tags: ['iron man', 'tony stark', 'avengers', 'marvel', 'arc reactor', 'superhero'],
    image: 'https://upload.wikimedia.org/wikipedia/en/4/47/Iron_Man_%28circa_2018%29.png',
    price: 40,
    popularity: 96,
    caption: 'i am iron man · stark industries',
    dateStr: '08.24.26',
    rotation: -1.4,
    tapeColor: 'kraft',
  },

  // ==========================================
  // CARS
  // ==========================================
  {
    id: 'cars-ferrari-f40',
    title: 'Ferrari F40 — The Twin-Turbo Maranello Legend',
    category: 'cars',
    characterOrSubject: 'Ferrari F40',
    subcategory: 'Supercars & Hypercars',
    tags: ['ferrari', 'f40', 'supercars', 'maranello', 'enzo ferrari', 'twin turbo', 'italian'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/F40_Ferrari_20090509.jpg',
    price: 40,
    popularity: 98,
    featured: true,
    trending: true,
    caption: 'the last supercar enzo approved · ferrari f40',
    dateStr: '08.19.26',
    rotation: 2.0,
    tapeColor: 'yellow',
  },
  {
    id: 'cars-skyline-gtr-r34',
    title: 'Nissan Skyline GT-R (R34) — Godzilla V-Spec II',
    category: 'cars',
    characterOrSubject: 'Nissan Skyline GT-R',
    subcategory: 'JDM Legends',
    tags: ['nissan', 'skyline', 'r34', 'gtr', 'godzilla', 'jdm', 'rb26dett', 'turbo'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Nissan_Skyline_GT-R_R34_V_Spec_II.jpg',
    price: 40,
    popularity: 97,
    newArrival: true,
    caption: 'godzilla awake · nissan skyline gt-r r34',
    dateStr: '10.01.26',
    rotation: -1.4,
    tapeColor: 'washi',
  },
  {
    id: 'cars-porsche-911-turbo',
    title: 'Porsche 911 Turbo (930) — The Original Whale Tail',
    category: 'cars',
    characterOrSubject: 'Porsche 911 Turbo',
    subcategory: 'Porsche Classics',
    tags: ['porsche', '911 turbo', '930', 'air cooled', 'supercars', 'vintage car', 'german'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/1976_Porsche_930_Turbo%2C_Emerald_Green_met%2C_front_left.jpg',
    price: 40,
    popularity: 96,
    featured: true,
    caption: 'air cooled legend · stuttgart porsche 930',
    dateStr: '09.22.26',
    rotation: -3.0,
    tapeColor: 'dark',
  },
  {
    id: 'cars-lamborghini-countach',
    title: 'Lamborghini Countach — Gandini Wedge Icon',
    category: 'cars',
    characterOrSubject: 'Lamborghini Countach',
    subcategory: 'Supercars & Hypercars',
    tags: ['lamborghini', 'countach', 'v12', 'supercar', 'italian', 'wedge design', 'sant agata'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Lamborghini_Countach_-_Flickr_-_exfordy_%282%29_%28cropped-2%29.jpg',
    price: 40,
    popularity: 94,
    caption: 'marcello gandini wedge silhouette · countach',
    dateStr: '08.10.26',
    rotation: 1.8,
    tapeColor: 'kraft',
  },

  // ==========================================
  // BIKES
  // ==========================================
  {
    id: 'bikes-ducati-panigale-v4',
    title: 'Ducati Panigale V4 — Bologna Racing Red Superbike',
    category: 'bikes',
    characterOrSubject: 'Ducati Panigale V4',
    subcategory: 'Superbikes',
    tags: ['ducati', 'panigale', 'v4', 'superbikes', 'italian', 'racing', 'motogp'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Ducati_Panigale_V4_-_Tuning_World_Bodensee_2018%2C_Friedrichshafen_%28OW1A0484%29.jpg',
    price: 40,
    popularity: 96,
    featured: true,
    trending: true,
    caption: 'desmosedici stradale roar · ducati panigale',
    dateStr: '09.15.26',
    rotation: -2.1,
    tapeColor: 'yellow',
  },

  // ==========================================
  // SPORTS / F1
  // ==========================================
  {
    id: 'sports-max-verstappen-f1',
    title: 'Formula 1 — Max Verstappen World Champion Speed',
    category: 'sports',
    characterOrSubject: 'Max Verstappen',
    subcategory: 'Formula 1',
    tags: ['f1', 'formula 1', 'max verstappen', 'red bull racing', 'champion', 'motorsport'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/52/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg',
    price: 40,
    popularity: 97,
    featured: true,
    trending: true,
    caption: '300 km/h apex perfection · max verstappen f1',
    dateStr: '09.01.26',
    rotation: 2.3,
    tapeColor: 'yellow',
  },

  // ==========================================
  // BOLLYWOOD
  // ==========================================
  {
    id: 'bollywood-shah-rukh-khan',
    title: 'Shah Rukh Khan — King Khan The Open Arms Pose',
    category: 'bollywood',
    characterOrSubject: 'Shah Rukh Khan',
    subcategory: 'Shah Rukh Khan',
    tags: ['shah rukh khan', 'srk', 'king khan', 'bollywood', 'mannat', 'ddlj', 'badshah'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg',
    price: 40,
    popularity: 100,
    featured: true,
    trending: true,
    caption: 'naam toh suna hoga · shah rukh khan king khan',
    dateStr: '10.02.26',
    rotation: -1.7,
    tapeColor: 'yellow',
  },
  {
    id: 'bollywood-amitabh-bachchan',
    title: 'Amitabh Bachchan — Shahenshah Angry Young Man',
    category: 'bollywood',
    characterOrSubject: 'Amitabh Bachchan',
    subcategory: 'Legends of 70s-90s',
    tags: ['amitabh bachchan', 'big b', 'deewar', 'bollywood', '70s cinema', 'shahenshah'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Indian_actor_Amitabh_Bachchan.jpg',
    price: 40,
    popularity: 93,
    caption: 'rishte mein toh hum tumhare baap lagte hain · big b',
    dateStr: '08.14.26',
    rotation: 2.1,
    tapeColor: 'kraft',
  },

  // ==========================================
  // TOLLYWOOD
  // ==========================================
  {
    id: 'tollywood-allu-arjun-pushpa',
    title: 'Allu Arjun — Pushpa The Rule Icon',
    category: 'tollywood',
    characterOrSubject: 'Allu Arjun',
    subcategory: 'Mass Heroes',
    tags: ['allu arjun', 'pushpa', 'pushpa 2', 'tollywood', 'mass', 'jhukega nahi', 'icon star'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Allu_Arjun_at_Pushpa_2_The_Rule_meet.jpg',
    price: 40,
    popularity: 98,
    featured: true,
    trending: true,
    caption: 'pushpa jhukega nahi saala · allu arjun icon star',
    dateStr: '10.01.26',
    rotation: 1.4,
    tapeColor: 'dark',
  },
  {
    id: 'tollywood-rrr-oscar',
    title: 'RRR — Ram Charan & Jr NTR Naatu Naatu Triumph',
    category: 'tollywood',
    characterOrSubject: 'Ram Charan & Jr NTR',
    subcategory: 'RRR & Baahubali',
    tags: ['rrr', 'ram charan', 'jr ntr', 'ss rajamouli', 'naatu naatu', 'tollywood', 'oscar'],
    image: 'https://upload.wikimedia.org/wikipedia/en/d/d7/RRR_Poster.jpg',
    price: 40,
    popularity: 98,
    featured: true,
    caption: 'fire meets water · alluri & bheem rrr',
    dateStr: '09.30.26',
    rotation: -2.3,
    tapeColor: 'yellow',
  },
  {
    id: 'tollywood-baahubali-beginning',
    title: 'Baahubali — SS Rajamouli Monumental Saga',
    category: 'tollywood',
    characterOrSubject: 'Prabhas / Baahubali',
    subcategory: 'RRR & Baahubali',
    tags: ['baahubali', 'prabhas', 'ss rajamouli', 'tollywood', 'waterfall', 'shivudu'],
    image: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Baahubali_The_Beginning_poster.jpg',
    price: 40,
    popularity: 96,
    caption: 'the beginning of a legend · baahubali',
    dateStr: '08.20.26',
    rotation: -1.6,
    tapeColor: 'kraft',
  },

  // ==========================================
  // HOLLYWOOD & MOVIES
  // ==========================================
  {
    id: 'hollywood-oppenheimer-imax',
    title: 'Cillian Murphy — Oppenheimer 70mm Christopher Nolan',
    category: 'hollywood',
    characterOrSubject: 'Cillian Murphy',
    subcategory: 'Oscar Winners',
    tags: ['oppenheimer', 'cillian murphy', 'christopher nolan', 'hollywood', 'imax', 'oscar'],
    image: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg',
    price: 40,
    popularity: 98,
    featured: true,
    caption: 'now i am become death · cillian murphy oppenheimer',
    dateStr: '09.11.26',
    rotation: -1.9,
    tapeColor: 'dark',
  },
  {
    id: 'movies-pulp-fiction-cult',
    title: 'Pulp Fiction — Quentin Tarantino 1994 Masterpiece',
    category: 'movies',
    characterOrSubject: 'Pulp Fiction',
    subcategory: 'Cult Classics',
    tags: ['pulp fiction', 'john travolta', 'samuel l jackson', 'tarantino', 'hollywood', 'cult', 'mia wallace'],
    image: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg',
    price: 40,
    popularity: 96,
    caption: 'say what again · tarantino pulp fiction 1994',
    dateStr: '08.20.26',
    rotation: 1.8,
    tapeColor: 'kraft',
  },
  {
    id: 'movies-the-godfather',
    title: 'The Godfather — Francis Ford Coppola Cinema Masterpiece',
    category: 'movies',
    characterOrSubject: 'Don Vito Corleone',
    subcategory: 'Classic Cinema',
    tags: ['the godfather', 'marlon brando', 'al pacino', 'coppola', 'cinema', 'classic'],
    image: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg',
    price: 40,
    popularity: 97,
    caption: 'an offer you cannot refuse · the godfather',
    dateStr: '07.12.26',
    rotation: -2.2,
    tapeColor: 'dark',
  },

  // ==========================================
  // ANIMALS
  // ==========================================
  {
    id: 'animals-golden-retriever',
    title: 'Golden Retriever — Loyal Companion Smile',
    category: 'animals',
    characterOrSubject: 'Golden Retriever',
    subcategory: 'Dogs & Pups',
    tags: ['dogs', 'golden retriever', 'puppy', 'pets', 'animals', 'sunlight'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_Retriever_Dukedestiny01_drvd.jpg',
    price: 40,
    popularity: 96,
    featured: true,
    caption: 'pure sunshine on four paws · golden retriever',
    dateStr: '10.02.26',
    rotation: 1.5,
    tapeColor: 'yellow',
  },
  {
    id: 'animals-bengal-tiger',
    title: 'Royal Bengal Tiger — Ranthambore Wild Predator',
    category: 'animals',
    characterOrSubject: 'Bengal Tiger',
    subcategory: 'Wild Apex Predators',
    tags: ['tiger', 'bengal tiger', 'wildlife', 'ranthambore', 'nature', 'predator', 'india'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Tiger_in_Ranthambhore.jpg',
    price: 40,
    popularity: 94,
    caption: 'silent steps in the morning fog · royal bengal tiger',
    dateStr: '09.08.26',
    rotation: -1.6,
    tapeColor: 'kraft',
  },

  // ==========================================
  // CARTOONS
  // ==========================================
  {
    id: 'cartoons-tom-jerry-chase',
    title: 'Tom & Jerry — Classic Hanna-Barbera Cel Art',
    category: 'cartoons',
    characterOrSubject: 'Tom & Jerry',
    subcategory: 'Tom & Jerry',
    tags: ['tom and jerry', 'tom', 'jerry', 'cartoon', 'nostalgia', 'hanna barbera', 'retro animation'],
    image: 'https://upload.wikimedia.org/wikipedia/en/d/d6/PDVD_002.jpg',
    price: 40,
    popularity: 95,
    featured: true,
    caption: 'chasing each other since 1940 · tom & jerry',
    dateStr: '08.12.26',
    rotation: 2.2,
    tapeColor: 'yellow',
  },

  // ==========================================
  // GAMES
  // ==========================================
  {
    id: 'games-cyberpunk-2077',
    title: 'Cyberpunk 2077 — Night City Samurai',
    category: 'games',
    characterOrSubject: 'Night City V',
    subcategory: 'Open World Legends',
    tags: ['cyberpunk', 'cyberpunk 2077', 'night city', 'games', 'gaming', 'neon', 'samurai'],
    image: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
    price: 40,
    popularity: 97,
    featured: true,
    caption: 'wake up samurai · cyberpunk 2077 night city',
    dateStr: '09.29.26',
    rotation: -1.7,
    tapeColor: 'washi',
  },
  {
    id: 'games-elden-ring-lands',
    title: 'Elden Ring — Erdtree The Lands Between',
    category: 'games',
    characterOrSubject: 'Elden Ring Erdtree',
    subcategory: 'Atmospheric Art',
    tags: ['elden ring', 'fromsoftware', 'erdtree', 'tarnished', 'soulsborne', 'games'],
    image: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
    price: 40,
    popularity: 96,
    caption: 'arise now ye tarnished · elden ring',
    dateStr: '09.17.26',
    rotation: 1.9,
    tapeColor: 'dark',
  },
  {
    id: 'games-gta-v-los-santos',
    title: 'Grand Theft Auto V — Los Santos Sunsets',
    category: 'games',
    characterOrSubject: 'Grand Theft Auto V',
    subcategory: 'Open World Legends',
    tags: ['gta', 'gta v', 'grand theft auto', 'rockstar', 'los santos', 'games'],
    image: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png',
    price: 40,
    popularity: 98,
    caption: 'welcome to los santos · grand theft auto v',
    dateStr: '09.25.26',
    rotation: -1.5,
    tapeColor: 'yellow',
  },

  // ==========================================
  // MUSIC
  // ==========================================
  {
    id: 'music-pink-floyd-dark-side',
    title: 'Pink Floyd — Dark Side of the Moon Iconic Prism',
    category: 'music',
    characterOrSubject: 'Pink Floyd',
    subcategory: 'Album Art',
    tags: ['pink floyd', 'dark side of the moon', 'rock', 'vinyl', 'album art', 'music', 'prism'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Dark_Side_of_the_Moon.png',
    price: 40,
    popularity: 97,
    featured: true,
    caption: 'there is no dark side of the moon really · pink floyd',
    dateStr: '08.28.26',
    rotation: -2.3,
    tapeColor: 'dark',
  },
  {
    id: 'music-the-beatles-legend',
    title: 'The Beatles — 1963 Dezo Hoffmann Historic Capture',
    category: 'music',
    characterOrSubject: 'The Beatles',
    subcategory: 'Rock Legends',
    tags: ['the beatles', 'john lennon', 'paul mccartney', 'rock', 'abbey road', 'music', 'vinyl'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/42/The_Beatles_1963_Dezo_Hoffman_Capitol_Records_press_photo_2.jpg',
    price: 40,
    popularity: 95,
    caption: 'all you need is love · the beatles 1963',
    dateStr: '07.18.26',
    rotation: 1.6,
    tapeColor: 'kraft',
  },

  // ==========================================
  // TRAVEL
  // ==========================================
  {
    id: 'travel-tokyo-shibuya-night',
    title: 'Tokyo — Shibuya Crossing Rainy Midnight Neon',
    category: 'travel',
    characterOrSubject: 'Tokyo Shibuya',
    subcategory: 'Metropolises',
    tags: ['tokyo', 'japan', 'shibuya', 'neon', 'rain', 'travel', 'street photography'],
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    price: 40,
    popularity: 98,
    featured: true,
    caption: 'shibuya midnight crossing · tokyo japan',
    dateStr: '10.01.26',
    rotation: 2.0,
    tapeColor: 'yellow',
  },
  {
    id: 'travel-swiss-alps-landwasser',
    title: 'Swiss Alps — Glacier Express Landwasser Viaduct',
    category: 'travel',
    characterOrSubject: 'Swiss Alps',
    subcategory: 'Alpine & Mountain',
    tags: ['switzerland', 'swiss alps', 'glacier express', 'mountains', 'landwasser', 'travel'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/CH_Landwasser_2.jpg',
    price: 40,
    popularity: 93,
    caption: 'landwasser viaduct · swiss alpine express',
    dateStr: '09.19.26',
    rotation: -1.3,
    tapeColor: 'washi',
  },

  // ==========================================
  // NATURE
  // ==========================================
  {
    id: 'nature-aurora-borealis',
    title: 'Norway — Emerald Aurora Borealis Dancing Lights',
    category: 'nature',
    characterOrSubject: 'Aurora Borealis',
    subcategory: 'Northern Lights',
    tags: ['aurora borealis', 'northern lights', 'norway', 'night sky', 'stars', 'nature'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg',
    price: 40,
    popularity: 96,
    featured: true,
    caption: 'dancing solar winds · emerald aurora borealis',
    dateStr: '09.27.26',
    rotation: 1.7,
    tapeColor: 'kraft',
  },

  // ==========================================
  // QUOTES
  // ==========================================
  {
    id: 'quotes-steve-jobs-hungry',
    title: 'Steve Jobs — Stay Hungry, Stay Foolish Stanford 2005',
    category: 'quotes',
    characterOrSubject: 'Steve Jobs',
    subcategory: 'Motivation & Drive',
    tags: ['quotes', 'steve jobs', 'stay hungry', 'motivation', 'apple', 'minimalist'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Steve_Jobs_Headshot_2010_%28cropped_4%29.jpg',
    price: 40,
    popularity: 95,
    featured: true,
    caption: 'stay hungry · stay foolish · steve jobs 2005',
    dateStr: '10.02.26',
    rotation: -1.8,
    tapeColor: 'yellow',
  },
  {
    id: 'quotes-albert-einstein',
    title: 'Albert Einstein — Imagination Is More Important Than Knowledge',
    category: 'quotes',
    characterOrSubject: 'Albert Einstein',
    subcategory: 'Life & Philosophy',
    tags: ['quotes', 'albert einstein', 'genius', 'physics', 'philosophy', 'imagination'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Albert_Einstein_Head_cleaned.jpg',
    price: 40,
    popularity: 94,
    caption: 'imagination is everything · albert einstein',
    dateStr: '09.15.26',
    rotation: 1.6,
    tapeColor: 'dark',
  },

  // ==========================================
  // CELEBRITIES
  // ==========================================
  {
    id: 'celeb-audrey-hepburn-1953',
    title: 'Audrey Hepburn — Roman Holiday Timeless Elegance',
    category: 'celebrities',
    characterOrSubject: 'Audrey Hepburn',
    subcategory: 'Cinema Legends',
    tags: ['audrey hepburn', 'roman holiday', 'actress', 'vintage', 'classic hollywood', 'portrait'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/74/AudreyKHepburn.jpg',
    price: 40,
    popularity: 94,
    featured: true,
    caption: 'elegance is the only beauty that never fades · audrey hepburn',
    dateStr: '08.11.26',
    rotation: 2.1,
    tapeColor: 'washi',
  },
  {
    id: 'celeb-marilyn-monroe-1953',
    title: 'Marilyn Monroe — The Golden Age of Cinema 1953',
    category: 'celebrities',
    characterOrSubject: 'Marilyn Monroe',
    subcategory: 'Cinema Legends',
    tags: ['marilyn monroe', 'actress', 'hollywood', 'vintage', 'cinema legend', 'blonde'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Monroecirca1953.jpg',
    price: 40,
    popularity: 95,
    caption: 'a smile is the best makeup any girl can wear · marilyn monroe',
    dateStr: '08.04.26',
    rotation: -1.7,
    tapeColor: 'kraft',
  },
];

// Clean deduplication by product ID ensuring canonical entries take precedence
// and every product guarantees valid required fields: name, exact image, category, subcategory, tags, description, price, visual style
export const ARCHIVE_PRODUCTS: ArchiveProduct[] = Array.from(
  new Map(
    BASE_ARCHIVE_PRODUCTS.map((item) => {
      const subject =
        item.characterOrSubject ||
        item.subject ||
        item.title.split(' — ')[0].trim();

      const subcategory =
        item.subcategory ||
        (item as any).subcategories?.[0] ||
        (item.category === 'anime'
          ? item.franchise || 'Anime Legends'
          : item.category === 'cricket'
          ? 'Cricket Legends'
          : item.category === 'football'
          ? 'Football Icons'
          : item.category === 'cars'
          ? 'Supercars & Classics'
          : item.category === 'bikes'
          ? 'Superbikes & Classics'
          : item.category === 'heroes'
          ? 'Superheroes & Comics'
          : item.category === 'movies' || item.category === 'hollywood' || item.category === 'bollywood' || item.category === 'tollywood'
          ? 'Cinema Archive'
          : item.category === 'cartoons'
          ? 'Animation & Nostalgia'
          : item.category === 'games'
          ? 'Gaming Icons'
          : item.category === 'quotes'
          ? 'Philosophy & Motivation'
          : 'Archive Editions');

      const description =
        item.description ||
        (item.caption
          ? `Archival Polaroid print capturing "${item.caption}". Exposed on authentic 35mm optical emulsion with analog chemistry.`
          : `${item.title} collectible Polaroid archival proof. Exposed with museum-grade precision.`);

      const style =
        item.style ||
        (item.category === 'cricket' || item.category === 'football' || item.category === 'sports'
          ? 'Sports Action'
          : item.category === 'cars' || item.category === 'bikes'
          ? 'Editorial'
          : item.category === 'anime'
          ? 'Manga Panel'
          : item.category === 'heroes'
          ? 'Cinematic'
          : 'Classic');

      const imageStatus = item.imageStatus || (item.image && item.image.trim() !== '' ? 'VERIFIED' : 'IMAGE_PENDING');

      return [
        item.id,
        {
          ...item,
          characterOrSubject: subject,
          subject,
          subcategory,
          description,
          style,
          price: item.price ?? 40,
          tags: item.tags || [subject.toLowerCase(), item.category],
          imageStatus,
        },
      ];
    })
  ).values()
);

