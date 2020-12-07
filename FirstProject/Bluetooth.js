import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  ScrollView,
  AppState,
  FlatList,
  Dimensions,
  Button,
  SafeAreaView,
} from 'react-native';
import BleManager from 'react-native-ble-manager';

const window = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      peripherals: new Map(),
      appState: '',
    };

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
      this,
    );
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
      this,
    );
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    BleManager.start({showAlert: false});

    this.handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    this.handlerStop = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      this.handleStopScan,
    );
    this.handlerDisconnect = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral,
    );
    this.handlerUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ).then(result => {
        if (result) {
          console.warn('Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ).then(result => {
            if (result) {
              console.warn('User accept');
            } else {
              console.warn('User refuse');
            }
          });
        }
      });
    }
  }

  handleAppStateChange(nextAppState) {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.warn('App has come to the foreground!');
      BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
        console.warn('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
    console.warn('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.warn(
      'Received data from ' +
        data.peripheral +
        ' characteristic ' +
        data.characteristic,
      data.value,
    );
  }

  handleStopScan() {
    console.warn('Scan is stopped');
    this.setState({scanning: false});
  }

  startScan() {
    if (!this.state.scanning) {
      //this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true)
        .then(results => {
          console.warn('Scanning...');
          this.setState({scanning: true});
        })
        .catch(err => {
          console.warn('scanning err:', err);
        });
    }
  }

  retrieveConnected() {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length == 0) {
        console.warn('No connected peripherals');
      }
      console.warn(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({peripherals});
      }
    });
  }

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    console.warn('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    this.setState({peripherals});
  }

  test(peripheral) {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id)
          .then(() => {
            let peripherals = this.state.peripherals;
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              this.setState({peripherals});
            }
            console.warn('Connected to ' + peripheral.id);

            setTimeout(() => {
              /* Test read current RSSI value
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.warn('Retrieved peripheral services', peripheralData);

              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.warn('Retrieved actual RSSI value', rssi);
              });
            });*/

              // Test using bleno's pizza example
              // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
              BleManager.retrieveServices(peripheral.id).then(
                peripheralInfo => {
                  console.warn(peripheralInfo);
                  var service = '0000fed1-0000-3512-2118-0009af100700';

                  var bakeCharacteristic =
                    '9fa480e0-4967-4542-9390-d343dc5d04ae';

                  var crustCharacteristic =
                    '13333333-3333-3333-3333-333333330001';

                  setTimeout(() => {
                    BleManager.startNotification(
                      peripheral.id,
                      service,
                      bakeCharacteristic,
                    )
                      .then(() => {
                        console.warn(
                          'Started notification on ' + peripheral.id,
                        );
                        setTimeout(() => {
                          BleManager.write(
                            peripheral.id,
                            service,
                            crustCharacteristic,
                            [0],
                          ).then(() => {
                            console.warn('Writed NORMAL crust');
                            BleManager.write(
                              peripheral.id,
                              service,
                              bakeCharacteristic,
                              [1, 95],
                            ).then(() => {
                              console.warn(
                                'Writed 351 temperature, the pizza should be BAKED',
                              );
                              /*
                        var PizzaBakeResult = {
                          HALF_BAKED: 0,
                          BAKED:      1,
                          CRISPY:     2,
                          BURNT:      3,
                          ON_FIRE:    4
                        };*/
                            });
                          });
                        }, 500);
                      })
                      .catch(error => {
                        console.warn('Notification error', error);
                      });
                  }, 200);
                },
              );
            }, 900);
          })
          .catch(error => {
            console.warn('Connection error', error);
          });
      }
    }
  }

  renderItem(item) {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => this.test(item)}>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: '#333333',
              padding: 10,
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 10,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
            }}>
            RSSI: {item.rssi}
          </Text>
          <Text
            style={{
              fontSize: 8,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
              paddingBottom: 20,
            }}>
            {item.id}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    const btnScanTitle =
      'Scan Bluetooth (' + (this.state.scanning ? 'on' : 'off') + ')';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan()} />
          </View>

          <View style={{margin: 10}}>
            <Button
              title="Retrieve connected peripherals"
              onPress={() => this.retrieveConnected()}
            />
          </View>

          <ScrollView style={styles.scroll}>
            {list.length == 0 && (
              <View style={{flex: 1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>No peripherals</Text>
              </View>
            )}
            <FlatList
              data={list}
              renderItem={({item}) => this.renderItem(item)}
              keyExtractor={item => item.id}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 10,
  },
  row: {
    margin: 10,
  },
});
