import React, { useRef, useState } from "react";
import {
  View as RNView,
  Text as RNText,
  Image as RNImage,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from "react-native";

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const AnimatedView = Animated.View as any;

const { width } = Dimensions.get("window");

interface SelectionCardProps {
  wallpaper: string; // URL de imagen
  icon: string; // URL de icono
  title: string;
  description: string;
  features: string[];
}

export default function SelectionCard({
  wallpaper,
  icon,
  title,
  description,
  features,
}: SelectionCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePress = () => {
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    Animated.timing(rotateAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const frontRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.content}>
        {/* Front */}
        <AnimatedView
          style={[
            styles.face,
            styles.front,
            { transform: [{ rotateY: frontRotate }] },
          ]}
        >
          <Image source={{ uri: wallpaper }} style={styles.img} />
          <View style={styles.frontContent}>
            <Text style={styles.badge}>Feature</Text>
            <View style={styles.description}>
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>
                  <Text style={styles.titleStrong}>{title}</Text>
                </Text>
                <Image source={{ uri: icon }} style={styles.icon} />
              </View>
              <Text style={styles.cardFooter}>{description}</Text>
            </View>
          </View>
          {/* Quitar círculos animados para optimizar */}
        </AnimatedView>

        {/* Back */}
        <AnimatedView
          style={[
            styles.face,
            styles.back,
            { transform: [{ rotateY: backRotate }] },
          ]}
        >
          <View style={styles.backContent}>
            <Text style={styles.backTitle}>Features</Text>
            {features.map((feature, index) => (
              <Text key={index} style={styles.feature}>
                • {feature}
              </Text>
            ))}
          </View>
        </AnimatedView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%", // 90% del ancho de pantalla
    maxWidth: 320, // máximo para pantallas grandes
    height: 254,
    marginHorizontal: "5%", // 5% de margen en cada lado
  },
  content: {
    width: "100%",
    height: "100%",
  },
  face: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    borderRadius: 5,
    overflow: "hidden",
  },
  front: {
    backgroundColor: "rgba(21,21,21,0.95)",
    backdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  back: {
    backgroundColor: "rgba(21,21,21,0.95)",
    backdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  frontContent: {
    position: "absolute",
    width: "100%",
    height: "100%",
    padding: 10,
    justifyContent: "space-between",
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    color: "white",
    fontSize: 10,
  },
  description: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 5,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleStrong: {
    fontWeight: "800",
    color: "#3b82f6",
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: "#3b82f6",
  },
  cardFooter: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
    fontSize: 10,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backContent: {
    width: "90%",
    height: "90%",
    backgroundColor: "rgba(31,41,55,0.9)",
    borderRadius: 12,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  backTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  feature: {
    color: "#e2e8f0",
    fontSize: 16,
    marginVertical: 4,
    textAlign: "center",
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
