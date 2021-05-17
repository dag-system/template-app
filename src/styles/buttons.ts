import { StyleSheet } from "react-native";

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
  });

  export default styles;