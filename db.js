import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',     
  database: 'managestore',
  port: 3307        
})

export default db