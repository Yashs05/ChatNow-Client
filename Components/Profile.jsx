import React, { useEffect, useState } from 'react'
import { View, Image, Text, ScrollView, Pressable } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import styles from '../style'
import * as DocumentPicker from 'expo-document-picker';
import { ActivityIndicator, Avatar, Button, Dialog, Divider, HelperText, IconButton, Modal, Portal, Snackbar, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { editUser, fetchUser, removePhoto } from '../actions/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from '../utils/socket';

const Profile = ({ navigation, route }) => {

  const dispatch = useDispatch()

  const { id } = route.params

  const { user } = useSelector(state => state.auth)

  const [profile, setProfile] = useState(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(false)

  const [profileLoading, setProfileLoading] = useState(true)

  const [profileError, setProfileError] = useState(false)

  const [visible, setVisible] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false)

  const [helperText, setHelperText] = useState(false)

  const [updateField, setUpdateField] = useState('')

  const [details, setdetails] = useState({
    name: user.name,
    username: user.username,
    status: user.status,
    profilePicture: null
  })

  const showDialog = () => setVisible(true);

  const hideDialog = () => {
    setVisible(false);
    setdetails({
      name: user.name,
      username: user.username,
      status: user.status,
      profilePicture: null
    })
    setHelperText(false)
  }

  const hideImageModal = () => {
    setShowImageModal(false)
    setdetails({
      ...details,
      profilePicture: null
    })
  }

  const pickFile = async () => {
    try {
      let file = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'] });

      if (file.type === 'success') {
        setdetails({
          ...details,
          profilePicture: {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
            size: file.size
          }
        })
        setShowImageModal(true)
      }
    } catch (error) {
      console.log(error)
    }
  };

  const handleRemovePhoto = () => {
    const formData = new FormData()

    setLoading(true)

    formData.append('profilePicturePublicID', user.profilePicturePublicID)
    dispatch(removePhoto(formData, setLoading, setError, setShowImageModal))
  }

  const handleSubmit = () => {
    const formData = new FormData()

    setLoading(true)
    if (updateField === 'name') {
      if (!details.name.trim()) {
        setHelperText(true)
        setLoading(false)
      }

      if (details.name === user.name) {
        setVisible(false)
        setLoading(false)
      }
      else {
        formData.append('name', details.name)
        setLoading(true)
        dispatch(editUser(formData, setLoading, setError, setVisible, setUpdateField))
      }
    }
    else if (updateField === 'username') {
      if (!details.username.trim()) {
        setHelperText(true)
        setLoading(false)
      }

      if (details.username === user.username) {
        setVisible(false)
        setLoading(false)
      }
      else {
        formData.append('username', details.username)
        setLoading(true)
        dispatch(editUser(formData, setLoading, setError, setVisible, setUpdateField))
      }
    }
    else if (updateField === 'status') {
      if (!details.status.trim()) {
        setHelperText(true)
        setLoading(false)
      }

      if (details.status === user.status) {
        setVisible(false)
        setLoading(false)
      }
      else {
        formData.append('status', details.status)
        setLoading(true)
        dispatch(editUser(formData, setLoading, setError, setVisible, setUpdateField))
      }
    }
    else {
      if ((details.profilePicture.size) / (1024 * 1024) > 1) {
        setLoading(false)
        setError('Image size should be less than 1mb.')
        setShowImageModal(false)
        setUpdateField(null)
        setdetails({ ...details, profilePicture: null })
        return;
      }
      formData.append('profilePicture', details.profilePicture)
      setLoading(true)
      dispatch(editUser(formData, setLoading, setError, setShowImageModal, setUpdateField, details, setdetails))
    }
  }

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('token')

      navigation.navigate('SignIn')
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }]
      })

      socket.on('disconnect')
    } catch (error) {
      setError(error.message)
    }
  }

  useEffect(() => {
    if (id) {
      fetchUser(id, setProfile, setProfileLoading, setProfileError)
    }
  }, [])

  if (profileLoading && id) {
    return <ActivityIndicator color='#167BD1' style={{ marginVertical: 20, flex: 1, backgroundColor: '#e8f3fd' }} />
  }

  if (profileError) {
    return <Text style={{ color: '#167BD1', fontSize: 20, fontWeight: 'bold', marginVertical: 20, marginHorizontal: 10, alignSelf: 'center' }}>{profileError}</Text>
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ width: '100%' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>

          <View style={{ position: 'relative' }}>
            <Pressable onPress={() => setShowImageModal(true)}>
              <Avatar.Image size={150}
                source={{ uri: profile ? profile.profilePicture : user.profilePicture }}
                style={{ marginVertical: 30, backgroundColor: '#d9d9d9' }} />
            </Pressable>
            {!profile ? <IconButton
              icon='camera'
              iconColor='white'
              size={24}
              style={{ position: 'absolute', bottom: 24, right: 0, backgroundColor: '#167BD1' }}
              onPress={pickFile} /> : null}
          </View>

          <View style={{ flex: 1, width: '100%', paddingHorizontal: 30 }}>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Ionicons name='person' size={18} color='#737373'></Ionicons>

              <View style={{ flexDirection: 'row', marginStart: 15, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#d9d9d9' }}>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14 }}>Name</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{profile ? profile.name : user.name}</Text>
                </View>

                {!profile ? <IconButton
                  icon='pencil'
                  iconColor='#167BD1'
                  size={20}
                  onPress={() => { setUpdateField('name'); showDialog() }}
                /> : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Ionicons name='text' size={18} color='#737373'></Ionicons>

              <View style={{ flexDirection: 'row', marginStart: 15, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#d9d9d9' }}>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14 }}>Username</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{profile ? profile.username : user.username}</Text>
                </View>

                {!profile ? <IconButton
                  icon='pencil'
                  iconColor='#167BD1'
                  size={20}
                  onPress={() => { setUpdateField('username'); showDialog() }}
                /> : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Ionicons name='information-circle' size={18} color='#737373'></Ionicons>

              <View style={{ flexDirection: 'row', marginStart: 15, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#d9d9d9' }}>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14 }}>Status</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{profile ? profile.status : user.status}</Text>
                </View>

                {!profile ? <IconButton
                  icon='pencil'
                  iconColor='#167BD1'
                  size={20}
                  onPress={() => { setUpdateField('status'); showDialog() }}
                /> : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Ionicons name='mail' size={18} color='#737373'></Ionicons>

              <View style={{ flexDirection: 'row', marginStart: 15, paddingVertical: 12 }}>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14 }}>Email</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{profile ? profile.email : user.email}</Text>
                </View>

                {!profile ? <IconButton
                  icon='pencil'
                  iconColor='#167BD1'
                  size={20}
                  disabled={true}
                /> : null}
              </View>
            </View>

            <Divider />

            {!profile ? <Button icon="logout" mode='outlined' buttonColor='#f2f2f2' textColor='#dc3545' style={{ paddingVertical: 3, marginVertical: 30, borderColor: '#dc3545', borderRadius: 30 }} onPress={signOut}>
              Sign out
            </Button> : null}
          </View>

          <Image source={require('../assets/chatnow-logo2.png')} style={{ width: 100, height: 20, resizeMode: 'contain', marginVertical: 30 }} />

          <Portal>
            <Dialog visible={visible}
              onDismiss={hideDialog}
              dismissable={!loading}
              dismissableBackButton={!loading}
              style={{ backgroundColor: '#e8f3fd' }}>

              <Dialog.Title style={{ color: 'black' }}>{`Edit ${updateField}`}</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  value={updateField === 'name' ? details.name : updateField === 'username' ? details.username : details.status}
                  selectionColor='#167BD1'
                  textColor='black'
                  activeUnderlineColor='#167BD1'
                  maxLength={updateField === 'status' ? 100 : 25}
                  style={{ backgroundColor: 'white', height: 50, paddingHorizontal: 10 }}
                  onChangeText={text => updateField === 'name' ? setdetails({ ...details, name: text }) :
                    updateField === 'username' ? setdetails({ ...details, username: text }) : setdetails({ ...details, status: text })}

                  right={<TextInput.Affix
                    text={(updateField === 'status' ? 100 : 25) - (updateField === 'name' ? details.name.length : updateField === 'username' ? details.username.length : details.status.length)}
                    textStyle={{ fontSize: 14, color: '#737373', marginStart: 10 }} />}
                  autoFocus={true}
                />

                {helperText ?
                  <HelperText type="error" visible={true} style={{ alignSelf: 'flex-start', fontSize: 14, color: '#dc3545' }} padding='none' >
                    {updateField === 'name' ? 'Name cannot be empty' : updateField === 'username' ? 'Username cannot be empty' : 'Status cannot be empty'}
                  </HelperText> : null}
              </Dialog.Content>

              <Dialog.Actions>
                <Button onPress={hideDialog} textColor='#737373' disabled={loading}>Cancel</Button>
                <Button onPress={handleSubmit} textColor='#167BD1' loading={loading} disabled={loading}>Save</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          {showImageModal ?
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
                  onPress={!loading ? () => { setShowImageModal(false); setdetails({ ...details, profilePicture: null }) } : null}
                />

                <View style={{ flex: 1, backgroundColor: 'black' }}>
                  <Image source={{ uri: details.profilePicture ? details.profilePicture.uri : profile ? profile.profilePicture : user.profilePicture }} style={{ width: '100%', flex: 1, resizeMode: 'contain' }} />
                </View>

                {details.profilePicture ?
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <Button onPress={hideImageModal} textColor='#737373' style={{ flex: 1, paddingVertical: 5 }} disabled={loading}>Cancel</Button>
                    <Button onPress={handleSubmit} textColor='#167BD1' style={{ flex: 1, paddingVertical: 5 }} loading={loading} disabled={loading}>Save</Button>
                  </View> :
                  !profile ? <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <Button icon='camera' onPress={pickFile} textColor='#737373' style={{ flex: 1, paddingVertical: 5 }} disabled={loading}>
                      Change photo
                    </Button>
                    <Button icon='delete' onPress={handleRemovePhoto} textColor='#dc3545' style={{ flex: 1, paddingVertical: 5 }} loading={loading}
                      disabled={loading || user.profilePicture === 'https://icon-library.com/images/my-profile-icon-png/my-profile-icon-png-14.jpg' ? true : false}
                    >
                      Remove photo
                    </Button>
                  </View> : null
                }
              </Modal>
            </Portal> : null}

        </View>
      </ScrollView>

      <Snackbar
        visible={error ? true : false}
        duration={2000}
        onDismiss={() => setError(false)}>
        {error}
      </Snackbar>
    </View >
  )
}

export default Profile