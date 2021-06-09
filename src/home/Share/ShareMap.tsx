import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import AppState from '../../models/AppState';

import ApiUtils from '../../ApiUtils';
import MapView, {Polyline} from 'react-native-maps';
import ShareData from './ShareData';

export default function ShareMap(props: any) {
  const {currentLiveSummary, currentMapStyle} = useSelector(
    (state: AppState) => state,
  );
  const [interval, setCurrentInterval] = useState<any>();

  const LATITUDE_DELTA = 0.016022;
  const LONGITUDE_DELTA = 0.001221;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let currentInterval = setInterval(() => {
      centerMap();
    }, 1000);
    setCurrentInterval(currentInterval);
    return () => clearInterval(interval);
  }, [currentLiveSummary]);

  const centerMap = () => {
    console.log('center map');
    if (currentLiveSummary.coordinates?.length != 0) {
      console.log('center map if');
      if (mapRef.current != null) {
        mapRef?.current?.fitToCoordinates(currentLiveSummary.coordinates, {
          edgePadding: {top: 10, right: 10, bottom: 10, left: 10},
          animated: true,
        });
        clearInterval(interval);
      }
    }
  };

  const ITEM_WIDTH = 300;
  return (
    <View>
      <ShareData />

      <MapView
        ref={mapRef}
        style={{
          height: ITEM_WIDTH,
          width: ITEM_WIDTH,
        }}
        mapType={currentMapStyle}
        showsUserLocation={false}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsScale={false}
        showsTraffic={false}
        onPress={(coordinate) => { centerMap() }}
        toolbarEnabled={false}
        initialRegion={{
          latitude: 45.78728972333324, // 44.843884,
          longitude: 4.874593511376774,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onLayout={() => centerMap()}>
        {currentLiveSummary.coordinates != null &&
        currentLiveSummary.coordinates.length > 0 ? (
          <Polyline
            key="polyline"
            coordinates={currentLiveSummary.coordinates}
            geodesic={true}
            strokeColor="rgba(63,170,239, 1)"
            strokeWidth={3}
            zIndex={12}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {},
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
});

// export default connect(mapStateToProps)(MapContainer);
