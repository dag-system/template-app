// ApiUtils.js

import {
  TemplateBackgroundColor,
  TemplateOrganisation,
  IsDemo,
  TemplateExpirationDate,
  TemplateSecondColor,
} from './globalsModifs';
import moment from 'moment';

const ISDEBUG = false;
const ISDEMO = false;

const VersionNumber = '1.0.0';
const VersionNumberInt = 1;
const pushNotificationInstance = '653e46e5-9ff8-48ae-9591-feaa4054023e';

var ApiUtils = {
  getOrganisation() {
    return TemplateOrganisation;
  },
  getPushNotificationInstance() {
    return pushNotificationInstance;
  },
  isExpired() {
    let currentDate = new Date();

    if (IsDemo && !__DEV__) {
      if (
        moment(currentDate.toISOString()).isAfter(
          TemplateExpirationDate.toISOString(),
        )
      ) {
        return true;
      }
    } else {
      return false;
    }
  },
  removeAccents(str) {
    let accents =
      'ÀÁÂÃÄÅàáâãäåßÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    let accentsOut =
      'AAAAAAaaaaaaBOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
    if (str != null) {
      str = str.split('');
      str.forEach((letter, index) => {
        let i = accents.indexOf(letter);
        if (i != -1) {
          str[index] = accentsOut[i];
        }
      });
      return str.join('');
    } else {
      return str;
    }
  },
  ISDEBUG() {
    return ISDEBUG;
  },
  ISDEMO() {
    return ISDEBUG;
  },
  getBackgroundColor() {
    return TemplateBackgroundColor !='' ? TemplateBackgroundColor  : "#ffffff" ;
  },
  getSecondColor() {
    return TemplateSecondColor;
  },
  getColor() {
    let color = this.getBackgroundColor();

    if (this.getBackgroundColor() == '#FFFFFF') {
      color = this.getSecondColor();
    }

    if (color == '#FFFFFF') {
      return '#000000';
    }

    return color;
  },
  VersionNumber() {
    return VersionNumber;
  },
  VersionNumberInt() {
    return VersionNumberInt;
  },

  red() {
    return '#E10D17';
  },

  orange() {
    return '#FEAA00';
  },

  green() {
    return '#39F800';
  },

  checkStatus: function (response) {
    if (response.ok) {
      return response;
    } else {
      response.text().then(function (text) {
        console.log('Check status error : ', text);
      });
      let error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  },

  getPhotoUrl(idStation, photo) {
    var url =
      ApiUtils.getUrl() + 'fichiers/interets/' + idStation + '/' + photo;
    return url;
  },

  getAPIUrl() {
    return 'https://folomi.fr/api/sportapi.php';
  },

  getAPIAuth() {
    if (ISDEBUG) {
      return 'aiovbZRUOGTzbrvZRUGB,??452';
    } else {
      return 'aiovbZRUOGTzbrvZRUGB,??452';
    }
  },

  getShareUrl() {
    if (ISDEBUG) {
      return 'http://reperret.fr/live/';
    } else if (ISDEMO) {
      return 'http://www.folomidemo.fr/live/';
    } else {
      return 'https://folomi.fr/s/liveFolo/live.php?c=';
    }
  },

  getGpxUrl(gpxName) {
    return 'https://folomi.fr/fichiers/gpxLive/' + gpxName + '.gpx';
  },

  getUrl() {
    if (ISDEBUG) {
      return 'http://reperret.fr/';
    } else if (ISDEMO) {
      return 'http://www.folomidemo.fr/';
    } else {
      return 'https://folomi.fr/';
    }
  },

  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  getLibelleLive() {
    var date = new Date();
    var hour = date.getHours();

    if (hour <= 11) {
      return 'Activité matinale';
    }
    if (hour > 11 && hour < 19) {
      return "Activité de l'après-midi";
    }

    if (hour >= 19) {
      return 'Activité du soir';
    }
  },

  hasPaid(userData) {
    let paiementsString = userData.paiements;
    if (paiementsString == null) {
      return false;
    }
    var paiements = Object.values(paiementsString);
    console.log(paiements);
    if (paiements != null && paiements.length > 0) {
      if (paiements.filter((p) => p.idStation == IdStation).length > 0) {
        return true;
      }
    } else {
      return false;
    }
  },

  logError: function (methodName, message) {
    // alert(message);
    // let formData = new FormData();
    // formData.append('method', 'debug');
    // formData.append('auth', ApiUtils.getAPIAuth());
    // var finalMessage =
    //   '----DATE---: ' +
    //   ' ' +
    //   new Date().toDateString() +
    //   ' ' +
    //   new Date().toTimeString() +
    //   '----METHOD---: ' +
    //   methodName +
    //   '---MESSAGE---:  ' +
    //   message;
    // formData.append('message', finalMessage);
    // formData.append('type', 0);
    // //fetch followCode API
    // fetch(ApiUtils.getAPIUrl(), {
    //   method: 'POST',
    //   headers: {},
    //   body: formData,
    // })
    //   .then(ApiUtils.checkStatus)
    //   .catch((e) => e);
  },

  logStats: function (message) {
    // let formData = new FormData();
    // formData.append('method', 'debug');
    // formData.append('auth', ApiUtils.getAPIAuth());
    // formData.append('message', message);
    // formData.append('type', 1);
    // //fetch followCode API
    // fetch(ApiUtils.getAPIUrl(), {
    //   method: 'POST',
    //   headers: {},
    //   body: formData,
    // })
    //   .then(ApiUtils.checkStatus)
    //   .catch(e => e);
  },
};
export {ApiUtils as default};
