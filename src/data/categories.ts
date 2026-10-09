import { PolaroidCategory, PrintPlan, CustomerOrder } from '../types';

export const POLAROID_CATEGORIES: PolaroidCategory[] = [
  {
    id: 'anime',
    name: 'ANIME',
    tagline: 'Neo-Tokyo nightscapes & emotional celluloid frames',
    description: 'Archival instant prints featuring iconic Japanese animation moods, legendary shonen protagonists, and classic hand-painted cel aesthetics.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    rotation: -2.5,
    tapeColor: 'yellow',
    tapeRotation: -1.2,
    badge: 'Popular',
    sampleCount: 140,
    highlightCaption: 'joyboy has returned · luffy',
    dateStr: '10.04.26'
  },
  {
    id: 'heroes',
    name: 'HEROES',
    tagline: 'Dramatic silhouettes & legendary comic mythology',
    description: 'High-contrast noir captures of dark knights, golden capes, and cinematic hero encounters printed on textured heavyweight emulsion paper.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_129-1.png',
    rotation: 1.8,
    tapeColor: 'kraft',
    tapeRotation: 2.1,
    sampleCount: 95,
    highlightCaption: 'with great power · spider-man',
    dateStr: '09.18.26'
  },
  {
    id: 'movies',
    name: 'MOVIES',
    tagline: '35mm anamorphic stills & auteur cinema moments',
    description: 'Curated 2.39:1 widescreen cinema stills reframed into physical 3.5×4.2 inch Polaroid frames with subtle grain and rich shadows.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg',
    rotation: -1.5,
    tapeColor: 'washi',
    tapeRotation: -3.0,
    badge: 'Auteur',
    sampleCount: 210,
    highlightCaption: 'say what again · pulp fiction',
    dateStr: '08.22.26'
  },
  {
    id: 'f1',
    name: 'F1',
    tagline: 'Monaco chicanes, flying sparks & 300km/h blur',
    description: 'Pure adrenaline frozen in time. Glowing ceramic brake discs, wet track rooster tails, and legendary Formula 1 wheel-to-wheel duels.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg',
    rotation: 2.8,
    tapeColor: 'yellow',
    tapeRotation: 1.5,
    badge: 'Trending',
    sampleCount: 115,
    highlightCaption: 'eau rouge · 300 km/h apex',
    dateStr: '09.01.26'
  },
  {
    id: 'cars',
    name: 'CARS',
    tagline: 'Air-cooled curves, vintage warehouses & track legends',
    description: 'Classic 911s, Ferrari twin-turbos, and midnight garage culture documented in warm analog tones with real paper depth.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/F40_Ferrari_20090509.jpg',
    rotation: -3.2,
    tapeColor: 'dark',
    tapeRotation: -1.8,
    sampleCount: 180,
    highlightCaption: 'maranello pure raw speed · f40',
    dateStr: '07.14.26'
  },
  {
    id: 'bikes',
    name: 'BIKES',
    tagline: 'Café racers, misty coastal passes & raw steel',
    description: 'Exposed carburetors, leather grips, and empty dawn canyon highways. The pure romance of two wheels and mechanical freedom.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Ducati_Panigale_V4_-_Tuning_World_Bodensee_2018%2C_Friedrichshafen_%28OW1A0484%29.jpg',
    rotation: 1.2,
    tapeColor: 'kraft',
    tapeRotation: 0.8,
    sampleCount: 88,
    highlightCaption: 'bologna racing red · ducati',
    dateStr: '08.05.26'
  },
  {
    id: 'quotes',
    name: 'QUOTES',
    tagline: 'Typewriter keystrokes & poignant poetic lines',
    description: 'Literary fragments and timeless reflections typeset on aged paper textures, framed by crisp white instant photo margins.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Steve_Jobs_Headshot_2010_%28cropped_4%29.jpg',
    rotation: -2.0,
    tapeColor: 'washi',
    tapeRotation: -2.2,
    sampleCount: 130,
    highlightCaption: 'stay hungry · stay foolish',
    dateStr: '09.30.26'
  },
  {
    id: 'cartoons',
    name: 'CARTOONS',
    tagline: 'Saturday morning memories & vintage cel nostalgia',
    description: 'Golden-era animation, playful illustrated nostalgia, and joyful memories brought into tangible physical prints for your desk or pinboard.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d6/PDVD_002.jpg',
    rotation: 2.2,
    tapeColor: 'yellow',
    tapeRotation: 1.9,
    sampleCount: 75,
    highlightCaption: 'chasing each other since 1940',
    dateStr: '06.12.26'
  },
  {
    id: 'games',
    name: 'GAMES',
    tagline: 'Retro CRT phosphors, pixel worlds & atmospheric realms',
    description: 'Ambient game worlds, neon arcade cabinets, and unforgettable virtual vistas printed with deep photographic blacks.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
    rotation: -1.7,
    tapeColor: 'dark',
    tapeRotation: -1.0,
    sampleCount: 165,
    highlightCaption: 'wake up samurai · night city',
    dateStr: '10.02.26'
  },
  {
    id: 'custom',
    name: 'CUSTOM',
    tagline: 'Your personal camera roll turned into archival prints',
    description: 'Upload your favorite photo, crop, choose classic film filters, and add your own handwritten caption. Printed with authentic Polaroid dye sublimation.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    rotation: 3.0,
    tapeColor: 'yellow',
    tapeRotation: 2.5,
    badge: 'Interactive',
    sampleCount: 999,
    highlightCaption: 'make it yours · studio edition',
    dateStr: 'today'
  }
];

