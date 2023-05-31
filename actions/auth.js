import axios from "axios"
import config from "../config"
import AsyncStorage from '@react-native-async-storage/async-storage';
import setAuthToken from "../utils/setAuthToken";
import { fetchChats } from './chats'

export const registerUser = (formData, navigation, setLoading, setError) => async dispatch => {

    try {
        const response = await axios.post(`${config.END_POINT}/users`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        await AsyncStorage.setItem('token', response.data.token)

        dispatch({
            type: 'auth/setToken'
        })

        dispatch(loadUser(navigation))

    } catch (error) {
        console.error(error.message)
        setError(error.response.data)
    }
    setLoading(false)
}

export const loginUser = (formData, navigation, setLoading, setError) => async dispatch => {

    try {
        const response = await axios.post(`${config.END_POINT}/auth`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        await AsyncStorage.setItem('token', response.data.token)

        dispatch({
            type: 'auth/setToken'
        })

        dispatch(loadUser(navigation, setLoading, setError))

    } catch (error) {
        console.error(error.message)
        setLoading(false)
        setError(error.response.data)
    }
}

export const loadUser = (navigation, setLoading, setError) => async dispatch => {

    try {
        const token = await AsyncStorage.getItem('token')

        setAuthToken(token)

        const response = await axios.get(`${config.END_POINT}/auth`)

        dispatch({
            type: 'auth/setUser',
            payload: response.data
        })

        dispatch(fetchChats(navigation, response.data._id))
    } catch (error) {
        console.error(error.message)
        navigation.navigate('SignIn')
        setError(error.response.data)
    }
    if(setLoading) setLoading(false)
}

export const editUser = (formData, setLoading, setError, setVisible, setUpdateField, details, setdetails) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/users`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'auth/setUser',
            payload: response.data
        })

    } catch (error) {
        console.error(error.message)
        setError(error.response.data)
    }

    setLoading(false)
    setVisible(false)
    setUpdateField('')

    if (details) setdetails({
        ...details,
        profilePicture: null
    })
}

export const removePhoto = (formData, setLoading, setError, setShowImageModal) => async dispatch => {

    try {
        const response = await axios.put(`${config.END_POINT}/users/removephoto`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        dispatch({
            type: 'auth/setUser',
            payload: response.data
        })

    } catch (error) {
        console.error(error.message)
        setError(error.response.data)
    }

    setLoading(false)
    setShowImageModal(false)
}

export const fetchUser = async (id, setProfile, setProfileLoading, setProfileError) => {

    try {
        const response = await axios.get(`${config.END_POINT}/users/${id}`)

        setProfile(response.data)

    } catch (error) {
        setProfileError(error.response.data)
    }

    setProfileLoading(false)
}