import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  StyleSheet,
} from "react-native";

import * as Contacts from "expo-contacts";

import {
  Provider as PaperProvider,
  Appbar,
  Searchbar,
  List,
  Avatar,
  Card,
  Text,
  ActivityIndicator,
  FAB,
  Divider,
} from "react-native-paper";

export default function ContactApp2() {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);

      const { status } =
        await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        alert("Permission denied");
        return;
      }

      const result =
        await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
          ],
        });

      const sorted = result.data.sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      );

      setContacts(sorted);
      setFiltered(sorted);

      if (sorted.length > 0) {
        setSelected(sorted[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (text) => {
    setSearch(text);

    const filteredList = contacts.filter(
      (contact) =>
        contact.name
          ?.toLowerCase()
          .includes(text.toLowerCase())
    );

    setFiltered(filteredList);
  };

  const initials = (name) => {
    if (!name) return "NA";

    return name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <PaperProvider>
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
          <Text>Loading Contacts...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>

        <Appbar.Header>
          <Appbar.Content
            title="My Contacts"
            subtitle={`${filtered.length} Contacts`}
          />
        </Appbar.Header>

        <Searchbar
          placeholder="Search Contact"
          value={search}
          onChangeText={onSearch}
          style={styles.search}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <>
              <List.Item
                title={item.name}
                description={
                  item.phoneNumbers?.[0]
                    ?.number || "No Number"
                }
                left={() => (
                  <Avatar.Text
                    size={48}
                    label={initials(item.name)}
                  />
                )}
                onPress={() =>
                  setSelected(item)
                }
              />
              <Divider />
            </>
          )}
        />

        {selected && (
          <Card style={styles.card}>
            <Card.Content>

              <Avatar.Text
                size={80}
                label={initials(
                  selected.name
                )}
                style={{
                  alignSelf: "center",
                  marginBottom: 15,
                }}
              />

              <Text
                variant="headlineSmall"
                style={{
                  textAlign: "center",
                }}
              >
                {selected.name}
              </Text>

              <Text
                style={{
                  marginTop: 20,
                }}
              >
                📞 Phone
              </Text>

              <Text variant="bodyLarge">
                {selected.phoneNumbers?.[0]
                  ?.number || "Not Available"}
              </Text>

              <Text
                style={{
                  marginTop: 15,
                }}
              >
                ✉️ Email
              </Text>

              <Text variant="bodyLarge">
                {selected.emails?.[0]
                  ?.email || "Not Available"}
              </Text>

            </Card.Content>
          </Card>
        )}

        <FAB
          icon="account-group"
          label={`${filtered.length}`}
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

  search: {
    margin: 10,
  },

  card: {
    margin: 10,
    borderRadius: 16,
  },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});