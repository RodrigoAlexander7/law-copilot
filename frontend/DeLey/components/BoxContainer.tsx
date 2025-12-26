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
  Easing,
} from "react-native";
import { Asset } from "expo-asset";
import { useRouter } from "expo-router";
import GlowButton from "./GlowButton";

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
  route: string;
  color: string;
  glowColor: string;
}

const boxes: BoxItem[] = [
  {
    id: "1",
    wallpaper: AdvisorGifAsset,
    icon: AdvisorImageAsset,
    title: "Education Module",
    description: "Get expert advice on legal matters.",
    features: ["Free initial chat", "24/7 support", "Expert lawyers"],
    route: "/tabs/education",
    color: "#ff6b6b",
    glowColor: "#ff6b6b",
  },
  {
    id: "2",
    wallpaper: DebateGifAsset,
    icon: DebateImageAsset,
    title: "Debate Module",
    description: "Review your documents securely.",
    features: ["Secure upload", "Quick turnaround", "Detailed feedback"],
    route: "/tabs/debate",
    color: "#4ecdc4",
    glowColor: "#4ecdc4",
  },
  {
    id: "3",
    wallpaper: EducationGifAsset,
    icon: EducationImageAsset,
    title: "Advisor Module",
    description: "Manage your cases efficiently.",
    features: ["Track progress", "Notifications", "Integrated tools"],
    route: "/tabs/advisor",
    color: "#45b7d1",
    glowColor: "#45b7d1",
  },
];

