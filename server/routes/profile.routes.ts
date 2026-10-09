import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

export const profileRouter = Router();

profileRouter.use(requireAuth);

/**
 * GET /api/profile (Section 20)
 */
profileRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true, favorites: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      profile: {
        ...user,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

/**
 * PATCH /api/profile
 */
profileRouter.patch('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, phone, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone !== undefined ? phone : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        ...updated,
        role: updated.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

/**
 * GET /api/addresses (Section 21)
 */
profileRouter.get('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    return res.json({ success: true, addresses });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve addresses.' });
  }
});

/**
 * POST /api/addresses
 */
profileRouter.post('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country = 'India', isDefault = false } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, address, city, and postal code are required.',
      });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state: state || 'Default',
        postalCode,
        country,
        isDefault: Boolean(isDefault),
      },
    });

    return res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    console.error('Create address error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

/**
 * PATCH /api/addresses/:id
 */
profileRouter.patch('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.updateMany({
      where: { id, userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault,
      },
    });

    return res.json({ success: true, message: 'Address updated.' });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

/**
 * DELETE /api/addresses/:id
 */
profileRouter.delete('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.address.deleteMany({
      where: { id, userId },
    });

    return res.json({ success: true, message: 'Address removed.' });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

/**
 * GET /api/favorites (Section 35)
 */
profileRouter.get('/favorites', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      favorites: favorites.map((f: { id: string; productId: string; product: unknown; createdAt: Date }) => ({
        id: f.id,
        productId: f.productId,
        product: f.product,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Favorites fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve favorites.' });
  }
});

/**
 * POST /api/favorites/:productId
 */
profileRouter.post('/favorites/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const fav = await prisma.favorite.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
    });

    return res.json({ success: true, message: 'Added to favorites.', favorite: fav });
  } catch (error) {
    console.error('Add favorite error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add to favorites.' });
  }
});

/**
 * DELETE /api/favorites/:productId
 */
profileRouter.delete('/favorites/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    await prisma.favorite.deleteMany({
      where: { userId, productId },
    });

    return res.json({ success: true, message: 'Removed from favorites.' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove favorite.' });
  }
});

/**
 * GET /api/recently-viewed (Section 36)
 */
profileRouter.get('/recently-viewed', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const list = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { viewedAt: 'desc' },
      take: 20,
    });

    return res.json({
      success: true,
      items: list.map((item: { product: unknown }) => item.product),
    });
  } catch (error) {
    console.error('Recently viewed error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recently viewed.' });
  }
});

/**
 * POST /api/recently-viewed/:productId
 */
profileRouter.post('/recently-viewed/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user!.id;

    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: { viewedAt: new Date() },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Record recently viewed error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update recently viewed.' });
  }
});
