import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import styles from '../style'
import { Avatar, IconButton, TouchableRipple } from 'react-native-paper'
import moment from 'moment/moment'
import { Ionicons } from '@expo/vector-icons'

const Home = ({ navigation }) => {

  const { user } = useSelector(state => state.auth)
  const { chats } = useSelector(state => state.chats)

  const handlePress = () => {
    navigation.navigate('Profile', {
      profile: null
    })
  }

  const handleChatPress = (chat) => {
    navigation.navigate('Chat', {
      chat: chat
    })
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#167BD1', elevation: 5 }}>
        <Image source={require('../assets/chatnow-logo.png')} style={{ width: 100, height: 20, resizeMode: 'contain' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon="magnify"
            iconColor='white'
            size={26}
            onPress={() => navigation.navigate('Search', { chat: null })}
          />

          <Pressable onPress={handlePress}>
            <Avatar.Image size={40} source={{ uri: user.profilePicture }} style={{ backgroundColor: '#d9d9d9' }} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ width: '100%' }}>
        <View style={{ flex: 1 }}>
          {
            chats.length ?
              chats.map((chat, i) => {
                return (
                  <View key={i}>
                    <TouchableRipple
                      onPress={() => handleChatPress(chats.find(item => item._id === chat._id))}>
                      <View style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }, chats.indexOf(chat) === chats.length - 1 ? { borderBottomWidth: 0.5, borderBottomColor: '#bfbfbf' } : null]}>

                        <Avatar.Image size={44} source={{ uri: chat.isGroupChat ? chat.groupPhoto : chat.users.find(item => item._id !== user._id).profilePicture }} style={{ marginEnd: 15, backgroundColor: '#d9d9d9' }} />

                        <View style={[{ flex: 1, paddingVertical: 20 }, chats.indexOf(chat) !== chats.length - 1 ? { borderBottomWidth: 0.5, borderBottomColor: '#d9d9d9' } : null]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 500, fontSize: 16 }}>
                              {chat.isGroupChat ? chat.groupName : chat.users.find(item => item._id !== user._id).name}
                            </Text>

                            <Text style={{ fontSize: 12, color: '#737373' }}>
                              {chat.messages.length ? new Date().getDate() - new Date(chat.messages[chat.messages.length - 1]?.date).getDate() > 1 ?
                                moment(chat.messages[chat.messages.length - 1]?.date).format('DD/MM/YY') :
                                moment(new Date(chat.messages[chat.messages.length - 1]?.date).getTime()).format('HH:mm') : moment(new Date(chat.createdAt)).format('DD/MM/YY')
                              }
                            </Text>
                          </View>

                          <View style={{ fontSize: 14, color: '#737373' }}>
                            {chat.messages[chat.messages.length - 1]?.image ?
                              <View style={{ flexDirection: 'row' }}>
                                <Ionicons name='image' size={18} color='#737373' style={{ marginEnd: 4 }} />
                                <Text>Photo</Text>
                              </View> :
                              <Text numberOfLines={1} ellipsizeMode='tail'>{chat.messages[chat.messages.length - 1]?.text}</Text>}
                          </View>
                        </View>
                      </View>
                    </TouchableRipple>

                  </View>
                )
              }) :
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 30 }}>
                <Text style={{ color: '#167BD1', fontWeight: 'bold', fontSize: 20 }}>You don't have any conversations.</Text>
                <Text style={{ color: '#167BD1', fontWeight: 'bold', fontSize: 16 }}>Start one by searching for users.</Text>
              </View>
          }
        </View>

        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <Image source={require('../assets/chatnow-logo2.png')} style={{ width: 100, height: 20, resizeMode: 'contain' }} />
        </View>
      </ScrollView>

    </View>
  )
}

export default Home