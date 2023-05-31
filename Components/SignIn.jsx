import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Button, Divider, Snackbar, TextInput, useTheme } from 'react-native-paper';
import styles from '../style';
import { useDispatch } from 'react-redux';
import { loginUser } from '../actions/auth';

const SignIn = ({ navigation }) => {

    const dispatch = useDispatch()

    const theme = useTheme();

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState(false)

    const [creds, setCreds] = useState({
        email: '',
        password: ''
    })

    const [credsInvalid, setCredsInvalid] = useState(false)

    const [showPassword, setshowPassword] = useState(false)

    const handleSignIn = () => {

        if (!creds.email.trim() || !creds.password.trim()) {
            setCredsInvalid(true)
        }

        const formData = new FormData()

        formData.append('email', creds.email.trim())
        formData.append('password', creds.password.trim())

        setLoading(true)
        dispatch(loginUser(formData, navigation, setLoading, setError))
    }

    return (
        <View style={[styles.container, { paddingHorizontal: 10 }]}>
            <View style={{ width: '100%', marginVertical: 30 }}>
                <Image source={require('../assets/chatnow-logo2.png')} style={{ width: 120, height: 20, resizeMode: 'contain' }} />
            </View>

            <Text style={styles.heading}>Create account</Text>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ width: '100%' }}>
                <View style={{ width: '100%' }}>

                    <View>
                        <TextInput
                            value={creds.email}
                            onChangeText={(value) => setCreds({ ...creds, email: value })}
                            label='Email'
                            mode='outlined'
                            activeOutlineColor='#167bd1'
                            style={styles.input}
                        />
                        <TextInput
                            value={creds.password}
                            secureTextEntry={showPassword ? false : true}
                            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} style={{}} onPress={() => setshowPassword(!showPassword)} />}
                            onChangeText={(value) => setCreds({ ...creds, password: value })}
                            label='Password'
                            mode='outlined'
                            activeOutlineColor='#167bd1'
                            style={styles.input}
                        />

                        {credsInvalid ? <Text style={{ fontWeight: 'bold', color: '#bf2c2c' }}>Please fill all the details correctly.</Text> : null}
                    </View>
                    <Button
                        style={{ paddingVertical: 5, marginTop: 30, marginBottom: 20, borderRadius: 30 }}
                        mode='contained'
                        buttonColor='#167bd1'
                        onPress={handleSignIn}
                        labelStyle={{ fontSize: 18 }}
                        loading={loading}
                        disabled={loading}>
                        Sign in
                    </Button>

                    <Divider />

                    <Button
                        style={{ paddingVertical: 5, marginTop: 20, borderRadius: 30 }}
                        mode='outlined'
                        textColor={theme.colors.secondary}
                        labelStyle={{ fontSize: 18 }}
                        onPress={() => navigation.navigate('SignUp')} >
                        Don't have an account? Sign up now.
                    </Button>
                </View>
            </ScrollView>

            <Snackbar
                visible={error ? true : false}
                duration={2000}
                onDismiss={() => setError(false)}>
                {error}
            </Snackbar>
        </View>
    );
}

export default SignIn;