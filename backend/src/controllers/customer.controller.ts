import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  validateRequired,
  validateEmail,
  validateMobile,
  parsePagination,
} from "../utils/validate";

/**
 * GET /api/customers
 * List all customers with search, filter, and pagination.
 */
export const getCustomers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, customerType } = req.query as Record<string, string>;

    // Build filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { businessName: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { id: true, name: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GetCustomers error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/customers/:id
 * Get a single customer's detail.
 */
export const getCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        challans: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            challanNumber: true,
            totalQuantity: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("GetCustomer error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/customers
 * Create a new customer.
 */
export const createCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    // Validate required fields
    const error = validateRequired(
      { name, mobile, businessName, customerType, address },
      ["name", "mobile", "businessName", "customerType", "address"]
    );
    if (error) {
      res.status(400).json({ success: false, message: error });
      return;
    }

    if (!validateMobile(mobile)) {
      res.status(400).json({ success: false, message: "Invalid mobile number" });
      return;
    }

    if (email && !validateEmail(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }

    // Validate enums
    const validTypes = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
    if (!validTypes.includes(customerType)) {
      res.status(400).json({
        success: false,
        message: `Customer type must be one of: ${validTypes.join(", ")}`,
      });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email: email || null,
        businessName,
        gstNumber: gstNumber || null,
        customerType,
        address,
        status: status || "LEAD",
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
        createdById: req.userId || null,
      },
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    console.error("CreateCustomer error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/customers/:id
 * Update an existing customer.
 */
export const updateCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    // Check if customer exists
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    if (mobile && !validateMobile(mobile)) {
      res.status(400).json({ success: false, message: "Invalid mobile number" });
      return;
    }

    if (email && !validateEmail(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(mobile && { mobile }),
        ...(email !== undefined && { email: email || null }),
        ...(businessName && { businessName }),
        ...(gstNumber !== undefined && { gstNumber: gstNumber || null }),
        ...(customerType && { customerType }),
        ...(address && { address }),
        ...(status && { status }),
        ...(followUpDate !== undefined && {
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("UpdateCustomer error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/customers/:id/follow-up
 * Add a follow-up note to a customer.
 */
export const addFollowUp = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { notes, followUpDate } = req.body;

    if (!notes) {
      res
        .status(400)
        .json({ success: false, message: "Notes field is required" });
      return;
    }

    // Check if customer exists
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    // Append new note with timestamp to existing notes
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${notes}`;
    const updatedNotes = existing.notes
      ? `${existing.notes}\n${newNote}`
      : newNote;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        notes: updatedNotes,
        ...(followUpDate && { followUpDate: new Date(followUpDate) }),
      },
    });

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error("AddFollowUp error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
