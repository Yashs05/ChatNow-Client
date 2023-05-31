import { View, Text, ScrollView, Image, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import styles from '../style'
import { ActivityIndicator, Avatar, IconButton, Modal, Portal, Snackbar, TextInput, TouchableRipple } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment/moment'
import { newGroupMessage, newMessage } from '../actions/chats'
import * as DocumentPicker from 'expo-document-picker';
import socket from '../utils/socket'

const Chat = ({ navigation, route }) => {

  const dispatch = useDispatch()

  const { chat, otherUser } = route.params

  const { user } = useSelector(state => state.auth)

  const { chats } = useSelector(state => state.chats)

  const [msg, setMsg] = useState({
    text: '',
    image: ''
  })

  const [chatExist, setChatExist] = useState(chat)

  const [visible, setVisible] = useState(false)
  const [visible2, setVisible2] = useState(false)

  const [currentMsg, setCurrentMsg] = useState(null)

  const [msgLoading, setMsgLoading] = useState(false)

  const [error, setError] = useState(false)

  const [caption, setCaption] = useState('')

  const [typing, setTyping] = useState(false)

  const [otherUserTyping, setOtherUserTyping] = useState(false)

  const [typingUserName, setTypingUserName] = useState('')

  const scrollViewRef = useRef();

  const timer = useRef()

  const pickFile = async () => {
    try {
      let file = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'] });

      setMsg({
        ...msg,
        image: {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size
        }
      })

      if (msg.text) setCaption(msg.text)

      if (file.type === 'success') {
        setVisible(true)
      }
    } catch (error) {
      console.log(error)
    }
  };

  const closeModal = () => {
    setVisible(false)
    setMsg({
      ...msg,
      image: ''
    })
    if (caption) setCaption('')
  }
  const closeModal2 = () => {
    setVisible2(false)
    setCurrentMsg(null)
  }

  const handleChange = value => {
    setMsg({ ...msg, text: value })

    if (chatExist) {
      if (!typing) {
        setTyping(true)
        socket.emit('typing', chatExist, user._id, user.name)
      }

      if (timer.current) {
        clearTimeout(timer.current)
      }
      timer.current = setTimeout(() => {
        setTyping(false)
        socket.emit('stop typing', chatExist, user._id)
      }, 4000)
    }
  }

  const handleNewMessage = (userId) => {

    if (!msg.text.trim() && !msg.image) {
      setError(true)
      return;
    }

    if (visible) setVisible(false)
    const formData = new FormData()

    formData.append('userId', userId)

    if (msg.text || caption) formData.append('text', msg.text || caption)

    if (msg.image) {
      if ((msg.image.size) / (1024 * 1024) > 1) {
        setError('Image size should be less than 1mb.')
        return;
      }
      formData.append('image', msg.image)
    }

    setMsgLoading(true)

    dispatch(newMessage(formData, chats, chatExist, setChatExist, setMsgLoading, user._id))

    setMsg({
      text: '',
      image: ''
    })

    if (caption) setCaption('')
  }

  const handleNewgroupMessage = (groupId) => {

    if (!msg.text.trim() && !msg.image) {
      setError(true)
      return;
    }

    if (visible) setVisible(false)
    const formData = new FormData()

    formData.append('groupId', groupId)

    if (msg.text) formData.append('text', caption ? caption : msg.text)

    if (msg.image) {
      if ((msg.image.size) / (1024 * 1024) > 1) {
        setError('Image size should be less than 1mb.')
        return;
      }
      formData.append('image', msg.image)
    }

    setMsgLoading(true)

    dispatch(newGroupMessage(formData, chats, setMsgLoading, user._id))

    setMsg({
      text: '',
      image: ''
    })

    if (caption) setCaption('')
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <TouchableRipple
            onPress={chat?.isGroupChat ? () => navigation.navigate('Group Info', { group: chat }) : () => navigation.navigate('Profile', { id: chat?.users.find(item => item._id !== user._id)._id || otherUser._id })}
            style={{ flex: 1 }}>

            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2 }}>
              <Avatar.Image size={30} source={{ uri: chat?.isGroupChat ? chat?.groupPhoto : chat?.users.find(item => item._id !== user._id).profilePicture || otherUser.profilePicture }} style={{ backgroundColor: '#d9d9d9', marginEnd: 10 }} />
              <View>
                <Text style={{ color: 'white', fontSize: 18 }}>{chat?.isGroupChat ? chat?.groupName : chat?.users.find(item => item._id !== user._id).name || otherUser.name}</Text>
                {otherUserTyping ? <Text style={{ fontSize: 12, color: '#e6e6e6' }}>{chat?.isGroupChat ? `${typingUserName} is typing` : 'Typing'}</Text> : null}
              </View>
            </View>
          </TouchableRipple>
        )
      }
    })
  }, [navigation, otherUserTyping, typingUserName])

  useEffect(() => {
    socket.on('typing started', (state, name) => { setOtherUserTyping(state); name ? setTypingUserName(name) : null })
    socket.on('typing stopped', state => setOtherUserTyping(state))

    return () => {
      socket.off('typing started')
      socket.off('typing stopped')
    }
  }, [])

  return (
    <View style={[styles.container, { paddingHorizontal: 10 }]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }} style={{ width: '100%' }}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: false })} >

        <View style={{ marginTop: 8 }}>
          {chatExist ?
            chats.find(item => item._id === chatExist._id)?.messages?.map((msg, i, msgsArray) => {
              return (
                <View key={i}>
                  <Pressable onPress={msg.image ? () => { setVisible2(true); setCurrentMsg(msg) } : null}>
                    {new Date(msg.date).getDate() - new Date(msgsArray.find(item => msgsArray.indexOf(item) === i - 1)?.date).getDate() >= 1 || i === 0 ?

                      <Text style={{ backgroundColor: '#e6e6e6', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 8, alignSelf: 'center', marginBottom: 16, fontSize: 12 }}>
                        {new Date().getDate() - new Date(msg.date).getDate() < 1 ? 'Today' :
                          new Date().getDate() - new Date(msg.date).getDate() === 1 ? 'Yesterday' :
                            moment(msg.date).format('MMM DD, YYYY')}
                      </Text> : null
                    }

                    <View style={{
                      alignSelf: msg.sender._id === user._id ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender._id === user._id ? '#a3cff5' : 'white', paddingHorizontal: 10, paddingVertical: 8,
                      marginBottom: new Date(msgsArray.find(item => msgsArray.indexOf(item) === i + 1)?.date).getDate() - new Date(msg.date).getDate() >= 1 ||
                        msgsArray.find(item => msgsArray.indexOf(item) === i + 1)?.sender._id !== msg.sender._id ? 16 : 4,
                      borderRadius: 12,
                      borderTopRightRadius: msg.sender._id === user._id ? msgsArray.find(item => msgsArray.indexOf(item) === i - 1)?.sender._id !== msg.sender._id ||
                        new Date(msg.date).getDate() - new Date(msgsArray.find(item => msgsArray.indexOf(item) === i - 1)?.date).getDate() >= 1 ? 0 : 16 : 16,

                      borderTopLeftRadius: msg.sender._id !== user._id ? msgsArray.find(item => msgsArray.indexOf(item) === i - 1)?.sender._id !== msg.sender._id ||
                        new Date(msg.date).getDate() - new Date(msgsArray.find(item => msgsArray.indexOf(item) === i - 1)?.date).getDate() >= 1 ? 0 : 16 : 16
                    }}>
                      {chat?.isGroupChat && msg.sender._id !== user._id && msgsArray.find(item => msgsArray.indexOf(item) === i - 1)?.sender._id !== msg.sender._id ?
                        <View style={{ alignSelf: 'flex-start' }}>
                          <Text style={{ color: '#737373', fontSize: 12, fontWeight: 'bold' }}>{msg.sender.name}</Text>
                        </View> : null}

                      <View style={{ flexDirection: !msg.image ? 'row' : 'column' }}>
                        {msg.image ?
                          <Image source={{ uri: msg.image }} style={{ width: 250, height: 250, marginBottom: 8 }} /> : null}

                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                          {msg.text ?
                            <Text style={{ flexShrink: 1, marginEnd: 10 }}>
                              {msg.text}
                            </Text> : null}
                          <Text style={{ color: '#737373', fontSize: 12 }}>{moment(msg.date).format('HH:mm')}</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </View>
              )
            }) :
            <Text style={{ alignSelf: 'center', backgroundColor: '#e6e6e6', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 8, marginTop: 8, fontSize: 14 }}>Start a conversation</Text>}

          {msgLoading ? <ActivityIndicator animating={true} color='#167BD1' size='small' style={{ alignSelf: 'flex-end' }} /> : null}
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
        <TextInput
          value={msg.text}
          onChangeText={(value) => handleChange(value)}
          mode='outlined'
          placeholder='Message'
          outlineStyle={{ borderRadius: 30, borderWidth: 0 }}
          selectionColor='#167BD1'
          style={{ flex: 1, marginBottom: 8 }}
          right={<TextInput.Icon icon="camera" iconColor='#737373' onPress={pickFile} />}
        />

        <IconButton
          icon="send"
          mode='contained'
          iconColor='white'
          containerColor='#167BD1'
          size={24}
          onPress={() => {
            chat?.isGroupChat ? handleNewgroupMessage(chat._id) : handleNewMessage(chat ? chat.users.find(item => item._id !== user._id)._id : otherUser._id)
          }}
        />
      </View>

      <Portal>
        <Modal visible={visible}
          onDismiss={closeModal}
          contentContainerStyle={{ flex: 1, backgroundColor: '#e8f3fd', padding: 10 }}>

          <IconButton
            icon="close"
            iconColor='#737373'
            size={30}
            style={{ alignSelf: 'flex-end' }}
            onPress={closeModal}
          />

          <Image source={{ uri: msg.image.uri }} style={{ width: '100%', flex: 1, resizeMode: 'contain' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
            <TextInput
              value={caption}
              onChangeText={(value) => setCaption(value)}
              mode='outlined'
              placeholder='Add a caption...'
              outlineStyle={{ borderRadius: 30, borderWidth: 0 }}
              selectionColor='#167BD1'
              style={{ flex: 1 }}
              right={
                <TextInput.Icon icon="send" iconColor='white' containerColor='#167BD1' size={18}
                  onPress={() => {
                    chat?.isGroupChat ? handleNewgroupMessage(chat._id) : handleNewMessage(chat ? chat.users.find(item => item._id !== user._id)._id : otherUser._id)
                  }} />
              }
            />
          </View>

        </Modal>
      </Portal>

      <Portal>
        <Modal visible={visible2}
          onDismiss={closeModal2}
          contentContainerStyle={{ flex: 1, backgroundColor: '#e8f3fd', padding: 10 }}>

          <IconButton
            icon="close"
            iconColor='#737373'
            size={30}
            style={{ alignSelf: 'flex-end' }}
            onPress={() => setVisible2(false)}
          />

          <Image source={{ uri: currentMsg?.image }} style={{ width: '100%', flex: 1, resizeMode: 'contain' }} />

          {currentMsg?.text ? <Text style={{ fontSize: 18, alignSelf: 'center', paddingTop: 10 }}>{currentMsg.text}</Text> : null}

        </Modal>
      </Portal>

      <Snackbar
        visible={error ? true : false}
        duration={2000}
        onDismiss={() => setError(false)}>
        {error}
      </Snackbar>

    </View>
  )
}

export default Chat