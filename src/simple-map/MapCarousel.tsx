import React, {PureComponent, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import GpxService from '../services/GpxServices';
import AppState from '../models/AppState';
import LiveStatInfos from '../models/LiveStatInfos';
import ApiUtils from '../ApiUtils';

import tradRes from './../lang/traduction.json';

interface State {}

interface CarouselItem {
  order: number;
  id: string;
  title1: string;
  subTitle1: string;
  title2: string;
  subTitle2: string;
}
export default function MapCarousel() {
  // constructor(props) {
  //   super(props);

  //   this.state = {
  //     carouselItems: [],
  //     activeSlide: 0,
  //   };
  // }

  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  const dispatch = useDispatch();
  const {lives, statistics, userData, challenges, isRecording, lang} =
    useSelector((state: AppState) => state);

  useEffect(() => {
    let totalKm = 0;
    let totalTime = 0;
    let totalDplus = 0;

    challenges?.forEach((c) => {
      loadSegment(c.idChallenge);
    });
    lives.forEach((live) => {
      let infos = getLiveStatsInfo(live.statsLive);
      if (infos != null) {
        totalKm += infos.distance;
        totalDplus += getDplus(infos);
        totalTime += GpxService.convertDureeToSec(infos.duree);
      }
    });

    let currentCarouselItems: CarouselItem[] = [];

    currentCarouselItems.push({
      order: 0,
      id: 'nbActivites',
      title1: tradRes[lang].map.numberActivities,
      subTitle1: lives.length.toString(),
      title2: tradRes[lang].map.totalActivities,
      subTitle2: statistics?.nbActivites,
    });

    currentCarouselItems.push({
      order: 1,
      id: 'nbKm',
      title1: tradRes[lang].map.numberKm,
      subTitle1: totalKm.toFixed(1) + ' km',
      title2: tradRes[lang].map.totalKm,
      subTitle2:
        statistics?.nbKmTotal != null ? statistics?.nbKmTotal + ' km' : '- km',
    });

    setCarouselItems(currentCarouselItems);
    // this.setState({carouselItems: carouselItems});
  }, [lives, statistics, isRecording, lang]);

  const getLiveStatsInfo = (json: string | undefined): LiveStatInfos => {
    if (json != undefined) {
      var infos = JSON.parse(json);
      return infos;
    } else {
      return {
        distance: 0,
        dPlus: 0,
        duree: '00:00:00',
      };
    }
  };

  const loadSegment = (idSegment: number) => {
    let formData = new FormData();
    formData.append('method', 'getSegmentDetail');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idSegment', idSegment);
    formData.append('idUtilisateur', userData.idUtilisateur);

    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json()) //;
      .then((responseJson) => {
        let newCarouselItem: CarouselItem = {
          order: idSegment,
          id: idSegment.toString(),
          title1: responseJson.nomSegment + ' : ',
          subTitle1:
            responseJson.efforts.bestEffort != null
              ? responseJson.efforts.bestEffort.tempsEffort
              : 'Pas de temps',
          title2: responseJson.nomSegment + ' 1er :' + '',
          subTitle2:
            responseJson.classement != null &&
            responseJson.classement.length > 0
              ? responseJson.classement[0].tempsEffort
              : '',
        };

        // console.log(newCarouselItem);

        setCarouselItems((value: CarouselItem[]) => {
          if (value.filter((c) => c.id == idSegment.toString()).length == 0) {
            return [...value, newCarouselItem];
          } else {
            return [...value];
          }
        });
        // this.saveCoordinates(responseJson.coords); // TO DO
        // this.getBestSegment(responseJson);
      })

      .catch((e) => {
        ApiUtils.logError('get segment', JSON.stringify(e.message));
        console.log(e);
        if (e.message == 'Timeout' || e.message == 'Network request failed') {
        }
      });
  };

  const getDplus = (infos: LiveStatInfos) => {
    if (infos.dPlus != undefined) {
      return infos.dPlus;
    } else {
      return 0;
    }
  };

  const _renderItem = ({item, index}: any) => {
    return (
      <View
        style={{
          width: '100%',
          paddingHorizontal: 5,
          backgroundColor: 'white',
          borderRadius: 10,
          marginLeft: 0,
          marginRight: 0,
          borderColor: 'black',
          borderWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          elevation: 20,
          shadowOpacity: 0.34,
          shadowRadius: 6.27,
        }}>
        <View style={styles.itemPart}>
          <Text style={styles.title}>{item.title1}</Text>
          <Text style={styles.title}>{item.subTitle1}</Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'row',
            marginTop: 5,
          }}>
          <View
            style={{
              width: '60%',
              borderBottomColor: '#CBCBCB',
              borderBottomWidth: 1,
            }}></View>
        </View>
        <View style={styles.itemPart}>
          <Text style={styles.title}>{item.title2}</Text>
          <Text style={styles.title}>{item.subTitle2}</Text>
        </View>
      </View>
    );
  };

  function pagination() {
    return (
      <Pagination
        dotsLength={carouselItems.length}
        activeDotIndex={activeSlide}
        // containerStyle={{  height : 10, width :'100%', justifyContent :"center" }}
        dotStyle={{
          width: 7,
          height: 7,
          borderRadius: 7,
          backgroundColor: 'white',
          borderColor: 'black',
          // borderWidth: 1,
        }}
        inactiveDotStyle={{
          backgroundColor: 'black',
          // borderColor : 'black',
          // borderWidth: 1,
          // Define styles for inactive dots here
        }}
        inactiveDotOpacity={1}
        inactiveDotScale={0.9}
      />
    );
  }

  return (
    <View
      style={{
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        left: 0,
        maxHeight: 150,
        width: '100%',
      }}>
      <View style={{marginTop: -10, marginBottom: -10}}>{pagination()}</View>

      <Carousel
        data={carouselItems.sort(function (a, b) {
          return a.order - b.order;
        })}
        renderItem={_renderItem}
        sliderWidth={400}
        style={{marginTop: -200, paddingTop: 0}}
        itemWidth={300}
        layout={'default'}
        onSnapToItem={(index) => setActiveSlide(index)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  itemPart: {
    paddingHorizontal: 5,
    paddingVertical: 7,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#000',
  },
});
