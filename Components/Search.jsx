import { View, Text, ScrollView, Image, Pressable } from 'react-native'
import React, { useRef, useState } from 'react'
import { Avatar, Banner, Button, Checkbox, Dialog, Divider, FAB, Modal, Portal, Snackbar, TextInput, TouchableRipple } from 'react-native-paper'
import styles from '../style'
import axios from 'axios'
import config from '../config'
import { useDispatch, useSelector } from 'react-redux'
import { addUser } from '../actions/chats'

const Search = ({ navigation, route }) => {

    const dispatch = useDispatch()

    const { chat } = route.params

    const { chats } = useSelector(state => state.chats)

    const [users, setUsers] = useState([])

    const [searchTerm, setSearchTerm] = useState('')

    const [checked, setChecked] = useState(false)

    const [groupUsers, setGroupUsers] = useState([])

    const [confirmShow, setConfirmShow] = useState(false)

    const [addingUser, setAddingUser] = useState(null)

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState(false)

    const timer = useRef()

    const handleChange = (text) => {
        setSearchTerm(text)

        if (timer.current) {
            clearTimeout(timer.current)
        }

        if (!text.trim()) {
            setUsers([])
        }
        else {
            timer.current = setTimeout(async () => {
                try {
                    const response = await axios.get(`${config.END_POINT}/users?search=${searchTerm}`)

                    setUsers(response.data)
                } catch (error) {
                    console.error(error)
                    setUsers([])
                }
            }, 750)
        }
    }

    const handlePress = (user) => {

        if (checked) {
            if (groupUsers.find(item => item._id === user._id)) {
                setGroupUsers(groupUsers => groupUsers.filter(item => item._id !== user._id))
            }
            else {
                setGroupUsers(groupUsers => [...groupUsers, user])
            }
        }
        else {
            if (!chat) {
                navigation.navigate('Chat', {
                    chat: chats.find(chat => {
                        return (
                            chat.users.find(item => item._id === user._id) &&
                                chat.users.find(item => item._id === user._id) &&
                                chat.users.length === 2 ? true : false
                        )
                    }),
                    otherUser: user,
                    userId: user._id
                })
                setSearchTerm('')
                setUsers([])
            }
            else {
                setAddingUser(user)
                setConfirmShow(true)
            }
        }
    }

    const handleCheck = () => {

        if (groupUsers.length) {
            if (groupUsers.length < 2) {
                setError('Please add atleast 2 participants.')
            }
            else {
                navigation.navigate('New Group', {
                    users: groupUsers
                })
            }
        }
        else {
            setChecked(checked => !checked)
        }
    }

    const handleAddUser = () => {
        const formData = new FormData()

        formData.append('groupId', chat._id)
        formData.append('userId', addingUser._id)

        dispatch(addUser(formData, chats, setLoading, setError, setConfirmShow, navigation, addingUser._id))
        setLoading(true)
    }

    return (
        <View style={styles.container}>
            <View style={{ paddingHorizontal: 15 }}>

                {checked && groupUsers.length ?
                    <>
                        <View style={{ flexDirection: 'row', flexWrap: 'nowrap', overflow: 'scroll', marginVertical: 10 }}>
                            {groupUsers.map((item, i) => {
                                return (
                                    <View style={{ marginEnd: 15 }} key={i}>
                                        <Pressable onPress={() => handlePress(item)} style={{ alignItems: 'center' }}>
                                            <Avatar.Image size={40} source={{ uri: item.profilePicture }} style={{ backgroundColor: '#d9d9d9' }} />
                                            <Text numberOfLines={1} ellipsizeMode='tail' style={{ width: 60, textAlign: 'center' }}>{item.name}</Text>
                                        </Pressable>
                                    </View>
                                )
                            })}
                        </View>

                        <Divider />
                    </> : null}
                <TextInput
                    placeholder='Search by name or username'
                    value={searchTerm}
                    mode='outlined'
                    textColor='black'
                    outlineColor='#bfbfbf'
                    activeOutlineColor='#167bd1'
                    left={<TextInput.Icon icon="magnify" iconColor='#737373' />}
                    style={{ paddingVertical: 5, marginVertical: 10, backgroundColor: 'white' }}
                    onChangeText={text => handleChange(text)}
                    autoFocus={true}
                />
            </View>

            {!searchTerm.trim() ? <Text style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold' }}>
                {checked ? 'Search for users to create a group.' : 'Search for users to start conversation.'}
            </Text> :

                !users.length ? <Text style={{ alignSelf: 'center', fontSize: 16, fontWeight: 'bold', marginVertical: 20 }}>
                    {checked ? 'Search for users to create a group.' : 'Search for users to start conversation.'}
                </Text> :

                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ width: '100%' }}>
                        <View style={{ flex: 1 }}>
                            {users.map((user, i) => {
                                return (
                                    <View key={i}>
                                        <TouchableRipple onPress={() => handlePress(user)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                                                <Avatar.Image size={44} source={{ uri: user.profilePicture }} style={{ backgroundColor: '#d9d9d9', marginEnd: 15 }} />

                                                <View style={{ flex: 1, paddingVertical: 20 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{user.name}</Text>
                                                    <Text style={{ fontSize: 14 }}>{user.username}</Text>
                                                </View>

                                                {checked ? <Checkbox
                                                    status={groupUsers?.find(item => item._id === user._id) ? 'checked' : 'unchecked'}
                                                    color='#167bd1'
                                                    uncheckedColor='#167bd1'
                                                /> : null}
                                            </View>
                                        </TouchableRipple>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
            }

            <Portal>
                <Dialog visible={confirmShow} onDismiss={() => setConfirmShow(false)} style={{ backgroundColor: '#e8f3fd' }}>
                    <Dialog.Title style={{ fontSize: 18 }}>{`Add ${addingUser?.name}?`}</Dialog.Title>
                    <Dialog.Actions>
                        <Button onPress={() => { setAddingUser(null); setConfirmShow(false) }} textColor='#737373' disabled={loading}>Cancel</Button>
                        <Button onPress={handleAddUser} textColor='#167BD1' loading={loading} disabled={loading}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {!chat ? <FAB
                icon={!groupUsers.length ? checked ? 'checkbox-marked' : 'checkbox-blank-outline' : 'plus'}
                label={groupUsers.length ? 'Create group' : 'New group'}
                color='white'
                style={styles.fab}
                onPress={handleCheck}
            >
            </FAB> : null}

            <Snackbar
                visible={error ? true : false}
                duration={2000}
                onDismiss={() => setError(false)}>
                {error}
            </Snackbar>
        </View>
    )
}

export default Search