import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";

import AsyncStorage from "@react-native-async-storage/async-storage";

import MapView, {
  Marker,
} from "react-native-maps";

import {
  Button,
  Card,
  Text,
} from "react-native-paper";

export default function CameraWithGeo() {
  const cameraRef = useRef(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [photo, setPhoto] =
    useState(null);

  const [locationData, setLocationData] =
    useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission =
    async () => {
      await Location.requestForegroundPermissionsAsync();
    };

  const capturePhoto = async () => {
    try {
      if (!cameraRef.current) return;

      const image =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.High,
        });

      const latitude =
        currentLocation.coords.latitude;

      const longitude =
        currentLocation.coords.longitude;

      const addresses =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      const address =
        addresses[0];

      const locationInfo = {
        latitude,
        longitude,

        city:
          address?.city || "",

        district:
          address?.district || "",

        region:
          address?.region || "",

        country:
          address?.country || "",

        postalCode:
          address?.postalCode || "",

        timestamp:
          new Date().toLocaleString(),
      };

      setLocationData(locationInfo);
      setPhoto(image);

    } catch (error) {
      console.log(error);
    }
  };

  const saveRecord = async () => {
    try {
      const filename =
        `photo_${Date.now()}.jpg`;

      const destination =
        FileSystem.documentDirectory +
        filename;

      await FileSystem.copyAsync({
        from: photo.uri,
        to: destination,
      });

      const record = {
        id: Date.now(),
        image: destination,
        ...locationData,
      };

      const existing =
        await AsyncStorage.getItem(
          "inspectionRecords"
        );

      const records =
        existing
          ? JSON.parse(existing)
          : [];

      records.push(record);

      await AsyncStorage.setItem(
        "inspectionRecords",
        JSON.stringify(records)
      );

      alert("Saved Successfully");

      setPhoto(null);
      setLocationData(null);

    } catch (error) {
      console.log(error);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Button
          mode="contained"
          onPress={requestPermission}
        >
          Grant Camera Permission
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {!photo ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
          />

          <Button
            mode="contained"
            style={styles.button}
            onPress={capturePhoto}
          >
            Capture Photo
          </Button>
        </>
      ) : (
        <>
          <Image
            source={{
              uri: photo.uri,
            }}
            style={styles.preview}
          />

          <Card style={styles.card}>
            <Card.Content>

              <Text
                variant="headlineSmall"
              >
                📍 Current Location
              </Text>

              <Text>
                City:
                {" "}
                {locationData?.city}
              </Text>

              <Text>
                State:
                {" "}
                {locationData?.region}
              </Text>

              <Text>
                Country:
                {" "}
                {locationData?.country}
              </Text>

              <Text>
                Latitude:
                {" "}
                {locationData?.latitude?.toFixed(
                  6
                )}
              </Text>

              <Text>
                Longitude:
                {" "}
                {locationData?.longitude?.toFixed(
                  6
                )}
              </Text>

              <Text>
                Time:
                {" "}
                {locationData?.timestamp}
              </Text>

            </Card.Content>
          </Card>

          {locationData && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude:
                  locationData.latitude,

                longitude:
                  locationData.longitude,

                latitudeDelta: 0.01,

                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude:
                    locationData.latitude,

                  longitude:
                    locationData.longitude,
                }}
                title="Photo Location"
              />
            </MapView>
          )}

          <Button
            mode="contained"
            icon="content-save"
            style={styles.button}
            onPress={saveRecord}
          >
            Save Record
          </Button>

          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => {
              setPhoto(null);
              setLocationData(null);
            }}
          >
            Retake Photo
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    height: 500,
  },

  preview: {
    width: "100%",
    height: 500,
  },

  card: {
    margin: 10,
  },

  map: {
    height: 250,
    margin: 10,
    borderRadius: 10,
  },

  button: {
    margin: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});