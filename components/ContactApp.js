import React, { useEffect, useState } from "react";
import * as Contacts from "expo-contacts";

import {
  View,
  FlatList,
  StyleSheet,
} from "react-native";

import {
  Searchbar,
  List,
  Card,
  Text,
  Avatar,
  ActivityIndicator,
} from "react-native-paper";

export default function ContactApp() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { status } =
      await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      const { data } =
        await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
          ],
        });

      setContacts(data);
      setFilteredContacts(data);

      if (data.length > 0) {
        setSelectedContact(data[0]);
      }
    }

    setLoading(false);
  };

  const searchContacts = (text) => {
    setSearch(text);

    const filtered = contacts.filter((contact) =>
      contact.name
        ?.toLowerCase()
        .includes(text.toLowerCase())
    );

    setFilteredContacts(filtered);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Contacts"
        value={search}
        onChangeText={searchContacts}
        style={styles.search}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={
              item.phoneNumbers?.[0]?.number ||
              "No Number"
            }
            left={() => (
              <Avatar.Text
                size={45}
                label={
                  item.name
                    ?.substring(0, 2)
                    .toUpperCase() || "NA"
                }
              />
            )}
            onPress={() => setSelectedContact(item)}
          />
        )}
      />

      {selectedContact && (
        <Card style={styles.card}>
          <Card.Content>

            <Avatar.Text
              size={80}
              label={
                selectedContact.name
                  ?.substring(0, 2)
                  .toUpperCase()
              }
              style={{
                alignSelf: "center",
                marginBottom: 15,
              }}
            />

            <Text variant="headlineSmall">
              {selectedContact.name}
            </Text>

            <Text variant="bodyLarge">
              📞 {selectedContact.phoneNumbers?.[0]?.number || "N/A"}
            </Text>

            <Text variant="bodyLarge">
              ✉️ {selectedContact.emails?.[0]?.email || "N/A"}
            </Text>

          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },

  search: {
    margin: 10,
  },

  list: {
    flex: 1,
  },

  card: {
    margin: 10,
    borderRadius: 16,
  },
});