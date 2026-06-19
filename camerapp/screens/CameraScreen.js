import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";

import {
  Button,
  Text,
  Card,
} from "react-native-paper";

export default function CameraScreen() {
  const cameraRef = useRef(null);

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();

  const [locationPermission, setLocationPermission] =
    useState(false);

  const [facing, setFacing] =
    useState("back");

  const [flash, setFlash] =
    useState("off");

  const [photo, setPhoto] =
    useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }

    if (!mediaPermission?.granted) {
      await requestMediaPermission();
    }

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setLocationPermission(true);
    }
  };

  const toggleCamera = () => {
    setFacing((current) =>
      current === "back"
        ? "front"
        : "back"
    );
  };

  const toggleFlash = () => {
    setFlash((current) =>
      current === "off"
        ? "on"
        : "off"
    );
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const image =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

      let latitude = null;
      let longitude = null;

      if (locationPermission) {
        const location =
          await Location.getCurrentPositionAsync(
            {}
          );

        latitude =
          location.coords.latitude;

        longitude =
          location.coords.longitude;
      }

      setPhoto({
        ...image,
        latitude,
        longitude,
        capturedAt:
          new Date().toLocaleString(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const savePhoto = async () => {
    try {
      await MediaLibrary.saveToLibraryAsync(
        photo.uri
      );

      alert(
        "Photo saved to Gallery"
      );
    } catch (error) {
      console.log(error);
    }
  };

  if (!cameraPermission) {
    return null;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.center}>
        <Text>
          Camera permission required
        </Text>

        <Button
          mode="contained"
          onPress={
            requestCameraPermission
          }
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >
      {!photo ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
          />

          <View style={styles.controls}>
            <Text variant="titleMedium">
              Camera:
              {" "}
              {facing.toUpperCase()}
            </Text>

            <Text variant="titleMedium">
              Flash:
              {" "}
              {flash.toUpperCase()}
            </Text>

            <Button
              mode="contained"
              icon="camera"
              onPress={takePhoto}
            >
              Capture
            </Button>

            <Button
              mode="outlined"
              icon="camera-flip"
              onPress={toggleCamera}
            >
              Flip Camera
            </Button>

            <Button
              mode="outlined"
              icon={
                flash === "on"
                  ? "flash"
                  : "flash-off"
              }
              onPress={toggleFlash}
            >
              Toggle Flash
            </Button>
          </View>
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
                variant="titleMedium"
              >
                Photo Details
              </Text>

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
            icon="content-save"
            onPress={savePhoto}
            style={styles.button}
          >
            Save To Gallery
          </Button>

          <Button
            mode="outlined"
            icon="camera-retake"
            onPress={() =>
              setPhoto(null)
            }
            style={styles.button}
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
    paddingBottom: 30,
  },

  camera: {
    height: 500,
  },

  preview: {
    width: "100%",
    height: 500,
  },

  controls: {
    padding: 15,
    gap: 10,
  },

  button: {
    marginHorizontal: 15,
    marginTop: 10,
  },

  card: {
    margin: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});