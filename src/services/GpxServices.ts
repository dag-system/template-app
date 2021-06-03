import moment from 'moment';
import haversine from 'haversine-distance';
import {buildGPX, GarminBuilder} from 'gpx-builder';
import {Point} from 'gpx-builder/dist/builder/BaseBuilder/models';

export default class GpxService {
  static calculateTimeBetweenTwoPoints(
    endPoint,
    startPoint, //seconds
  ) {
    return moment
      .duration(moment(endPoint.dateGps).diff(moment(startPoint.dateGps)))
      .asSeconds();
  }

  static calculateDistBetweenTwoPoints(
    endPoint,
    startPoint, //meters
  ) {
    return haversine(startPoint, endPoint);
  }

  static calculateSpeedBetweenTwoPoints(
    endPoint,
    startPoint, // m/s
  ) {
    return (
      GpxService.calculateDistBetweenTwoPoints(endPoint, startPoint) /
      GpxService.calculateTimeBetweenTwoPoints(endPoint, startPoint)
    );
  }

  static calculateSpeed(
    dist,
    time, // km/h
  ) {
    return dist / time;
  }

  static convertTokmH(
    speed, // km/h
  ) {
    return speed * 3.6;
  }
  static speedToPace(
    speed, //km/h à minutes par km
  ) {
    return GpxService.paceDisplay((1 / speed) * 3600);
  }

  static paceDisplay(pace) {
    var hours = Math.floor((pace % (60 * 60)) / (60 * 60));
    var minutes = Math.floor((pace % (60 * 60)) / 60);
    var seconds = Math.floor((pace % 60) / 1);
    return GpxService.formattedTime(hours, minutes, seconds);
  }

  static formattedTime(hours, minutes, seconds) {
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

    if (hours > 0) {
      return hoursDisplay + ':' + minutesDisplay + ':' + secondsDisplay;
    } else {
      return minutesDisplay + ':' + secondsDisplay;
    }
  }

  static convertDureeToSec(duree: string) {
    //00:08:52

    if (duree != undefined && duree != '0') {
      let split = duree.split(':');
      let hours = Number(split[0]);
      let minutes = Number(split[1]);
      let seconds = Number(split[2]);

      return hours * 3600 + minutes * 60 + seconds;
    } else {
      return 0;
    }
  }

  static createGpx = (data: any[]) => {
    try {
      const gpxData = new GarminBuilder();
      let points: Point[] = [];

      data.forEach((c) => {
        var point = new Point(c.latitude, c.longitude, {
          time: new Date(c.timestamp),
        });
        points.push(point);
      });

      gpxData.setSegmentPoints(points);
      var gpxString = buildGPX(gpxData.toObject());
      return gpxString;
      //await this.sendGeneratedGPX(gpxString);
    } catch (e) {
      console.log(e);
    }
  };
}
