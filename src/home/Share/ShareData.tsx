import React from 'react';
import {StyleSheet, Text, Image} from 'react-native';
import {View} from 'native-base';
import {useSelector} from 'react-redux';
import AppState from '../../models/AppState';

import Logo from '../../assets/logo.png';
import ApiUtils from '../../ApiUtils';

export default function ShareData(props: any) {
  const {currentLiveSummary} = useSelector((state: AppState) => state);

  const ITEM_WIDTH = 300;
  const LOGO_SIZE = 70;
  const PADDING = 10;
  return (
    <View style={{position: 'absolute', top: 0, zIndex: 10004}}>
      <View
        style={{
          position: 'absolute',
          height: ITEM_WIDTH ,
          top: 0,
          backgroundColor: 'black',
          opacity: 0.2,
          width: ITEM_WIDTH,
          zIndex: 1000,
        }}></View>

      <View
        style={{
          position: 'absolute',
          zIndex: 1001,
          top: 0,
          display: 'flex',
          flexDirection: 'row',
          width: ITEM_WIDTH,
          // paddingTop: 5,
          paddingHorizontal: PADDING,
        }}>
        <Image
          source={Logo}
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          resizeMode="contain"
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
          }}
        />
      </View>
      {currentLiveSummary.statsLive != null ?
      <View
        style={{
          position: 'absolute',
          height: 30,
          top: ITEM_WIDTH - PADDING * 3,
          backgroundColor: 'black',
          opacity: 0.3,
          width: ITEM_WIDTH,
          zIndex: 1000,
        }}></View> :null}
         {currentLiveSummary.statsLive != null ?
      <View
        style={{
          position: 'absolute',
          zIndex: 1001,
          top: ITEM_WIDTH - PADDING * 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: ITEM_WIDTH,
          paddingTop: 5,
          paddingHorizontal: PADDING,
        }}>
        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
          }}>
          {currentLiveSummary.statsLive != null
            ? currentLiveSummary.statsLive?.distance.toFixed(1) + 'km'
            : null}
        </Text>
        {/* <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
          }}>
          {currentLiveSummary.libelleLive}
        </Text> */}
        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
          }}>
          {currentLiveSummary.statsLive?.duree}
        </Text>
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {},
  header: {
    backgroundColor: ApiUtils.getBackgroundColor(),
  },
});
