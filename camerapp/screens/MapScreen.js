import React, {
  useEffect,
  useState,
} from "react";

import { View } from "react-native";

import * as Location from "expo-location";
import LocationMap from "../components/LocationMap";

 
export default function MapScreen() {
  const [location, setLocation] =
    useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return;
    }

    const currentLocation =
      await Location.getCurrentPositionAsync(
        {}
      );

    setLocation({
      latitude:
        currentLocation.coords.latitude,
      longitude:
        currentLocation.coords.longitude,
    });
  };

  if (!location) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <LocationMap
        latitude={location.latitude}
        longitude={location.longitude}
      />
    </View>
  );
}