import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/types";
import logger from "../../../util/logger";

/**
 * GET handler for store custom route
 * Returns store information and featured products
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const productService = req.scope.resolve("productService");
    const storeService = req.scope.resolve("storeService");
    
    // Get query parameters with defaults
    const limit = parseInt(req.query.limit as string) || 5;
    const storeId = req.query.store_id as string;
    
    // Validate parameters
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        message: "Limit must be between 1 and 100",
        status: 400,
        error: "Bad Request"
      });
    }
    
    // Get store information
    let storeInfo;
    try {
      storeInfo = await storeService.retrieve(storeId);
    } catch (error) {
      // Store ID might not be required, continue without it
      storeInfo = { name: "Default Store" };
    }
    
    // Get featured products
    let featuredProducts;
    try {
      featuredProducts = await productService.list(
        { is_giftcard: false },
        { 
          take: limit,
          order: { created_at: "DESC" }
        }
      );
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching featured products",
        status: 500,
        error: "Internal Server Error"
      });
    }
    
    return res.status(200).json({
      store: storeInfo,
      featured_products: featuredProducts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Unexpected error in store custom route:", error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      status: 500,
      error: "Internal Server Error"
    });
  }
}

/**
 * POST handler for store custom route
 * Allows submitting customer feedback
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { email, feedback, rating } = req.body;
    
    // Validate required fields
    if (!email || !feedback) {
      return res.status(400).json({
        message: "Email and feedback are required fields",
        status: 400,
        error: "Bad Request"
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        status: 400,
        error: "Bad Request"
      });
    }
    
    // Validate rating if provided
    if (rating !== undefined && (isNaN(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5",
        status: 400,
        error: "Bad Request"
      });
    }
    
    logger.info("Feedback received", { email, feedback, rating });
    
    return res.status(201).json({
      message: "Feedback received successfully",
      status: 201,
      data: {
        id: `feedback_${Date.now()}`,
        email,
        feedback,
        rating: rating || null,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error("Error processing feedback", { error: error.toString() });
    return res.status(500).json({
      message: "An error occurred while processing your feedback",
      status: 500,
      error: "Internal Server Error"
    });
  }
}
