import React from "react";
import {
  View as RNView,
  StyleSheet,
  TouchableOpacity,
  Text as RNText,
  Linking,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, Entypo } from "@expo/vector-icons";

const View = RNView as any;
const TouchableOpacityComponent = TouchableOpacity as any;
const Text = RNText as any;

function open(url: string) {
  Linking.openURL(url).catch(() => {
    // ignore errors for now
  });
}

export default function Footer() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isNarrow = width < 420;

  return (
    <View style={[
      styles.footer, 
      isNarrow && styles.footerNarrow,
      { paddingBottom: Math.max(insets.bottom, 32) }
    ]}>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <Text style={styles.appName}>De Ley</Text>
          <Text style={styles.tagline}>Tu asistente legal — claro, humano, rápido</Text>
        </View>

        <View style={styles.links}>
          <TouchableOpacityComponent onPress={() => open("https://example.com/about")} style={styles.linkButton}>
            <Text style={styles.linkText}>About</Text>
          </TouchableOpacityComponent>
          <TouchableOpacityComponent onPress={() => open("https://example.com/privacy")} style={styles.linkButton}>
            <Text style={styles.linkText}>Privacy</Text>
          </TouchableOpacityComponent>
          <TouchableOpacityComponent onPress={() => open("mailto:contact@example.com")} style={styles.linkButton}>
            <Text style={styles.linkText}>Contact</Text>
          </TouchableOpacityComponent>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.social}>
          <TouchableOpacityComponent
            onPress={() => open("https://twitter.com/")}
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <FontAwesome name="twitter" size={18} color="#fff" />
          </TouchableOpacityComponent>
          <TouchableOpacityComponent
            onPress={() => open("https://www.linkedin.com/")}
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <Entypo name="linkedin" size={18} color="#fff" />
          </TouchableOpacityComponent>
          <TouchableOpacityComponent
            onPress={() => open("https://github.com/")}
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <FontAwesome name="github" size={18} color="#fff" />
          </TouchableOpacityComponent>
        </View>

        <Text style={styles.copy}>© {new Date().getFullYear()} De Ley — All rights reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,1)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  footerNarrow: {
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  brand: {
    flexDirection: "column",
    minWidth: 140,
  },
  appName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  tagline: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 2,
  },
  links: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 6,
  },
  linkButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  linkText: {
    color: "#e2e8f0",
    fontSize: 13,
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  social: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  copy: {
    color: "#94a3b8",
    fontSize: 12,
  },
});