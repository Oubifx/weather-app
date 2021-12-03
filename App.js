import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, TextInput, View, Image} from 'react-native';
import { LinearGradient } from "expo-linear-gradient"


export default function App() {
  return <AppScreen/>
}

const AppScreen = () => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getWeatherFromApi = async () => {
    try {
      const response = await fetch('http://api.weatherapi.com/v1/forecast.json?key=526d4889d65b48cabba160455213011&q=Melitopol, Ukraine&days=2&aqi=no&alerts=no')
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeatherFromApi();
  }, []);

  if(isLoading) {
    //LOAD MENU
    console.log('LOADING!')
    return(
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <Text style={{fontSize: 40}}>Loading!</Text> 
      </View>
    )
  } else {
    
    console.log('LOADED!')
    let maxMinTemp = [Math.round(data.forecast.forecastday[0].day.maxtemp_c),Math.round(data.forecast.forecastday[0].day.mintemp_c)]
    return(
        <LinearGradient
        style={styles.container}
        colors={['#7161ef', 'transparent']}
        start={{x:0.5, y:0}}
        end={{x:0.7, y:1}}>
            <HomeSearch/>
            <HomeYesterdayWeather data={data} maxMinTemp={maxMinTemp}/>
            <HomeYesterdayWeatherAdditional data={data} maxMinTemp={maxMinTemp}/>
            <HomeFullDayWeather data={data} maxMinTemp={maxMinTemp}/>
        </LinearGradient>

    )
  }
}

// FUNCTIONS

const getWeatherImgUri = (param) => {
  return {
    uri: 'http:' + param,
  }
}

// Components
const HomeSearch = () => {

  const onChangeText = (inputText) => {
    console.log(inputText)
  }

  return(
    <View style={{flex: 69, justifyContent:'flex-end', alignItems: 'center', flexDirection: 'row', marginTop: 30}}>
      <TextInput style={styles.input} onChangeText={onChangeText} selectionColor={'rgba(256, 256, 256, 0.75)'} placeholder={'Location...'} placeholderTextColor={'rgba(256, 256, 256, 0.45)'}/>
    </View>
  )
}



const HomeYesterdayWeather = ({data, maxMinTemp}) => {
 
  return(
    <View style={{flex: 276, justifyContent: 'center', alignItems: 'center', paddingVertical: 10}}>
      <Text style={[styles.centertext,{fontWeight: 'bold', fontSize: 16}]}>{data.location.name}, {data.location.region}</Text>

      <Text style={styles.centertext}>{data.location.localtime}</Text>

      <View style={{flex:2, flexDirection: 'row', alignItems: 'center'}}>
        <Image source={getWeatherImgUri(data.forecast.forecastday[0].day.condition.icon)} style={{width: 64, height: 64}}></Image>
        <Text style={{textAlignVertical: 'center', color: 'white', fontSize: 60}}>{Math.round(data.current.temp_c)}°</Text>
      </View>
      

      <Text style={[styles.centertext,{fontWeight: 'bold'}]}>{maxMinTemp[0]}°/{maxMinTemp[1]}° Feels like {Math.round(data.current.feelslike_c)}°</Text>
      
      <Text style={[styles.centertext,{fontWeight: 'bold', paddingBottom: 20}]}>{data.forecast.forecastday[0].day.condition.text}</Text>
    </View>
  )
}

