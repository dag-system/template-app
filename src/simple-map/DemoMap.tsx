import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ImageBackground,
  Linking,
} from 'react-native';
import {Text, Header, Left, Icon, Body, Right} from 'native-base';
import {useSelector} from 'react-redux';
import MarkerInteret from '../assets/marker.png';
import MapView, {LatLng, Marker, Polyline} from 'react-native-maps';
import Interest from '../models/Interest';
import AppState from '../models/AppState';
import {useNavigation} from '@react-navigation/core';
import GpxService from '../services/GpxServices';
import Logo from '../assets/logo.png';

const LATITUDE_DELTA_CLOSE = 0.016022;
const LONGITUDE_DELTA_CLOSE = 0.001221;

const SPACING = 5;

export default function DemoMap() {
  const [isModalInterestVisible, setIsModalInterestVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentInteret, setCurrentInteret] = useState<Interest>();

  const [closestInterest, setClosestInterest] = useState<Interest>();

  const [currentMarkerIndex, setCurrentMarkerIndex] = useState(2);
  const [speedDemo, setSpeedDemo] = useState(2);
  const [interval, setCurrentInterval] = useState<any>();
  const mapRef = useRef<MapView>(null);

  const navigation = useNavigation();
  const {pointsInterets, currentMapStyle, demoTrace} = useSelector(
    (state: AppState) => state,
  );

  useEffect(() => {
    let currentInterval = setInterval(() => {
      updateDemo(speedDemo);
    }, 1000);
    setCurrentInterval(currentInterval);
    return () => clearInterval(interval);
  }, []);

  const centerMap = () => {
    mapRef?.current?.fitToCoordinates(demoTrace.positionsTrace);
  };

  const goBack = () => {
    clearInterval(interval);
    navigation.goBack();
  };

  const updateDemo = (speed: number) => {
    setCurrentMarkerIndex((index) => {
      if (index + speed > demoTrace.positionsTrace.length) {
        stopDemo();
        return 0;
      } else {
        getClosestInterest(index + speed);
        return index + speed;
      }
    });
  };

  const togglePause = () => {
    if (isPaused) {
      startDemo();
    } else {
      pauseDemo();
    }
    setIsPaused((paused) => {
      return !paused;
    });
  };

  const startDemo = () => {
    clearInterval(interval);
    let currentInterval = setInterval(() => {
      updateDemo(speedDemo);
    }, 1000);
    setCurrentInterval(currentInterval);
  };

  const pauseDemo = () => {
    clearInterval(interval);
  };

  const stopDemo = () => {
    setCurrentMarkerIndex(0);
    setIsPaused(true);
    clearInterval(interval);
  };

  const decreaseSpeed = () => {
    clearInterval(interval);
    let nbPoints = speedDemo;
    nbPoints /= 2;
    nbPoints = Math.max(1, nbPoints);
    setIsPaused(false);
    setSpeedDemo((speed) => {
      let currentInterval = setInterval(() => {
        updateDemo(nbPoints);
      }, 1000);

      setCurrentInterval(currentInterval);
      return nbPoints;
    });
  };

  const increaseSpeed = () => {
    clearInterval(interval);
    let nbPoints = speedDemo;
    nbPoints *= 2;
    nbPoints = Math.min(nbPoints, 30);
    setIsPaused(false);

    setSpeedDemo((speed) => {
      let currentInterval = setInterval(() => {
        updateDemo(nbPoints);
      }, 1000);

      setCurrentInterval(currentInterval);
      return nbPoints;
    });
  };
  const setCenter = (coords: LatLng) => {
    mapRef?.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: LATITUDE_DELTA_CLOSE,
      longitudeDelta: LONGITUDE_DELTA_CLOSE,
    });
  };

  const onClickInterestPoint = (marker: Interest) => {
    setCurrentInteret(marker);
    //onOpenInterestModal();
  };

  const getClosestInterest = (currentIndex: number) => {
    let closest = null;
    let minDist = 100000;
    if (
      pointsInterets != null &&
      currentIndex < demoTrace.positionsTrace.length
    ) {
      pointsInterets.forEach((interest) => {
        let dist = GpxService.calculateDistBetweenTwoPoints(
          interest.coordinates,
          demoTrace.positionsTrace[currentIndex],
        );
        if (dist < minDist && dist < 100) {
          closest = interest;
          minDist = dist;
        }
      });

      // setClosestInterest(closest);
      if (closest != null) {
        setClosestInterest(closest);
      }
    }
  };

  return (
    <View style={styles.map}>
      <Header style={{backgroundColor: 'white'}}>
        <Left>
          <TouchableOpacity onPress={() => goBack()}>
            <Icon name="chevron-left" type="FontAwesome5" />
          </TouchableOpacity>
        </Left>
        <Body>
          <Image resizeMode="contain" source={Logo} style={styles.logoHeader} />
        </Body>
        <Right></Right>
      </Header>

      <View style={{flex: 1}}>
        <MapView
          ref={mapRef}
          mapType={currentMapStyle}
          style={styles.map}
          showsUserLocation={true}
          followsUserLocation={false}
          scrollEnabled={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsScale={false}
          showsTraffic={false}
          initialRegion={{
            latitude: 45.76512485710589,
            longitude: 4.8696115893891765,
            latitudeDelta: LATITUDE_DELTA_CLOSE,
            longitudeDelta: LONGITUDE_DELTA_CLOSE,
          }}
          onLayout={() => centerMap()}
          toolbarEnabled={false}>
          {demoTrace != null ? (
            <Polyline
              key={demoTrace.nomTrace}
              coordinates={demoTrace.positionsTrace}
              tappable={true}
              zIndex={0}
              geodesic={true}
              strokeColor={demoTrace.couleurTrace}
              strokeWidth={5}
            />
          ) : null}

          {demoTrace != null ? (
            <Polyline
              key={demoTrace.nomTrace}
              coordinates={demoTrace.positionsTrace.filter(
                (p, index) => index <= currentMarkerIndex,
              )}
              tappable={true}
              zIndex={12}
              geodesic={true}
              strokeColor={'white'}
              strokeWidth={5}
            />
          ) : null}

          {pointsInterets != null
            ? pointsInterets.map((marker) => (
                <Marker
                  onPress={() => onClickInterestPoint(marker)}
                  key={marker.id}
                  coordinate={marker.coordinates}
                  tracksViewChanges={true}>
                  <ImageBackground
                    style={{height: 25, width: 20}}
                    source={MarkerInteret}>
                    <Text style={{width: 25, height: 25}} />
                  </ImageBackground>
                </Marker>
              ))
            : null}
        </MapView>

        <View
          style={{
            position: 'absolute',
            top: 10,
            width: '100%',
            padding: SPACING,
          }}>
          <View
            style={[
              styles.shadow,
              {
                backgroundColor: 'white',
                padding: SPACING,
                borderRadius: 10,
              },
            ]}>
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
              Démo de {demoTrace.nomTrace}
            </Text>
          </View>

          {closestInterest != null ? (
            <View
              style={[
                styles.shadow,
                {
                  // padding: SPACING,
                  marginTop: SPACING * 2,
                  backgroundColor: 'white',
                  flexDirection: 'row',
                  borderRadius: 10,
                },
              ]}>
              {closestInterest?.photoInteret != null &&
              closestInterest?.photoInteret != '' ? (
                <Image
                  style={{
                    height: '100%',
                    minHeight: 100,
                    width: 100,
                    marginRight: SPACING,
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                  }}
                  source={{
                    uri: `data:image/png;base64,${closestInterest?.photoInteret}`,
                  }}
                />
              ) : null}
              <View style={{padding: SPACING}}>
                <Text style={{fontWeight: 'bold'}}>
                  {closestInterest.libelleInteret}
                </Text>
                <Text>{closestInterest.descriptionInteret}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {currentInteret != null ? (
          <View
            style={{
              position: 'absolute',
              top: 100,
              width: '100%',
              padding: SPACING,
            }}>
            <Text>{currentInteret.libelleInteret}</Text>
          </View>
        ) : null}

        <View
          style={{
            // position: 'absolute',
            bottom: 100,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}>
            <View>
              <TouchableOpacity
                onPress={() => decreaseSpeed()}
                style={[styles.button, {backgroundColor: 'white'}]}>
                <Text>- vite</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => togglePause()}
              style={[
                styles.buttonRound,
                {backgroundColor: isPaused ? 'green' : 'orange'},
              ]}>
              <Text style={{color: 'white'}}>
                {isPaused ? 'Start' : 'Pause'}
              </Text>
            </TouchableOpacity>

            {currentMarkerIndex != 0 ? (
              <TouchableOpacity
                onPress={() => stopDemo()}
                style={[styles.buttonRound, {backgroundColor: 'red'}]}>
                <Text style={{color: 'white'}}>Stop</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => increaseSpeed()}
              style={[styles.button, {backgroundColor: 'white'}]}>
              <Text>+ vite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    borderColor: 'black',
    borderWidth: 0,
    zIndex: 0,
    minHeight: 400,
  },
  logoHeader: {
    height: 50,
    width: '100%',
  },
  shadow: {
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.7,
    shadowRadius: 6.27,
  },
  button: {
    elevation: 20,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.7,
    shadowRadius: 6.27,
  },
  buttonRound: {
    elevation: 20,
    borderRadius: 500,
    height: 60,
    width: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.7,
    shadowRadius: 6.27,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
