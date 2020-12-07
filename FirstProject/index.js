/**
 * @format
 */

import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';

import App from './App';
import Test from './Test'; //'./Test';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Test);
