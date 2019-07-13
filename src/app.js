const express = require('express')
const http = require('http')
const path = require('path');
const socketio = require('socket.io')
const Filter = require('bad-words')
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {

    socket.on('join', ({
        username,
        room
    }, callback) => {

        const {
            error,
            user
        } = addUser({
            id: socket.id,
            username,
            room
        })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('newClient', generateMessage('admin', `Welcome to ${room} room!`))

        socket.broadcast.to(user.room).emit('messageDelivery', generateMessage('admin', `${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback()

    })

    socket.on('sendMessage', (sentMessage, callback) => {
        const filter = new Filter()

        if (filter.isProfane(sentMessage)) {
            return callback(undefined, 'Language!')
        }

        const user = getUser(socket.id)

        io.to(user.room).emit('messageDelivery', generateMessage(user.username, sentMessage))
        callback('<delivered>', undefined)
    })

    socket.on('sendLocation', (location, callback) => {

        const user = getUser(socket.id)
        io.to(user.room).emit('locationSharing',
            generateLocationMessage(user.username, `http://www.google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('<shared>')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('messageDelivery', generateMessage('admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

module.exports = server