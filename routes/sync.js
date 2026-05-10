import express from 'express'
import db from '../db.js'

const router = express.Router()

/* ===============================
   1. PUSH (HP → SERVER)
   ===============================*/
router.post('/', async (req, res) => {
  const { products, movements, sales } = req.body

  try {
    // simpan produk
for (const p of products || []) {

  const formattedDate = p.updated_at
    ?.replace('T', ' ')
    ?.replace('Z', '')
    ?.split('.')[0]

  await db.query(
    `INSERT INTO products 
    (id, name, category, kode_barang, price, modal, stock, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    name=VALUES(name),
    category=VALUES(category),
    kode_barang=VALUES(kode_barang),
    price=VALUES(price),
    modal=VALUES(modal),
    stock=VALUES(stock),
    updated_at=VALUES(updated_at)`,

    [
      p.id,
      p.name,
      p.category,
      p.kode_barang,
      p.price,
      p.modal,
      p.stock,
      formattedDate
    ]
  )
}
   // simpan pergerakan stok + update stock
for (const m of movements || []) {

  const createdAt = m.created_at
    ?.replace('T', ' ')
    ?.replace('Z', '')
    ?.split('.')[0]

  // insert movement
  const [result] = await db.query(
    `INSERT IGNORE INTO stock_movements 
     (id, product_id, type, quantity, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,

    [
      m.id,
      m.product_id,
      m.type,
      m.quantity,
      m.note,
      createdAt
    ]
  )

  // update stock kalau data baru
  if (result.affectedRows > 0) {

    await db.query(
      `UPDATE products 
       SET stock = stock ${m.type === 'IN' ? '+' : '-'} ?
       WHERE id = ?`,

      [
        m.quantity,
        m.product_id
      ]
    )
  }
}

for (const s of sales || []) {

  const createdAt = s.created_at
    ?.replace('T', ' ')
    ?.replace('Z', '')
    ?.split('.')[0]

  await db.query(
    `INSERT IGNORE INTO sales 
    (id, product_id, quantity, total_price, total_profit, created_at)
    VALUES (?, ?, ?, ?, ?, ?)`,

    [
      s.id,
      s.product_id,
      s.quantity,
      s.total_price,
      s.total_profit,
      createdAt
    ]
  )
}

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})


router.get('/pull', async (req, res) => {

  const lastSync =
    req.query.lastSync || '1970-01-01 00:00:00'

  try {

    const [products] = await db.query(
      `SELECT * FROM products
       WHERE updated_at >= ?`,
      [lastSync]
    )

    const [movements] = await db.query(
      `SELECT * FROM stock_movements
       WHERE created_at >= ?`,
      [lastSync]
    )

    const [sales] = await db.query(
      `SELECT * FROM sales
       WHERE created_at >= ?`,
      [lastSync]
    )

    res.json({
      products,
      movements,
      sales
    })

  } catch (err) {

    console.error('PULL ERROR:', err)

    res.status(500).json({
      error: err.message
    })
  }
})

export default router