import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Share} from 'react-native';
import {Text} from 'native-base';
import {useSelector} from 'react-redux';
import {formattedTime} from '../services/HoursService';
import AppState from '../models/AppState';

export default function MapStatBanner() {
  const [test, setTest] = useState(0);
  const [interval, setCurrentInterval] = useState<any>();

  const {dates, currentLive, odometer} = useSelector(
    (state: AppState) => state,
  );

  useEffect(() => {
    clearInterval(interval);
    let currentInterval = setInterval(
      () => setTest((value) => value + 1),
      1100,
    );
    setCurrentInterval(currentInterval);
    return () => clearInterval(interval);
  }, []);

  const getCurrentTime = () => {
    if (dates.length == 0 || dates == null) {
      return '00:00:00';
    } else {
      if (dates.length % 2 == 0) {
        //on est en pause
        var currentTime = 0;
        for (var i = 0; i < dates.length - 1; i++) {
          currentTime += dates[i + 1] - dates[i];
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
        for (var i = 0; i < dates.length - 1; i++) {
          currentTime += dates[i + 1] - dates[i];
          i++;
        }

        var now = new Date().getTime();

        currentTime = currentTime + now - dates[dates.length - 1];

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
  };

  const getCurrentTimeInSec = () => {
    if (dates.length == 0 || dates == null) {
      return 0;
    } else {
      if (dates.length % 2 == 0) {
        //on est en pause
        var currentTime = 0;
        for (var i = 0; i < dates.length - 1; i++) {
          currentTime += dates[i + 1] - dates[i];
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
        for (var i = 0; i < dates.length - 1; i++) {
          currentTime += dates[i + 1] - dates[i];
          i++;
        }

        var now = new Date().getTime();

        currentTime = currentTime + now - dates[dates.length - 1];

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
  };

  const getSpeed = () => {
    var time = getCurrentTimeInSec();

    if (time == 0) {
      return '-';
    }

    let distKm = odometer;

    return ((distKm / time) * 3600).toFixed(2);
  };

  return (
    <View style={styles.statBanner}>
      <View style={styles.timeTextContainer}>
        <Text style={styles.timeText}>{getCurrentTime()}</Text>
      </View>

      <View style={styles.timeTextContainer}>
        <Text style={styles.timeText}>{getSpeed()} km/h</Text>
      </View>
      <View style={styles.timeTextContainer}>
        <Text style={styles.timeText}>{odometer?.toFixed(2)} km</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statBanner: {
    position: 'absolute',
    top: 0,
    zIndex: 1000,
    flexDirection: 'row',

    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
    marginTop: 10,
  },

  timeTextContainer: {
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  timeText: {
    fontWeight: 'bold',
  },
});
