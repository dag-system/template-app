import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Alert} from 'react-native';
import {
  Header,
  Body,
  Toast,
  Icon,
  Text,
  Left,
  Right,
  Button,
  Switch,
  Picker,
  Spinner,
} from 'native-base';
import ApiUtils from '../ApiUtils';
import {useDispatch, useSelector} from 'react-redux';
import BackgroundGeolocation from 'react-native-background-geolocation';
import ErrorMessage from '../home/ErrorMessage';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {TemplateSportLive} from '../globalsModifs';
import AppState from '../models/AppState';
import {useNavigation} from '@react-navigation/core';

interface Props {
  onCancel(): void;
  onIgnore(): void;
  onSuccess(): void;
}
export default function StopActivity(props: Props) {
  const [libelleLive, setLibelleLive] = useState('');
  const [libelleLiveIsModified, setLibelleLiveIsModified] = useState(false);

  const [selectedSport, setSelectedSport] = useState(-1);
  const [comments, setComments] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [
    acceptChallengeNameUtilisateur,
    setAcceptChallengeNameUtilisateur,
  ] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {currentLive, userData, coordinatesString} = useSelector(
    (state: AppState) => state,
  );

  useEffect(() => {
    if (currentLive != null) {
      setLibelleLive(currentLive.libelleLive);
      setSelectedSport(currentLive.idSport);
    }
    setAcceptChallengeNameUtilisateur(userData.acceptChallengeNameUtilisateur);
  }, [currentLive]);

  const onToggleEnabled = (isMoving: boolean, isRecording: boolean) => {
    if (isMoving) {
      // clearInterval(interval);
      // interval = setInterval(() => setState({time: Date.now()}), 15000);
      BackgroundGeolocation.start(
        () => {
          // NOTE:  We tell react-native-maps to show location only AFTER BackgroundGeolocation
          // has requested location authorization.  If react-native-maps requests authorization first,
          // it will request WhenInUse -- "Permissions Tug-of-war"

          BackgroundGeolocation.changePace(true);
        },
        (state) => {
          ApiUtils.logError('failure geoloc', JSON.stringify(state));
        },
      );
    } else {
      if (isRecording) {
        BackgroundGeolocation.changePace(false);
      } else {
        BackgroundGeolocation.stop();
      }

      //  clearInterval(interval);
    }
  };

  const onClickValidateStop = () => {
    syncPositions();

    var isError = false;
    if (libelleLive == '') {
      isError = true;
    }

    if (selectedSport == -1) {
      isError = true;
    }

    if (!isError) {
      onSendRequestStop();
    }
  };

  const onSendRequestStop = () => {
    syncPositions();

    setSpinner(false);
    let formData = new FormData();
    formData.append('method', 'updateLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idLive', currentLive.idLive.toString());
    formData.append('etatLive', '2');
    formData.append('commentLive', comments);
    formData.append('libelleLive', libelleLive);
    formData.append('idSport', selectedSport.toString());

    var acceptChallengeNameUtilisateur = '0';
    if (acceptChallengeNameUtilisateur) {
      acceptChallengeNameUtilisateur = '1';
    }

    formData.append(
      'acceptChallengeNameUtilisateur',
      acceptChallengeNameUtilisateur,
    );
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.codeErreur == 'SUCCESS') {
          setSpinner(false);

          onDisconnect(true);

          var action = {
            type: 'UPDATE_ACCEPT_CHALLENGE',
            data: {
              acceptChallengeNameUtilisateur: acceptChallengeNameUtilisateur,
            },
          };
          dispatch(action);

          var live = {
            idLive: currentLive.idLive,
          };
          var actionSaveLiveSummary = {type: 'SAVE_CURRENT_LIVE', data: live};
          dispatch(actionSaveLiveSummary);

          navigation.navigate('LiveSummary');
          // .then(
          //   navigation.navigate('LiveSummary')
          // );
        } else {
          Alert.alert(responseJson.message);
        }
      })
      .catch((e) => {
        console.log(JSON.stringify(e));
        setSpinner(false);
        ApiUtils.logError('create live', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));

        if (e.message == 'Timeout' || e.message == 'Network request failed') {
          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration: 5000,
          });
        }
      });
  };

  const sendGeneratedGPX = (gpx: string) => {
    let formData = new FormData();
    formData.append('method', 'sendGeneratedGpx');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', userData.idUtilisateur.toString());
    formData.append('gpxContent', gpx);
    formData.append('idLive', currentLive.idLive.toString());
    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/jsjhon',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.codeErreur == 'SUCCESS') {
        } else {
          // alert('erreur : ' + responseJson.message);
        }
      })
      .catch((e) => {
        console.log(e);
        // alert('erreur : ' + e.message);
        ApiUtils.logError(
          'send generated gpx',
          'idUser: ' +
            userData.idUtilisateur +
            ' message: ' +
            JSON.stringify(e),
        );
      });
  };

  const syncPositions = () => {
    try {
      BackgroundGeolocation.sync(
        (records) => {
          // setState({isSyncOk: true});
          ApiUtils.logError(
            'sync at end idUtilisateur: ' + userData.idUtilisateur,
            JSON.stringify(records),
          );
        },
        () => {},
      );
    } catch (e) {
      ApiUtils.logError(
        'ERROR sync at end idUtilisateur: ' + userData.idUtilisateur,
      );
    }
  };

  const onignoreOk = () => {
    setSpinner(true);
    let formData = new FormData();
    formData.append('method', 'deleteLive');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idLive', currentLive?.idLive.toString());
    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/jsjhon',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        setSpinner(false);
        if (responseJson.codeErreur == 'SUCCESS') {
          var action = {
            type: 'IGNORE_LIVE',
            data: currentLive.idLive,
          };
          dispatch(action);

          onDisconnect(false);
        } else {
          Alert.alert('erreur : ' + responseJson.message);
        }
      })
      .catch((e) => {
        setSpinner(false);

        ApiUtils.logError('simpleMap ignoreActivity', e.message);
      });
  };

  const ignoreActivity = () => {
    Alert.alert(
      "Ignorer l'activité",
      "Si vous ignorez l'activité vous allez perdre les données enregistrées. Etes-vous sûr d'ignorer l'activité ?",
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {text: 'Ignorer', onPress: () => onignoreOk()},
      ],
      {cancelable: false},
    );
  };

  const onDisconnect = (isSummary: boolean) => {
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeAllListeners();

    var action = {type: 'CLEAR_MAP', data: null};
    dispatch(action);
    onToggleEnabled(false, false);

    if (!isSummary) {
      props.onIgnore();
    } else {
      props.onSuccess();
    }
  };

  const onChangeLiveName = (name: string) => {
    if (!libelleLiveIsModified && libelleLive.length - 1 == name.length) {
      setLibelleLive('');
      setLibelleLiveIsModified(true);
    } else {
      setLibelleLive(name);
    }
  };

  const isErrorFormStop = () => {
    var isError = false;
    if (libelleLive == '') {
      isError = true;
    }

    if (selectedSport == -1) {
      isError = true;
    }

    return isError;
  };

  const onValueSportChange = (value: number) => {
    setSelectedSport(value);
  };

  return (
    <View>
      <Header style={styles.headerModal}>
        <Left>
          <TouchableOpacity
            style={styles.drawerButton}
            onPress={() => {
              props.onCancel();
            }}>
            <Icon name="chevron-left" type="FontAwesome5" />
          </TouchableOpacity>
        </Left>
        <Body style={{justifyContent: 'center', flex: 1}}>
          <Text style={{fontWeight: 'bold'}}>Enregistrez votre activité</Text>
        </Body>
        <Right style={{flex: 0}} />
      </Header>

      <ScrollView scrollEnabled={true}>
        <View>
          <TextInput
            style={[styles.inputCode, {fontWeight: 'bold'}]}
            clearButtonMode="always"
            placeholder="Titre"
            value={libelleLive}
            onChangeText={(value) => onChangeLiveName(value)}
          />

          <ErrorMessage
            value={libelleLive}
            message="Le titre de la course doit être renseignée"
          />

          <View style={styles.picker}>
            <Picker
              mode="dropdown"
              accessibilityLabel={'Choisissez votre sport'}
              iosHeader={'Choisissez votre sport'}
              iosIcon={<Icon name="chevron-down" type="FontAwesome5" />}
              style={{marginTop: 0}}
              selectedValue={selectedSport.toString()}
              onValueChange={(value) => onValueSportChange(value)}
              placeholder={'Choisissez votre sport'}
              placeholderStyle={{
                color: ApiUtils.getColor(),
              }}
              placeholderIconColor={ApiUtils.getColor()}
              textStyle={{color: ApiUtils.getColor()}}
              itemStyle={{
                color: ApiUtils.getColor(),
                marginLeft: 0,
                paddingLeft: 10,
                borderBottomColor: ApiUtils.getColor(),
                borderBottomWidth: 1,
              }}
              itemTextStyle={{
                color: ApiUtils.getColor(),
                borderBottomColor: ApiUtils.getColor(),
                borderBottomWidth: 1,
              }}>
              <Picker.Item label="Choisissez votre sport" value="-1" />
              {TemplateSportLive.map((sport, index) => {
                return (
                  <Picker.Item
                    label={sport.sportName}
                    value={sport.idSport.toString()}
                    key={index}
                  />
                );
              })}
            </Picker>

            {selectedSport == -1 ? (
              <Text
                style={{
                  marginTop: 10,
                  color: 'red',
                  fontSize: 14,
                  paddingLeft: 5,
                  fontStyle: 'italic',
                }}>
                Le type de sport doit être renseigné
              </Text>
            ) : null}

            <View
              style={{
                borderBottomColor: '#000000',
                borderBottomWidth: 1,
                // height: 120,
                marginBottom: 0,
                marginTop: 20,
                paddingTop: 0,
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#DDDDDD',
                }}>
                Commentaire :
              </Text>
              <TextInput
                style={{marginTop: 0, paddingBottom: 10}}
                multiline={true}
                numberOfLines={4}
                onChangeText={(text) => setComments(text)}
                value={comments}
                placeholder="Commentaire"
              />
            </View>

            <View
              style={{
                marginTop: 20,
                width: '80%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Switch
                style={{paddingTop: 20}}
                onValueChange={(text) => {
                  setAcceptChallengeNameUtilisateur(text);
                }}
                value={acceptChallengeNameUtilisateur}
              />

              <TouchableOpacity
                onPress={() => {
                  setAcceptChallengeNameUtilisateur(
                    !acceptChallengeNameUtilisateur,
                  );
                }}>
                <Text style={{marginLeft: 10}}>
                  J'accepte que mon nom apparaisse dans le classement
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {spinner ? (
            <View
              style={{
                marginTop: 15,
                width: '100%',
              }}>
              <Spinner color="black" />
              <Text style={{textAlign: 'center', alignSelf: 'center'}}>
                Enregistrement en cours
              </Text>
            </View>
          ) : (
            <Button
              style={{
                marginTop: 10,
                paddingHorizontal: 50,
                elevation: 0,
                alignSelf: 'center',
                borderColor: isErrorFormStop() ? 'black' : ApiUtils.getColor(),
                borderWidth: 1,
                backgroundColor: isErrorFormStop()
                  ? 'transparent'
                  : ApiUtils.getColor(),
              }}
              onPress={() => onClickValidateStop()}
              disabled={isErrorFormStop()}>
              <Text
                style={{
                  color: isErrorFormStop() ? 'black' : 'white',
                }}>
                ENREGISTRER
              </Text>
            </Button>
          )}

          <View style={{marginTop: -5}}>
            <Text
              style={styles.ignoreActivityLink}
              onPress={() => ignoreActivity()}>
              Ignorer l'activité
            </Text>
          </View>

          <View style={{marginBottom: 300}} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ignoreActivityLink: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  headerModal: {
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    // height: 50
  },
  drawerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 0,
    paddingTop: 10,
    shadowOffset: {height: 0, width: 0},
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    paddingLeft: 0,
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
  picker: {
    marginTop: 0,
    padding: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingBottom: 5,
  },
});
