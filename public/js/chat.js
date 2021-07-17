// buat socket
const socket = io()

// mengirim data ke server untuk menambah user yg join
const user = document.getElementById('username')
const username = user.dataset.userName
const userColor = user.dataset.userColor

const botName = 'FI <span id="username" class="badge bg-primary ms-1" style="font-size: 10px">BOT</span>'

// beritahu server bahwa ada user join
socket.emit('join', username)

// mengirim message ke server bawha ada user yg join
let date = new Date()
socket.emit('sendMessage', {
  username: botName,
  color: 'var(--bs-primary)',
  message: `<span class="text-info">@${username}</span> joinned!`,
  date: date.toLocaleDateString(),
  time: date.getHours() + '.' + date.getMinutes(),
})

// kemudian jika ada respon dari serve maka tampilkan toast ke seluruh user
socket.on('join', (res) => {
  // membuat toast
  const toastContainer = document.getElementById('toastContainer')
  toastContainer.innerHTML += `
      <div class="toast text-white bg-success border-0 mb-2" style="max-width: max-content">
        <div class="d-flex">
          <div class="toast-body">
            ${res} joinned!
          </div>
          <button class="btn btn-close-white me-2 m-auto" data-bs-dismiss='toast'></button>
        </div>
      </div>
      `

  // menampilkan lalu meyembunyikan toast
  const toastElList = [].slice.call(document.querySelectorAll('.toast'))
  var toastList = toastElList.map((toastEl) => {
    return new bootstrap.Toast(toastEl)
  })

  toastList.forEach((toast) => toast.show())

  // jika toast telah disembunyikan maka hapus elementnya
  const toasts = document.querySelectorAll('.toast')
  toasts.forEach((toast) => {
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove()
    })
  })
})

// jika ada respon emit('userOnline') dari server
socket.on('userOnline', (res) => {
  const userOnline = document.getElementById('userOnline')
  userOnline.innerHTML = res
})

// -------------------------------------------
// messages container
const messageContainer = document.getElementById('messageContainer')

// jika ada respon emit('loadMessages') dari server
socket.on('loadMessages', (res) => {
  // jika belum ada pesan
  if (res.length == 0) {
    messageContainer.innerHTML += `
    <div class="border rounded-3 pt-1 p-2 mb-2" style="max-width: max-content">
      <div class="d-flex justify-content-between">
        <span class="fw-bold d-flex align-items-center" style="color: var(--bs-primary)">${botName}</span>
        <span class="text-end ms-3">${new Date().getHours() + '.' + new Date().getMinutes()}</span>
      </div>
      Hai <span class="text-info">@${username}</span>, <br> Saat ini belum ada pesan yang terkirim. Jadilah yang pertama!
    </div>`

    //messageContainer.innerHTML = `Belum ada pesan, jadilah yang pertama!`
    return false
  }

  res.forEach((message) => {
    messageContainer.innerHTML += `
    <div class="border rounded-3 pt-1 p-2 mb-2 me-5" style="max-width: max-content">
      <div class="d-flex justify-content-between">
        <span class="fw-bold d-flex align-items-center" style="color:${message.color}">${message.username}</span>
        <span class="text-end ms-3">${message.time}</span>
      </div>
      ${message.message}
    </div>`
  })
})

// bagian input message
const inputMessage = document.getElementById('inputMessage')
const btnSendMessage = document.getElementById('btnSendMessage')
const typingStatusContainer = document.getElementById('typingStatus')

// -------------------------------------------
// jika user sedang mengetik
inputMessage.onfocus = () => {
  socket.emit('isTyping', username)
}

// kemudian jika responnya sudah ada maka
// munculkan typingStatus di semua user
socket.on('isTyping', (res) => {
  typingStatusContainer.innerHTML = `<strong>${res}</strong> sedang menulis..`
})

// --------------------------------------------
// Jika user sedang tidak mengetik / berhenti mengetik
inputMessage.onblur = () => {
  socket.emit('notTyping')
}

// kemudian jika ada balasan dari server
// maka hapus isi dari element #typingStatus
socket.on('notTyping', () => {
  typingStatusContainer.innerHTML = ''
})

// --------------------------------------------
// Jika user mengirim pesan
btnSendMessage.onclick = () => {
  // jika inputMessage masih kosong maka jangan lakukan pengiriman
  if (!inputMessage.value) {
    inputMessage.classList.add('is-invalid')
    return false
  }

  inputMessage.classList.remove('is-invalid')

  // mengirim ke server bawah ada sesorang yg mengirim pesan
  let date = new Date()
  socket.emit('sendMessage', {
    username,
    color: userColor,
    message: inputMessage.value,
    date: date.toLocaleDateString(),
    time: date.getHours() + '.' + date.getMinutes(),
  })

  // jika pesan telah dikirim maka bersihkan inputMessage
  inputMessage.value = ''
}

// kemudian jika ada respon balik dari server maka lakukan hal berikut
socket.on('sendMessage', (res) => {
  // bunyikan ringtone
  const ringtone = new Audio('popup.mp3')
  ringtone.play()

  otherMessage = `
    <div class="border rounded-3 pt-1 p-2 mb-2 me-5" style="max-width: max-content">
      <div class="d-flex justify-content-between">
        <span class="fw-bold d-flex align-items-center" style="color:${res.color}">${res.username}</span>
        <span class="text-end ms-3">${res.time}</span>
      </div>
      ${res.message}
    </div>`

  myMessage = `
    <div class="ms-5 mb-2">
      <div class="bg-primary text-white border rounded-3 pt-1 p-2 ms-auto" style="max-width: max-content">
        <div class="d-flex justify-content-between">
          <span class="fw-bold d-flex align-items-center" style="color:${res.color}">${res.username}</span>
          <span class="text-end ms-3">${res.time}</span>
        </div>
        ${res.message}
      </div>
    </div>`

  // kemudian append message yang di terima dari server ke messageContainer
  let messageContainer = document.getElementById('messageContainer')
  messageContainer.innerHTML += res.username === username ? myMessage : otherMessage
})

window.onload = () => {
  const loginAlert = new bootstrap.Modal(document.getElementById('loginAlert')).show()
}
