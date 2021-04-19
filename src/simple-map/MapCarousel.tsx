import React, {PureComponent} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  ScrollView,
  Platform,
  TouchableHighlight,
  Image,
  ImageBackground,
  Modal,
  Linking,
} from 'react-native';
import {Icon, Text, Button} from 'native-base';
import {connect} from 'react-redux';
import MarkerInteret from '../assets/marker.png';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {ReactNativeModal as ModalSmall} from 'react-native-modal';
import {Icon as IconElement} from 'react-native-elements';
import {isPointInPolygon} from 'geolib';
import BatteryModal from '../home/BatteryModal';
import DefaultProps from '../models/DefaultProps';
import moment from 'moment';
import ApiUtils from '../ApiUtils';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import GpxService from '../services/GpxServices';

const LATITUDE_DELTA_CLOSE = 0.02922;
const LONGITUDE_DELTA_CLOSE = 0.02421;

const LATITUDE_DELTA = 0.016022;
const LONGITUDE_DELTA = 0.001221;

const mapStateToProps = (state) => {
  return {
    currentMapStyle: state.currentMapStyle,
    coordinatesString: state.coordinatesString,
    polylines: state.polylines,
    currentPosition: state.currentPosition,
    isGpsNotOk: state.isGpsNotOk,
    isRecording: state.isRecording,
    pointsInterets: state.pointsInterets,
    lives: state.lives,
  };
};

interface Props extends DefaultProps {
  lives: any[];
}

interface State {}

class MapCarousel extends PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      carouselItems: [],
      activeSlide : 0
    };
  }
  componentDidMount() {
    let totalKm = 0;
    let totalTime = 0;
    let totalDplus = 0;

    this.props.lives.forEach((live) => {
      let infos = this.getLiveStatsInfo(live.statsLive);
      totalKm += infos.distance;
      totalDplus += this.getDplus(infos);
      totalTime += GpxService.convertDureeToSec(infos.duree);
    });

    let carouselItems = [];
    carouselItems.push({
      title1: 'Nombre de km parcourus',
      subTitle1: totalKm.toFixed(1) + ' km',
      title2: 'Temps total',
      subTitle2: moment('2015-01-01')
        .startOf('day')
        .seconds(totalTime)
        .format('HH:mm:ss'),
    });

    carouselItems.push({
      title1: "Nombre d'activités",
      subTitle1: this.props.lives.length,
      title2: 'D+ total',
      subTitle2: totalDplus + " m",
    });

    this.setState({carouselItems: carouselItems});
  }

  getLiveStatsInfo(json) {
    if (json != undefined) {
      var infos = JSON.parse(json);
      return infos;
    } else {
      return {
        distance: 0,
      };
    }

    return 0;
  }

  getDplus(infos)
  {
    if(infos.dPlus !=undefined)
    {
      return infos.dPlus;
    }else{
      return 0;
    }
  }


  _renderItem = ({item, index}) => {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          padding: 5,
          backgroundColor: 'white',
          borderRadius: 10,
          marginLeft: 0,
          marginRight: 0,
          borderColor: 'black',
          borderWidth: 0,
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
            marginTop : 5,
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

  get pagination() {
    const {carouselItems, activeSlide} = this.state;
    return (
      <Pagination
        dotsLength={carouselItems.length}
        activeDotIndex={activeSlide}
        // containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        dotStyle={{
          width: 15,
          height: 15,
          borderRadius: 105,
          marginHorizontal: 8,
          backgroundColor: 'white',
          borderColor : 'black',
          // borderWidth: 1,
        }}
        inactiveDotStyle={
          {
            backgroundColor : "black"
            // borderColor : 'black',
            // borderWidth: 1,
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={1}
        inactiveDotScale={0.9}
      />
    );
  }

  render() {
    return (
      <View
        style={{
          zIndex: 1000,
          position: 'absolute',
          top: 20,
          left: 0,
          maxHeight: 200,
          width: '100%',
        }}>
        <Carousel
          ref={(c) => {
            this._carousel = c;
          }}
          data={this.state.carouselItems}
          renderItem={this._renderItem}
          sliderWidth={400}
          itemWidth={300}
          layout={'default'}
          onSnapToItem={(index) => this.setState({activeSlide: index})}
        />
        {this.pagination}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemPart: {
    paddingHorizontal: 5,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#000',
  },
});

export default connect(mapStateToProps)(MapCarousel);
