import { ArchiveProduct } from '../types';

export interface ImageAuditResult {
  validCount: number;
  missingCount: number;
  invalidUrlCount: number;
  items: {
    id: string;
    title: string;
    image: string;
    isValid: boolean;
    status: 'VERIFIED' | 'MISSING_IMAGE' | 'INVALID_URL';
    message?: string;
  }[];
}

/**
 * Validates all products in the PIXÉ.CO catalog.
 * Performs checks for empty images, invalid URL schemas, and missing sources.
 */
export function auditProductCatalogImages(products: ArchiveProduct[]): ImageAuditResult {
  const result: ImageAuditResult = {
    validCount: 0,
    missingCount: 0,
    invalidUrlCount: 0,
    items: [],
  };

  const logs: string[] = ['\n========================================', 'PIXÉ.CO IMAGE AUDIT', '========================================'];

  for (const product of products) {
    const img = (product.image || '').trim();
    const title = product.characterOrSubject || product.subject || product.title;

    if (!img || img.toUpperCase().includes('PENDING')) {
      result.missingCount++;
      result.items.push({
        id: product.id,
        title,
        image: img,
        isValid: false,
        status: 'MISSING_IMAGE',
        message: 'Image source is missing or marked pending',
      });
      logs.push(`✗ ${title} — IMAGE MISSING`);
      continue;
    }

    const isValidUrl =
      img.startsWith('http://') ||
      img.startsWith('https://') ||
      img.startsWith('/') ||
      img.startsWith('data:image/');

    if (!isValidUrl) {
      result.invalidUrlCount++;
      result.items.push({
        id: product.id,
        title,
        image: img,
        isValid: false,
        status: 'INVALID_URL',
        message: 'Image URL is malformed',
      });
      logs.push(`✗ ${title} — INVALID URL: ${img}`);
      continue;
    }

    result.validCount++;
    result.items.push({
      id: product.id,
      title,
      image: img,
      isValid: true,
      status: 'VERIFIED',
    });
    logs.push(`✓ ${title}`);
  }

  logs.push('========================================');
  logs.push(`AUDIT COMPLETE: ${result.validCount} VERIFIED · ${result.missingCount} MISSING · ${result.invalidUrlCount} INVALID`);
  logs.push('========================================\n');

  if (process.env.NODE_ENV !== 'production' || import.meta.env?.DEV) {
    console.info(logs.join('\n'));
  }

  return result;
}

export interface ArchiveAuditReport {
  totalProducts: number;
  validImages: number;
  missingImages: number;
  duplicateAssets: number;
  duplicateIds: string[];
  missingTitles: string[];
  missingCategories: string[];
  invalidRelationships: string[];
}

/**
 * Validates all product images in the archive and detects duplicates or missing sources.
 * Requirement: Section 18 (ARCHIVE IMAGE AUDIT)
 */
export function validateArchiveImages(products: ArchiveProduct[]): ArchiveAuditReport {
  const seenImages = new Map<string, string[]>();
  let validCount = 0;
  let missingCount = 0;

  for (const p of products) {
    const img = (p.image || '').trim();
    if (!img || img.toUpperCase().includes('PENDING')) {
      missingCount++;
    } else {
      validCount++;
      const list = seenImages.get(img) || [];
      list.push(p.id);
      seenImages.set(img, list);
    }
  }

  let duplicateAssets = 0;
  seenImages.forEach((ids) => {
    if (ids.length > 1) {
      duplicateAssets++;
    }
  });

  const report: ArchiveAuditReport = {
    totalProducts: products.length,
    validImages: validCount,
    missingImages: missingCount,
    duplicateAssets,
    duplicateIds: [],
    missingTitles: [],
    missingCategories: [],
    invalidRelationships: [],
  };

  if (process.env.NODE_ENV !== 'production' || import.meta.env?.DEV) {
    console.info(
      `\n========================================\n` +
      `PIXÉ.CO ARCHIVE IMAGE AUDIT\n` +
      `========================================\n` +
      `Total products: ${report.totalProducts}\n` +
      `Valid images: ${report.validImages}\n` +
      `Missing images: ${report.missingImages}\n` +
      `Duplicate assets: ${report.duplicateAssets}\n` +
      `========================================\n`
    );
  }

  return report;
}

/**
 * Validates data integrity: duplicate IDs, missing titles/categories, relationship targets.
 * Requirement: Section 36 & 37 (NO DUPLICATES & DATA QUALITY)
 */
export function validateArchiveData(products: ArchiveProduct[]): ArchiveAuditReport {
  const baseReport = validateArchiveImages(products);
  const seenIds = new Set<string>();

  for (const p of products) {
    if (seenIds.has(p.id)) {
      baseReport.duplicateIds.push(p.id);
    }
    seenIds.add(p.id);

    if (!p.title || !p.title.trim()) {
      baseReport.missingTitles.push(p.id);
    }

    if (!p.category || !p.category.trim()) {
      baseReport.missingCategories.push(p.id);
    }

    if (p.keyRelationships) {
      for (const rel of p.keyRelationships) {
        if (!rel.target || !rel.type) {
          baseReport.invalidRelationships.push(`${p.id} -> invalid relationship`);
        }
      }
    }
  }

  return baseReport;
}

