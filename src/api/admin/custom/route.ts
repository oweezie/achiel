import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { EntityManager } from "typeorm"

/**
 * @swagger
 * /admin/custom:
 *   get:
 *     description: Get admin dashboard statistics
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve("logger")
  const manager: EntityManager = req.scope.resolve("manager")

  try {
    logger.info("Admin custom endpoint called")

    // Sample business logic: Get counts of various entities
    const stats = await manager.transaction(async (transactionManager) => {
      // Get product count
      const productCount = await transactionManager
        .query("SELECT COUNT(*) as count FROM product")
        .then(result => parseInt(result[0].count))

      // Get order count
      const orderCount = await transactionManager
        .query("SELECT COUNT(*) as count FROM \"order\"")
        .then(result => parseInt(result[0].count))

      // Get customer count
      const customerCount = await transactionManager
        .query("SELECT COUNT(*) as count FROM customer")
        .then(result => parseInt(result[0].count))

      return {
        products: productCount,
        orders: orderCount,
        customers: customerCount,
        timestamp: new Date().toISOString(),
      }
    })

    return res.status(200).json({
      success: true,
      message: "Admin dashboard statistics retrieved successfully",
      data: stats,
    })
  } catch (error) {
    logger.error("Error in admin custom endpoint", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving admin statistics",
      error: error.message,
    })
  }
}

/**
 * @swagger
 * /admin/custom:
 *   post:
 *     description: Process admin custom action
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve("logger")
  
  try {
    const { action } = req.body

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required",
      })
    }

    logger.info(`Admin custom action requested: ${action}`)

    // Sample business logic based on action
    let result
    switch (action) {
      case "refresh_cache":
        // Simulate cache refresh
        result = { 
          action: "refresh_cache", 
          status: "completed", 
          timestamp: new Date().toISOString() 
        }
        break
      case "generate_report":
        // Simulate report generation
        result = { 
          action: "generate_report", 
          status: "scheduled", 
          reportId: `report_${Date.now()}`,
          timestamp: new Date().toISOString() 
        }
        break
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported action: ${action}`,
        })
    }

    return res.status(200).json({
      success: true,
      message: `Action '${action}' processed successfully`,
      data: result,
    })
  } catch (error) {
    logger.error("Error in admin custom POST endpoint", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the custom action",
      error: error.message,
    })
  }
}
