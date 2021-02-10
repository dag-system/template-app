import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Share,
} from 'react-native';
import {
  Header,
  Body,
  Icon,
  Text,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import GlobalStyles from '../styles';
import DefaultProps from '../models/DefaultProps';
const mapStateToProps = state => {
  return {
    isRecording: state.isRecording,
    currentLive: state.currentLive,
    userData : state.userData,
    dates : state.dates,
    odometer : state.odometer,
    currentPosition : state.currentPosition
  };
};

interface Props extends DefaultProps {
  isRecording: boolean,
  currentLive: any,
  userData : any,
  dates : any[],
  odometer : any,
  currentPosition : any
}

interface State {}


class MapHeader extends Component<Props,State> {
  interval: number;
  constructor(props) {
    super(props);

    this.state = {
    
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

  }
  didMount() {
    clearInterval(this.interval);
    this.interval =  setInterval(() =>this.setState({test :1}), 1100);
  }

  componentWillUnmount()
  {
    clearInterval(this.interval);
  }

  goBackOk() {
    var action = {type: 'CLEAR_MAP', data: null};
    this.props.dispatch(action);

    this.props.navigation.navigate('Lives');

  }

  goBack() {
    if (this.props.isRecording) {
      Alert.alert(
        "Quitter l'activité",
        "Si vous quittez l'activité vous allez perdre les données enregistrées. Etes-vous sûr de quitter l'activité ?",
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {text: 'Quitter', onPress: () => this.goBackOk()},
        ],
        {cancelable: false},
      );
    } else {
      this.goBackOk();
    }
  }


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

  render() {
    return (
      <View>
      <Header style={styles.header}>
        <Body>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              paddingRight: 0,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                paddingRight: 0,
              }}>
              <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => this.goBack()}>
                <Icon
                  style={styles.saveText}
                  name="chevron-left"
                  type="FontAwesome5"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  elevation: 0,
                  justifyContent: 'center',
                }}
                onPress={() => this.goBack()}>
                <View style={[GlobalStyles.row]}>
                  <Text style={{color: 'black'}}>
                    {this.props.userData.nomUtilisateur}
                  </Text>
                  <Text style={{color: 'black', marginLeft: 5}}>
                    {this.props.userData.prenomUtilisateur}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              {this.props.currentPosition ? (
                <TouchableOpacity
                  style={[{marginLeft: 10}]}
                  onPress={() => this.onClickShare()}>
                  <Icon
                    active
                    name="share"
                    type="FontAwesome5"
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </Body>
      </Header>
         <View style={styles.statBanner}>
         <Text style={styles.timeText}>{this.getCurrentTime()}</Text>
         <Text>|</Text>
         <Text style={styles.timeText}>{this.getSpeed()} km/h</Text>
         <Text>|</Text>
         <Text style={styles.timeText}>
           {this.props.odometer?.toFixed(2)} km
         </Text>
       </View>

       <View style={styles.liveNameBanner}>
         <Text style={styles.liveNameText}>
           {this.props.currentLive?.libelleLive}
         </Text>
       </View>
       </View>
    );
  }
}

const styles = StyleSheet.create({

  goBackButton: {
    backgroundColor: 'transparent',
    width: 30,
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    paddingLeft: 0,
  },
  saveText: {
    color: 'black',
    paddingLeft: 0,
    marginLeft: 0,
    marginRight: -5,
  },

  header: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    // height: 80
  },
  statBanner: {
    flexDirection: 'row',
    borderTopColor: '#D5D5D5',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
  },
  liveNameBanner: {
    backgroundColor: 'white',
    borderTopColor: '#D5D5D5',
    borderTopWidth: 1,
    justifyContent: 'center',
    width: '100%',
    height: 30,
    paddingTop: 5,
    paddingBottom: 5,
    color: 'white',
  },
  liveNameText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default connect(mapStateToProps)(MapHeader);
