import { View, Text, ScrollView, Pressable, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from '../style'
import { Avatar, Button, Dialog, Divider, HelperText, IconButton, Modal, Portal, Snackbar, TextInput, TouchableRipple } from 'react-native-paper'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import * as DocumentPicker from 'expo-document-picker';
import { editGroup, leaveGroup, removeGroupPhoto, removeUser } from '../actions/chats'

const GroupInfo = ({ navigation, route }) => {

  const dispatch = useDispatch()

  const { group } = route.params

  const { user } = useSelector(state => state.auth)

  const { chats } = useSelector(state => state.chats)

  const [chat, setChat] = useState(group)

  const [showEditModal, setShowEditModal] = useState(false)

  const [showImageModal, setShowImageModal] = useState(false)

  const [confirmShow, setConfirmShow] = useState(false)

  const [groupName, setGroupName] = useState(chat?.groupName)

  const [newPhoto, setNewPhoto] = useState(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(false)

  const [helperText, setHelperText] = useState(false)

  const [removingUser, setRemovingUser] = useState(null)

  const [confirmContext, setConfirmContext] = useState(null)

  const pickFile = async () => {
    try {
      let file = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'] });

      if (file.type === 'success') {
        setNewPhoto({
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size
        })
        setShowImageModal(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const hideEditModal = () => {
    setShowEditModal(false);
    setGroupName(chat?.groupName)
    setHelperText(false)
  }

  const hideImageModal = () => {
    setShowImageModal(false)
    setNewPhoto(null)
  }

  const handleNameEdit = () => {
    const formData = new FormData()

    if (!groupName.trim()) {
      setHelperText(true)
      return
    }

    if (groupName === chat?.groupName) {
      setShowEditModal(false)
      return
    }

    formData.append('name', groupName)
    formData.append('id', group._id)

    setLoading(true)
    dispatch(editGroup(formData, chats, setLoading, setError, setShowEditModal))
  }

  const handlePhotoEdit = () => {
    const formData = new FormData()

    if ((newPhoto.size) / (1024 * 1024) > 1) {
      setError('Image size should be less than 1mb.')
      return;
    }

    formData.append('photo', newPhoto)
    formData.append('id', group._id)

    setLoading(true)
    dispatch(editGroup(formData, chats, setLoading, setError, setShowImageModal, setNewPhoto))
  }

  const handleRemovePhoto = () => {
    const formData = new FormData()

    formData.append('id', group._id)
    formData.append('photoPublicId', group.groupPhotoPublicId)

    setLoading(true)
    dispatch(removeGroupPhoto(formData, chats, setLoading, setError, setShowImageModal))
  }

  const handleRemoveUser = () => {
    const formData = new FormData()

    formData.append('groupId', group._id)
    formData.append('userId', removingUser._id)

    dispatch(removeUser(formData, chats, setLoading, setError, setConfirmShow, removingUser._id))
    setLoading(true)
  }

  const handleGroupLeave = () => {
    dispatch(leaveGroup(group._id, chats, setLoading, setError, setConfirmShow, navigation))
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Text style={{ color: 'white', fontSize: 18 }}>{chat?.groupName}</Text>
    })
  }, [navigation])

  useEffect(() => {
    setChat(() => chats.find(item => item._id === group._id))
  }, [chats])

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ width: '100%' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>

          <View style={{ position: 'relative' }}>
            <Pressable onPress={() => setShowImageModal(true)}>
              <Avatar.Image size={150}
                source={{ uri: chat?.groupPhoto }}
                style={{ marginVertical: 30, backgroundColor: '#d9d9d9' }} />
            </Pressable>
            {user._id === chat?.groupAdmin._id ? <IconButton
              icon='camera'
              iconColor='white'
              size={24}
              style={{ position: 'absolute', bottom: 24, right: 0, backgroundColor: '#167BD1' }}
              onPress={pickFile} /> : null}
          </View>

          <View style={{ marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>{chat?.groupName}</Text>

            <Text style={{ color: '#737373' }}>
              {`Created by ${chat?.groupAdmin._id === user._id ? 'you' : chat?.users.find(item => item._id === chat?.groupAdmin._id)?.name} on ${moment(new Date(chat?.createdAt)).format('DD/MM/YY')}`}
            </Text>
          </View>

          <Divider style={{ width: '100%' }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginHorizontal: 10 }}>
            <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold' }}>{`${chat?.users.length} Participants`}</Text>

            {user._id === chat?.groupAdmin._id ? <IconButton
              icon='account-plus'
              iconColor='#167BD1'
              size={26}
              onPress={() => navigation.navigate('Search', { chat: chat })} /> : null}
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              {chat?.users.map((item, i) => {
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable onPress={() => setShowImageModal(true)}>
                      <Avatar.Image size={40}
                        source={{ uri: item.profilePicture }}
                        style={{ backgroundColor: '#d9d9d9', marginEnd: 10 }} />
                    </Pressable>
                    <Text style={{ flex: 1, paddingVertical: 20 }}>{item._id === user._id ? 'You' : item.name}</Text>
                    {chat?.groupAdmin._id === item._id ?
                      <Text style={{ fontSize: 12, borderRadius: 4, backgroundColor: '#e6e6e6', paddingHorizontal: 8, paddingVertical: 2 }}>Admin</Text> :
                      chat?.groupAdmin._id === user._id ?
                        <IconButton
                          icon='exit-to-app'
                          iconColor='#737373'
                          size={18}
                          onPress={() => { setConfirmShow(true); setRemovingUser(item) }} /> : null
                    }
                  </View>
                )
              })}
            </View>
          </View>

          <Divider style={{ width: '100%' }} />

          {chat?.groupAdmin._id === user._id ?
            <TouchableRipple onPress={() => setShowEditModal(true)} style={{ backgroundColor: 'white', flexDirection: 'row', marginTop: 30, paddingVertical: 10, paddingHorizontal: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#737373' }}>'Edit group name</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{chat?.groupName}</Text>
              </View>
            </TouchableRipple> : null}

          <View style={{ width: '100%', paddingHorizontal: 10 }}>
            <Button icon="exit-to-app" buttonColor='white' textColor='#dc3545' mode='outlined' onPress={() => { setConfirmContext('self leave'); setConfirmShow(true) }} style={{ paddingVertical: 3, marginVertical: 30, borderColor: '#dc3545', borderRadius: 30 }}>
              Exit group
            </Button>
          </View>

          <Portal>
            <Dialog visible={showEditModal}
              onDismiss={hideEditModal}
              dismissable={!loading}
              dismissableBackButton={!loading}
              style={{ backgroundColor: '#e8f3fd' }}>

              <Dialog.Title style={{ color: 'black' }}>Edit group name</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  value={groupName}
                  textColor='black'
                  selectionColor='#167BD1'
                  activeUnderlineColor='#167BD1'
                  maxLength={50}
                  style={{ backgroundColor: 'white', height: 50, paddingHorizontal: 10 }}
                  onChangeText={text => setGroupName(text)}

                  right={<TextInput.Affix
                    text={50 - groupName.length}
                    textStyle={{ fontSize: 14, color: '#737373', marginStart: 10 }} />}
                  autoFocus={true}
                />

                {helperText ?
                  <HelperText type="error" visible={true} style={{ alignSelf: 'flex-start', fontSize: 14, color: '#dc3545' }} padding='none' >
                    Group name cannot be empty'
                  </HelperText> : null}
              </Dialog.Content>

              <Dialog.Actions>
                <Button onPress={hideEditModal} textColor='#737373' disabled={loading}>Cancel</Button>
                <Button onPress={handleNameEdit} textColor='#167BD1' loading={loading} disabled={loading}>Save</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          <Portal>
            <Modal visible={showImageModal}
              dismissable={!loading}
              dismissableBackButton={!loading}
              onDismiss={() => setShowImageModal(false)}
              contentContainerStyle={{ flex: 1, backgroundColor: '#e8f3fd', padding: 10 }}>

              <IconButton
                icon="close"
                iconColor='#737373'
                size={30}
                style={{ alignSelf: 'flex-end' }}
                onPress={!loading ? () => { setShowImageModal(false); setNewPhoto(null) } : null}
              />

              <View style={{ flex: 1, backgroundColor: 'black' }}>
                <Image source={{ uri: newPhoto ? newPhoto.uri : chat?.groupPhoto }} style={{ width: '100%', flex: 1, resizeMode: 'contain' }} />
              </View>

              {newPhoto ?
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <Button onPress={hideImageModal} textColor='#737373' style={{ flex: 1, paddingVertical: 5 }} disabled={loading}>Cancel</Button>
                  <Button onPress={handlePhotoEdit} textColor='#167BD1' style={{ flex: 1, paddingVertical: 5 }} loading={loading} disabled={loading}>Save</Button>
                </View> :
                chat?.groupAdmin._id === user._id ?
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <Button icon='camera' onPress={pickFile} textColor='#737373' style={{ flex: 1, paddingVertical: 5 }} disabled={loading}>
                      Change photo
                    </Button>
                    <Button icon='delete' onPress={handleRemovePhoto} textColor='#dc3545' style={{ flex: 1, paddingVertical: 5 }} loading={loading}
                      disabled={loading || chat?.groupPhoto === 'https://icon-library.com/images/persons-icon/persons-icon-11.jpg' ? true : false}
                    >
                      Remove photo
                    </Button>
                  </View> : null
              }
            </Modal>
          </Portal>

          <Portal>
            <Dialog visible={confirmShow} onDismiss={() => setConfirmShow(false)} style={{ backgroundColor: '#e8f3fd' }}>
              <Dialog.Title style={{ fontSize: 18, color: 'black' }}>{confirmContext ? 'Do you want to leave the group?' : `Remove ${removingUser?.name}?`}</Dialog.Title>
              <Dialog.Actions>
                <Button onPress={() => { setRemovingUser(null); setConfirmShow(false) }} textColor='#737373' disabled={loading}>Cancel</Button>
                <Button onPress={confirmContext ? handleGroupLeave : handleRemoveUser} textColor='#dc3545' loading={loading} disabled={loading}>{confirmContext ? 'Leave' : 'Remove'}</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

        </View>
      </ScrollView>

      <Snackbar
        visible={error ? true : false}
        duration={2000}
        onDismiss={() => setError(false)}>
        {error}
      </Snackbar>
    </View>
  )
}

export default GroupInfo