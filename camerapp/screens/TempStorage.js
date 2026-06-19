import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Button,
  Text,
  Card,
} from "react-native-paper";

export default function TempStorage() {
  const cameraRef = useRef(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [photo, setPhoto] =
    useState(null);

  const [savedPhotos, setSavedPhotos] =
    useState([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const data =
      await AsyncStorage.getItem(
        "photos"
      );

    if (data) {
      setSavedPhotos(
        JSON.parse(data)
      );
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    const image =
      await cameraRef.current
        .takePictureAsync();

    const location =
      await Location.getCurrentPositionAsync(
        {}
      );

    setPhoto({
      ...image,

      latitude:
        location.coords.latitude,

      longitude:
        location.coords.longitude,

      capturedAt:
        new Date().toLocaleString(),
    });
  };

  const savePhoto = async () => {
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

        latitude:
          photo.latitude,

        longitude:
          photo.longitude,

        capturedAt:
          photo.capturedAt,
      };

      const existing =
        await AsyncStorage.getItem(
          "photos"
        );

      const photos =
        existing
          ? JSON.parse(existing)
          : [];

      photos.push(record);

      await AsyncStorage.setItem(
        "photos",
        JSON.stringify(photos)
      );

      await loadPhotos();

      setPhoto(null);

      alert(
        "Photo saved internally"
      );

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
          onPress={
            requestPermission
          }
        >
          Grant Camera Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photo ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
          />

          <Button
            mode="contained"
            onPress={takePhoto}
            style={styles.capture}
          >
            Capture
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

          <Card
            style={styles.card}
          >
            <Card.Content>

              <Text>
                Latitude:
                {" "}
                {photo.latitude}
              </Text>

              <Text>
                Longitude:
                {" "}
                {photo.longitude}
              </Text>

              <Text>
                Captured:
                {" "}
                {photo.capturedAt}
              </Text>

            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={savePhoto}
          >
            Save Internally
          </Button>

          <Button
            mode="outlined"
            onPress={() =>
              setPhoto(null)
            }
          >
            Retake
          </Button>
        </>
      )}

      <Text
        variant="titleLarge"
        style={styles.heading}
      >
        Saved Photos
      </Text>

      <FlatList
        data={savedPhotos}
        keyExtractor={(item) =>
          item.id.toString()
        }
        horizontal
        renderItem={({ item }) => (
          <Card
            style={styles.galleryCard}
          >
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.thumbnail}
            />

            <Card.Content>
              <Text>
                {item.latitude}
              </Text>

              <Text>
                {item.longitude}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },

  camera: {
    height: 350,
  },

  preview: {
    height: 350,
  },

  capture: {
    margin: 15,
  },

  heading: {
    margin: 15,
  },

  galleryCard: {
    width: 160,
    margin: 10,
  },

  thumbnail: {
    width: 160,
    height: 120,
  },

  card: {
    margin: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});