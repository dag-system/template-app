import React, { Component } from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import {
  Text,
} from 'native-base';



export default class ErrorMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }

  componentDidMount() { }

  render() {
    return (
      <View>
        {(this.props.value == undefined || this.props.value == '') ? <Text style={[styles.errorStyle]}>{this.props.message}</Text> : <Text style={styles.errorStyle}>&nbsp;   &nbsp;&nbsp;</Text>}
      </View>


    );
  }
}

const styles = StyleSheet.create({
  errorStyle: {
    color: 'red',
    fontSize: 14,
    paddingLeft : 5,
    fontStyle :'italic'
  }
});
