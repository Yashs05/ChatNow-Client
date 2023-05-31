import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './AppNavigator';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import store from './store';

export default function App() {

  return (
    <Provider store={store}>
      <PaperProvider>
        <AppNavigator />
        <StatusBar backgroundColor={'#167BD1'} barStyle='default' />
      </PaperProvider>
    </Provider>
  );
}
