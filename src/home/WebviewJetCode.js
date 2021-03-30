import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {Button, Spinner} from 'native-base';
import {connect} from 'react-redux';
import ApiUtils from '../ApiUtils';
import AutoHeightWebView from 'react-native-autoheight-webview';

const myScript = `

window.addEventListener("message", function(event) {
  console.log("Received post message", event);
  window.ReactNativeWebView.postMessage(event.data)
  
}, false);

document.addEventListener("message", function(event) {
  console.log("Received post message", event);
  window.ReactNativeWebView.postMessage(event.data)
  
}, false);
true; // note: this is required, or you'll sometimes get silent failures
`;

const mapStateToProps = (state) => {
  return {};
};

class WebViewJetCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      webviewHeight: 9000,
      isError: false,
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  getWebViewMessage(event) {
    console.log(event.nativeEvent.data);

    var eventData = JSON.parse(event.nativeEvent.data);
    console.log(eventData);
    if (eventData.type == 'resize_height') {
      let height = eventData.height;
      // console.log('heigth', eventData.height);
      this.setState({webviewHeight: height});
    }

    if (eventData.type == 'payResult') {
      var action = {type: 'ADD_PAYRESULT', data: eventData};
      this.props.dispatch(action);

      this.downloadPayResult(eventData);
    }
  }

  reload() {
    this.setState({isError: false});
  }

  downloadPayResult(purchase) {
    console.log(purchase.customerId);
    fetch(purchase.url, {
      method: 'POST',
      headers: {
        AppsName: 'visito',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: purchase.customerId,
      }),
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        var action = {type: 'UPDATE_PAY_RESULT', data: responseJson};
        this.props.dispatch(action);
      })
      .catch((e) => {
        alert(e);
      });
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.props.uri != null && !this.state.isError ? (
          <AutoHeightWebView
            userAgent="folomi"
            style={{marginTop: 40, minHeight: 500, width: '100%'}}
            startInLoadingState={true}
            injectedJavaScript={myScript}
            onError={(syntheticEvent) => {
              const {nativeEvent} = syntheticEvent;
              this.setState({isError: true});
              console.log('WebView error: ', nativeEvent);
            }}
            onMessage={(data) => this.getWebViewMessage(data)}
            renderLoading={() => (
              <Spinner style={{marginTop: -900}} color="black" />
            )}
            source={{
              uri: this.props.uri,
            }}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
          />
        ) : null}
        {this.state.isError ? (
          <View style={{justifyContent: 'center', flex: 1}}>
            <Text style={{textAlign: 'center', marginBottom: 10}}>
              {ApiUtils.translate('webview.error')}
            </Text>

            <View
              style={{
                alignSelf: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                flex: 1,
              }}>
              <Button
                rounded
                small
                style={{
                  //  backgroundColor: '#F0AB7B',
                  backgroundColor: ApiUtils.getbackgroundColor(),
                  alignSelf: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  paddingTop: 5,
                  paddingBottom: 6,
                }}
                onPress={() => this.reload()}>
                <TText style={{fontSize: 18, color: 'white'}}>
                  {ApiUtils.translate('webview.reload')}
                </TText>
              </Button>
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({});

export default connect(mapStateToProps)(WebViewJetCode);
