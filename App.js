import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Weather from "./components/Weather";
import SearchBar from "./components/SearchBar";

const API_KEY = "b3aaa0b3323c0baab93aff38f75b44cb";

export default function App() {
  //initialize the state

  const [weatherData, setWeatherData] = useState(null);
  const [loaded, setLoaded] = useState(true);

  async function fetchWeatherData(cityName) {
    setLoaded(false);
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
    try {
      const response = await fetch(URL);
      if (response.status == 200) {
        const data = await response.json();
        

        setWeatherData(data);
      } else {
        setWeatherData(null);
      }
      setLoaded(true);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchWeatherData("pune");
  }, []);

  if (!loaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="gray" size={36} />
      </View>
    );
  } else if (weatherData == null) {
    return <View style={styles.container}>
        <SearchBar fetchWeatherData={fetchWeatherData}/>
        <Text>City not Found..... Try another city!</Text>
    </View>;
  }
  return (
    <View style={styles.container}>
      <Weather weatherData={weatherData} 
      fetchWeatherData={fetchWeatherData}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
