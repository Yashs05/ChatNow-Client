import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import styles from '../style'
import { Avatar, Button, Divider, HelperText, Snackbar, TextInput } from 'react-native-paper'
import * as DocumentPicker from 'expo-document-picker';
import { useDispatch, useSelector } from 'react-redux';
import { newGroup } from '../actions/chats';

const GroupDetails = ({ navigation, route }) => {

  const dispatch = useDispatch()

  const { users } = route.params

  const { chats } = useSelector(state => state.chats)

  const [groupDetails, setgroupDetails] = useState({
    name: '',
    groupPhoto: ''
  })

  const [nameError, setNameError] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const pickFile = async () => {
    try {
      let file = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'] });

      setgroupDetails({
        ...groupDetails,
        groupPhoto: {
          uri: file.uri,
          name: file.name,
          type: file.mimeType
        }
      })
    } catch (error) {
      console.log(error)
    }
  };

  const handleGroupSubmit = () => {
    if (!groupDetails.name.trim()) {
      setNameError(true)
      return;
    }

    const formData = new FormData()

    formData.append('userIds', users.map(item => item._id))
    formData.append('groupName', groupDetails.name)

    if (groupDetails.groupPhoto) formData.append('groupPhoto', groupDetails.groupPhoto)

    dispatch(newGroup(formData, chats, setLoading, setError, navigation))
    setLoading(true)
  }

  return (
    <View style={[styles.container, { paddingHorizontal: 10 }]}>
      <View style={{ marginVertical: 15, alignItems: 'center' }}>
        <Pressable onPress={pickFile}>
          <Avatar.Image size={75} source={{ uri: groupDetails.groupPhoto.uri || 'https://icon-library.com/images/persons-icon/persons-icon-11.jpg' }} style={{ backgroundColor: '#d9d9d9' }} />
        </Pressable>

        <View style={{ width: '100%', marginVertical: 15 }}>
          <TextInput
            label="Group name"
            underlineColor='#167BD1'
            activeUnderlineColor='#167BD1'
            value={groupDetails.name}
            onChangeText={text => setgroupDetails({ ...groupDetails, name: text })}
            style={{ width: '100%', backgroundColor: 'white' }}
          />
          {nameError ?
            <HelperText type="error" visible={true} style={{ alignSelf: 'flex-start', fontSize: 14 }} padding='none' >
              Please write a name for the group.
            </HelperText> : null}
        </View>

        <Divider style={{ width: '100%' }} />

        <View style={{ marginVertical: 15, width: '100%' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Participants</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'nowrap', overflow: 'scroll' }}>
            {users.map((item, i) => {
              return (
                <View style={{ marginEnd: 15, alignItems: 'center' }} key={i}>
                  <Avatar.Image size={40} source={{ uri: item.profilePicture }} style={{ backgroundColor: '#d9d9d9' }} />
                  <Text numberOfLines={1} ellipsizeMode='tail' style={{ width: 60, textAlign: 'center' }}>{item.name}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <Divider style={{ width: '100%' }} />

        <View style={{ width: '100%', marginVertical: 15 }}>
          <Button icon="check" mode="contained" buttonColor='#167BD1' loading={loading} disabled={loading} onPress={handleGroupSubmit}>
            Create Group
          </Button>
        </View>

      </View>
      {error ?
        <Snackbar
          visible={error ? true : false}
          duration={5000}
          style={{ width: '100%' }}
          onDismiss={() => setError(false)}>
            {error}
        </Snackbar> :
        null}
    </View>
  )
}

export default GroupDetails