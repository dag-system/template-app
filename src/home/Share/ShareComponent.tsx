import React, {useState} from 'react';
import {
  ScrollViewBase,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Container, Content, Icon, View} from 'native-base';
import GlobalStyles from '../../styles';
import {useDispatch, useSelector} from 'react-redux';
import AppState from '../../models/AppState';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import ApiUtils from '../../ApiUtils';
import ViewShot, {captureRef} from 'react-native-view-shot';
import ShareImage from './ShareImage';
import Share from 'react-native-share';
import ShareMap from './ShareMap';
// @ts-ignore
import autransShare from './../../assets/autrans.jpg';
import charandeShare from './../../assets/charande.jpg';
import {Sponsors} from '../Sponsors';

export default function ShareComponent(props: any) {
  const card = React.createRef<ViewShot>();
  const cardPerso = React.createRef<ViewShot>();
  const cardMap = React.createRef<ViewShot>();

  const scrollview = React.createRef<ScrollView>();

  const takeSnapshot = (currentCard: any) => {
    if (currentCard.current) {
      captureRef(currentCard, {
        format: 'png',
        quality: 1,
        result: 'base64',
      }).then(
        (uri) => {
          console.log('Image saved to ', uri);
          var base64Data = `data:image/png;base64,` + uri;
          Share.open({
            url: base64Data,
            message:
              'Retrouvez mon activité au défi estivale de la foulée blanche',
            filename: 'Mon activité.png',
            type: 'image/png',
            showAppsToView: true,
          });
        },
        (error) => console.error('Oops, snapshot failed', error),
      );
      // );
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
      scrollview.current?.scrollTo({
        x: ITEM_WIDTH + SCROLL_ITEM_PADDING * 5,
        y: 0,
        animated: true,
      });
      setImage(image);
    });
  };

  const [image, setImage] = useState<ImageOrVideo>();

  const ITEM_WIDTH = 300;
  const ITEM_HEIGHT = 300;
  const SCROLL_ITEM_PADDING = 20;
  const SCROLL_ITEM_WIDTH =
    Dimensions.get('screen').width - SCROLL_ITEM_PADDING * 2;
  const SCROLL_ITEM_HEIGHT = 200;

  return (
    <Container>
      <Content>
        <Text style={{textAlign: 'center', margin: 30, fontSize: 20}}>
          Partager votre activité
        </Text>
        <ScrollView
          ref={scrollview}
          showsHorizontalScrollIndicator={true}
          horizontal
          contentContainerStyle={{paddingRight: 0, paddingBottom: 20}}
          pagingEnabled={true}>
          <View style={{justifyContent: 'center'}}>
            <TouchableOpacity
              onPress={() => importImage()}
              style={[
                {
                  borderColor: 'black',
                  // borderWidth: 1,
                  marginHorizontal: SCROLL_ITEM_PADDING,
                  width: SCROLL_ITEM_WIDTH,
                  alignSelf: 'center',
                  paddingVertical: 100,
                  borderRadius: 10,
                  // height: SCROLL_ITEM_HEIGHT,
                },
              ]}>
              <Icon
                type="FontAwesome5"
                name="image"
                style={{textAlign: 'center', marginBottom: 20}}
              />
              <Text
                style={{
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  textAlignVertical: 'center',
                }}>
                {image == null
                  ? 'Choisir une image ou glisser vers la droite pour voir plus de choix'
                  : 'Choisir une autre image'}
              </Text>
            </TouchableOpacity>
          </View>

          {image != null ? (
            <View
              style={{
                marginHorizontal: SCROLL_ITEM_PADDING,
                width: SCROLL_ITEM_WIDTH,
              }}>
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
            </View>
          ) : null}

          <View
            style={{
              marginHorizontal: SCROLL_ITEM_PADDING,
              width: SCROLL_ITEM_WIDTH,
            }}>
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                display: 'flex',
              }}>
              <ViewShot
                ref={card}
                style={{width: ITEM_WIDTH, height: ITEM_HEIGHT}}>
                <ShareImage customImage={autransShare} />
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
          </View>

          <View
            style={{
              marginHorizontal: SCROLL_ITEM_PADDING,
              width: SCROLL_ITEM_WIDTH,
            }}>
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                display: 'flex',
              }}>
              <ViewShot
                ref={card}
                style={{width: ITEM_WIDTH, height: ITEM_HEIGHT}}>
                <ShareImage customImage={charandeShare} />
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
          </View>

          <View
            style={{
              marginHorizontal: SCROLL_ITEM_PADDING,
              width: SCROLL_ITEM_WIDTH,
            }}>
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
          </View>
        </ScrollView>
      </Content>
      <Sponsors />
    </Container>
  );
}

const styles = StyleSheet.create({
  logo: {},
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
});
