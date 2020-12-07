import React, {Component} from 'react';
import {Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';

import Bluetooth from './Bluetooth';
import Calendar from './Calander';

class HomeScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Home',
  };

  render() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>Home Screen</Text>
      </View>
    );
  }
}

const Testing = ({navigation}) => (
  <View style={{flexGrow: 1, alignContent: 'space-between'}}>
    <Text style={{fontSize: 30, fontFamily: 'SourceSansPro-Regular'}}>
      Testing
    </Text>

    <Icon
      name="rocket"
      size={30}
      color="#900"
      onPress={() => navigation.openDrawer()}
    />
    <Icon.Button
      backgroundColor="#3b5991"
      onPress={() => navigation.navigate('Home')}>
      Go to next screen
    </Icon.Button>

    <Icon.Button
      backgroundColor="#3b5991"
      onPress={() => navigation.navigate('Bluetooth')}>
      Go to Bluetooth
    </Icon.Button>

    <Icon.Button
      backgroundColor="#3b5991"
      onPress={() => navigation.navigate('Calendar')}>
      Go to Calendar
    </Icon.Button>
  </View>
);

const AppNavigator = createDrawerNavigator({
  Test: Testing,
  Home: HomeScreen,
  Bluetooth,
  Calendar,
});

export default createAppContainer(AppNavigator);
