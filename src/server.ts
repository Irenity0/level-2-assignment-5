import dotenv from "dotenv"
import app from "./app"
import connectDB from "./config/database"

dotenv.config()

const PORT = process.env.PORT || 3000

connectDB()

app.listen(PORT, () => {
  console.log(`Kitler wallet ready on port http://localhost:${PORT} uwu`)
})

process.on("unhandledRejection", (err: any) => {
  console.error("Unhandled Promise Rejection:", err)
  process.exit(1)
})

process.on("uncaughtException", (err: any) => {
  console.error("Uncaught Exception:", err)
  process.exit(1)
})
