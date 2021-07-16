const fs = require('fs')

const loadMessages = () => {
  const messages = fs.readFileSync('data/messages.json', 'utf-8')
  return JSON.parse(messages)
}

const saveMessage = (message) => {
  fs.writeFileSync('data/messages.json', JSON.stringify(message))
}

const addMessage = (message) => {
  const messages = loadMessages()
  messages.push(message)
  saveMessage(messages)
}

module.exports = {
  loadMessages,
  addMessage,
}
