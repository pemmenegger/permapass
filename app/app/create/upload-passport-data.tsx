import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { defaultStyles } from "../../styles";
import { TextScreen } from "../../components/TextScreen";
import { useState } from "react";
import { NavigationButton } from "../../components/NavigationButton";

export default function Page() {
  const apiUrl = process.env.EXPO_PUBLIC_ARWEAVE_API_URL;
  const [responseContent, setResponseContent] = useState("");
  const [responseURL, setResponseURL] = useState("");
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
        setResponseURL(data.url);
        const urlResponse = await fetch(data.url);
        const urlData = await urlResponse.text();
        setResponseContent(urlData);
      } else {
        setResponseURL("");
        setResponseContent("No URL found in the response");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseURL("");
      setResponseContent(`Error fetching data: ${error}`);
    }
  }

  return (
    <TextScreen header={"Upload Passport Data"}>
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        maxLength={16}
        autoCapitalize="none"
        autoFocus={true}
      />
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Upload To Arweave</Text>
      </TouchableOpacity>
      <Text>Response - Arweave link:</Text>
      <Text>{responseURL}</Text>
      <Text>Response - Arweave content:</Text>
      <Text>{responseContent}</Text>
      <NavigationButton
        to="/create/mint-nft"
        params={{
          tokenURI: responseURL,
        }}
      >
        Create NFT
      </NavigationButton>
      <NavigationButton
        to="/create/mint-nft"
        params={{
          tokenURI: responseURL,
        }}
      >
        Create DID
      </NavigationButton>
    </TextScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.bgLight,
    flex: 0.95,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: defaultStyles.fontMedium,
    fontWeight: "200",
    color: defaultStyles.secondary,
    marginTop: 10,
    marginBottom: 5,
  },
  titleBold: {
    fontSize: defaultStyles.fontMedium,
    fontWeight: "400",
    color: defaultStyles.secondary,
    marginTop: 10,
    marginBottom: 5,
  },
  textHighlight: {
    color: defaultStyles.primary,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderWidth: 1,
    width: 250,
    borderColor: defaultStyles.secondary,
    borderRadius: 10,
    fontSize: defaultStyles.fontMedium,
    padding: 15,
    marginBottom: 10,
  },
  button: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    width: 200,
    height: 50,
    marginVertical: 5,
    backgroundColor: defaultStyles.bgLight,
    shadowOffset: { width: 3, height: 3 },
    shadowColor: defaultStyles.bgDark,
    shadowRadius: 5,
    shadowOpacity: 0.2,
    borderRadius: 10,
  },
  buttonText: {
    color: defaultStyles.secondary,
    fontSize: defaultStyles.fontMedium,
    fontWeight: "bold",
  },
});
