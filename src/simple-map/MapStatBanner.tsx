import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Share,
  Image,
} from 'react-native';
import {Header, Body, Icon, Text, Left, Right} from 'native-base';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import GlobalStyles from '../styles';
import DefaultProps from '../models/DefaultProps';
import BackgroundGeolocation from 'react-native-background-geolocation';
import Logo from '../assets/logo.png';
const mapStateToProps = (state) => {
  return {
    isRecording: state.isRecording,
    currentLive: state.currentLive,
    userData: state.userData,
    dates: state.dates,
    odometer: state.odometer,
    currentPosition: state.currentPosition,
  };
};

interface Props extends DefaultProps {
  isRecording: boolean;
  currentLive: any;
  userData: any;
  dates: any[];
  odometer: any;
  currentPosition: any;
  ondrawer(): void;
}

interface State {}

class MapStatBanner extends Component<Props, State> {
  interval: number;
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {
    clearInterval(this.interval);
    this.interval = setInterval(() => this.setState({test: 1}), 1100);
  }

  // componentWillUnmount() {
  //   clearInterval(this.interval);
  // }

  // goBackOk() {
  //   BackgroundGeolocation.stop();
  //   var action = {type: 'CLEAR_MAP', data: null};
  //   this.props.dispatch(action);

  //   this.props.navigation.navigate('Lives');
  // }

  // goBack() {
  //   if (this.props.isRecording) {
  //     Alert.alert(
  //       "Quitter l'activité",
  //       "Si vous quittez l'activité vous allez perdre les données enregistrées. Etes-vous sûr de quitter l'activité ?",
  //       [
  //         {
  //           text: 'Annuler',
  //           style: 'cancel',
  //         },
  //         {text: 'Quitter', onPress: () => this.goBackOk()},
  //       ],
  //       {cancelable: false},
  //     );
  //   } else {
  //     this.goBackOk();
  //   }
  // }

  onClickShare() {
    Share.share(
      {
        message:
          'Suivez ma position en direct  : ' +
          ApiUtils.getShareUrl() +
          this.props.currentLive.codeLive,
        title: 'Suivez ma position en direct !',
      },
      {
        // Android only:
        dialogTitle: 'Suivez ma position en direct ! ',
      },
    );
  }

  formattedTime(hours, minutes, seconds) {
    var hoursDisplay = hours;
    if (hours < 10) {
      hoursDisplay = '0' + hours;
    }

    var minutesDisplay = minutes;
    if (minutes < 10) {
      minutesDisplay = '0' + minutes;
    }

    var secondsDisplay = seconds;
    if (seconds < 10) {
      secondsDisplay = '0' + seconds;
    }

    return hoursDisplay + ':' + minutesDisplay + ':' + secondsDisplay;
  }

  getCurrentTime() {
    if (this.props.dates.length == 0 || this.props.dates == null) {
      return '00:00:00';
    } else {
      if (this.props.dates.length % 2 == 0) {
        //on est en pause
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }

        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return this.formattedTime(hours, minutes, seconds);
      } else {
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }

        var now = new Date().getTime();

        currentTime =
          currentTime + now - this.props.dates[this.props.dates.length - 1];

        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return this.formattedTime(hours, minutes, seconds);
      }
    }
  }

  getCurrentTimeInSec() {
    if (this.props.dates.length == 0 || this.props.dates == null) {
      return 0;
    } else {
      if (this.props.dates.length % 2 == 0) {
        //on est en pause
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }
        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return hours * 3600 + minutes * 60 + seconds;
        return currentTime;
      } else {
        var currentTime = 0;
        for (var i = 0; i < this.props.dates.length - 1; i++) {
          currentTime += this.props.dates[i + 1] - this.props.dates[i];
          i++;
        }

        var now = new Date().getTime();

        currentTime =
          currentTime + now - this.props.dates[this.props.dates.length - 1];

        var hours = Math.floor(
          (currentTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        var minutes = Math.floor(
          (currentTime % (1000 * 60 * 60)) / (1000 * 60),
        );
        var seconds = Math.floor((currentTime % (1000 * 60)) / 1000);
        return hours * 3600 + minutes * 60 + seconds;
      }
    }
  }

  getSpeed() {
    var time = this.getCurrentTimeInSec();

    if (time == 0) {
      return '-';
    }

    let distKm = this.props.odometer;

    return ((distKm / time) * 3600).toFixed(2);
  }

  openDrawer = () => {
    // alert('ici');
    this.props.ondrawer();
  };

  render() {
    return (
      <View style={styles.statBanner}>
        <View style={styles.timeTextContainer}>
          <Text style={styles.timeText}>{this.getCurrentTime()}</Text>
        </View>

        <View style={styles.timeTextContainer}>
          <Text style={styles.timeText}>{this.getSpeed()} km/h</Text>
        </View>
        <View style={styles.timeTextContainer}>
          <Text style={styles.timeText}>
            {this.props.odometer?.toFixed(2)} km
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    statBanner: {
        position : 'absolute',
        top :0,
        zIndex : 1000,
        flexDirection: 'row',
        borderTopColor: '#D5D5D5',
        borderTopWidth: 1,
        justifyContent: 'space-around',
        width: '100%',
        // backgroundColor: 'white',
        padding: 10,
        marginTop : 10,
      },

      timeTextContainer:{
        backgroundColor: 'white',
        padding : 10,
        paddingHorizontal : 15,
        borderRadius : 10,
      },

      timeText:{
 
        fontWeight : 'bold'
      }
});

export default connect(mapStateToProps)(MapStatBanner);
