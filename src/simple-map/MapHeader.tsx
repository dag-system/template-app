import React, {Component} from 'react';
import {StyleSheet, View, Share, Image} from 'react-native';
import {Header, Body, Icon, Left, Right, Button} from 'native-base';
import ApiUtils from '../ApiUtils';
import {connect} from 'react-redux';
import DefaultProps from '../models/DefaultProps';
import Logo from '../assets/logo.png';
import {formattedTime} from '../services/HoursService';
import AppState from '../models/AppState';
import {textAutoBackgroundColor} from '../globalsModifs';
const mapStateToProps = (state: AppState) => {
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

class MapHeader extends Component<Props, State> {
  interval: any;
  constructor(props: any) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {
    clearInterval(this.interval);
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
        return formattedTime(hours, minutes, seconds);
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
        return formattedTime(hours, minutes, seconds);
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
      <View>
        <Header style={styles.header}>
          <Left>
            <Button
              style={styles.goBackButton}
              onPress={() => this.openDrawer()}>
              <Icon style={styles.saveText} name="bars" type="FontAwesome5" />
            </Button>
          </Left>
          <Body>
            <Image
              resizeMode="contain"
              source={Logo}
              style={styles.logoHeader}
            />
          </Body>
          <Right></Right>
        </Header>
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
    color: textAutoBackgroundColor,
    paddingLeft: 0,
    marginLeft: 0,
    marginRight: -5,
    width: 80,
    height: 40,
  },

  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    // height: 80
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
  logoHeader: {
    // width: '10%',
    height: 50,
    width: '100%',
    marginLeft: '30%',
    // width : 100
    // marginRight: '2%',
  },
});

export default connect(mapStateToProps)(MapHeader);
