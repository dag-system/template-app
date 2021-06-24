import React from 'react';
import {Image} from 'react-native';
import {View} from 'native-base';

import Skieur from '../../assets/skieur.png';
import ShareData from './ShareData';

export default function ShareImage(props: any) {
  const ITEM_WIDTH = 300;
  return (
    <>
      {props.image == null && props.customImage !== null ? (
        <View>
          <ShareData style={{position: 'absolute', top: 0,  zIndex: 10004}} />
          <Image
            source={props.customImage}
            width={ITEM_WIDTH}
            resizeMode="cover"
            style={{width: ITEM_WIDTH, height: ITEM_WIDTH}}
          />
        </View>
      ) : (
        <View>
          <ShareData style={{position: 'absolute', top: 0, zIndex: 10004}} />
          <Image
            source={{
              uri: `data:${props.image.mime};base64,${props.image.data}`,
            }}
            width={ITEM_WIDTH}
            resizeMode="cover"
            style={{width: ITEM_WIDTH, height: ITEM_WIDTH}}
          />
        </View>
      )}
    </>
  );
}
