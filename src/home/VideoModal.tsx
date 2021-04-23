import React, {Component} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import {
  Header,
  Body,
  Icon,
  Left,
  Right,
  View,
} from 'native-base';
import {connect} from 'react-redux';
import ApiUtils from '../ApiUtils';

import Video from 'react-native-video';
import VideoPrez from '../assets/tuto.mp4';
const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

class VideoModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFullScreen: true,
    };
  }

  componentDidMount() {
    setTimeout(() => this.didMount(), 300);
  }
  didMount() {}

  onClose = () => {
    this.props.onclose && this.props.onclose();
  };

  render() {
    return (
      <View style={{ backgroundColor : '#213849', padding : 0, flex :1}}>

          <Video
            source={VideoPrez} // Can be a URL or a local file.
            ref={(ref) => {
              this.player = ref;
            }} // Store reference
            repeat={true}
            resizeMode={"contain"}
            // onBuffer={this.onBuffer} // Callback when remote video is buffering
            // onError={this.videoError} // Callback when video cannot be loaded
            style={[styles.backgroundVideo,
              {
                width : Dimensions.get('window').width,
                height : Dimensions.get('window').height -25
              },
            ]}
            // style={[this.state.isFullScreen ? styles.video : styles.fullScreenVideo,{height : 10}]}
          />
    </View>
    );
  }
}

const styles = StyleSheet.create({

  video: {
    // width: '100%',
  },

  fullScreenVideo: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // zIndex : 1
    width: '100%',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default connect(mapStateToProps)(VideoModal);
