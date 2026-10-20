import { StyleSheet, Text, View, TextInput, Dimensions } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import React, { useState } from "react";

export default function SearchBar({ fetchWeatherData }) {
  const [cityName, setCityName] = useState("");

  return (
    <View style={styles.serachBar}>
      <TextInput
        placeholder="Enter City"
        value={cityName}
        onChangeText={(text) => setCityName(text)}
      />
      <EvilIcons
        name="search"
        size={30}
        color="blue"
        onPress={() => fetchWeatherData(cityName)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  serachBar: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: Dimensions.get("screen").width - 20,
    borderWidth: 1.5,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    backgroundColor: "lightgray",
    borderColor: "purple",
  },
});
