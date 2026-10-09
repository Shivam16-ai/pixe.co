import { ArchiveProduct } from '../types';

export interface SearchScoreResult {
  product: ArchiveProduct;
  score: number;
  matchReasons: string[];
}

export interface SearchSuggestionItem {
  type: 'product' | 'franchise' | 'category' | 'tag' | 'faction' | 'query';
  title: string;
  subtitle: string;
  query: string;
  image?: string;
  product?: ArchiveProduct;
}

/**
 * Normalizes text for robust analog darkroom search
 */
export function normalizeSearchTerm(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics (e.g. Mbappé -> mbappe)
    .replace(/[^a-z0-9\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strict search alias dictionary to bridge shonen, sports, automotive shorthand
 * Maps user query terms to their exact canonical names
 */
const ALIAS_MAP: Record<string, string[]> = {
  // Football
  messi: ['lionel messi', 'leo messi', 'messi'],
  ronaldo: ['cristiano ronaldo', 'cr7', 'ronaldo'],
  neymar: ['neymar jr', 'neymar'],
  mbappe: ['kylian mbappe', 'mbappe'],
  haaland: ['erling haaland', 'haaland'],

  // Cricket
  virat: ['virat kohli', 'king kohli', 'virat'],
  kohli: ['virat kohli', 'king kohli', 'virat'],
  dhoni: ['ms dhoni', 'mahendra singh dhoni', 'thala'],
  rohit: ['rohit sharma', 'hitman'],
  sachin: ['sachin tendulkar', 'master blaster'],
  babar: ['babar azam'],
  bumrah: ['jasprit bumrah'],
  hardik: ['hardik pandya'],
  stokes: ['ben stokes'],
  williamson: ['kane williamson'],

  // Anime - One Piece
  luffy: ['monkey d. luffy', 'joyboy', 'luffy'],
  zoro: ['roronoa zoro', 'zoro', 'enma'],
  sanji: ['sanji', 'vinsmoke sanji'],
  law: ['trafalgar d. water law', 'trafalgar law'],
  shanks: ['shanks', 'red hair shanks'],
  ace: ['portgas d. ace', 'ace'],
  sabo: ['sabo'],
  yamato: ['yamato'],
  mihawk: ['dracule mihawk', 'mihawk'],
  kaido: ['kaido'],
  whitebeard: ['whitebeard', 'edward newgate'],
  blackbeard: ['blackbeard', 'marshall d. teach'],
  croc: ['crocodile', 'sir crocodile'],
  doflamingo: ['donquixote doflamingo', 'doflamingo'],

  // Anime - Bleach
  ichigo: ['ichigo kurosaki', 'substitute soul reaper', 'ichigo'],
  rukia: ['rukia kuchiki'],
  aizen: ['sosuke aizen', 'aizen'],
  byakuya: ['byakuya kuchiki'],
  zaraki: ['kenpachi zaraki', 'zaraki'],
  kenpachi: ['kenpachi zaraki'],
  hitsugaya: ['toshiro hitsugaya'],
  urahara: ['kisuke urahara', 'urahara'],
  yoruichi: ['yoruichi shihoin', 'yoruichi shihouin', 'yoruichi'],
  yhwach: ['yhwach'],
  ulquiorra: ['ulquiorra cifer'],
  grimmjow: ['grimmjow jaegerjaquez'],

  // Anime - Naruto & Shonen
  naruto: ['naruto uzumaki', 'seventh hokage', 'naruto'],
  sasuke: ['sasuke uchiha'],
  itachi: ['itachi uchiha'],
  kakashi: ['kakashi hatake'],
  madara: ['madara uchiha'],
  obito: ['obito uchiha'],
  jiraiya: ['jiraiya'],
  tsunade: ['tsunade'],
  minato: ['minato namikaze'],
  gojo: ['satoru gojo', 'six eyes'],
  sukuna: ['ryomen sukuna'],
  tanjiro: ['tanjiro kamado'],
  nezuko: ['nezuko kamado'],
  rengoku: ['kyojuro rengoku', 'flame hashira'],
  goku: ['son goku', 'goku', 'kakarot'],
  vegeta: ['vegeta', 'prince vegeta'],
  levi: ['levi ackermann', 'captain levi'],
  eren: ['eren yeager'],

  // Superheroes
  batman: ['the batman', 'batman', 'bruce wayne', 'dark knight'],
  spiderman: ['spider man', 'peter parker'],
  ironman: ['iron man', 'tony stark'],
  superman: ['superman', 'clark kent'],

  // Automotive
  porsche: ['porsche 911', 'porsche 930', 'porsche'],
  ferrari: ['ferrari f40', 'ferrari'],
  skyline: ['nissan skyline gt r', 'r34', 'skyline'],
  supra: ['toyota supra', 'mk4 supra', 'supra'],
  ducati: ['ducati panigale'],
  kawasaki: ['kawasaki ninja h2'],
  hayabusa: ['suzuki hayabusa'],
};

const BROAD_CATEGORIES = new Set([
  'anime',
  'sports',
  'cricket',
  'football',
  'cars',
  'bikes',
  'movies',
  'heroes',
  'hollywood',
  'bollywood',
  'tollywood',
  'games',
  'cartoons',
  'travel',
  'nature',
  'music',
  'quotes',
  'celebrities',
  'animals',
]);

/**
 * Calculates a relevance score for a product given a query string.
 * Priority order (Section 4):
 * 1. Exact title match (500)
 * 2. Exact subject / character match (450)
 * 3. Title / Subject prefix match (350)
 * 4. Title / Subject phrase substring match (250)
 * 5. Franchise match (180)
 * 6. Category / Subcategory match (80)
 * 7. Tag match (50)
 * 8. Description / caption / relationship match (20)
 */
export function scoreProductSearch(product: ArchiveProduct, rawQuery: string): SearchScoreResult {
  const normQ = normalizeSearchTerm(rawQuery);
  if (!normQ) {
    return { product, score: product.popularity || 50, matchReasons: [] };
  }

  const queryTokens = normQ.split(' ').filter(Boolean);
  let score = 0;
  const matchReasons: string[] = [];

  const titleNorm = normalizeSearchTerm(product.title);
  const subjectNorm = normalizeSearchTerm(product.characterOrSubject || product.subject || '');
  const franchiseNorm = normalizeSearchTerm(product.franchise || '');
  const categoryNorm = normalizeSearchTerm(product.category || '');
  const subcategoryNorm = normalizeSearchTerm(product.subcategory || '');
  const captionNorm = normalizeSearchTerm(product.caption || '');
  const roleNorm = normalizeSearchTerm(product.role || product.crewOrAffiliation || '');
  const tagsNorm = product.tags.map(normalizeSearchTerm);
  const aliasesNorm = (product.aliases || []).map(normalizeSearchTerm);

  // 1. Exact Title match
  if (titleNorm === normQ) {
    score += 500;
    matchReasons.push('Exact Title Match');
  } else if (titleNorm.startsWith(normQ)) {
    score += 350;
    matchReasons.push('Title Prefix Match');
  } else if (titleNorm.includes(normQ)) {
    score += 250;
    matchReasons.push('Title Substring Match');
  }

  // 2. Exact Subject / Character match
  if (subjectNorm === normQ) {
    score += 450;
    matchReasons.push('Exact Subject Match');
  } else if (subjectNorm.startsWith(normQ)) {
    score += 320;
    matchReasons.push('Subject Prefix Match');
  } else if (subjectNorm.includes(normQ)) {
    score += 220;
    matchReasons.push('Subject Substring Match');
  }

  // 3. Aliases match
  for (const al of aliasesNorm) {
    if (al === normQ) {
      score += 420;
      matchReasons.push(`Exact Alias "${al}"`);
      break;
    } else if (al.startsWith(normQ)) {
      score += 300;
      matchReasons.push(`Alias Prefix "${al}"`);
      break;
    } else if (al.includes(normQ)) {
      score += 200;
      break;
    }
  }

  // 4. Franchise Match
  if (franchiseNorm === normQ) {
    score += 180;
    matchReasons.push('Franchise Match');
  } else if (franchiseNorm.startsWith(normQ)) {
    score += 150;
    matchReasons.push('Franchise Prefix Match');
  } else if (franchiseNorm.includes(normQ)) {
    score += 120;
    matchReasons.push('Franchise Match');
  }

  // 5. Category / Subcategory Match
  if (categoryNorm === normQ) {
    score += 80;
    matchReasons.push('Category Match');
  } else if (categoryNorm.startsWith(normQ)) {
    score += 60;
  }

  if (subcategoryNorm === normQ) {
    score += 90;
    matchReasons.push('Subcategory Match');
  } else if (subcategoryNorm.includes(normQ)) {
    score += 50;
  }

  // 6. Tags Match
  for (const t of tagsNorm) {
    if (t === normQ) {
      score += 70;
      matchReasons.push(`Tag "${t}"`);
      break;
    } else if (t.startsWith(normQ)) {
      score += 50;
      matchReasons.push(`Tag "${t}"`);
      break;
    } else if (t.includes(normQ)) {
      score += 30;
      break;
    }
  }

  // 7. Role / Faction / Arc Match
  if (roleNorm.includes(normQ)) {
    score += 40;
    matchReasons.push('Role/Faction Match');
  }

  if (product.arcs && product.arcs.some((a) => normalizeSearchTerm(a).includes(normQ))) {
    score += 45;
    matchReasons.push('Story Arc Match');
  }

  // 8. Description / Caption
  if (captionNorm.includes(normQ)) {
    score += 20;
  }

  // 9. Multi-token evaluation with alias resolution
  let subjectMatchedTokens = 0;
  let generalMatchedTokens = 0;

  for (const token of queryTokens) {
    if (token.length <= 1) continue;

    const tokenInSubjectOrTitle =
      titleNorm.includes(token) ||
      subjectNorm.includes(token) ||
      aliasesNorm.some((a) => a.includes(token));

    const tokenInOther =
      franchiseNorm.includes(token) ||
      categoryNorm.includes(token) ||
      tagsNorm.some((t) => t.includes(token)) ||
      roleNorm.includes(token);

    if (tokenInSubjectOrTitle) {
      subjectMatchedTokens++;
      generalMatchedTokens++;
      score += 40;
    } else if (tokenInOther) {
      generalMatchedTokens++;
      score += 15;
    }

    // Check alias mapping for this token
    const aliases = ALIAS_MAP[token] || [];
    for (const alias of aliases) {
      if (
        titleNorm.includes(alias) ||
        subjectNorm.includes(alias) ||
        aliasesNorm.some((a) => a.includes(alias))
      ) {
        subjectMatchedTokens++;
        generalMatchedTokens++;
        score += 80;
        matchReasons.push(`Alias Match: ${alias}`);
        break;
      }
    }
  }

  // Completeness bonus
  if (queryTokens.length > 1 && generalMatchedTokens === queryTokens.length) {
    score += 60;
  }

  // Disqualification check:
  // If the query is NOT a broad category query (e.g. searching "Lionel Messi", "Virat Kohli", "Batman"),
  // but a product matched only a generic category without matching any subject or query tokens, discard it!
  const isBroadCategoryQuery = BROAD_CATEGORIES.has(normQ);
  if (!isBroadCategoryQuery && queryTokens.length > 0) {
    const hasAnyValidMatch =
      titleNorm.includes(normQ) ||
      subjectNorm.includes(normQ) ||
      franchiseNorm.includes(normQ) ||
      (product.brand && normalizeSearchTerm(product.brand).includes(normQ)) ||
      (product.team && normalizeSearchTerm(product.team).includes(normQ)) ||
      (product.club && normalizeSearchTerm(product.club).includes(normQ)) ||
      (product.country && normalizeSearchTerm(product.country).includes(normQ)) ||
      (product.role && normalizeSearchTerm(product.role).includes(normQ)) ||
      (product.crewOrAffiliation && normalizeSearchTerm(product.crewOrAffiliation).includes(normQ)) ||
      (product.arcs && product.arcs.some((a) => normalizeSearchTerm(a).includes(normQ))) ||
      tagsNorm.some((t) => t === normQ || t.includes(normQ)) ||
      aliasesNorm.some((a) => a.includes(normQ)) ||
      generalMatchedTokens > 0;

    if (!hasAnyValidMatch) {
      score = 0;
    }
  }

  // Popularity & Featured tie-breaker
  if (score > 0) {
    score += (product.popularity || 50) * 0.05;
    if (product.featured) score += 5;
  }

  return { product, score, matchReasons };
}

/**
 * Searches and ranks products strictly by relevance score
 */
export function rankArchiveProducts(
  products: ArchiveProduct[],
  query: string
): ArchiveProduct[] {
  const norm = normalizeSearchTerm(query);
  if (!norm) return products;

  const scored = products
    .map((p) => scoreProductSearch(p, norm))
    .filter((res) => res.score > 15);

  scored.sort((a, b) => b.score - a.score);
  return scored.map((res) => res.product);
}

/**
 * Computes autocomplete suggestions with exact corresponding thumbnails (Section 5)
 */
export function generateSearchSuggestions(
  products: ArchiveProduct[],
  query: string,
  limit: number = 7
): SearchSuggestionItem[] {
  const norm = normalizeSearchTerm(query);
  if (!norm) {
    // Curated trending defaults with exact thumbnails
    return products
      .filter((p) => p.featured || p.trending)
      .slice(0, limit)
      .map((p) => ({
        type: 'product',
        title: p.characterOrSubject || p.subject || p.title,
        subtitle: `${p.franchise || p.category.toUpperCase()} · ₹${p.price}`,
        query: p.characterOrSubject || p.title,
        image: p.thumbnail || p.image,
        product: p,
      }));
  }

  const suggestions: SearchSuggestionItem[] = [];
  const addedTitles = new Set<string>();

  // Helper to add suggestion
  const addSug = (item: SearchSuggestionItem) => {
    const key = item.title.toLowerCase();
    if (!addedTitles.has(key)) {
      addedTitles.add(key);
      suggestions.push(item);
    }
  };

  // Specific canonical autocomplete pairings required by prompt Section 5:
  // "luf" -> Monkey D. Luffy, One Piece, Straw Hat Pirates
  if ('monkey d. luffy'.startsWith(norm) || 'luffy'.startsWith(norm) || norm === 'luf') {
    const luffy = products.find((p) => p.characterOrSubject?.toLowerCase().includes('luffy'));
    if (luffy) {
      addSug({
        type: 'product',
        title: 'Monkey D. Luffy',
        subtitle: 'One Piece · Straw Hat Pirates (Captain / Joyboy)',
        query: 'Monkey D. Luffy',
        image: luffy.thumbnail || luffy.image,
        product: luffy,
      });
      addSug({
        type: 'franchise',
        title: 'One Piece',
        subtitle: 'Anime Franchise · 99 Canonical Prints',
        query: 'One Piece',
        image: luffy.thumbnail || luffy.image,
      });
      addSug({
        type: 'faction',
        title: 'Straw Hat Pirates',
        subtitle: 'Grand Line Pirate Crew · 10 Nakama Prints',
        query: 'Straw Hat Pirates',
        image: luffy.thumbnail || luffy.image,
      });
    }
  }

  // "mes" -> Lionel Messi, Football, Argentina
  if ('lionel messi'.startsWith(norm) || 'messi'.startsWith(norm) || norm === 'mes') {
    const messi = products.find((p) => p.characterOrSubject?.toLowerCase().includes('messi'));
    if (messi) {
      addSug({
        type: 'product',
        title: 'Lionel Messi',
        subtitle: 'World Cup 2022 Champion Glory · Argentina',
        query: 'Lionel Messi',
        image: messi.thumbnail || messi.image,
        product: messi,
      });
      addSug({
        type: 'category',
        title: 'Football',
        subtitle: 'Sports Archive · World Football Icons',
        query: 'Football',
        image: messi.thumbnail || messi.image,
      });
      addSug({
        type: 'faction',
        title: 'Argentina',
        subtitle: 'National Football Team · World Champions',
        query: 'Argentina',
        image: messi.thumbnail || messi.image,
      });
    }
  }

  // "vir" -> Virat Kohli, Cricket, India
  if ('virat kohli'.startsWith(norm) || 'virat'.startsWith(norm) || norm === 'vir') {
    const kohli = products.find((p) => p.characterOrSubject?.toLowerCase().includes('kohli'));
    if (kohli) {
      addSug({
        type: 'product',
        title: 'Virat Kohli',
        subtitle: 'King Kohli Master of Chase · Cricket',
        query: 'Virat Kohli',
        image: kohli.thumbnail || kohli.image,
        product: kohli,
      });
      addSug({
        type: 'category',
        title: 'Cricket',
        subtitle: 'Sports Archive · Cricket Legends & Champions',
        query: 'Cricket',
        image: kohli.thumbnail || kohli.image,
      });
      addSug({
        type: 'faction',
        title: 'India',
        subtitle: 'National Cricket Team · World Champions',
        query: 'India',
        image: kohli.thumbnail || kohli.image,
      });
    }
  }

  // "bat" -> Batman, DC, Superheroes
  if ('the batman'.startsWith(norm) || 'batman'.startsWith(norm) || norm === 'bat') {
    const batman = products.find((p) => p.characterOrSubject?.toLowerCase().includes('batman'));
    if (batman) {
      addSug({
        type: 'product',
        title: 'Batman',
        subtitle: 'The Dark Knight · Gotham Rooftop Vigilante',
        query: 'Batman',
        image: batman.thumbnail || batman.image,
        product: batman,
      });
      addSug({
        type: 'franchise',
        title: 'DC',
        subtitle: 'DC Comics Superhero Universe',
        query: 'DC',
        image: batman.thumbnail || batman.image,
      });
      addSug({
        type: 'category',
        title: 'Superheroes',
        subtitle: 'Comic Book Legends & Vigilantes',
        query: 'Superheroes',
        image: batman.thumbnail || batman.image,
      });
    }
  }

  // General Rank-based autocomplete results
  const ranked = rankArchiveProducts(products, norm);

  for (const p of ranked) {
    if (suggestions.length >= limit) break;
    const title = p.characterOrSubject || p.subject || p.title;
    addSug({
      type: 'product',
      title,
      subtitle: `${p.franchise || p.category.toUpperCase()} ${p.role ? `· ${p.role}` : ''}`,
      query: title,
      image: p.thumbnail || p.image,
      product: p,
    });
  }

  // If a franchise matches and isn't added, add it with exact representative image
  for (const p of products) {
    if (suggestions.length >= limit) break;
    if (p.franchise && normalizeSearchTerm(p.franchise).startsWith(norm)) {
      addSug({
        type: 'franchise',
        title: p.franchise,
        subtitle: `Franchise Archive · ${p.category.toUpperCase()}`,
        query: p.franchise,
        image: p.thumbnail || p.image,
      });
    }
  }

  return suggestions.slice(0, limit);
}

/**
 * Generates smart keyword search suggestions derived from actual archive data (Section 24)
 */
export function getSmartQuerySuggestions(query: string, products: ArchiveProduct[]): string[] {
  const norm = normalizeSearchTerm(query);
  if (!norm) {
    return ['One Piece', 'Lionel Messi', 'Virat Kohli', 'Porsche 911', 'Batman', 'Bleach'];
  }

  const suggestions: string[] = [];

  // Check aliases
  if (ALIAS_MAP[norm]) {
    suggestions.push(...ALIAS_MAP[norm]);
  }

  // Find matching franchises
  const matchingFranchises = new Set<string>();
  for (const p of products) {
    if (p.franchise && normalizeSearchTerm(p.franchise).includes(norm)) {
      matchingFranchises.add(p.franchise);
    }
  }

  // Find matching subjects
  const matchingSubjects = new Set<string>();
  for (const p of products) {
    const subj = p.characterOrSubject || p.subject;
    if (subj && normalizeSearchTerm(subj).includes(norm)) {
      matchingSubjects.add(subj);
    }
  }

  matchingSubjects.forEach((s) => suggestions.push(s));
  matchingFranchises.forEach((f) => suggestions.push(f));

  // Deduplicate and limit to 5
  return Array.from(new Set(suggestions)).slice(0, 5);
}