export const PRINT_PLANS: PrintPlan[] = [
  {
    id: 'single',
    name: '1 POLAROID',
    price: 40,
    quantity: 1,
    description: 'A single iconic moment printed on 310gsm archival emulsion paper with classic Polaroid gloss.',
    features: [
      'Original 3.5 × 4.2 inch Polaroid ratio',
      'True white archival frame border',
      'Protective clear glassine sleeve',
      'Ships in rigid stay-flat mailer'
    ],
    rotation: -2,
    imageSample: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
    caption: 'one moment, held forever'
  },
  {
    id: 'trio',
    name: '3 POLAROIDS',
    price: 100,
    quantity: 3,
    badge: 'Popular',
    description: 'The studio favorite. Three curated moments or personal memories saved together for ₹100 instead of ₹120.',
    features: [
      'Save ₹20 instantly with bundle',
      'Mix and match any category or custom photos',
      'Includes 3 mini wooden desk stands',
      'Archival black kraft presentation box'
    ],
    rotation: 1.5,
    imageSample: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg',
    caption: 'trio of timeless frames'
  },
  {
    id: 'custom',
    name: 'CUSTOM PRINT',
    price: 50,
    quantity: 1,
    description: 'Upload your own camera roll snapshot. Interactive framing, film tone toning curves, and custom handwritten captioning.',
    features: [
      'Live in-browser Polaroid preview',
      'Custom handwritten message on lower border',
      'Choose between Glossy, Fine Matte, or Vintage Tone',
      'Hand-inspected before thermal darkroom exposure'
    ],
    rotation: -1,
    imageSample: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    caption: 'crafted by you · printed by pixé'
  }
];

export const SAMPLE_CUSTOM_PHOTOS = [
  {
    id: 'sample-1',
    name: 'Golden Hour Coast',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'coastal breeze · 2026'
  },
  {
    id: 'sample-2',
    name: 'Neon Tokyo Rain',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    caption: 'shibuya night rain · 01:14'
  },
  {
    id: 'sample-3',
    name: 'Vintage 911 Silhouette',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/1976_Porsche_930_Turbo%2C_Emerald_Green_met%2C_front_left.jpg',
    caption: 'air-cooled dreams · 1989'
  },
  {
    id: 'sample-4',
    name: 'Misty Alpine Valley',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/CH_Landwasser_2.jpg',
    caption: 'swiss mountain peace'
  }
];

export const SAMPLE_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'PX-94218',
    date: 'Oct 03, 2026',
    itemsCount: 3,
    totalAmount: 100,
    status: 'Thermal Printing',
    currentStage: 'OPTICAL EXPOSURE',
    carrier: 'BlueDart Express Air',
    trackingNumber: 'BD-8891042-IN',
    estimatedDelivery: 'Oct 06, 2026',
    items: [
      {
        title: 'One Piece — Luffy Joyboy',
        caption: 'joyboy has returned · luffy',
        price: 40,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
        qty: 1
      },
      {
        title: 'Virat Kohli — Chase Master',
        caption: 'the chase master · virat kohli',
        price: 40,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium_05.jpg',
        qty: 1
      },
      {
        title: 'Ferrari F40 Maranello',
        caption: 'the last supercar enzo approved',
        price: 40,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/F40_Ferrari_20090509.jpg',
        qty: 1
      }
    ]
  },
  {
    id: 'PX-90144',
    date: 'Sep 24, 2026',
    itemsCount: 1,
    totalAmount: 50,
    status: 'Delivered',
    currentStage: 'DISPATCHED',
    carrier: 'BlueDart Express Air',
    trackingNumber: 'BD-8201944-IN',
    estimatedDelivery: 'Sep 27, 2026',
    items: [
      {
        title: 'Lionel Messi World Champion',
        caption: 'eterno rey · lionel messi',
        price: 50,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
        qty: 1
      }
    ]
  }
];

export const MOCK_CUSTOMER_ORDERS = SAMPLE_CUSTOMER_ORDERS;

export const MOCK_DARKROOM_QUEUE = [
  {
    id: 'JOB-882',
    orderId: 'PX-94218',
    customerName: 'Elena Vance',
    productType: '3 Polaroids' as const,
    caption: 'joyboy has returned · luffy',
    filter: 'Classic Film Tone',
    paperStock: '310gsm Archival Gloss' as const,
    status: 'Thermal Printing' as const,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    submittedAt: '12 mins ago'
  },
  {
    id: 'JOB-883',
    orderId: 'PX-94218',
    customerName: 'Elena Vance',
    productType: '3 Polaroids' as const,
    caption: 'the chase master · virat kohli',
    filter: 'High Contrast Vivid',
    paperStock: '310gsm Archival Gloss' as const,
    status: 'Chemical Curing' as const,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Virat_Kohli_during_the_India_vs_Australia_4th_Test_match_at_Narendra_Modi_Stadium_05.jpg',
    submittedAt: '12 mins ago'
  },
  {
    id: 'JOB-884',
    orderId: 'PX-94301',
    customerName: 'Marcus Sterling',
    productType: 'Custom Print' as const,
    caption: 'the last supercar enzo approved',
    filter: 'Noir 35mm B&W',
    paperStock: '310gsm Matte Rag' as const,
    status: 'Queued' as const,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/F40_Ferrari_20090509.jpg',
    submittedAt: '4 mins ago'
  },
  {
    id: 'JOB-885',
    orderId: 'PX-94190',
    customerName: 'Aarav Patel',
    productType: '1 Polaroid' as const,
    caption: 'stay hungry · stay foolish',
    filter: 'Warm Amber Sepia',
    paperStock: '310gsm Archival Gloss' as const,
    status: 'QC Checked' as const,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Steve_Jobs_Headshot_2010_%28cropped_4%29.jpg',
    submittedAt: '35 mins ago'
  }
];
