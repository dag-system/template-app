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
  showsUserLocation: false,
  isMoving: false,
  isStarted: false,
  odometer: 0,
  odometerInitialValue: null,
  isFirstPoint: null,
  pointsInterets: [],
  polylines: [],
  nomStation: null,
  descriptionStation: null,
  currentPosition: null,
  currentLiveFromSegment: null,
  currentLiveFromSegmentId: null,
  currentMapStyle: Platform.OS == 'android' ? 'terrain' : 'hybrid',
  folocodes : [],
  isOkPopupGps : false,
  isOkPopupBAttery : false,
};

const initialMockState = {
  userData: {
    idUtilisateur : 7000
  },
  sports: [],
  lives: [{idLive :1, libelleLive : "test"}],
  clubs: [],
  isRecording: false,
  currentLive: {
    idLive : 3
  },
  dates: [],
  markers: [],
  coordinates: [],
  showsUserLocation: false,
  isMoving: false,
  isStarted: false,
  odometer: 0,
  odometerInitialValue: null,
  isFirstPoint: null,
  pointsInterets: [],
  polylines: [],
  nomStation: null,
  descriptionStation: null,
  currentPosition: null,
  currentLiveFromSegment: null,
  currentLiveFromSegmentId: null,
  currentMapStyle: Platform.OS == 'android' ? 'terrain' : 'hybrid',
  folocodes : [],
  isOkPopupGps : false,
  isOkPopupBAttery : false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN': {
      let nextState = {
        ...state,
        userData: action.data,
      };
      return nextState || state;
    }
    case 'LOGOUT': {
      let nextState = initialState;
      return nextState || state;
    }
    case 'GET_LIVES': {
      let nextState = {
        ...state,
        lives: action.data,
      };
      return nextState || state;
    }

    case 'GET_CLUBS': {
      let nextState = {
        ...state,
        clubs: action.data,
      };
      return nextState || state;
    }

    case 'GET_SPORTS': {
      let nextState = {
        ...state,
        sports: action.data,
      };
      return nextState || state;
    }
    case 'DELETE_LIVE': {
      var currentLives = new Object(state.lives);
      currentLives = currentLives.filter(l => l.idLive != action.data);
      let nextState = {
        ...state,
        lives: currentLives,
      };
      return nextState || state;
    }

    case 'CREATE_LIVE': {
      let nextState = {
        ...state,
        lives: [...state.lives, action.data],
        currentLive: action.data,
      };

      return nextState || state;
    }
    case 'UPDATE_MAP_STYLE': {
      let nextState = {
        ...state,
        currentMapStyle: action.data,
      };
      return nextState || state;
    }

    case 'SAVE_CURRENT_LIVE': {
      let nextState = {
        ...state,
        currentLive: action.data,
      };
      // alert(JSON.stringify(action.data));

      return nextState || state;
    }

    case 'UPDATE_ACCEPT_CHALLENGE': {
      let nextState = {
        ...state,
        userData: {
          ...state.userData,
          acceptChallengeUtilisateur : action.data
        } 
      };
      // alert(JSON.stringify(action.data));

      return nextState || state;
    }

    case 'SAVE_IS_RECORDING': {
      let nextState = {
        ...state,
        isRecording: action.data,
      };

      return nextState || state;
    }

    case 'SAVE_MARKERS': {
      let nextState = {
        ...state,
        markers: action.data,
      };

      return nextState || state;
    }
    case 'SAVE_COORDINATES': {
      let nextState = {
        ...state,
        coordinates: action.data,
      };

      return nextState || state;
    }

    case 'ADD_MARKER': {
      let nextState = {
        ...state,
        markers: [...state.markers, action.data],
      };

      // console.log(nextState.markers)

      return nextState || state;
    }
    case 'ADD_COORDINATE': {
      let nextState = {
        ...state,
        coordinates: [...state.coordinates, action.data],
      };

      return nextState || state;
    }
    case 'CLEAR_MAP': {
      let nextState = {
        ...state,
        coordinates: [],
        markers: [],
        dates: [],
        showsUserLocation: false,
        isRecording: false,
        isMoving: false,
        odometer: 0,
        isFirstPoint: true,
        odometerInitialValue: null,
        pointsInterets: [],
        polylines: [],
        nomStation: null,
        descriptionStation: null,
        currentPosition: null,
      };

      return nextState || state;
    }

    case 'ADD_DATE': {
      let nextState = {
        ...state,
        dates: [...state.dates, action.data],
      };
      return nextState || state;
    }

    case 'UPDATE_ODOMETER': {
      var data = action.data;
      let nextState = {
        ...state,
        isFirstPoint: data.isFirstPoint,
        odometer: data.odometer,
        odometerInitialValue: data.odometerInitialValue,
        currentPosition: data.currentPosition,
      };

      return nextState || state;
    }

    case 'UPDATE_CURRENT_POSITION': {

      let nextState = {
        ...state,
        currentPosition: action.data,
      };

      return nextState || state;
    }
    case 'IS_MOVING': {
      let nextState = {
        ...state,
        isMoving: action.data,
      };
      return nextState || state;
    }

    case 'UPDATE_INVITES': {
      var newLive = new Object(state.currentLive);
      newLive.invites = action.data;
      let nextState = {
        ...state,
        currentLive: newLive,
      };

      return nextState || state;
    }

    case 'UPDATE_STATION_DATA': {
      let nextState = {
        ...state,
        polylines: action.data.polylines,
        nomStation: action.data.nomStation,
        descriptionStation: action.data.descriptionStation,
        pointsInterets: action.data.pointsInterets,
      };
      return nextState || state;
    }

    case 'ADD_TRACE': {
      var trace = action.data;
      var traces = new Object(state.polylines);
      traces.push(trace);
      let nextState = {
        ...state,
        polylines: traces,
      };
      return nextState || state;
    }

    case 'TOGGLE_TRACE': {
      var traces = new Object(state.polylines);

      var trace = traces.filter(pol => pol.nomTrace == action.data)[0];
      trace.isActive = !trace.isActive;

      let nextState = {
        ...state,
        polylines: traces,
      };
      // console.log(nextState.polylines)
      return nextState || state;
    }
    case 'CURRENT_LIVE_FOR_SEGMENT': {
      let nextState = {
        ...state,
        currentLiveFromSegmentId: action.data.idLive,
        currentLiveFromSegment: action.data,
      };
      // console.log(nextState.polylines)
      return nextState || state;
    }
    case 'CURRENT_LIVE_FOR_SEGMENT_ID': {
      let nextState = {
        ...state,
        currentLiveFromSegmentId: action.data,
      };
      // console.log(nextState.polylines)
      return nextState || state;
    }
    default: {
      return state;
    }
  }
};

export default reducer;
