import { View, Image } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadUser } from '../actions/auth'
import styles from '../style'

const Splash = ({ navigation }) => {

    const dispatch = useDispatch()
    
    useEffect(() => {
        dispatch(loadUser(navigation))
    }, [])

    return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <Image source={require('../assets/chatnow-logo2.png')} style={{ width: 180, height: 60, resizeMode: 'contain' }} />
        </View>
    )
}

export default Splash