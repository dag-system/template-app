/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
// import * as Sentry from '@sentry/react-native';
// import React from 'react';

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));

  // const whyDidYouRender = require('@welldone-software/why-did-you-render');
  // whyDidYouRender(React, {
  //   trackAllPureComponents: true,
  // });


}


// Sentry.init({
//   dsn:
//     'https://d455e5c5cf5548f89d42e2f9582469f7@o556570.ingest.sentry.io/5687721',
//     debug: false,
//     deactivateStacktraceMerging: true

// });

AppRegistry.registerComponent(appName, () => App);

console.disableYellowBox = true;

// Define a simple "HeadlessTask" with an async function.
// This function will receive all events from the BackgroundGeolocation plugin
// while in the "Headless" state
