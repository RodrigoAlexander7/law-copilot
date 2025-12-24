import React, { useEffect, useRef } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
} from "react-native";
import LogoImage from "../assets/images/LogoImage.png";

import {
  useFonts as useQuicksand,
  Quicksand_400Regular,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import {
  useFonts as useInconsolata,
  Inconsolata_200ExtraLight,
  Inconsolata_700Bold,
} from "@expo-google-fonts/inconsolata";
import {
  useFonts as useUnderdog,
  Underdog_400Regular,
} from "@expo-google-fonts/underdog";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function Index() {
  const [qLoaded] = useQuicksand({
    Quicksand_400Regular,
    Quicksand_700Bold,
  });
  const [iLoaded] = useInconsolata({
    Inconsolata_200ExtraLight,
    Inconsolata_700Bold,
  });
  const [uLoaded] = useUnderdog({
    Underdog_400Regular,
  });

  const anim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const startIdle = () => {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loopRef.current.start();
  };

  useEffect(() => {
    if (!(qLoaded && iLoaded && uLoaded)) return;
    startIdle();
    return () => {
      loopRef.current?.stop();
    };
  }, [qLoaded, iLoaded, uLoaded]);

  const onHoverIn = () => {
    loopRef.current?.stop();
    Animated.timing(anim, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const onHoverOut = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (qLoaded && iLoaded && uLoaded) startIdle();
    });
  };

  if (!qLoaded || !iLoaded || !uLoaded) {
    return null;
  }
  const logoScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const logoTranslateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const titleTranslateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const titleScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const subtitleOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });

  const pressableProps =
    Platform.OS === "web"
      ? { onHoverIn, onHoverOut }
      : { onPressIn: onHoverIn, onPressOut: onHoverOut };

  return (
    <View style={styles.container}>
      <Pressable {...pressableProps} style={styles.logoWrapper}>
        <AnimatedImage
          source={LogoImage}
          style={[
            styles.logo,
            {
              transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />
      </Pressable>

      <Pressable {...pressableProps} style={styles.titleWrapper}>
        <AnimatedText
          style={[
            styles.title,
            {
              transform: [{ translateY: titleTranslateY }, { scale: titleScale }],
            },
          ]}
        >
          De Ley
        </AnimatedText>
      </Pressable>

      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Your legal assistant, explain as an human.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbfbfd",
  },
  logoWrapper: {
    padding: 8,
    borderRadius: 999,
  },
  logo: {
    width: 96, 
    height: 96,
    marginBottom: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  titleWrapper: {
    paddingVertical: 4,
  },
  title: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 30,
    marginTop: 6, 
    color: "#0f172a",
    textShadowColor: "rgba(15,23,42,0.06)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: "Inconsolata_200ExtraLight",
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