export default function BoxContainer() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({});
  const flatListRef = useRef<RNFlatList>(null);
  const bgAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

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
  
  // Add logging to help debug viewability/index updates
  const _onMomentumScrollEnd = (event: any) => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    // eslint-disable-next-line no-console
    console.log('[BoxContainer] onMomentumScrollEnd calculated index:', idx);
    setSelectedIndex(idx);
  };

  // More reliable viewability handler for FlatList: update selectedIndex when the visible item changes
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const onViewRef = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      const vi = viewableItems[0];
      let idx: number | null = null;
      if (typeof vi.index === 'number') {
        idx = vi.index;
      } else if (vi.key) {
        const parsed = parseInt(vi.key, 10);
        if (!Number.isNaN(parsed)) {
          // key may be item.id which is 1-based in this data; normalize to 0-based index
          idx = parsed > 0 && parsed <= boxes.length ? parsed - 1 : parsed;
        }
      }
      if (idx !== null && !Number.isNaN(idx)) {
        // debug log to help diagnose viewability issues
        // eslint-disable-next-line no-console
        console.log('[BoxContainer] onViewableItemsChanged -> idx:', idx, 'viewableItems:', viewableItems.map(v=> ({ index: v.index, key: v.key }))); 
        setSelectedIndex(idx);
      }
    }
  });

  const scrollToIndex = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setSelectedIndex(index);
    }
  };

  const [cardRotations, setCardRotations] = useState<{[key: string]: Animated.Value}>({});
  const [cardEntranceAnims, setCardEntranceAnims] = useState<{[key: string]: Animated.Value}>({});

  // Initialize rotation values and entrance animations for each card
  React.useEffect(() => {
    const rotations: {[key: string]: Animated.Value} = {};
    const entrances: {[key: string]: Animated.Value} = {};
    boxes.forEach(box => {
      rotations[box.id] = new Animated.Value(0);
      entrances[box.id] = new Animated.Value(0);
    });
    setCardRotations(rotations);
    setCardEntranceAnims(entrances);
    
    // Animate entrance of first card
    if (entrances['1']) {
      Animated.spring(entrances['1'], {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  // Animate card entrance when selectedIndex changes
  useEffect(() => {
    const currentCardId = boxes[selectedIndex]?.id;
    if (currentCardId && cardEntranceAnims[currentCardId]) {
      Animated.spring(cardEntranceAnims[currentCardId], {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, cardEntranceAnims]);

  // Animated values for nav dots - initialize once so they're available on first render
  const dotAnimsRef = useRef<Animated.Value[]>(boxes.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)));

  // animate dots when selectedIndex changes
  useEffect(() => {
    if (!dotAnimsRef.current || !dotAnimsRef.current.length) return;
    const animations = dotAnimsRef.current.map((av, i) =>
      Animated.timing(av, {
        toValue: i === selectedIndex ? 1 : 0,
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }, [selectedIndex]);

  const toggleCardFlip = (cardId: string) => {
    const rotation = cardRotations[cardId];
    if (rotation) {
      const toValue = flippedCards[cardId] ? 0 : 180;
      Animated.spring(rotation, {
        toValue,
        friction: 9,
        tension: 20,
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
      <Animated.FlatList
        ref={flatListRef}
        data={boxes}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={_onMomentumScrollEnd}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { 
            useNativeDriver: true,
            listener: (e: any) => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / screenWidth);
              if (typeof idx === 'number' && idx !== selectedIndex) {
                setSelectedIndex(idx);
              }
            }
          }
        )}
        scrollEventThrottle={16}
        keyExtractor={(item: BoxItem) => item.id}
        renderItem={({ item, index }: { item: BoxItem, index: number }) => {
          // Parallax y animaciones basadas en el scroll
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          // Animación de escala para la card
          const cardScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp',
          });

          // Animación de opacidad
          const cardOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          // Parallax para el fondo
          const parallaxBg = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, -50],
            extrapolate: 'clamp',
          });

          // Rotación sutil en Y para efecto 3D
          const rotateY = scrollX.interpolate({
            inputRange,
            outputRange: ['15deg', '0deg', '-15deg'],
            extrapolate: 'clamp',
          });

          // Blur effect
          const blurOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 0.2, 0.6],
            extrapolate: 'clamp',
          });

          // Entrance animation
          const entranceAnim = cardEntranceAnims[item.id] || new Animated.Value(1);
          const entranceScale = entranceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          });
          const entranceOpacity = entranceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });
          const entranceTranslateY = entranceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          });

          return (
            <Animated.View
              style={{
                width: screenWidth,
                height: screenHeight,
                transform: [{ scale: cardScale }, { perspective: 1000 }],
                opacity: cardOpacity,
              }}
            >
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

                {/* Background GIF with Parallax */}
                <AnimatedView
                  style={[
                    styles.bg,
                    {
                      transform: [{ translateX: parallaxBg }],
                    },
                  ]}
                >
                  <Image
                    source={item.wallpaper}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    onError={() => console.log('Error loading wallpaper:', item.wallpaper)}
                  />
                </AnimatedView>
                
                {/* Blurred background with animated opacity */}
                <AnimatedView
                  style={[
                    styles.blur,
                    {
                      opacity: blurOpacity,
                      transform: [{ translateX: parallaxBg }],
                    },
                  ]}
                >
                  <Image
                    source={item.wallpaper}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </AnimatedView>

                {/* Content Block with 3D rotation */}
                <AnimatedView
                  style={[
                    styles.block,
                    pressedCards[item.id] && styles.blockPressed,
                    {
                      opacity: entranceOpacity,
                      transform: [
                        { perspective: 1000 },
                        { translateY: entranceTranslateY },
                        { scale: entranceScale },
                        { rotateY },
                        {
                          rotateY: cardRotations[item.id]?.interpolate({
                            inputRange: [0, 180],
                            outputRange: ['0deg', '180deg']
                          }) || '0deg'
                        }
                      ]
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
                    {!flippedCards[item.id] ? (
                      // Front side
                      <View style={styles.text}>
                        <Image 
                          source={item.icon} 
                          style={styles.icon} 
                          resizeMode="contain"
                          onError={() => console.log('Error loading icon:', item.icon)}
                        />
                        <AnimatedText style={[styles.title, { opacity: 1 }]}>
                          {item.title}
                        </AnimatedText>
                        <AnimatedText style={[styles.description, { opacity: 0.9 }]}>
                          {item.description}
                        </AnimatedText>
                      </View>
                    ) : (
                      // Back side - rotated to compensate for card flip
                      <AnimatedView style={[styles.text, { transform: [{ rotateY: '180deg' }] }]}>
                        <AnimatedText style={[styles.backTitle, { opacity: 1 }]}>
                          Features
                        </AnimatedText>
                        {item.features.map((feature, index) => (
                          <AnimatedText key={index} style={[styles.feature, { opacity: 0.9 }]}>
                            • {feature}
                          </AnimatedText>
                        ))}
                      </AnimatedView>
                    )}
                  </TouchableOpacityComponent>
                </AnimatedView>
                
                {/* Button outside the flippable card */}
                <GlowButton
                  title="Enter Module"
                  color={item.color}
                  glowColor={item.glowColor}
                  onPress={() => router.push(item.route as any)}
                />
              </ScrollView>
            </Animated.View>
          );
        }}
      />
        {/* Navigation dots for the slider (moved here from index) */}
        <View style={styles.nav}>
          {boxes.map((_, idx) => {
            const anim = dotAnimsRef.current[idx];
            const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
            const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
            const ringScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.35] });
            return (
              <TouchableOpacityComponent
                key={idx}
                onPress={() => scrollToIndex(idx)}
                activeOpacity={0.8}
                style={styles.navDotWrapper}
              >
                <AnimatedView style={[styles.navDotRing, { transform: [{ scale: ringScale }], opacity }]} />
                <AnimatedView
                  style={[
                    styles.navDot,
                    {
                      transform: [{ scale }],
                      opacity,
                    },
                  ]}
                />
              </TouchableOpacityComponent>
            );
          })}
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 140, // Más espacio para el botón y navegación
    minHeight: "100%",
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
    minHeight: 380,
    borderRadius: 10,
    zIndex: 1,
    position: "relative",
    boxSizing: "border-box",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
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
    width: 160,
    height: 160,
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
  nav: {
    width: "100%",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  navDotWrapper: {
    marginHorizontal: 6,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  navDotRing: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.03)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  navDot: {
    width: 12,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 6,
    marginHorizontal: 8,
  },
  navDotActive: {
    width: 16,
    height: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
});
