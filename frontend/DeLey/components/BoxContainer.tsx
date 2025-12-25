import React, { useState, useRef } from "react";
import {
  View as RNView,
  FlatList as RNFlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Image as RNImage,
  useWindowDimensions,
} from "react-native";
import SelectionCard from "./SelectionCard";

const View = RNView as any;
const FlatList = RNFlatList as any;
const Image = RNImage as any;
const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

interface BoxItem {
  id: string;
  wallpaper: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const { width, height } = Dimensions.get("window");

const boxes: BoxItem[] = [
  {
    id: "1",
    wallpaper: "https://via.placeholder.com/300x400?text=Wallpaper1",
    icon: "https://via.placeholder.com/50x50?text=Icon1",
    title: "Education Module",
    description: "Get expert advice on legal matters.",
    features: ["Free initial chat", "24/7 support", "Expert lawyers"],
  },
  {
    id: "2",
    wallpaper: "https://via.placeholder.com/300x400?text=Wallpaper2",
    icon: "https://via.placeholder.com/50x50?text=Icon2",
    title: "Debate Module",
    description: "Review your documents securely.",
    features: ["Secure upload", "Quick turnaround", "Detailed feedback"],
  },
  {
    id: "3",
    wallpaper: "https://via.placeholder.com/300x400?text=Wallpaper3",
    icon: "https://via.placeholder.com/50x50?text=Icon3",
    title: "Advisor Module",
    description: "Manage your cases efficiently.",
    features: ["Track progress", "Notifications", "Integrated tools"],
  },
];

export default function BoxContainer() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flatListRef = useRef<RNFlatList>(null);
  const bgAnim = useRef(new Animated.Value(0)).current;

  const onScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setSelectedIndex(index);
    Animated.timing(bgAnim, {
      toValue: index,
      duration: 200, // más rápido
      useNativeDriver: false,
    }).start();
  };

  const bgOpacity = bgAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.3, 0.5, 0.3], // menos opaco para menos carga
  });

  return (
    <View style={[styles.container, { width: screenWidth }]}>
      <AnimatedImage
        source={{ uri: boxes[selectedIndex].wallpaper }}
        style={[styles.background, { width: screenWidth, height: screenHeight, opacity: bgOpacity }]}
        blurRadius={3} // menos blur para optimizar
      />
      <FlatList
        ref={flatListRef}
        data={boxes}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        keyExtractor={(item: BoxItem) => item.id}
        renderItem={({ item }: { item: BoxItem }) => (
          <View style={[styles.cardContainer, { width: screenWidth }]}>
            <SelectionCard
              wallpaper={item.wallpaper}
              icon={item.icon}
              title={item.title}
              description={item.description}
              features={item.features}
            />
          </View>
        )}
      />
      <View style={styles.indicators}>
        {boxes.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              selectedIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    resizeMode: "cover",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  cardContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  indicators: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeDot: {
    backgroundColor: "#3b82f6",
    width: 14,
    height: 14,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
});
