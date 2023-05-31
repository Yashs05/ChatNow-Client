import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#e8f3fd',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        width: '100%'
    },
    input: {
        width: '100%',
        height: 60,
        backgroundColor: 'white',
        marginBottom: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        marginTop: 30,
        marginBottom: 20,
        backgroundColor: '#007bff',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    fab: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#167bd1',
        margin: 16,
        borderRadius: 50,
        bottom: 0,
    }
});

export default styles