import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  Text as RNText,
  View as RNView,
  Image as RNImage,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
  ScrollView as RNScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset } from "expo-asset";
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
const LogoImage = require("../assets/images/LogoImage.png");
import BoxContainer from "../components/BoxContainer";
import StarsBackground from "../components/StarsBackground";
import Footer from "../components/Footer";
import SplashScreen from "../components/SplashScreen";

const Text = RNText as any;
const View = RNView as any;
const Image = RNImage as any;
const ScrollView = RNScrollView as any;
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

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const anim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Load all assets with progress
  useEffect(() => {
    const loadAssets = async () => {
      const assets = [
        require("../assets/images/LogoImage.png"),
        require("../assets/images/AdvisorImage.png"),
        require("../assets/images/DebateImage.png"),
        require("../assets/images/EducationImage.png"),
        require("../assets/gifs/AdvisorGif.gif"),
        require("../assets/gifs/DebateGif.gif"),
        require("../assets/gifs/EducationGif.gif"),
      ];

      const totalAssets = assets.length;
      let loadedCount = 0;

      for (const asset of assets) {
        try {
          await Asset.loadAsync(asset);
          loadedCount++;
          setLoadingProgress(loadedCount / totalAssets);
        } catch (error) {
          console.error("Error loading asset:", error);
          loadedCount++;
          setLoadingProgress(loadedCount / totalAssets);
        }
      }

      // Wait a bit to show 100%
      setTimeout(() => {
        setAssetsLoaded(true);
      }, 300);
    };

    if (qLoaded && iLoaded && uLoaded) {
      loadAssets();
    }
  }, [qLoaded, iLoaded, uLoaded]);

  const startIdle = useCallback(() => {
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
  }, [anim]);

  useEffect(() => {
    if (!(qLoaded && iLoaded && uLoaded)) return;
    startIdle();
    return () => {
      loopRef.current?.stop();
    };
  }, [qLoaded, iLoaded, uLoaded, startIdle]);

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

  if (!qLoaded || !iLoaded || !uLoaded || !assetsLoaded) {
    return (
      <SplashScreen 
        progress={loadingProgress} 
        isComplete={assetsLoaded && qLoaded && iLoaded && uLoaded}
      />
    );
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
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StarsBackground />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
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
        </View>

        <View style={styles.body}>
          <BoxContainer />
        </View>
      </ScrollView>

      {/* Footer estándar de la aplicación (fijo en bottom) */}
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
    // asegúrate que el contenido ocupe toda la altura disponible para empujar el footer al final
    justifyContent: "flex-start",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
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
  footer: {
    // ahora es parte del flujo, no fixed
    height: 80,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
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
});
