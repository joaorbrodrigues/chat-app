const socket = io()

//! Elements
const $sendMessageForm = document.querySelector('.send-message-form')
const $messageInput = $sendMessageForm.querySelector('.message-content')
const $sendMessageButton = $sendMessageForm.querySelector('#send-message')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//! Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//! Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }


}

//! Handling events that come from the server
socket.on('newClient', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('messageDelivery', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationSharing', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        message: message.url,
        createdAt: moment(message.createdAt).format('LTS')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

//! Handling events that come from the client and send to the server
$sendMessageForm.addEventListener('submit', (e) => {

    e.preventDefault()

    $sendMessageButton.disabled = true

    socket.emit('sendMessage', $messageInput.value, (deliveryStatus, error) => {
        $sendMessageButton.disabled = false
        if (error) {
            console.log(error)
        } else {
            console.log(deliveryStatus)
        }
    })
    $messageInput.value = ''
    $messageInput.focus()
})

$sendLocationButton.addEventListener('click', () => {

    $sendLocationButton.disabled = true

    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser!')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, (deliveryStatus) => {
            $sendLocationButton.disabled = false
            console.log(deliveryStatus)
        })
    })
})

socket.emit('join', { username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})