const HomeYesterdayWeatherAdditional = ({data, maxMinTemp}) => {

const getUVlevel = () => {
  if(data.current.uv <= 2) {
    return 'Low'
  } else if (data.current.uv <= 5) {
    return 'Moderate'
  } else if (data.current.uv <= 7) {
    return 'High'
  } else if (data.current.uv <= 10) {
    return 'Very high'
  } else {
    return 'Extreme'
  }
}

  return(
    <View style={{flex: 135}}>
      <Text style={{textAlign:'right', paddingHorizontal: 30, color: 'white',paddingBottom:3}}>Yesterday: {maxMinTemp[0]}°/{maxMinTemp[1]}°</Text>
      <View style={styles.bordercontainer}>
        <View style={{flex: 1, margin: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
          <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/727/727802.png'}}  resizeMode={'contain'} tintColor={'white'} style={{width: 32, height: 32,alignSelf: 'center'}}></Image>
          <Text style={{textAlignVertical: 'center', color: 'white'}}>Precipitation{"\n"}{data.current.humidity}%</Text>
        </View>
        <View style={{height: "45%", width: 1,backgroundColor:'white', alignSelf: 'center', borderRadius: 10}}></View>
          
        <View style={{flex: 1, margin: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
          <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/106/106061.png'}}  resizeMode={'contain'} tintColor={'white'} style={{width: 32, height: 32,alignSelf: 'center', marginRight: 5}}></Image>
          <Text style={{textAlignVertical: 'center', color: 'white'}}>UV Index{"\n"}{getUVlevel()}</Text>
        </View>
      </View>
    </View>
  )
}

const HomeFullDayWeather = ({data, maxMinTemp}) => {
  let currentTime = data.location.localtime.slice(-5).split(':')[0]
  let dayHour = []

  // [0,1]
  for (let l = 0; l<2; l++) {
     // [2,5,8,11,14,17,20,23]
    for (let i = 2; i <= 23; i+=3) {
        if(dayHour.length > 3) {break}
        if (l != 0 || currentTime < i+3) {
          dayHour.push([l,i])
            if(dayHour.length > 3) {break}
        }
    }
  }

  return (
    <View style={{flex: 260}}>
      <Text style={{textAlign:'left', paddingHorizontal: 30, color: 'white',paddingBottom:3}}>Hourly</Text>
      <View style={styles.bordercontainer}>
        <WeatherColum dayData={data.forecast.forecastday[dayHour[0][0]].hour[dayHour[0][1]]} maxMinTemp={maxMinTemp}/>
        <WeatherColum dayData={data.forecast.forecastday[dayHour[1][0]].hour[dayHour[1][1]]} maxMinTemp={maxMinTemp}/>
        <WeatherColum dayData={data.forecast.forecastday[dayHour[2][0]].hour[dayHour[2][1]]} maxMinTemp={maxMinTemp}/>
        <WeatherColum dayData={data.forecast.forecastday[dayHour[3][0]].hour[dayHour[3][1]]} maxMinTemp={maxMinTemp}/>
      </View>
    </View>
  )
}

const WeatherColum = ({ dayData, maxMinTemp}) => {
  
  const getTempGraphStyle = (temp_c) => {
    let tempProcent = Math.round(((temp_c - maxMinTemp[1]) * 90) / (maxMinTemp[0] - maxMinTemp[1]))
    let graphStyle = {height: 10+tempProcent+'%'}
    return graphStyle
  }

  console.log('WeatherColum:',dayData.time)
  return(
    <View style={{flex: 1, margin: 5, alignItems: 'center'}}>
      <Text style={[styles.centertext, {flex: 0.5, textAlignVertical: 'bottom', marginTop: 10, fontWeight: 'bold'}]}>{dayData.time.slice(-5)}</Text>

      <View style={styles.centertext}>
        <Image source={getWeatherImgUri(dayData.condition.icon)}  resizeMode={'contain'}  style={{flex: 2, width: 64, height: 64, alignSelf: 'center'}}></Image>
        <Text style={[styles.centertext,{fontSize: 10, textAlign: 'center', textAlignVertical: 'top'}]}> {Math.max(dayData.chance_of_rain, dayData.chance_of_snow)}%</Text>
      </View>

      <View style={{
        alignItems: 'center',
        flexDirection: "column",
        justifyContent: 'flex-end',
        flex: 1.5,
        marginVertical: '30%'
        }}>
        <Text style={{alignSelf: 'flex-end', color: 'white', fontSize: 18}}> {Math.round(dayData.temp_c)}°</Text>
        <View style={[{width: 4, backgroundColor:'white', borderRadius: 10},getTempGraphStyle(Math.round(dayData.temp_c))]}></View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#95d0f2',
  },
  input: {
    flex: 1,
    marginVertical: 12,
    marginHorizontal: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: 'rgba(256, 256, 256, 0.35)',
    color: 'rgba(256, 256, 256, 0.45)',
  },
  bordercontainer: {
    flex: 1,
    backgroundColor: 'rgba(256, 256, 256, 0.35)',
    margin: 10,
    borderRadius: 10,
    marginTop: 0,
    flexDirection: 'row'
  },
  centertext:{
    flex: 1,
    textAlignVertical: 'center',
    color: 'white'
  }
});
///#a0c6f6