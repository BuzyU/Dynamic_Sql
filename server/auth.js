const admin = require('firebase-admin')
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
}
module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization || ''
  const match = authHeader.match(/^Bearer (.+)$/)
  if (!match) return res.sendStatus(401)
  try {
    const decoded = await admin.auth().verifyIdToken(match[1])
    req.uid = decoded.uid
    next()
  } catch (e) {
    res.sendStatus(401)
  }
} 