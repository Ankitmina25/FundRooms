import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validateRequired, parsePagination } from "../utils/validate";

/**
 * GET /api/products
 * List all products with search and pagination.
 */
export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, category } = req.query as Record<string, string>;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GetProducts error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/products/low-stock
 * Get products where currentStock is below minimumStock.
 */
export const getLowStockProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const products = await prisma.$queryRaw`
      SELECT * FROM Product WHERE currentStock < minimumStock ORDER BY currentStock ASC
    `;

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("GetLowStockProducts error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/products/:id
 * Get product detail with recent stock movements.
 */
export const getProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("GetProduct error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/products
 * Create a new product.
 */
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, sku, category, unitPrice, currentStock, minimumStock, warehouse } =
      req.body;

    const error = validateRequired(
      { name, sku, category, unitPrice, warehouse },
      ["name", "sku", "category", "unitPrice", "warehouse"]
    );
    if (error) {
      res.status(400).json({ success: false, message: error });
      return;
    }

    // Check for duplicate SKU
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      res.status(400).json({ success: false, message: "SKU already exists" });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice: parseFloat(unitPrice),
        currentStock: parseInt(currentStock) || 0,
        minimumStock: parseInt(minimumStock) || 0,
        warehouse,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("CreateProduct error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/products/:id
 * Update an existing product.
 */
export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, sku, category, unitPrice, minimumStock, warehouse } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // Check for duplicate SKU if it's being changed
    if (sku && sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku) {
        res.status(400).json({ success: false, message: "SKU already exists" });
        return;
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(sku && { sku }),
        ...(category && { category }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
        ...(minimumStock !== undefined && {
          minimumStock: parseInt(minimumStock),
        }),
        ...(warehouse && { warehouse }),
      },
    });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("UpdateProduct error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/products/:id/stock
 * Add a stock movement (IN or OUT) and update current stock.
 */
export const addStockMovement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.id as string);
    const { quantity, type, reason } = req.body;

    const error = validateRequired({ quantity, type, reason }, [
      "quantity",
      "type",
      "reason",
    ]);
    if (error) {
      res.status(400).json({ success: false, message: error });
      return;
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      res
        .status(400)
        .json({ success: false, message: "Quantity must be greater than 0" });
      return;
    }

    if (!["IN", "OUT"].includes(type)) {
      res
        .status(400)
        .json({ success: false, message: "Type must be IN or OUT" });
      return;
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // Check if stock would go negative on OUT
    if (type === "OUT" && product.currentStock < qty) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.currentStock}, Requested: ${qty}`,
      });
      return;
    }

    // Use transaction to update stock and create movement
    const result = await prisma.$transaction(async (tx) => {
      const newStock =
        type === "IN"
          ? product.currentStock + qty
          : product.currentStock - qty;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          type,
          reason,
          createdById: req.userId!,
        },
      });

      return { product: updatedProduct, movement };
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("AddStockMovement error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
