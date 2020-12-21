// ApiUtils.js
import AsyncStorage from '@react-native-community/async-storage';

const ISDEBUG = false;
const ISDEMO = false;

const VersionNumber = "0.0.1";

var ApiUtils = {

  ISDEBUG()
  {
    return ISDEBUG;
  },
  ISDEMO()
  {
    return ISDEBUG;
  },
  getBackgroundColor()
  {
    return '#3266aa';
  },
  VersionNumber()
  {
    return VersionNumber;
  },

  checkStatus: function (response) {
    if (response.ok) {
      return response;
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  },

  getPhotoUrl(idStation, photo) {
    var url = ApiUtils.getUrl() + 'fichiers/interets/' + idStation + '/' + photo;
    return url;
  },

  getColor() {
    return ApiUtils.getBackgroundColor()
  },

   getAPIUrl() {
    if (ISDEBUG) {
      return "https://www.reperret.fr/api/foulee.php";
    } else if (ISDEMO) {
      return "https://www.folomidemo.fr/api/foulee.php";
    }
    else {
      return "https://www.folomi.fr/api/foulee.php";
    }
  }

  , 
  getAPIAuth() {
    if (ISDEBUG) {
      return "aiovbZRUOGTzbrvZRUGB,??452";
    } else {
      return "aiovbZRUOGTzbrvZRUGB,??452";
    }

  }

  , 
  getShareUrl() {
    if (ISDEBUG) {
      return "http://reperret.fr/live/";
    } else if (ISDEMO) {
      return "http://www.folomidemo.fr/live/";
    } else {
      return "http://folomi.fr/live/";
    }

  },

  getGpxUrl(gpxName) {
    if (ISDEBUG) {
      return "http://reperret.fr/fichiers/gpxLive/"+gpxName+'.gpx';
    } else if (ISDEMO) {
      return "http://www.folomidemo.fr/fichiers/gpxLive/"+gpxName+'.gpx';
    } else {
      return "https://www.folomi.fr/fichiers/gpxLive/"+gpxName+'.gpx';
    }

  }


  , 
  getUrl() {
    if (ISDEBUG) {
      return "http://reperret.fr/";
    } else if (ISDEMO) {
      return "http://www.folomidemo.fr/";
    } else {
      return "http://folomi.fr/";
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
      return "Activité matinale";
    }
    if (hour > 11 && hour < 19) {
      return "Activité de l'après-midi";
    }

    if (hour >= 19) {
      return "Activité du soir";
    }
  },

  logError: function (methodName, message) {

    // alert(message)
    let formData = new FormData();
    formData.append('method', 'debug');
    formData.append('auth', ApiUtils.getAPIAuth());


    var finalMessage = '----DATE---: ' + ' ' + new Date().toDateString() + ' ' + new Date().toTimeString() + '----METHOD---: ' + methodName + '---MESSAGE---:  ' + message;

    formData.append('message', finalMessage);
    formData.append('type', 0);
    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {

      },
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .catch(e => e);
  },

  logStats: function (message) {

    let formData = new FormData();
    formData.append('method', 'debug');
    formData.append('auth', ApiUtils.getAPIAuth());



    formData.append('message', message);
    formData.append('type', 1);

    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {

      },
      body: formData
    })
      .then(ApiUtils.checkStatus)
      .catch(e => e);
  }

};
export { ApiUtils as default };