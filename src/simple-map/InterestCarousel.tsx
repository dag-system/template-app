import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AppState from '../models/AppState';
import Interest from '../models/Interest';

export default function InterestCarousel() {
  const dispatch = useDispatch();
  const {pointsInterets} = useSelector((state: AppState) => state);

  const [isOpen, setIsOpen] = useState(false);
  const [interestByTypes, setInterestByTypes] = useState<any[]>([]);

  const ITEM_WIDTH = 300;
  const PADDING = 20;

  useEffect(() => {
    let types = getInterestByTypes();
    setInterestByTypes(types);
  }, [pointsInterets]);

  const getInterestByTypes = (): any[] => {
    let types: any = [];
    if (pointsInterets != null) {
      pointsInterets.forEach((interet) => {
        if (
          types.filter((t) => t.idType == interet.idTypeInteret).length == 0
        ) {
          let newType = {
            idType: interet.idTypeInteret,
          };
          types.push(newType);
        }
      });
    }
    return types;
  };

  return !isOpen ? (
    <TouchableOpacity onPress={() => setIsOpen(true)} style={{height: 50}}>
      <Text>Voir les points d'interets </Text>
    </TouchableOpacity>
  ) : (
    <View
      style={{
        zIndex: 1000,
        // marginBottom: 200,
        // top : '80%',
      position: 'absolute',
      backgroundColor : "white",

        // maxHeight: 150,
        // height: 200,
        width: '100%',
      }}>
      <TouchableOpacity onPress={() => setIsOpen(false)} style={{height: 50}}>
        <Text>Cacher les points d'interets {interestByTypes.length} </Text>
      </TouchableOpacity>

      {interestByTypes.length > 0 ? (
        <ScrollView >
          {interestByTypes.map((type: any) => {
            return (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {pointsInterets != null &&
                    pointsInterets.filter(i => i.idTypeInteret == type.idType).map((interest: Interest) => {
                      return (
                        <TouchableOpacity
                          key={interest.idInteret}
                          style={{width: ITEM_WIDTH, padding: PADDING}}>
                          {interest?.photoInteret != null &&
                          interest?.photoInteret != '' ? (
                            <Image
                              style={{height: 200, width: '100%'}}
                              source={{
                                uri: `data:image/png;base64,${interest?.photoInteret}`,
                              }}
                            />
                          ) : null}

                          <Text>{interest.libelleInteret}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  <Text>LA</Text>
                </ScrollView>
              </View>
            );
          })}
       
        </ScrollView>
      ) : null}
         <View style={{paddingBottom : 300 }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  itemPart: {
    paddingHorizontal: 5,
    paddingVertical: 7,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#000',
  },
});
