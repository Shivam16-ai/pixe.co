export type AppRoute = 'landing' | 'login' | 'portal-customer' | 'portal-admin';
export type PageView = 'home' | 'login' | 'signup' | 'custom' | 'shop';

export type CustomerPortalTab = 'dashboard' | 'shop' | 'custom' | 'orders' | 'profile' | 'favorites';
export type AdminPortalTab = 'dashboard' | 'queue' | 'orders' | 'inventory' | 'analytics';

export type OrderTimelineStage =
  | 'QUEUED'
  | 'EMULSION PREP'
  | 'OPTICAL EXPOSURE'
  | 'CRYSTALLIZATION'
  | 'WAX PACKAGING'
  | 'DISPATCHED';

export interface UserSession {
  role: 'customer' | 'admin' | null;
  name: string;
  email: string;
  avatar?: string;
  memberSince?: string;
}

export interface PolaroidCategory {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  rotation: number;
  tapeColor: 'yellow' | 'kraft' | 'washi' | 'dark';
  tapeRotation: number;
  badge?: string;
  sampleCount: number;
  highlightCaption: string;
  dateStr: string;
}

export interface PrintPlan {
  id: string;
  name: string;
  price: number;
  quantity: number;
  badge?: string;
  description: string;
  features: string[];
  rotation: number;
  imageSample: string;
  caption: string;
}

export type PaperFinish = 'matte' | 'glossy' | 'vintage';

export interface ArchiveCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  itemCount: number;
  featuredImage: string;
  description: string;
  subcategories?: string[];
  franchises?: string[];
}

export const POLAROID_STYLES = [
  'Classic',
  'Vintage Film',
  'Black & White',
  'Editorial',
  'Cinematic',
  'Pop',
  'Sports Action',
  'Minimal',
  'Retro',
  'Art Print',
  'Manga Panel',
  'Wanted Poster',
  'Character Profile',
] as const;

export type PolaroidStyle =
  | (typeof POLAROID_STYLES)[number]
  | 'classic'
  | 'vintage'
  | 'bw'
  | 'editorial'
  | 'cinematic'
  | 'pop'
  | 'sports'
  | 'minimal'
  | 'retro'
  | 'art'
  | 'Classic Anime'
  | 'Cinematic'
  | 'Vintage Film'
  | 'Black & White'
  | 'Editorial'
  | 'Manga Panel'
  | 'Wanted Poster'
  | 'Battle Action'
  | 'Minimal Portrait'
  | 'Retro Japanese Print'
  | 'Crew Portrait'
  | 'Character Profile'
  | 'Character Portrait'
  | 'cinematic-anime'
  | string;

export interface CharacterRelationship {
  target: string;
  type:
    | 'Friend'
    | 'Family'
    | 'Crewmate'
    | 'Rival'
    | 'Ally'
    | 'Enemy'
    | 'Former Enemy'
    | 'Love Interest'
    | 'Mentor'
    | 'Student'
    | string;
  notes?: string;
}

export interface ArchiveProduct {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  franchise?: string;
  characterOrSubject?: string;
  subject?: string;
  role?: string | null;
  crewOrAffiliation?: string | null;
  affiliations?: string[];
  squad?: string | null;
  rank?: string | null;
  race?: string | null;
  schrift?: string | null;
  zanpakuto?: string | null;
  bankai?: string | null;
  bounty?: string | null;
  epithet?: string | null;
  relationshipGroup?: string[];
  keyRelationships?: CharacterRelationship[];
  arcs?: string[];
  tags: string[];
  image: string;
  thumbnail?: string | null;
  imageSource?: string | null;
  imageStatus?: 'VERIFIED' | 'IMAGE_PENDING';
  description?: string;
  price: number; // typically 40
  popularity: number;
  popular?: boolean;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  caption: string;
  dateStr: string;
  rotation?: number;
  tapeColor?: 'yellow' | 'kraft' | 'washi' | 'dark';
  style?: PolaroidStyle;
  relatedIds?: string[];
  aliases?: string[];
  brand?: string;
  model?: string;
  player?: string;
  team?: string;
  club?: string;
  country?: string;
  city?: string;
  actor?: string;
  actress?: string;
  director?: string;
  game?: string;
  artist?: string;
  year?: number | string;
  era?: string;
}

export interface CartItem {
  id: string;
  title: string;
  type: 'category' | 'plan' | 'custom' | 'archive';
  price: number;
  quantity: number;
  caption?: string;
  imageUrl: string;
  filter?: string;
  paperFinish?: PaperFinish;
  customDetails?: {
    filterName: string;
    caption: string;
    textColor: string;
    dateStamp: boolean;
    frameStyle: string;
  };
}

export interface CustomerOrder {
  id: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  status: 'In Darkroom' | 'Thermal Printing' | 'QC Inspection' | 'Out for Delivery' | 'Delivered';
  currentStage?: OrderTimelineStage;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  items: {
    title: string;
    caption?: string;
    price: number;
    imageUrl: string;
    qty: number;
  }[];
}

export interface DarkroomPrintJob {
  id: string;
  orderId: string;
  customerName: string;
  productType: '1 Polaroid' | '3 Polaroids' | 'Custom Print';
  caption: string;
  filter: string;
  paperStock: '310gsm Archival Gloss' | '310gsm Matte Rag';
  status: 'Queued' | 'Thermal Printing' | 'Chemical Curing' | 'QC Checked' | 'Packed & Dispatched';
  imageUrl: string;
  submittedAt: string;
}
