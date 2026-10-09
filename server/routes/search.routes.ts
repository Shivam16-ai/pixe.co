import { Router, Request, Response } from 'express';
import { prisma } from '../db';

export const searchRouter = Router();

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * GET /api/search?q=
 * Full ranking and autocomplete suggestions
 */
searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const rawQ = (req.query.q as string || req.query.search as string || '').trim();

    if (!rawQ) {
      return res.json({
        success: true,
        query: '',
        results: [],
        suggestions: [],
      });
    }

    const normQ = rawQ.toLowerCase();
    const queryTokens = normQ.split(/\s+/).filter(Boolean);

    // Fetch all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        subject: true,
        category: true,
        subcategory: true,
        franchise: true,
        image: true,
        thumbnail: true,
        price: true,
        style: true,
        tags: true,
        aliases: true,
        role: true,
      },
    });

    // Score products
    const scored = products
      .map((p: {
        id: string;
        title: string;
        subject: string;
        category: string;
        subcategory: string | null;
        franchise: string | null;
        image: string;
        thumbnail: string | null;
        price: number;
        style: string;
        tags: string | null;
        aliases: string | null;
        role: string | null;
      }) => {
        const title = p.title.toLowerCase();
        const subject = p.subject.toLowerCase();
        const franchise = (p.franchise || '').toLowerCase();
        const category = p.category.toLowerCase();
        const subcategory = (p.subcategory || '').toLowerCase();
        const tags = safeJsonParse<string[]>(p.tags, []).map((t: string) => t.toLowerCase());
        const aliases = safeJsonParse<string[]>(p.aliases, []).map((a: string) => a.toLowerCase());

        let score = 0;

        if (title === normQ) score += 500;
        else if (title.startsWith(normQ)) score += 350;
        else if (title.includes(normQ)) score += 200;

        if (subject === normQ) score += 450;
        else if (subject.startsWith(normQ)) score += 320;
        else if (subject.includes(normQ)) score += 180;

        for (const a of aliases) {
          if (a === normQ) score += 400;
          else if (a.startsWith(normQ)) score += 280;
          else if (a.includes(normQ)) score += 150;
        }

        if (franchise === normQ) score += 250;
        else if (franchise.includes(normQ)) score += 140;

        if (category === normQ) score += 90;
        if (subcategory.includes(normQ)) score += 70;

        for (const t of tags) {
          if (t === normQ) score += 80;
          else if (t.includes(normQ)) score += 40;
        }

        for (const tok of queryTokens) {
          if (title.includes(tok) || subject.includes(tok)) score += 40;
          else if (tags.some((t: string) => t.includes(tok))) score += 20;
        }

        return { product: p, score };
      })
      .filter((item: { score: number }) => item.score > 25)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    // Build autocomplete suggestions with exact corresponding thumbnails
    const suggestions: any[] = [];
    const seenTitles = new Set<string>();

    for (const item of scored.slice(0, 8)) {
      const p = item.product;
      const title = p.subject || p.title;
      if (!seenTitles.has(title.toLowerCase())) {
        seenTitles.add(title.toLowerCase());
        suggestions.push({
          type: 'product',
          title,
          subtitle: `${p.franchise || p.category.toUpperCase()} · ₹${p.price}`,
          query: title,
          image: p.thumbnail || p.image,
          productId: p.id,
        });
      }
    }

    return res.json({
      success: true,
      query: rawQ,
      count: scored.length,
      results: scored.map((item: { product: {
        id: string;
        title: string;
        subject: string;
        category: string;
        subcategory: string | null;
        franchise: string | null;
        image: string;
        thumbnail: string | null;
        price: number;
        style: string;
      } }) => ({
        id: item.product.id,
        title: item.product.title,
        characterOrSubject: item.product.subject,
        subject: item.product.subject,
        category: item.product.category,
        subcategory: item.product.subcategory,
        franchise: item.product.franchise,
        image: item.product.image,
        thumbnail: item.product.thumbnail || item.product.image,
        price: item.product.price,
        style: item.product.style,
      })),
      suggestions,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process darkroom search.',
    });
  }
});
