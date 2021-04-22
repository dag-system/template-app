import Interest from './Interest';
import Polyline from './Polyline';
import Live from './Live';
import {MapTypes} from 'react-native-maps';
import UserData from './UserDate';
import PhoneData from './PhoneData';

export default class AppState {
  lives: Live[];
  pointsInterets: Interest[];
  polylines: Polyline[];
  coordinatesString: string;
  currentMapStyle: MapTypes;
  demoTrace: Polyline;
  currentLive: Live;
  isMoving: boolean;
  isRecording: boolean;
  odometer: any;
  userData: UserData;
  phoneData: PhoneData;
  isGpsNotOk: boolean;
  statistics: any;
  dates: any;
  currentPosition: any;
}
