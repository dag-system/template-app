// var libxmljs = require("libxmljs");
var xml2js = require('react-native-xml2js');

var DomParser = require('react-native-html-parser').DOMParser;

import GPXTrack from './GPXTrack.js';

export default class GPXDocument {

  /**
   * Parse the gpx xml string and store the results internally
   * @param {string} xmlString The xml string to parse
   */
  constructor(xmlString) {

    try{
      let doc = new DomParser().parseFromString(xmlString, 'text/html');
      console.log(doc.getElementsByTagName('trk'));
  
      var test = doc.getElementsByTagName('trk');
  
      this.parsedGPX = doc;
    }catch(e)
    {
      // alert(e)
    }

    // var parseString = require('react-native-xml2js').parseString;
    // // this.parsedGPX = xml2js.parseString(xmlString);
    // parseString(xmlString, function (err, result) {
    //   this.parsedGPX = result;
    // });
  }

  /**
   * Get the tracks for all tracks in the gpx file
   */
  async getTracks() {

    var tracks = this.parsedGPX.getElementsByTagName('trk');

    // let tracks = this.parsedGPX.find('/ns:gpx/ns:trk', GPXDocument.GPX_NS);


    if (tracks === undefined)
      throw new Error('Unable read tracks');

    
    var tracksArray = [];
    for (let i = 0; i < tracks.length; i++) {
      const element = tracks[i];
      tracksArray.push(element);

    }
    // Use the map function to get an array with the name of each track if it exists
    return tracksArray.map((val) => {
      return val === undefined ? undefined : new GPXTrack(val);
    });
  }
}

// The mean radius of the earth in miles
GPXDocument.MEAN_RAD_MI = 3958.7613;
GPXDocument.GPX_NS = { ns: 'http://www.topografix.com/GPX/1/1' };