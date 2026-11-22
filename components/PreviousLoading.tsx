import { View } from "./Themed";
import { ActivityIndicator, StyleSheet } from "react-native";

const PreviousLoading = () => {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
};

export default PreviousLoading;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6FA",
  },
});
