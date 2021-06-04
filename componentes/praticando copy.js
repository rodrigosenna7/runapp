import React, {useState, useEffect}  from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableHighlight, Button} from 'react-native';
import { Entypo, AntDesign } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import haversine from 'haversine';
const LOCATION_TASK_NAME = 'background-location-task';

export default function (){

    const [location, setLocation] = useState(null);
    const [distancia, setDistancia] = useState(0);
    const [historicoLocalizacao, setHistoricoLocalizacao] = useState([]);
    
    // --------------------
    const [posicaoAtual, setPosicaoAtual] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
  
      const [rota, setRota] = useState([]);

    startTraking = async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
          console.log("Inicinando serviço")
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
          });               
        }    
      };

      
    
      callbackUpdate = (track) => {
        /*console.log("SIZE: ", track)*/
        if(track){
            let current = track[track.length-1][0].coords;
            current = {
            ...posicaoAtual,
            ...current,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121
            }
            setPosicaoAtual(current);

            if(current.latitude && rota &&  rota.length>0)
                setDistancia(distancia+ haversine(current, rota[rota.length-1],{unit: 'km'}))
            
            setRota([...rota,{latitude:current.latitude, longitude:current.longitude}])
        }
      }

    useEffect(() => {
            
        (async () => {
            let { status } = false || await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setErrorMsg('Permission to access location was denied');
              return;
            }            
      
            let x = await Location.getProviderStatusAsync();
            setLocation(x);
            startTraking();
          })();
    }, [])

    /**------------------------- */
    return(
        <SafeAreaView >
           <View style={estilos.container}>

                <View style={{alignItems:'center'}}>
                    {/* Distancia */ }
                    <Text style={estilos.txtPrincipal} >{distancia.toFixed(2)}km</Text>
                    <Text>Distância</Text>
                </View>

                <View style={{flexDirection:'row', alignItems:'space-between'}}>
                    <View style={estilos.bloco}>
                        <Text style={estilos.txtTitulo}>28:51</Text>
                        <View style={{flexDirection:'row', alignItems:'space-between'}}>
                            <AntDesign name="clockcircleo" size={17} color="black" />
                            <Text>Duração</Text>
                        </View>
                    </View>

                    <View style={estilos.bloco}>
                        <Text style={estilos.txtTitulo}>8:51</Text>
                        <View style={{flexDirection:'row', alignItems:'space-between'}}>
                            <Entypo name="gauge" size={20} color="black" />
                            <Text>Ritmo (min/km)</Text>
                        </View>
                    </View> 
                </View>

                <View style={{flexDirection:'row', alignItems:'space-between'}}>
                    <View style={estilos.bloco}>
                        <Entypo name="location" size={24} color="black" />
                    </View>

                    <View style={estilos.bloco}>
                        <Entypo name="bar-graph" size={24} color="black" />
                    </View>
                </View>
                
                 <TouchableHighlight onPress={startTraking}>
                    <Text>Clique aqui para pegar a localização</Text>
                </TouchableHighlight>
                 
                <Text>Latitude: {historicoLocalizacao.length}</Text>
                <Text>Longitude: {JSON.stringify(location)}</Text>

                {/* Mapa */}
                <MapView
                    region={posicaoAtual}
                    provider="google"
                    style={{
                        height: 320,
                        width: '100%',
                                            
                    }}
                    initialRegion={{
                    latitude: 37.235290,
                    longitude: -121.827420,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,                                   

                    }}
                >
                 <Polyline
          coordinates={rota}
          strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={[
            '#7F0000',
            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
            '#B24112',
            '#E5845C',
            '#238C23',
            '#7F0000'
          ]}
          strokeWidth={6}
        />
                </MapView>
                {/* ---------------------- */}
                
           </View>
            

        </SafeAreaView>



    )
}

const estilos = StyleSheet.create({

    container:{
        paddingTop:25,
        margin:5,
    },

    bloco:{
        flexDirection:'column',
        alignItems:'center',
        flex:0.5,
        marginTop:15,
    },
    
    txtTitulo:{
        fontSize:30,
    },

    txtinfo:{
        fontSize:25,
    },


    txtPrincipal:{
        fontWeight:'bold',
        fontSize:50,
    },

    txtsubTitulo:{
        fontSize:15,
            
        },

    icone:{
        width:'30%',
        resizeMode:'contain',
        marginTop:-80    
    },

    img:{
        width:'100%',
        resizeMode:'stretch',
        marginTop:-90,
    },

    botao:{
        marginTop:10,
    }

})

// -----------------------------
let callbackUpdate = null;
  const track = [];
  
  const addLocation = (location) =>{
    track.push(location);
    if(callbackUpdate)
        callbackUpdate(track);
  }
  
  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
      console.log("erro!")
      return;
    }
    if (data) {
      const { locations } = data;    
      addLocation(locations)
    }
  });