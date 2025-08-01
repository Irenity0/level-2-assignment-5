import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import authRoutes from "./modules/auth/auth.routes"

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Catch invalid JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload. Please fix your request body.",
    })
  }
  next(err)
})


// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Kitler wallet is running uwu!",
    timestamp: new Date().toISOString(),
  })
})

// Simple root API endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Kitler wallet uwu",
  })
})

// routees
app.use("/api/auth", authRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", error)
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  })
})

export default app