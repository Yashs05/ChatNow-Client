import axios from "axios"
import config from "../config"
import socket from '../utils/socket'

export const fetchChats = (navigation, userId) => async dispatch => {

    try {
        const response = await axios.get(`${config.END_POINT}/chats`)

        dispatch({
            type: 'chats/setChats',
            payload: response.data
        })

        navigation.navigate('Home')

        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })

        socket.connect()
        socket.emit('join', userId)

    } catch (error) {
        console.error(error.message)
    }
}

export const newMessage = (formData, chats, chatExist, setChatExist, setMsgLoading, userId) => async dispatch => {

    try {
        const response = await axios.post(`${config.END_POINT}/chats`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'chats/setMessages',
            payload: chatExist ?
                chats.map(item => item._id === response.data._id ? response.data : item).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() }) :
                chats.concat(response.data).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
        })

        setChatExist(response.data)

        socket.emit('new message', response.data, userId)
        socket.emit('stop typing', response.data, userId)

    } catch (error) {
        console.error(error.message)
    }
    setMsgLoading(false)
}

export const newGroup = (formData, chats, setLoading, setError, navigation) => async dispatch => {

    try {
        const response = await axios.post(`${config.END_POINT}/chats/group`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'chats/setChats',
            payload: chats.concat(response.data).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
        })

        navigation.navigate('Home')
        socket.emit('new group', response.data)

    } catch (error) {
        setError(error.response.data)
        console.log(error.response.data)
    }
    setLoading(false)
}

export const editGroup = (formData, chats, setLoading, setError, setModal, setNewPhoto) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/chats/group`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'chats/setChats',
            payload: chats.map(chat => chat._id === response.data._id ? response.data : chat)
        })

        socket.emit('edit group', response.data)

    } catch (error) {
        setError(error.response.data)
        console.log(error.response.data)
    }
    setLoading(false)
    setModal(false)
    if (setNewPhoto) setNewPhoto(null)
}

export const removeGroupPhoto = (formData, chats, setLoading, setError, setShowImageModal) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/chats/group/removephoto`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'chats/setChats',
            payload: chats.map(chat => chat._id === response.data._id ? response.data : chat)
        })

        socket.emit('group photo remove', response.data)

    } catch (error) {
        setError(error.response.data)
        console.log(error.response.data)
    }
    setLoading(false)
    setShowImageModal(false)
}

export const newGroupMessage = (formData, chats, setMsgLoading, userId) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/chats/group/newMessage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'chats/setMessages',
            payload: chats.map(chat => chat._id === response.data._id ? response.data : chat).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
        })

        socket.emit('new message', response.data, userId)
        socket.emit('stop typing', response.data, userId)

    } catch (error) {
        console.error(error.message)
    }
    setMsgLoading(false)
}

export const addUser = (formData, chats, setLoading, setError, setConfirmShow, navigation, userId) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/chats/group/addUser`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'chats/setChats',
            payload: chats.map(chat => chat._id === response.data._id ? response.data : chat).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
        })
        navigation.goBack()

        socket.emit('add to group', response.data, userId)

    } catch (error) {
        console.error(error.message)
        setError(error.response.data)
    }
    setLoading(false)
    setConfirmShow(false)
}

export const removeUser = (formData, chats, setLoading, setError, setConfirmShow, userId) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/chats/group/removeUser`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'chats/setChats',
            payload: chats.map(chat => chat._id === response.data._id ? response.data : chat).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
        })

        socket.emit('remove from group', response.data, userId)

    } catch (error) {
        console.error(error.message)
        setError(error.response.data)
    }
    setLoading(false)
    setConfirmShow(false)
}

export const leaveGroup = (id, chats, setLoading, setError, setConfirmShow, navigation) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/chats/group/leavegroup/${id}`)

        dispatch({
            type: 'chats/setChats',
            payload: chats.filter(item => item._id !== id)
        })

        navigation.navigate('Home')

        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        })

        socket.emit('leave group', response.data)

    } catch (error) {
        console.error(error.message)
        setError(error.response.data)
        setLoading(false)
        setConfirmShow(false)
    }
}