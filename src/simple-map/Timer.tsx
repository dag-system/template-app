import React, {Component} from 'react';
import {
  StyleSheet,
} from 'react-native';
import {
  Text,
} from 'native-base';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    coordinates : state.coordinates,
    dates : state.dates
  };
};


class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);

    // alert(this.props.userData.ddnUtilisateur)
    //   alert(new Date(this.props.userData.ddnUtilisateur))

    // setTimeout(() => this.setState({ userdata: { ...this.state.userdata, ddnUtilisateur: this.state.userdata.ddnUtilisateur) }} ), 100)
  }
  didMount() {}

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


  render() {
    return (
  
      <Text style={styles.timeText}>{this.getCurrentTime()}</Text>
    );
  }
}

const styles = StyleSheet.create({
  timeText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default connect(mapStateToProps)(Timer);
