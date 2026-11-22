import { Text, View } from "./Themed";
import { StyleSheet } from "react-native";

interface ResumeCardProps {
  helper: string;
  title: string;
  divider: boolean;
  details: Array<string>;
}

const ResumeCard = ({ details, divider, helper, title }: ResumeCardProps) => {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{helper}</Text>

      {title ? <Text style={styles.summaryAmount}>{title}</Text> : null}

      {divider ? <View style={styles.summaryDivider} /> : null}

      {details.map((item, index) => (
        <Text key={index + 1} style={styles.summaryDetail}>
          {item}
        </Text>
      ))}
    </View>
  );
};

export default ResumeCard;

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#172554",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  summaryLabel: {
    color: "#CBD5E1",
    fontSize: 13,
  },
  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginTop: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 16,
  },
  summaryDetail: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 5,
  },
});
