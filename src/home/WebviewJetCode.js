import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button, Spinner } from 'native-base';
import { connect } from 'react-redux';
import ApiUtils from '../ApiUtils';
import AutoHeightWebView from 'react-native-autoheight-webview'

const myScript = `

window.addEventListener("message", function(event) {
 // alert("Received post message");
  // console.log("Received post message", event);
  window.ReactNativeWebView.postMessage(event.data)
  
}, false);

document.addEventListener("message", function(event) {
  //alert("Received post message");
  // console.log("Received post message", event);
  window.ReactNativeWebView.postMessage(event.data)
  
}, false);
true; // note: this is required, or you'll sometimes get silent failures
`;

const mapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
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
    console.log("event")
    console.log(event);

    var eventData = JSON.parse(event.nativeEvent.data);
    // console.log(eventData)
    if (eventData.type == 'resize_height') {
      let height = eventData.height;
      // console.log('heigth', eventData.height);
      this.setState({ webviewHeight: height });
    }

    if (eventData.type == 'payResult') {

      // {"customerID":"347977635867476d69645030767248352f47634643336963",
      // "sessionID":"yBghbwrItve4RFzu-MPYB0rMxQOEP7TU",
      // "jetcodeType":"payinresult","basketId":482,
      // "type":"payResult",
      // "url":"https://test.dag-system.com:8081/getBasketInfos/482"}

      // let data = {
      //   url: eventData.url,
      //   basketId: eventData.basketId,
      // };
      var action = { type: 'ADD_PAYRESULT', data: eventData };
      this.props.dispatch(action);

      this.downloadPayResult(eventData);
    }
  }


  setPaiementOk(idUtilisateur, amount, idStation){
    let formData = new FormData();
    formData.append('method', 'addpaiement');
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idStation', idStation);
    formData.append('idUtilisateur', idUtilisateur);
    formData.append('totalAmount', amount);
    

    //fetch followCode API
    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
      
        console.log(responseJson);
        this.onLogin(idUtilisateur);

      })
      .catch((e) => {
        alert(e);
        ApiUtils.logError('simpleMap onClickCreateInvite', e.message);
      })
      .then
      // (e) => alert("erreur : " + e.message),
      //  this.onClickNavigate('SimpleMap'));
      //alert("error gettingData"+ e.message)
      ();
  }

  onClickNavigate(routeName) {
    this.props.navigation.navigate(routeName);
  }


  onLogin(idUser) {
    this.setState({isLoading: true});
    let formData = new FormData();
    formData.append('method', 'getInformationsUtilisateur');
    formData.append('organisation', ApiUtils.getOrganisation());
    formData.append('auth', ApiUtils.getAPIAuth());
    formData.append('idUtilisateur', idUser);

    //fetch followCode API

    fetch(ApiUtils.getAPIUrl(), {
      method: 'POST',
      headers: {
        // Accept: 'application/json',
        // 'Content-Type': 'application/json',
      },
      body: formData,
    })
      .then(ApiUtils.checkStatus)
      .then((response) => response.json())
      .then((responseJson) => {
        //save values in cache
        if (responseJson.codeErreur == 'SUCCESS') {
          //SaveData
          this.setState({email: '', password: ''});

          var action = {type: 'LOGIN', data: responseJson};
          this.props.dispatch(action);
          this.setState({isLoading: false});
          this.onClickNavigate('Lives');

          // ApiUtils.setLogged().then(this.saveUserInfo(responseJson, false));
        } else {
          alert(responseJson.message);
          this.setState({isLoading: false});
        }
      })
      .catch((e) => {
        this.setState({isLoading: false});
        console.log(e);
        ApiUtils.logError('login', JSON.stringify(e.message));
        // alert('Une erreur est survenue : ' + JSON.stringify(e.message));

        if (e.message == 'Timeout' || e.message == 'Network request failed') {
          this.setState({noConnection: true});

          Toast.show({
            text: "Vous n'avez pas de connection internet, merci de réessayer",
            buttonText: 'Ok',
            type: 'danger',
            position: 'bottom',
            duration: 5000,
          });
        }
      });
  }



  reload() {
    this.setState({ isError: false });
  }

  downloadPayResult(purchase) {
    console.log
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
        console.log("downloadpurchase")
        console.log(responseJson);

        // {"basketDate": "2021-03-12T07:31:35.000Z", "basketId": "2211", 
        // "customerId": "776658443961493556553761556878454f4669356a42622b",
        //  "invoiceFile": ["https://www.dag-system.com:8080/files/20_AR%20Commande%20n%C2%B0366321.pdf"], 
        //  "order": [{"amount": 0, "customerParamList": "A;A;mangoPayUserAccount;{\"mangoPayUserId\":\"1468907711\",\"walletId\":\"1468907715\"}", "invoiceNumber": "2021-00009", "orderAlias": "S-591-210312083134-366321-P-2211", "orderDate": "2021-03-12T07:31:35.000Z", "orderId": 366321, "resort": "INP Grenoble"}], "orderId": ["366321"], "waitingPayment": false}

        this.setPaiementOk(this.props.userData.idUtilisateur,responseJson.order[0].amount,ApiUtils.getIdStation());

        var action = { type: 'UPDATE_PAY_RESULT', data: responseJson };
        this.props.dispatch(action);
      })
      .catch((e) => {
        alert(e);
      });
  }

  render() {
    return (
      <View style={{flex : 1}}>
        {this.props.uri != null && !this.state.isError ? (
          <WebView
            userAgent="visito"
            style={{ marginTop: 3, minHeight: 500,  width: '100%' }}
            startInLoadingState={true}
            injectedJavaScript={myScript}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              this.setState({ isError: true });
              console.log('WebView error: ', nativeEvent);
            }}
            onMessage={(data) => this.getWebViewMessage(data)}
            renderLoading={() => <Spinner style={{ marginTop: -900 }} color="black" />}
            source={{
              uri: this.props.uri,
            }}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
          />
        ) : null}
        {this.state.isError ? (
          <View style={{ justifyContent: 'center', flex: 1 }}>
            <Text style={{ textAlign: 'center', marginBottom: 10 }}>{ApiUtils.translate('webview.error')}</Text>

            <View style={{ alignSelf: 'center', justifyContent: 'center', textAlign: 'center', flex: 1 }}>
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
                <TText style={{ fontSize: 18, color: 'white' }}>{ApiUtils.translate('webview.reload')}</TText>
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
