/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

if(__DEV__) {
    import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
  }

AppRegistry.registerComponent(appName, () => App);

console.disableYellowBox = true;
// Define a simple "HeadlessTask" with an async function. 
// This function will receive all events from the BackgroundGeolocation plugin
// while in the "Headless" state

