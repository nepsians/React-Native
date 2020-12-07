import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';

export default class Calander extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: undefined,
      firstTime: true,
      firstDate: undefined,
      lastDate: undefined,
    };

    this.count = 0;
  }

  onPress = day => {
    this.setState({selectedDate: undefined});
    var date = {};
    var selectedDate = day.dateString;

    for (let i = 0; i < 7; i++) {
      date = {
        ...date,
        [selectedDate]: {
          selected: true,
          selectedColor: 'orange',
          startingDay: i === 0,
          endingDay: i === 6,
          color: 'orange',
        },
      };
      selectedDate = moment(selectedDate, 'YYYY-MM-DD')
        .add(1, 'days')
        .format('YYYY-MM-DD');
    }
    console.warn(date);
    this.setState({selectedDate: date});
  };

  forDoublePress = day => {
    const {firstDate, lastDate, firstTime} = this.state;
    var selectedDate = day.dateString;

    var dates = {...this.state.selectedDate};

    switch (this.count) {
      case 0:
        dates = {
          ...dates,
          [selectedDate]: {
            startingDay: true,
            color: 'orange',
            selected: true,
          },
        };
        this.setState({selectedDate: dates, firstDate: selectedDate});
        this.count += 1;
        break;

      case 1:
        var diffDate = moment(firstDate, 'YYYY-MM-DD');

        if (diffDate.diff(selectedDate) > 0) {
          this.count = 0;
          this.setState({selectedDate: undefined});
          return;
        }

        while (diffDate.diff(selectedDate) < 0) {
          diffDate = moment(diffDate, 'YYYY-MM-DD').add(1, 'days');

          dates = {
            ...dates,
            [diffDate.format('YYYY-MM-DD')]: {
              color: 'orange',
              selected: true,
              endingDay: diffDate.diff(selectedDate) === 0,
            },
          };
        }

        this.setState({selectedDate: dates});

        this.count += 1;
        break;

      default:
        this.count = 0;
        this.setState({selectedDate: undefined});
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Calendar
          minDate={new Date()}
          style={{borderWidth: 1, borderColor: 'gray', height: 350}}
          theme={theme}
          onDayPress={this.forDoublePress}
          markedDates={this.state.selectedDate}
          markingType="period"
        />
      </View>
    );
  }
}

const theme = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#b6c1cd',
  selectedDayBackgroundColor: '#00adf5',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#00adf5',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  dotColor: '#00adf5',
  selectedDotColor: '#ffffff',
  arrowColor: 'orange',
  disabledArrowColor: '#d9e1e8',
  monthTextColor: 'blue',
  indicatorColor: 'blue',
  textDayFontFamily: 'monospace',
  textMonthFontFamily: 'monospace',
  textDayHeaderFontFamily: 'monospace',
  textDayFontWeight: '300',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '300',
  textDayFontSize: 16,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 16,
};
