import React from "react";
import {
  View as RNView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const View = RNView as any;
const TouchableOpacityComponent = TouchableOpacity as any;

interface FooterProps {
  selectedIndex: number;
  totalItems: number;
  onSelectIndex: (index: number) => void;
}

export default function Footer({ selectedIndex, totalItems, onSelectIndex }: FooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.dots}>
        {Array.from({ length: totalItems }, (_, index) => (
          <TouchableOpacityComponent
            key={index}
            style={[
              styles.dot,
              selectedIndex === index && styles.activeDot,
            ]}
            onPress={() => onSelectIndex(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 6,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeDot: {
    width: 16,
    height: 16,
    backgroundColor: "#ffffff",
  },
});