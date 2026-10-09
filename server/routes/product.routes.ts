import { Router, Request, Response } from 'express';
import { prisma } from '../db';

export const productRouter = Router();

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function formatProduct(p: any) {
  return {
    id: p.id,
    title: p.title,
    characterOrSubject: p.subject,
    subject: p.subject,
    category: p.category,
    subcategory: p.subcategory,
    franchise: p.franchise,
    description: p.description,
    image: p.image,
    thumbnail: p.thumbnail || p.image,
    price: p.price,
    style: p.style,
    stockQuantity: p.stockQuantity,
    featured: p.featured,
    popular: p.popular,
    trending: p.trending,
    aliases: safeJsonParse(p.aliases, []),
    tags: safeJsonParse(p.tags, []),
    arcs: safeJsonParse(p.arcs, []),
    role: p.role,
    crewOrAffiliation: p.crewOrAffiliation,
    relationshipGroup: safeJsonParse(p.relationshipGroup, []),
    caption: p.caption,
    dateStr: p.dateStr,
    rotation: p.rotation,
    tapeColor: p.tapeColor,
    imageStatus: p.imageStatus,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * GET /api/products
 * Server-side filtered and paginated product archive
 */
productRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 36));
    const search = (req.query.search as string || req.query.q as string || '').trim().toLowerCase();
    const category = (req.query.category as string || 'all').trim();
    const subcategory = (req.query.subcategory as string || 'all').trim();
    const franchise = (req.query.franchise as string || 'all').trim();
    const style = (req.query.style as string || 'all').trim();
    const sort = (req.query.sort as string || 'trending').trim();

    const where: any = {};

    if (category !== 'all') {
      where.category = category;
    }

    if (subcategory !== 'all') {
      where.subcategory = subcategory;
    }

    if (franchise !== 'all') {
      where.franchise = franchise;
    }

    if (style !== 'all') {
      where.style = style;
    }

    // Load products from DB
    let allMatching = await prisma.product.findMany({
      where,
    });

    // If search query is present, rank and filter in memory using multi-field relevance
    if (search) {
      const searchTokens = search.split(/\s+/).filter(Boolean);
      allMatching = allMatching
        .map((p: (typeof allMatching)[number]) => {
          const title = p.title.toLowerCase();
          const subject = p.subject.toLowerCase();
          const pFranchise = (p.franchise || '').toLowerCase();
          const pCategory = p.category.toLowerCase();
          const pSubcategory = (p.subcategory || '').toLowerCase();
          const tags = safeJsonParse<string[]>(p.tags, []).map((t: string) => t.toLowerCase());
          const aliases = safeJsonParse<string[]>(p.aliases, []).map((a: string) => a.toLowerCase());

          let score = 0;

          if (title === search) score += 500;
          else if (title.startsWith(search)) score += 350;
          else if (title.includes(search)) score += 200;

          if (subject === search) score += 450;
          else if (subject.startsWith(search)) score += 320;
          else if (subject.includes(search)) score += 180;

          if (aliases.some((a: string) => a === search || a.includes(search))) score += 300;
          if (pFranchise === search || pFranchise.includes(search)) score += 150;
          if (pCategory === search) score += 80;
          if (pSubcategory.includes(search)) score += 60;
          if (tags.some((t: string) => t === search || t.includes(search))) score += 50;

          for (const token of searchTokens) {
            if (title.includes(token) || subject.includes(token)) score += 40;
            else if (tags.some((t: string) => t.includes(token))) score += 20;
          }

          return { product: p, score };
        })
        .filter((item: { score: number }) => item.score > 20)
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .map((item: { product: (typeof allMatching)[number] }) => item.product);
    } else {
      // Sorting
      if (sort === 'trending') {
        allMatching.sort((a: { trending: boolean }, b: { trending: boolean }) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
      } else if (sort === 'popular') {
        allMatching.sort((a: { popular: boolean }, b: { popular: boolean }) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
      } else if (sort === 'new') {
        allMatching.sort((a: { createdAt: Date }, b: { createdAt: Date }) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (sort === 'az') {
        allMatching.sort((a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title));
      } else if (sort === 'price-asc') {
        allMatching.sort((a: { price: number }, b: { price: number }) => a.price - b.price);
      } else if (sort === 'price-desc') {
        allMatching.sort((a: { price: number }, b: { price: number }) => b.price - a.price);
      }
    }

    const total = allMatching.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = allMatching.slice(offset, offset + limit);

    return res.json({
      success: true,
      items: paginated.map(formatProduct),
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve darkroom archive catalog.',
    });
  }
});

/**
 * GET /api/products/:id
 * Retrieve single product + related products from database
 */
productRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ${id} not found in darkroom archive.`,
      });
    }

    // Fetch related products (same franchise or category, excluding current)
    const relatedDb = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        OR: [
          product.franchise ? { franchise: product.franchise } : {},
          { category: product.category },
        ],
      },
      take: 6,
    });

    return res.json({
      success: true,
      product: formatProduct(product),
      relatedProducts: relatedDb.map(formatProduct),
    });
  } catch (error) {
    console.error('Product detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product details.',
    });
  }
});

/**
 * GET /api/categories
 * Database supported categories
 */
productRouter.get('/meta/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      categories: categories.map((c: {
        id: string;
        name: string;
        slug: string;
        iconName: string | null;
        featuredImage: string | null;
        description: string | null;
        itemCount: number;
        subcategories: string | null;
      }) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        iconName: c.iconName,
        featuredImage: c.featuredImage,
        description: c.description,
        itemCount: c.itemCount,
        subcategories: safeJsonParse(c.subcategories, []),
      })),
    });
  } catch (error) {
    console.error('Categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category catalog.',
    });
  }
});
