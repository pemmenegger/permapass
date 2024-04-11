import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";

function Post() {
  const apiUrl = process.env.EXPO_PUBLIC_ARWEAVE_API_URL;
  const [responseText, setResponseText] = useState("");
  const [name, setName] = useState("");

  async function onPress() {
    if (!apiUrl) {
      console.error("API URL is not set");
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
        }),
      });
      const data = await response.json();

      if (data && data.url) {
        const urlResponse = await fetch(data.url);
        const urlData = await urlResponse.text();
        setResponseText(urlData);
      } else {
        setResponseText("No URL found in the response");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseText(`Error fetching data: ${error}`);
    }
  }

  return (
    <View>
      <TextInput style={styles.input} placeholder="Enter name" value={name} onChangeText={setName} />
      <Button onPress={onPress} title="Post" />
      <Text>Response:</Text>
      <Text>{responseText}</Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Post />
      {/* <StatusBar style="auto" /> */}
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
