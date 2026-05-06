import express from 'express'
import cors from 'cors'
import syncRoutes from './routes/sync.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/sync', syncRoutes)

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on http://192.168.1.5:5000')
})