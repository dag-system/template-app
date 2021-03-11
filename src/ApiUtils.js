// ApiUtils.js

const ISDEBUG = false;
const ISDEMO = false;

const VersionNumber = '1.0.0';
const VersionNumberInt = 1;

const IdStation = 51;

var ApiUtils = {
  getOrganisation() {
    return 'DIGIRAIDINP';
  },
  ISDEBUG() {
    return ISDEBUG;
  },
  ISDEMO() {
    return ISDEBUG;
  },
  getBackgroundColor() {
    return '#2B3990';
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
      response.text().then(function (text) {});

      let error = new Error(response.statusText);
      error.response = response;
      throw response;
    }
  },

  hasPaid(userData)
  {
      let paiementsString = userData.paiements;
      if(paiementsString == null)
      {
        return false;
      }
      var paiements = Object.values(paiementsString);
      console.log(paiements);
      if(paiements !=null && paiements.length > 0)
      {
        if(paiements.filter(p=> p.idStation == IdStation).length >0)
        {
          return true;
        }
      }else{

        return false;
      }
  
  },

  getPhotoUrl(idStation, photo) {
    var url =
      ApiUtils.getUrl() + 'fichiers/interets/' + idStation + '/' + photo;
    return url;
  },

  getColor() {
    return ApiUtils.getBackgroundColor();
  },

  getAPIUrl() {
    return 'https://www.folomi.fr/api/sportapi.php';
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
      return 'https://www.folomi.fr/api/live/';
    }
  },

  getGpxUrl(gpxName) {
    return 'https://www.folomi.fr/api/fichiers/gpxLive/' + gpxName + '.gpx';
  },

  getUrl() {
    if (ISDEBUG) {
      return 'http://reperret.fr/';
    } else if (ISDEMO) {
      return 'http://www.folomidemo.fr/';
    } else {
      return 'https://www.folomi.fr/api/';
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

  logError: function (methodName, message) {
    // alert(message)
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
    //   .catch(e => e);
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
