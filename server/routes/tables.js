const express = require('express')
const pool = require('../db')
const router = express.Router()
function validName(name) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}
router.post('/create', async (req, res) => {
  const { table, fields } = req.body
  if (!validName(table) || !Array.isArray(fields) || !fields.every(validName)) return res.sendStatus(400)
  const cols = fields.map(f => `"${f}" text`).join(', ')
  const sql = `CREATE TABLE IF NOT EXISTS "${req.uid}_${table}" (id serial primary key, uid text, ${cols})`
  try {
    await pool.query(sql)
    res.sendStatus(200)
  } catch {
    res.sendStatus(400)
  }
})
router.post('/:table', async (req, res) => {
  const { table } = req.params
  if (!validName(table)) return res.sendStatus(400)
  const keys = Object.keys(req.body).filter(validName)
  const cols = ['uid', ...keys]
  const vals = [req.uid, ...keys.map(k => req.body[k])]
  const params = vals.map((_, i) => `$${i+1}`)
  const sql = `INSERT INTO "${req.uid}_${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${params.join(',')}) RETURNING *`
  try {
    const r = await pool.query(sql, vals)
    res.json(r.rows[0])
  } catch {
    res.sendStatus(400)
  }
})
router.get('/:table', async (req, res) => {
  const { table } = req.params
  if (!validName(table)) return res.sendStatus(400)
  try {
    const r = await pool.query(`SELECT * FROM "${req.uid}_${table}" WHERE uid = $1`, [req.uid])
    res.json(r.rows)
  } catch {
    res.sendStatus(400)
  }
})
router.put('/:table/:id', async (req, res) => {
  const { table, id } = req.params
  if (!validName(table)) return res.sendStatus(400)
  const keys = Object.keys(req.body).filter(validName)
  if (!keys.length) return res.sendStatus(400)
  const sets = keys.map((k,i) => `"${k}" = $${i+2}`)
  const vals = [id, ...keys.map(k => req.body[k])]
  const sql = `UPDATE "${req.uid}_${table}" SET ${sets.join(',')} WHERE id = $1 AND uid = '${req.uid}' RETURNING *`
  try {
    const r = await pool.query(sql, vals)
    if (!r.rows.length) return res.sendStatus(404)
    res.json(r.rows[0])
  } catch {
    res.sendStatus(400)
  }
})
router.delete('/:table/:id', async (req, res) => {
  const { table, id } = req.params
  if (!validName(table)) return res.sendStatus(400)
  const sql = `DELETE FROM "${req.uid}_${table}" WHERE id = $1 AND uid = $2 RETURNING *`
  try {
    const r = await pool.query(sql, [id, req.uid])
    if (!r.rows.length) return res.sendStatus(404)
    res.json(r.rows[0])
  } catch {
    res.sendStatus(400)
  }
})
module.exports = router 