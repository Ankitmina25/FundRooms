import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validateRequired, parsePagination } from "../utils/validate";

/**
 * Generate a unique challan number like CH-20260808-001
 */
const generateChallanNumber = async (): Promise<string> => {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  const prefix = `CH-${dateStr}-`;

  // Find the last challan number with today's date prefix
  const lastChallan = await prisma.salesChallan.findFirst({
    where: { challanNumber: { startsWith: prefix } },
    orderBy: { challanNumber: "desc" },
  });

  let nextNum = 1;
  if (lastChallan) {
    const lastNum = parseInt(lastChallan.challanNumber.split("-").pop() || "0");
    nextNum = lastNum + 1;
  }

  return `${prefix}${nextNum.toString().padStart(3, "0")}`;
};

/**
 * GET /api/challans
 * List all challans with filters and pagination.
 */
export const getChallans = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, search } = req.query as Record<string, string>;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true, businessName: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    res.json({
      success: true,
      data: challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GetChallans error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/challans/:id
 * Get challan detail with all items.
 */
export const getChallan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);

    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: "Challan not found" });
      return;
    }

    res.json({ success: true, data: challan });
  } catch (error) {
    console.error("GetChallan error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/challans
 * Create a new challan. If status is CONFIRMED, stock is reduced.
 *
 * Body: { customerId, status, items: [{ productId, quantity }] }
 */
export const createChallan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { customerId, status, items } = req.body;

    // Validate input
    const error = validateRequired({ customerId, items }, [
      "customerId",
      "items",
    ]);
    if (error) {
      res.status(400).json({ success: false, message: error });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one product item is required",
      });
      return;
    }

    const challanStatus = status || "DRAFT";
    if (!["DRAFT", "CONFIRMED"].includes(challanStatus)) {
      res.status(400).json({
        success: false,
        message: "Status must be DRAFT or CONFIRMED",
      });
      return;
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) },
    });
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    // Fetch all products and validate
    const productIds = items.map((item: any) => parseInt(item.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({
        success: false,
        message: "One or more products not found",
      });
      return;
    }

    // Build product map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate quantities and stock
    let totalQuantity = 0;
    const challanItems: any[] = [];

    for (const item of items) {
      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) {
        res.status(400).json({
          success: false,
          message: "Each item must have a quantity greater than 0",
        });
        return;
      }

      const product = productMap.get(parseInt(item.productId));
      if (!product) {
        res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        });
        return;
      }

      // If confirming, check stock availability
      if (challanStatus === "CONFIRMED" && product.currentStock < qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${qty}`,
        });
        return;
      }

      totalQuantity += qty;

      // Build item with product snapshot
      challanItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: qty,
        total: Number(product.unitPrice) * qty,
      });
    }

    // Generate challan number
    const challanNumber = await generateChallanNumber();

    // Use transaction to create challan and reduce stock (if confirmed)
    const challan = await prisma.$transaction(async (tx) => {
      // Create challan
      const newChallan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: parseInt(customerId),
          totalQuantity,
          status: challanStatus,
          createdById: req.userId!,
          items: {
            create: challanItems,
          },
        },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true } },
          items: true,
        },
      });

      // If confirmed, reduce stock and create stock movements
      if (challanStatus === "CONFIRMED") {
        for (const item of challanItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "OUT",
              reason: `Sales Challan ${challanNumber}`,
              createdById: req.userId!,
            },
          });
        }
      }

      return newChallan;
    });

    res.status(201).json({ success: true, data: challan });
  } catch (error) {
    console.error("CreateChallan error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/challans/:id/status
 * Update challan status (Confirm a draft, or Cancel).
 * Body: { status: "CONFIRMED" | "CANCELLED" }
 */
export const updateChallanStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be CONFIRMED or CANCELLED",
      });
      return;
    }

    // Get the challan with items
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: "Challan not found" });
      return;
    }

    // Only DRAFT challans can be confirmed or cancelled
    if (challan.status !== "DRAFT") {
      res.status(400).json({
        success: false,
        message: `Cannot change status. Challan is already ${challan.status}`,
      });
      return;
    }

    // If confirming, validate stock
    if (status === "CONFIRMED") {
      for (const item of challan.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.currentStock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for "${item.productName}". Available: ${product?.currentStock || 0}, Required: ${item.quantity}`,
          });
          return;
        }
      }
    }

    // Use transaction
    const updatedChallan = await prisma.$transaction(async (tx) => {
      const updated = await tx.salesChallan.update({
        where: { id },
        data: { status },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true } },
          items: true,
        },
      });

      // If confirming, reduce stock
      if (status === "CONFIRMED") {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "OUT",
              reason: `Sales Challan ${challan.challanNumber}`,
              createdById: req.userId!,
            },
          });
        }
      }

      return updated;
    });

    res.json({ success: true, data: updatedChallan });
  } catch (error) {
    console.error("UpdateChallanStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
