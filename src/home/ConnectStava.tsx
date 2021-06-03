import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Container, Content, Root} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {Sponsors} from '../home/Sponsors';
import {useNavigation} from '@react-navigation/core';
import {
  TemplateArrayImagesSponsorPath,
  textAutoBackgroundColor,
} from '../globalsModifs';
import ApiUtils from '../ApiUtils';
import AppState from '../models/AppState';
import {authorize} from 'react-native-app-auth';
import StravaActivity from '../models/StravaActivity';
import moment from 'moment';
import GpxService from '../services/GpxServices';
import HeaderComponent from './HeaderComponent';

interface CurrentProps {
  onCancel(): void;
  onSelect(resu: string | undefined): void;
}
export default function ConnectStrava(props: CurrentProps) {
  const {stravaData} = useSelector((state: AppState) => state);
  const [activities, setActivities] = useState([]);
  const [stravaToken, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    askAuthorization();
    if (stravaData == null) {
      askAuthorization();
    } else {
      if (moment(stravaData.accessTokenExpirationDate).isAfter(moment())) {
        getData(stravaData.accessToken, 1);
      } else {
        askAuthorization();
        //refresh token and get data
      }
    }
  }, []);

  const config = {
    // clientId: '20195',
    // clientSecret: '6635da5c19e886064212a2cdd9f775204b93f284',

    clientId : '58309',
    clientSecret:'bc167b2ba6a15349c292131fa3956f6dea668b88',

    redirectUrl: 'com.dag.templateappname.app://oauthredirect',
    serviceConfiguration: {
      authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
      tokenEndpoint:
        'https://www.strava.com/oauth/token?client_id=20195&client_secret=6635da5c19e886064212a2cdd9f775204b93f284',
    },
    scopes: ['activity:read_all'],
  };

  const askAuthorization = async () => {
    try {
      const result = await authorize(config);
      setActivities([]);
      console.log(result);

      setToken(result.accessToken);

      var action = {type: 'SAVE_STRAVA_TOKEN', data: result};
      dispatch(action);

      await getData(result.accessToken, 1);

      // result includes accessToken, accessTokenExpirationDate and refreshToken
    } catch (error) {
      console.warn(error);
    }
  };

  const refresh = async (refreshToken: string, getNewData = false) => {
    // saveData(result, TOKEN_DB_KEY);
    // if (getNewData) {
    //   this.setState(
    //     {polylines: [], coordinates: [], coordinatesLight: []},
    //     () => this.getData(result.accessToken, 1),
    //   );
    //   // this.getData(result.accessToken, 1);
    // }
  };

  const getData = async (token: string, page: number) => {
    setIsLoading(true);
    var url =
      'https://www.strava.com/api/v3/athlete/activities?per_page=200&page=' +
      page;
    var bearer = 'Bearer ' + token;
    await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: bearer,
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setIsLoading(false);
        setActivities(response);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  const getActivityGpx = async (activity: StravaActivity) => {
    var url = `https://www.strava.com/api/v3/activities/${activity.id}/streams/latlng,altitude,time?key_by_type=true`;
    var bearer = 'Bearer ' + stravaToken;
    await fetch(url, {
      method: 'GET',
      // withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: bearer,
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        createGpxFromStreams(
          activity,
          response.time.data,
          response.latlng.data,
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const createGpxFromStreams = (
    activity: StravaActivity,
    times: any[],
    latLngs: any[],
  ) => {
    let points: any[] = [];
    for (let i = 0; i < times.length; i++) {
      let time = moment(activity.start_date);
      time.add(times[i], 'seconds');
      let point = {
        latitude: latLngs[i][0],
        longitude: latLngs[i][1],
        timestamp: time,
      };
      points.push(point);
    }
    let resu = GpxService.createGpx(points);
    console.log(resu);

    props.onSelect(resu);
  };

  return (
    <Root>
      <Container>
        <HeaderComponent mode="back" onPressBack={() => props.onCancel()} />

        <Content style={styles.body} scrollEnabled={true}>
          {isLoading ? (
            <Text style={{textAlign: 'center', marginTop: 10}}>
              Chargement en cours
            </Text>
          ) : (
            <Text
              style={{textAlign: 'center', marginTop: 10, marginBottom: 10}}>
              Choisir une activité parmi la liste suivante :{' '}
            </Text>
          )}
          {activities.map((activity: StravaActivity) => {
            return (
              <TouchableOpacity onPress={() => getActivityGpx(activity)}>
                <Text>
                  {moment(activity.start_date).format('DD/MM')} {activity.name}{' '}
                  {(activity.distance / 1000).toFixed(1)}km{' '}
                </Text>
              </TouchableOpacity>
            );
          })}
          {TemplateArrayImagesSponsorPath.length > 0 ? (
            // <Footer style={{backgroundColor: 'white', paddingBottom: 64}}>
            <Sponsors />
          ) : // </Footer>
          null}
        </Content>
      </Container>
    </Root>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
    width: '100%',
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
  },
  title: {
    width: '25%',
  },
  map: {
    height: 200,
  },
  buttonok: {
    marginTop: 20,
    marginBottom: 0,
    alignSelf: 'center',
    // width: 150,
    height: 30,
    borderRadius: 10,
    // marginRight: 40,
    backgroundColor: 'black',
  },
  saveButton: {
    backgroundColor: 'transparent',
    width: '38%',
    marginTop: 0,
    paddingTop: 0,
  },
  logo: {
    width: '100%',
    height: 50,
    alignSelf: 'center',
    marginRight: '50%',
  },
  bold: {
    fontWeight: 'bold',
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    paddingLeft: 0,
  },
  resultCol: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '30%',
  },
  resultNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveText: {
    color: textAutoBackgroundColor,
    paddingLeft: 0,
    marginLeft: 5,
    marginRight: -5,
  },
  inputCode: {
    borderBottomColor: '#DDDDDD',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 0,
    marginTop: 5,
    fontSize: 16,
  },

  errorMessage: {
    marginLeft: 10,
    marginTop: 10,
    fontStyle: 'italic',
  },
  body: {
    width: '100%',
    backgroundColor: 'white',
    flex: 1,
    paddingBottom: 200,
  },
  loginButtonSection: {
    width: '100%',
    // height: '120%',
    flex: 1,
    padding: 10,
    paddingBottom: 100,

    // marginTop: 5,
  },
  centerLogo: {
    color: '#000',
  },
  container: {
    width: '100%',
  },
  textLink: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    marginRight: 10,
    alignContent: 'center',
    textAlign: 'center',
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: ApiUtils.getColor(),
    backgroundColor: ApiUtils.getColor(),
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
