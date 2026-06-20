import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";

import * as Contacts from "expo-contacts";

import {
  Provider as PaperProvider,
  MD3LightTheme,
  Appbar,
  Searchbar,
  List,
  Avatar,
  Card,
  Text,
  ActivityIndicator,
  FAB,
  Divider,
  Button,
  Badge,
} from "react-native-paper";

const theme = {
  ...MD3LightTheme,
};

export default function ContactApp3() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);

      const permission =
        await Contacts.requestPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to contacts."
        );
        return;
      }

      const result =
        await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
            Contacts.Fields.Image,
          ],
        });

      const sortedContacts = result.data.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );

      setContacts(sortedContacts);
      setFilteredContacts(sortedContacts);

      if (sortedContacts.length > 0) {
        setSelectedContact(sortedContacts[0]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const searchContacts = (text) => {
    setSearch(text);

    const filtered = contacts.filter((contact) =>
      (contact.name || "")
        .toLowerCase()
        .includes(text.toLowerCase())
    );

    setFilteredContacts(filtered);
  };

  const getInitials = (name) => {
    if (!name) return "NA";

    return name
      .split(" ")
      .map((item) => item[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const callContact = async () => {
    const phone =
      selectedContact?.phoneNumbers?.[0]?.number;

    if (!phone) {
      Alert.alert(
        "No Number",
        "Phone number not available"
      );
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const ContactAvatar = ({ contact, size }) => {
    if (
      contact?.imageAvailable &&
      contact?.image?.uri
    ) {
      return (
        <Avatar.Image
          size={size}
          source={{ uri: contact.image.uri }}
        />
      );
    }

    return (
      <Avatar.Text
        size={size}
        label={getInitials(contact?.name)}
      />
    );
  };

  const renderContact = ({ item }) => (
    <>
      <List.Item
        title={item.name || "Unknown"}
        description={
          item.phoneNumbers?.[0]?.number ||
          "No Number"
        }
        left={() => (
          <ContactAvatar
            contact={item}
            size={50}
          />
        )}
        right={() => (
          <List.Icon icon="chevron-right" />
        )}
        onPress={() => setSelectedContact(item)}
      />

      <Divider />
    </>
  );

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>
            Loading Contacts...
          </Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content
            title="My Contacts"
            subtitle={`${filteredContacts.length} Contacts`}
          />

          <View style={styles.badgeContainer}>
            <Badge size={26}>
              {filteredContacts.length}
            </Badge>
          </View>
        </Appbar.Header>

        <Searchbar
          placeholder="Search contacts..."
          value={search}
          onChangeText={searchContacts}
          style={styles.searchBar}
        />

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />

        {selectedContact && (
          <Card style={styles.card}>
            <Card.Content>

              <View
                style={{
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <ContactAvatar
                  contact={selectedContact}
                  size={90}
                />
              </View>

              <Text
                variant="headlineSmall"
                style={styles.name}
              >
                {selectedContact.name}
              </Text>

              <Divider
                style={{
                  marginVertical: 15,
                }}
              />

              <Text variant="titleMedium">
                📞 Phone
              </Text>

              <Text variant="bodyLarge">
                {selectedContact
                  ?.phoneNumbers?.[0]?.number ||
                  "Not Available"}
              </Text>

              <Text
                variant="titleMedium"
                style={{
                  marginTop: 15,
                }}
              >
                ✉️ Email
              </Text>

              <Text variant="bodyLarge">
                {selectedContact?.emails?.[0]
                  ?.email || "Not Available"}
              </Text>

              <Button
                mode="contained"
                icon="phone"
                style={{
                  marginTop: 20,
                }}
                onPress={callContact}
              >
                Call Contact
              </Button>

            </Card.Content>
          </Card>
        )}

        <FAB
          icon="account-group"
          label={`${filteredContacts.length}`}
          style={styles.fab}
        />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  searchBar: {
    marginHorizontal: 10,
    marginVertical: 10,
  },

  badgeContainer: {
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    margin: 10,
    borderRadius: 18,
  },

  name: {
    textAlign: "center",
    fontWeight: "bold",
  },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});