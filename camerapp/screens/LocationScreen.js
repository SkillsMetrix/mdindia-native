import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as Location from "expo-location";

import AsyncStorage from "@react-native-async-storage/async-storage";

import MapView, { Marker } from "react-native-maps";

import {
  PaperProvider,
  Button,
  Card,
  Text,
} from "react-native-paper";

export default function LocationScreen() {
  const cameraRef = useRef(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [activeTab, setActiveTab] =
    useState("camera");

  const [photo, setPhoto] =
    useState(null);

  const [locationData, setLocationData] =
    useState(null);

  const [records, setRecords] =
    useState([]);

  useEffect(() => {
    loadRecords();
    Location.requestForegroundPermissionsAsync();
  }, []);

  const loadRecords = async () => {
    try {
      const data =
        await AsyncStorage.getItem(
          "inspectionRecords"
        );

      if (data) {
        setRecords(JSON.parse(data));
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const capturePhoto = async () => {
    try {
      if (!cameraRef.current) return;

      const image =
        await cameraRef.current.takePictureAsync();

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

      setPhoto(image);

      setLocationData({
        latitude,
        longitude,

        city:
          addresses[0]?.city || "",

        region:
          addresses[0]?.region || "",

        country:
          addresses[0]?.country || "",

        timestamp:
          new Date().toLocaleString(),
      });
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  const saveRecord = async () => {
    try {
      const record = {
        id: Date.now(),

        image: photo.uri,

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

      records.unshift(record);

      await AsyncStorage.setItem(
        "inspectionRecords",
        JSON.stringify(records)
      );

      Alert.alert(
        "Saved Successfully",
        `Photo URI:\n\n${photo.uri}`
      );

      await loadRecords();

      setPhoto(null);
      setLocationData(null);

      setActiveTab("history");

    } catch (error) {
      Alert.alert(
        "Save Error",
        error.message
      );
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem(
      "inspectionRecords"
    );

    setRecords([]);
  };

  const showStorage = async () => {
    const data =
      await AsyncStorage.getItem(
        "inspectionRecords"
      );

    Alert.alert(
      "Stored Records",
      data || "EMPTY"
    );
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <PaperProvider>
        <View style={styles.center}>
          <Button
            mode="contained"
            onPress={requestPermission}
          >
            Grant Camera Permission
          </Button>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>

        <View style={styles.menu}>
          <Button
            mode={
              activeTab === "camera"
                ? "contained"
                : "outlined"
            }
            onPress={() =>
              setActiveTab("camera")
            }
          >
            Camera
          </Button>

          <Button
            mode={
              activeTab === "history"
                ? "contained"
                : "outlined"
            }
            onPress={() =>
              setActiveTab("history")
            }
          >
            History
          </Button>
        </View>

        {activeTab === "camera" ? (
          <ScrollView>

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

                    <Text variant="headlineSmall">
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
                  />
                </MapView>

                <Button
                  mode="contained"
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
                  Retake
                </Button>
              </>
            )}

          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>

            <Button
              mode="contained"
              style={styles.button}
              onPress={showStorage}
            >
              Debug Storage
            </Button>

            <Button
              mode="outlined"
              style={styles.button}
              onPress={clearHistory}
            >
              Clear History
            </Button>

            <FlatList
              data={records}
              keyExtractor={(item) =>
                item.id.toString()
              }
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={
                      styles.historyImage
                    }
                  />

                  <Card.Content>

                    <Text variant="titleMedium">
                      📍 {item.city}
                    </Text>

                    <Text>
                      {item.region}
                    </Text>

                    <Text>
                      {item.country}
                    </Text>

                    <Text>
                      {item.latitude}
                    </Text>

                    <Text>
                      {item.longitude}
                    </Text>

                    <Text>
                      {item.timestamp}
                    </Text>

                  </Card.Content>
                </Card>
              )}
            />

          </View>
        )}

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },

  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },

  camera: {
    height: 450,
  },

  preview: {
    width: "100%",
    height: 450,
  },

  map: {
    height: 250,
    margin: 10,
  },

  button: {
    margin: 10,
  },

  card: {
    margin: 10,
  },

  historyImage: {
    width: "100%",
    height: 250,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});