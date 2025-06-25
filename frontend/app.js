const firebaseConfig = {apiKey:"AIzaSyCFn-QYrb0UBL1jDJojC2oz6-Sotqf2ty8",authDomain:"dynamic-sql.firebaseapp.com",projectId:"dynamic-sql",storageBucket:"dynamic-sql.firebasestorage.app",messagingSenderId:"665809851568",appId:"1:665809851568:web:e2e0ea802aec3f57185775",measurementId:"G-G9RYKYVPN1"}
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const userDiv = document.getElementById('user')
const loginBtn = document.getElementById('login')
const logoutBtn = document.getElementById('logout')
const main = document.getElementById('main')
let idToken = ''
function showUser(user) {
  userDiv.textContent = user.displayName+" "+user.email
  loginBtn.style.display = 'none'
  logoutBtn.style.display = ''
  main.style.display = ''
}
function hideUser() {
  userDiv.textContent = ''
  loginBtn.style.display = ''
  logoutBtn.style.display = 'none'
  main.style.display = 'none'
}
auth.onAuthStateChanged(async u => {
  if (u) {
    idToken = await u.getIdToken()
    showUser(u)
  } else {
    idToken = ''
    hideUser()
  }
})
loginBtn.onclick = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
logoutBtn.onclick = () => auth.signOut()
document.getElementById('create-table').onsubmit = async e => {
  e.preventDefault()
  const table = document.getElementById('table-name').value.trim()
  const fields = document.getElementById('fields').value.split(',').map(f=>f.trim()).filter(Boolean)
  const r = await fetch('/tables/create', {method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+idToken},body:JSON.stringify({table,fields})})
  document.getElementById('result').textContent = r.ok?'Table created':await r.text()
}
async function crud(method) {
  const table = document.getElementById('crud-table').value.trim()
  const id = document.getElementById('crud-id').value.trim()
  let fields = {}
  try{fields=JSON.parse(document.getElementById('crud-fields').value||'{}')}catch{}
  let url = '/tables/'+table
  if((method==='put'||method==='delete')&&id)url+='/'+id
  let opts = {method:method==='read'?'GET':method.toUpperCase(),headers:{'Content-Type':'application/json','Authorization':'Bearer '+idToken}}
  if(method==='create'||method==='put')opts.body=JSON.stringify(fields)
  const r = await fetch(url,opts)
  document.getElementById('result').textContent = await r.text()
}
document.getElementById('create').onclick = ()=>crud('create')
document.getElementById('read').onclick = ()=>crud('read')
document.getElementById('update').onclick = ()=>crud('put')
document.getElementById('delete').onclick = ()=>crud('delete') 