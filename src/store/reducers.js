const haversine = require('haversine');
const initialState = {
  userData: null,
  sports: [],
  lives: [],
  clubs: [],
  isRecording: false,
  currentLive: null,
  dates: [],
  markers: [],
  coordinates: [],
  coordinatesString: '[]',
  showsUserLocation: false,
  isMoving: false,
  isStarted: false,
  odometer: 0,
  pointsInterets: [],
  polylines: [],
  nomStation: null,
  descriptionStation: null,
  currentPosition: null,
  currentLiveFromSegment: null,
  currentLiveFromSegmentId: null,
  currentMapStyle: Platform.OS == 'android' ? 'terrain' : 'hybrid',
  folocodes: [], //{folocode : , nom, prenom ?}
  isOkPopupGps: false,
  isOkPopupBAttery: false,
  isOkPopupBAttery2: false,
  userClubs: [],
  isGpsNotOk: true,
  phoneData: null,
  notifications: [],
  lang: 'fr',
};

const initialMockState = {
  userData: {
    idUtilisateur: 7000,
  },
  sports: [],
  lives: [{idLive: 1, libelleLive: 'test'}],
  clubs: [],
  isRecording: false,
  currentLive: {
    idLive: 3,
  },
  dates: [],
  markers: [],
  coordinates: [],
  coordinatesString: '[]',
  showsUserLocation: false,
  isMoving: false,
  isStarted: false,
  odometer: 0,
  pointsInterets: [],
  polylines: [],
  nomStation: null,
  descriptionStation: null,
  currentPosition: null,
  currentLiveFromSegment: null,
  currentLiveFromSegmentId: null,
  currentMapStyle: Platform.OS == 'android' ? 'terrain' : 'hybrid',
  folocodes: [],
  isOkPopupGps: false,
  isOkPopupBAttery: false,
  notifications: [{type: 'newEffort', idLive: 12}],
  lang: 'fr',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN': {
      let newFolocode = {
        folocode: action.data.folocodeUtilisateur,
        prenom: action.data.prenomUtilisateur,
        nom: action.data.nomUtilisateur,
      };
      if (state.folocodes == null) {
        state.folocodes = [];
      }
      let folocodes = JSON.parse(JSON.stringify(state.folocodes));
      if (
        folocodes.filter((f) => f.folocode == newFolocode.folocode).length == 0
      ) {
        folocodes.push(newFolocode);
      }
      return {
        ...state,
        folocodes: folocodes,
        userData: action.data,
      };
    }
    case 'LOGOUT': {
      return {
        ...initialState,
        folocodes: state.folocodes,
      };
    }
    case 'GET_LIVES': {
      return {
        ...state,
        lives: action.data,
      };
    }
    case 'GET_CLUBS': {
      return {
        ...state,
        clubs: action.data,
      };
    }

    case 'DELETE_ACCOUNT': {
      const newFolo = state.folocodes.filter(
        (item) => item.folocode != action.data.folocode,
      );
      return {
        ...initialState,
        folocodes: newFolo,
      };
    }

    case 'ADD_FOLOCODE': {
      return {
        ...state,
        folocodes: [...state.folocodes, action.data],
      };
    }

    case 'ADD_NOTIFICATION': {
      let notifs = JSON.parse(JSON.stringify(state.notifications));
      if (notifs.filter((n) => n.idLive == action.data.idLive).length == 0) {
        return {
          ...state,
          notifications: [...state.notifications, action.data],
        };
      } else {
        return state;
      }
    }

    case 'DELETE_NOTIFICATION': {
      let notifs = [];
      notifs = state.notifications.filter((n) => n.idLive != action.data);
      return {
        ...state,
        notifications: notifs,
      };
    }

    case 'UPDATE_PHONE_DATA': {
      return {
        ...state,
        phoneData: action.data,
      };
    }

    case 'VIEW_POPUPAIDE': {
      return {
        ...state,
        isOkPopupBAttery: true,
      };
    }

    case 'VIEW_POPUPGPS': {
      return {
        ...state,
        isOkPopupGps: true,
      };
    }

    case 'VIEW_POPUPBATTERY': {
      return {
        ...state,
        isOkPopupBAttery2: true,
      };
    }

    case 'GET_SPORTS': {
      return {
        ...state,
        sports: action.data,
      };
    }
    case 'DELETE_LIVE': {
      var currentLives = new Object(state.lives);
      currentLives = currentLives.filter((l) => l.idLive != action.data);
      return {
        ...state,
        lives: currentLives,
      };
    }

    case 'CREATE_LIVE': {
      return {
        ...state,
        lives: [...state.lives, action.data],
        currentLive: action.data,
      };
    }
    case 'UPDATE_MAP_STYLE': {
      return {
        ...state,
        currentMapStyle: action.data,
      };
    }

    case 'SAVE_CURRENT_LIVE': {
      return {
        ...state,
        currentLiveSummary: action.data,
      };
    }

    case 'UPDATE_ACCEPT_CHALLENGE': {
      return {
        ...state,
        userData: {
          ...state.userData,
          acceptChallengeUtilisateur: action.data.acceptChallengeUtilisateur,
          acceptChallengeNameUtilisateur:
            action.data.acceptChallengeNameUtilisateur,
        },
      };
    }

    case 'SAVE_IS_RECORDING': {
      return {
        ...state,
        isRecording: action.data,
      };
    }

    case 'GET_USER_CLUBS': {
      return {
        ...state,
        userClubs: action.data,
      };
    }

    case 'SAVE_MARKERS': {
      return {
        ...state,
        markers: action.data,
      };
    }
    case 'SAVE_COORDINATES': {
      return {
        ...state,
        // coordinates: action.data,
        coordinatesString: JSON.stringify(action.data),
      };
    }

    case 'UPDATE_GPS_OK': {
      return {
        ...state,
        isGpsNotOk: action.data.isGpsNotOk,
        currentPosition: action.data.location.coords,
      };
    }

    case 'ADD_COORDINATE': {
      var coords = JSON.parse(state.coordinatesString);

      let isGpsNotOk = true;

      if (action.data.speed != -1) {
        isGpsNotOk = false;
      }
      let odometer = state.odometer;

      if (coords.length > 1) {
        let oldLatLong = coords[coords.length - 1];
        var dist = haversine(oldLatLong, action.data);
        odometer += dist;
      }

      coords.push(action.data);
      return {
        ...state,
        coordinatesString: JSON.stringify(coords),
        currentPosition: action.data,
        isGpsNotOk: isGpsNotOk,
        odometer: odometer,
      };
    }
    case 'IGNORE_LIVE': {
      let lives = JSON.parse(JSON.stringify(state.lives));

      lives = lives.filter((l) => l.idLive != action.data);

      return {
        ...state,
        lives: lives,
      };
    }
    case 'CLEAR_MAP': {
      return {
        ...state,
        coordinates: [],
        coordinatesString: '[]',
        markers: [],
        dates: [],
        isRecording: false,
        isMoving: false,
        odometer: 0,
        nomStation: null,
        descriptionStation: null,
        // currentPosition: null,
        currentLive: null,
      };
    }

    case 'ADD_DATE': {
      return {
        ...state,
        dates: [...state.dates, action.data],
      };
    }

    case 'UPDATE_ODOMETER': {
      return {
        ...state,
        odometer: action.data.odometer,
      };
    }

    case 'IS_MOVING': {
      return {
        ...state,
        isMoving: action.data,
      };
    }

    case 'UPDATE_STATION_DATA': {
      return {
        ...state,
        polylines: action.data.polylines,
        nomStation: action.data.nomStation,
        descriptionStation: action.data.descriptionStation,
        pointsInterets: action.data.pointsInterets,
        challenges: action.data.challenges,
        statistics: action.data.statistics,
      };
    }

    case 'ADD_TRACE': {
      return {
        ...state,
        polylines: traces,
      };
    }

    case 'SET_DEMO_TRACE': {
      var traces = new Object(state.polylines);

      var trace = traces.filter(
        (pol) => pol.nomTrace == action.data.nomTrace,
      )[0];
      return {
        ...state,
        demoTrace: trace,
        isDemoMode: true,
      };
    }
    case 'REFRESH': {
      return {
        ...state,
        refresh: action.data,
      };
    }

    case 'TOGGLE_TRACE': {
      var traces = new Object(state.polylines);

      var trace = traces.filter((pol) => pol.nomTrace == action.data)[0];
      trace.isActive = !trace.isActive;
      return {
        ...state,
        polylines: traces,
      };
    }
    case 'CURRENT_LIVE_FOR_SEGMENT': {
      return {
        ...state,
        currentLiveFromSegmentId: action.data.idLive,
        currentLiveFromSegment: action.data,
      };
    }
    case 'CURRENT_LIVE_FOR_SEGMENT_ID': {
      return {
        ...state,
        currentLiveFromSegmentId: action.data,
      };
    }
    case 'CHANGE_LANG': {
      return {
        ...state,
        lang: action.data,
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
