import express from 'express'
import cors from 'cors'
import syncRoutes from './routes/sync.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/sync', syncRoutes)

// 🔥 pakai port dari Railway
const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})