import React, { useEffect, useRef } from "react";
import {
  Text as RNText,
  View as RNView,
  Image as RNImage,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
} from "react-native";
import LogoImage from "../assets/images/LogoImage.png";

const Text = RNText as any;
const View = RNView as any;
const Image = RNImage as any;

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
import BoxContainer from "../components/BoxContainer";
import StarsBackground from "../components/StarsBackground";

const AnimatedImage = Animated.createAnimatedComponent(Image) as any;
const AnimatedText = Animated.createAnimatedComponent(Text) as any;

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
      <StarsBackground />
      <View style={styles.content}>
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

        <AnimatedText style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Your legal assistant, explain as an human.
        </AnimatedText>

        <BoxContainer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60, // Espacio para el contenido superior
  },
  logoWrapper: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logo: {
    width: 100, 
    height: 100,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  titleWrapper: {
    paddingVertical: 4,
  },
  title: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 32,
    marginTop: 8, 
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inconsolata_200ExtraLight",
    fontSize: 16,
    color: "#e2e8f0",
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
