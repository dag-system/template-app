import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Platform,
  Alert,
  Text,
  Modal,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Body,
  Container,
  Content,
  H1,
  H2,
  Header,
  Icon,
  Left,
  Right,
  View,
} from 'native-base';
import GlobalStyles from '../styles';
import {useDispatch, useSelector} from 'react-redux';
import AppState from '../models/AppState';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import ImagePicker from 'react-native-image-crop-picker';
import {
  TemplateAppName,
  TemplateBackgroundColor,
  TemplateDisplayName,
  textAutoBackgroundColor,
} from '../globalsModifs';
// import Logovdm from '../assets/sponsor_logo4.png';
import Logo from '../assets/logo.png';
import Skieur from '../assets/skieur.png';
import ApiUtils from '../ApiUtils';
import {Sponsors} from './Sponsors';
import HeaderComponent from './HeaderComponent';
import ViewShot, {captureRef, captureScreen} from 'react-native-view-shot';
import ShareImage from './ShareImage';
import Share from 'react-native-share';
import MapView, {Polyline} from 'react-native-maps';
import ShareMap from './ShareMap';

export default function ShareComponent(props: any) {
  const card = React.createRef();
  const cardPerso = React.createRef();
  const cardMap = React.createRef();

  const [snapshot, setSnapshot] = useState();

  const takeSnapshot = (currentCard: any) => {
    if (currentCard.current) {
      captureRef(currentCard, {
        format: 'jpg',
        quality: 1,
        result: 'base64',
      }).then(
        (uri) => {
          console.log('Image saved to ', uri);
          var base64Data = `data:image/jpeg;base64,` + uri;
          Share.open({
            url: base64Data,
            message: 'Retrouvez mon activité au défi estivale de la foulée blanche',
            filename: 'Mon activité.jpg',
            type: 'image/jpeg',
            showAppsToView: true,
          });
        },
        (error) => console.error('Oops, snapshot failed', error),
      );
      console.log('Work');
      setSnapshot(
        captureRef(currentCard, {
          result: 'data-uri',
        }),
      );
    } else {
      console.log('Not working');
    }
  };

  const importImage = () => {
    ImagePicker.openPicker({
      width: 700,
      height: 700,
      includeBase64: true,
      cropping: true,
      
    }).then((image) => {
      console.log(image);
      setImage(image);
      //   const action = { type: Actions.AddCommentImage, data: image };
      //   this.props.dispatch(action);
      // this.setState({ images: [...this.state.images, image] });
    });
  };

  const dispatch = useDispatch();

  const [isModalNotificationVisible, setIsModalNotificationVisible] =
    useState(false);

  const [notificationText, setNotificationText] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');
  const [image, setImage] = useState();

  const {userData, currentLiveSummary, currentMapStyle} = useSelector(
    (state: AppState) => state,
  );

  //   useEffect(() => {
  //     init();
  //   }, []);

  const close = () => {
    props.onClose();
  };

  const ITEM_WIDTH = 300;
  const ITEM_HEIGHT = 300;
  return (
    <Container>
      <Content>
        <Text style={{textAlign: 'center', margin: 10, fontSize: 20}}>
          Partager votre activité
        </Text>

        <TouchableOpacity
          onPress={() => importImage()}
          style={[
            GlobalStyles.button,
            {
              width: '80%',
              alignSelf: 'center',
              marginTop: 13,
              marginBottom: 13,
              paddingVertical: 12,
            },
          ]}>
          <Text
            style={{
              textAlign: 'center',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}>
           {image ==null ? "Choisir une image" : "Choisir une autre image"}
          </Text>
        </TouchableOpacity>

        {image != null ? (
          <View>
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                display: 'flex',
              }}>
              <ViewShot
                ref={cardPerso}
                style={{width: ITEM_WIDTH, height: ITEM_HEIGHT}}>
                <ShareImage image={image} />
              </ViewShot>
            </View>

            <TouchableOpacity
              onPress={() => takeSnapshot(cardPerso)}
              style={[
                GlobalStyles.button,
                {
                  width: '80%',
                  alignSelf: 'center',
                  marginTop: 13,
                  paddingVertical: 12,
                },
              ]}>
              <Text
                style={{
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                }}>
                PARTAGER
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}


        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            display: 'flex',
          }}>
          <ViewShot ref={card} style={{width: ITEM_WIDTH, height: ITEM_HEIGHT}}>
            <ShareImage />
          </ViewShot>
        </View>

        <TouchableOpacity
          onPress={() => takeSnapshot(card)}
          style={[
            GlobalStyles.button,
            {
              width: '80%',
              alignSelf: 'center',
              marginTop: 13,

              marginBottom: 13,
              paddingVertical: 12,
            },
          ]}>
          <Text
            style={{
              textAlign: 'center',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}>
            PARTAGER
          </Text>
        </TouchableOpacity>

        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            display: 'flex',
          }}>
          <ViewShot
            ref={cardMap}
            style={{width: ITEM_WIDTH, height: ITEM_HEIGHT}}>
            <View
              style={{
                position: 'absolute',
                height: ITEM_WIDTH,
                top: 0,
                backgroundColor: 'black',
                opacity: 0.2,
                width: ITEM_WIDTH,
                zIndex: 1000,
              }}></View>
            <ShareMap />
          </ViewShot>
        </View>

        <TouchableOpacity
          onPress={() => takeSnapshot(cardMap)}
          style={[
            GlobalStyles.button,
            {
              width: '80%',
              alignSelf: 'center',
              marginTop: 13,

              marginBottom: 13,
              paddingVertical: 12,
            },
          ]}>
          <Text
            style={{
              textAlign: 'center',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}>
            PARTAGER
          </Text>
        </TouchableOpacity>

  
        {/* <Image
          style={{width: 64, height: 64, borderRadius: 12, marginRight: 10}}
          resizeMode="cover"
          source={{uri: `data:${image.mime};base64,${image.body}`}}
        />
      ) : null} */}

        <View style={{marginBottom: 300}} />
      </Content>

      {/* <Sponsors /> */}
    </Container>
  );
}

const styles = StyleSheet.create({
  logo: {},
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
});

// export default connect(mapStateToProps)(MapContainer);
