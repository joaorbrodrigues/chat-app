const users = []

const addUser = ({
    id,
    username,
    room
}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is already taken!'
        }
    }

    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return {
        user
    }

}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    } else {
        return {
            error: `the provided user doesn't exist`
        }
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)

    if(!user) return { error: `the id ${id} doesn't match any users` }
    return user
}

const getUsersInRoom = (room) => {
    
    if(!room) return { error: `no room was provided` }

    room = room.trim().toLowerCase()

    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}