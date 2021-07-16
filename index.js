const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const ejs = require('express-ejs-layouts')
const messages = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// layout
app.set('view engine', 'ejs')
app.use(ejs)
const layout = 'layouts/main'

app.get('/', (req, res) => {
  res.render('login', {
    layout,
    title: 'Login',
  })
})

app.get('/chat', (req, res) => {
  const randomArray = (array) => {
    let currentIndex = array.length,
      randomIndex

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
  }

  const colorArray = ['blue', 'green', 'teal', 'red', 'orage', 'yellow', 'pink', 'lime', 'salmon', 'violet', 'aqua']
  const color = randomArray(colorArray)[0]

  res.render('chat', {
    layout,
    title: 'Chating',
    data: {
      user: {
        name: req.query.nama,
        color,
      },
    },
  })
})

let userOnline = 0
io.on('connection', (socket) => {
  // ---------------------------------
  // jika ada user join
  socket.on('join', (username) => {
    console.log(username, 'Joinned')

    // kirim ke seluruh user. bahwa ada user yang baru join
    io.emit('join', username)

    // menambah userOnline
    userOnline++
    console.log('User online : ', userOnline)
    io.emit('userOnline', userOnline)

    // loadMessages hanya untuk user yang baru join, jadi hanya menggunakan socket.emit(), buka io.emit()
    socket.emit('loadMessages', messages.loadMessages())
  })

  // ---------------------------------
  // jika ada sesorang sedang menulis
  socket.on('isTyping', (username) => {
    console.log(username, 'typing..')

    // kirim data ke seluruh user, bawah seseorang sedang menulis
    io.emit('isTyping', username)
  })

  // ---------------------------------
  // jika ada sesorang tidak sedang menulis
  socket.on('notTyping', () => {
    io.emit('notTyping')
  })

  // ---------------------------------
  // jika user mengirim pesan
  socket.on('sendMessage', (res) => {
    // simpan pesan yang dikirim user ke messages.json
    messages.addMessage(res)

    // kirim pesan yang dikrim seseorang, ke seluruh user
    io.emit('sendMessage', res)
  })

  // ---------------------------------
  // jika ada user yang keluar dari halaman
  socket.on('disconnect', (data) => {
    console.log('User disconnect')

    // kurangi daftar userOnline

    userOnline--
    console.log('User online : ', userOnline)
    io.emit('userOnline', userOnline)
  })
})

server.listen(3000)
