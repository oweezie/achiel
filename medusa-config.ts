import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: {
    workflows: false //{
      // Using the provided PostgreSQL connection string for workflows
      //clientUrl: process.env.DATABASE_URL,
      // Alternatively, you may use dbName from the environment if preferred:
      // dbName: process.env.DB_NAME,

      // Optional: If utilizing a Redis workflow engine, configure as below
      // redis: {
      //   url: process.env.REDIS_URL,
      //   queueName: "workflow_queue"
      // }
   // }
  }
})
