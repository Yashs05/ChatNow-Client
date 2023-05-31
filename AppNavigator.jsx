import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SignUp from './Components/SignUp'
import SignIn from './Components/SignIn'
import Home from './Components/Home'
import Splash from './Components/Splash'
import Profile from './Components/Profile'
import Chat from './Components/Chat'
import Search from './Components/Search'
import GroupDetails from './Components/GroupDetails'
import GroupInfo from './Components/GroupInfo'
import socket from './utils/socket'
import { useDispatch, useSelector } from 'react-redux'

const AppNavigator = () => {

    const Stack = createNativeStackNavigator()

    const dispatch = useDispatch()

    const { chats } = useSelector(state => state.chats)

    useEffect(() => {
        socket.on('message received', chat => {
            dispatch({
                type: 'chats/setMessages',
                payload: chats.find(item => item._id === chat._id) ? chats.map(item => item._id === chat._id ? chat : item).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() }) :
                    chats.concat(new Array(chat)).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
            })
        })

        socket.on('group created', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.concat(group).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
            })
        })

        socket.on('group edited', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.map(item => item._id === group._id ? group : item)
            })
        })

        socket.on('group photo removed', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.map(item => item._id === group._id ? group : item)
            })
        })

        socket.on('added to group', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.concat(group).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
            })
        })

        socket.on('other user added to group', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.map(item => item._id === group._id ? group : item)
            })
        })

        socket.on('removed from group', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.filter(item => item._id !== group._id).sort(function (a, b) { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() })
            })
        })
        
        socket.on('other user removed from group', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.map(item => item._id === group._id ? group : item)
            })
        })
        
        socket.on('user left', group => {
            dispatch({
                type: 'chats/setChats',
                payload: chats.map(item => item._id === group._id ? group : item)
            })
        })

        return () => {
            socket.off('message received')
            socket.off('group created')
            socket.off('group edited')
            socket.off('group photo removed')
            socket.off('added to group')
            socket.off('other user added to group')
            socket.off('removed from group')
            socket.off('other user removed from group')
            socket.off('user left')
        }
    }, [chats])

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name='Splash' component={Splash} options={{ headerShown: false }} />
                <Stack.Screen name='SignIn' component={SignIn} options={{ headerShown: false }} />
                <Stack.Screen name='SignUp' component={SignUp} options={{ animation: 'slide_from_right', headerTintColor: 'white', headerStyle: { backgroundColor: '#167BD1' } }} />
                <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
                <Stack.Screen name='Profile' component={Profile} options={{ animation: 'slide_from_right', headerTintColor: 'white', headerStyle: { backgroundColor: '#167BD1' } }} />
                <Stack.Screen name='Chat' component={Chat} options={{ animation: 'slide_from_right', headerTintColor: 'white', headerStyle: { backgroundColor: '#167BD1' } }} />
                <Stack.Screen name='Search' component={Search} options={{ animation: 'slide_from_right', headerTintColor: 'white', headerStyle: { backgroundColor: '#167BD1' } }} />
                <Stack.Screen name='New Group' component={GroupDetails} options={{ animation: 'slide_from_right', headerTintColor: 'white', headerStyle: { backgroundColor: '#167BD1' } }} />
                <Stack.Screen name='Group Info' component={GroupInfo} options={{ animation: 'slide_from_right', headerTintColor: 'white', headerStyle: { backgroundColor: '#167BD1' } }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator