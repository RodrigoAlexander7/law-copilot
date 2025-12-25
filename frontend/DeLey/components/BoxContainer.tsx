import React, { useState, useRef, useEffect } from "react";
import {
  View as RNView,
  FlatList as RNFlatList,
  StyleSheet,
  Animated,
  Image as RNImage,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView as RNScrollView,
} from "react-native";
import { Asset } from "expo-asset";

const AdvisorImageAsset = Asset.fromModule(require("../assets/images/AdvisorImage.png"));
const DebateImageAsset = Asset.fromModule(require("../assets/images/DebateImage.png"));
const EducationImageAsset = Asset.fromModule(require("../assets/images/EducationImage.png"));

const AdvisorGifAsset = Asset.fromModule(require("../assets/gifs/AdvisorGif.gif"));
const DebateGifAsset = Asset.fromModule(require("../assets/gifs/DebateGif.gif"));
const EducationGifAsset = Asset.fromModule(require("../assets/gifs/EducationGif.gif"));

const ScrollView = RNScrollView as any;
const View = RNView as any;
const FlatList = RNFlatList as any;
const Image = RNImage as any;
const AnimatedView = Animated.View as any;
const AnimatedText = Animated.Text as any;
const TouchableOpacityComponent = TouchableOpacity as any;

interface BoxItem {
  id: string;
  wallpaper: any;
  icon: any;
  title: string;
  description: string;
  features: string[];
}

const boxes: BoxItem[] = [
  {
    id: "1",
    wallpaper: AdvisorGifAsset,
    icon: AdvisorImageAsset,
    title: "Education Module",
    description: "Get expert advice on legal matters.",
    features: ["Free initial chat", "24/7 support", "Expert lawyers"],
  },
  {
    id: "2",
    wallpaper: DebateGifAsset,
    icon: DebateImageAsset,
    title: "Debate Module",
    description: "Review your documents securely.",
    features: ["Secure upload", "Quick turnaround", "Detailed feedback"],
  },
  {
    id: "3",
    wallpaper: EducationGifAsset,
    icon: EducationImageAsset,
    title: "Advisor Module",
    description: "Manage your cases efficiently.",
    features: ["Track progress", "Notifications", "Integrated tools"],
  },
];

export default function BoxContainer() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({});
  const flatListRef = useRef<RNFlatList>(null);
  const bgAnim = useRef(new Animated.Value(0)).current;

  // Descargar assets cuando el componente se monte
  useEffect(() => {
    const downloadAssets = async () => {
      try {
        await Asset.loadAsync([
          require("../assets/images/AdvisorImage.png"),
          require("../assets/images/DebateImage.png"),
          require("../assets/images/EducationImage.png"),
          require("../assets/gifs/AdvisorGif.gif"),
          require("../assets/gifs/DebateGif.gif"),
          require("../assets/gifs/EducationGif.gif"),
        ]);
        console.log("Assets downloaded successfully");
      } catch (error) {
        console.error("Error downloading assets:", error);
      }
    };
    downloadAssets();
  }, []);

  const onScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setSelectedIndex(index);
    Animated.timing(bgAnim, {
      toValue: index,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const scrollToIndex = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setSelectedIndex(index);
    }
  };

  const [cardRotations, setCardRotations] = useState<{[key: string]: Animated.Value}>({});

  // Initialize rotation values for each card
  React.useEffect(() => {
    const rotations: {[key: string]: Animated.Value} = {};
    boxes.forEach(box => {
      rotations[box.id] = new Animated.Value(0);
    });
    setCardRotations(rotations);
  }, []);

  const toggleCardFlip = (cardId: string) => {
    const rotation = cardRotations[cardId];
    if (rotation) {
      const toValue = flippedCards[cardId] ? 0 : 180;
      Animated.spring(rotation, {
        toValue,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const [pressedCards, setPressedCards] = useState<{[key: string]: boolean}>({});

  const handlePressIn = (cardId: string) => {
    setPressedCards(prev => ({ ...prev, [cardId]: true }));
  };

  const handlePressOut = (cardId: string) => {
    setPressedCards(prev => ({ ...prev, [cardId]: false }));
  };

  return (
    <View style={[styles.slider, { width: screenWidth, height: screenHeight }]}>
      <FlatList
        ref={flatListRef}
        data={boxes}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        keyExtractor={(item: BoxItem) => item.id}
        renderItem={({ item }: { item: BoxItem }) => (
          <ScrollView 
            style={{ width: screenWidth, height: screenHeight }}
            showsVerticalScrollIndicator={true}
            bounces={true}
            contentContainerStyle={styles.itemContent}
          >
            {/* TEMP: Background placeholder */}
            <View style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              bottom: 20,
              backgroundColor: item.id === '1' ? '#ff6b6b' : item.id === '2' ? '#4ecdc4' : '#45b7d1',
              opacity: 0.8,
              borderRadius: 20,
            }} />

            {/* Background GIF */}
            <Image
              source={item.wallpaper}
              style={styles.bg}
              resizeMode="cover"
              onError={() => console.log('Error loading wallpaper:', item.wallpaper)}
            />
            
            {/* Blurred background */}
            <Image
              source={item.wallpaper}
              style={[styles.blur, { opacity: 0.2 }]}
              resizeMode="cover"
            />

            {/* Content Block */}
            <AnimatedView
              style={[
                styles.block,
                pressedCards[item.id] && styles.blockPressed,
                {
                  transform: [{
                    rotateY: cardRotations[item.id]?.interpolate({
                      inputRange: [0, 180],
                      outputRange: ['0deg', '180deg']
                    }) || '0deg'
                  }]
                }
              ]}
            >
              <TouchableOpacityComponent
                style={styles.blockTouchable}
                onPress={() => toggleCardFlip(item.id)}
                onPressIn={() => handlePressIn(item.id)}
                onPressOut={() => handlePressOut(item.id)}
                activeOpacity={0.9}
              >
                <View style={[styles.circleLight, { opacity: pressedCards[item.id] ? 0.4 : 0 }]} />
                <View style={styles.text}>
                  {!flippedCards[item.id] ? (
                    // Front side
                    <>
                      <Image 
                        source={item.icon} 
                        style={styles.icon} 
                        resizeMode="contain"
                        onError={() => console.log('Error loading icon:', item.icon)}
                      />
                      {/* TEMP: Icon placeholder */}
                      <View style={{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        borderRadius: 40,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <AnimatedText style={{ fontSize: 24, color: 'white' }}>
                          {item.id === '1' ? '📚' : item.id === '2' ? '⚖️' : '👨‍⚖️'}
                        </AnimatedText>
                      </View>
                      <AnimatedText style={[styles.title, { opacity: 1 }]}>
                        {item.title}
                      </AnimatedText>
                      <AnimatedText style={[styles.description, { opacity: 0.9 }]}>
                        {item.description}
                      </AnimatedText>
                    </>
                  ) : (
                    // Back side
                    <>
                      <AnimatedText style={[styles.backTitle, { opacity: 1 }]}>
                        Features
                      </AnimatedText>
                      {item.features.map((feature, index) => (
                        <AnimatedText key={index} style={[styles.feature, { opacity: 0.9 }]}>
                          • {feature}
                        </AnimatedText>
                      ))}
                    </>
                  )}
                </View>
              </TouchableOpacityComponent>
            </AnimatedView>
          </ScrollView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    height: "100%",
  },
  itemsGroup: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  item: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 80, // Espacio para los dots de navegación
    minHeight: "100%", // Altura mínima de la pantalla
  },
  itemContent: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 80, // Espacio para el footer
    flex: 1,
  },
  activeItem: {
    opacity: 1,
    visibility: "visible",
  },
  bg: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    zIndex: 0,
    width: "auto",
    height: "auto",
    position: "absolute",
    borderRadius: 20,
  },
  blur: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    zIndex: 0,
    width: "auto",
    height: "auto",
    position: "absolute",
    borderRadius: 20,
  },
  block: {
    width: "100%",
    height: "auto",
    padding: 20,
    color: "#ffffff",
    maxWidth: 300,
    overflow: "visible",
    minHeight: 450,
    borderRadius: 10,
    zIndex: 1,
    position: "relative",
    boxSizing: "border-box",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  blockTouchable: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  blockPressed: {
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 15,
  },
  circleLight: {
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  text: {
    width: "100%",
    height: "100%",
    display: "flex",
    textAlign: "center",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  feature: {
    fontSize: 16,
    color: "#e2e8f0",
    textAlign: "center",
    marginVertical: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
