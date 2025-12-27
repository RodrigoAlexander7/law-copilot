import React, { useState, useRef, useEffect } from "react";
import {
  View as RNView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView as RNScrollView,
  Animated,
} from "react-native";
import { MotiView } from "moti";

const View = RNView as any;
const Text = RNText as any;
const TextInput = RNTextInput as any;
const ScrollView = RNScrollView as any;

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (tags: string[]) => void;
  availableTags: string[];
}

export default function SearchBar({
  onSearch,
  onFilterChange,
  availableTags,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate border on focus
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    // Pulse animation when there are selected tags
    if (selectedTags.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [selectedTags.length]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 107, 107, 0.3)", "rgba(255, 107, 107, 0.8)"],
  });

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange(newTags);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            borderColor: borderColor,
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name, specialty, or tags..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchQuery.length > 0 && (
          <MotiView
            from={{ scale: 0, rotate: "0deg" }}
            animate={{ scale: 1, rotate: "360deg" }}
            transition={{ type: "spring" }}
          >
            <TouchableOpacity
              onPress={() => handleSearch("")}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </Animated.View>

      {/* Filter Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsScrollView}
        contentContainerStyle={styles.tagsContainer}
      >
        {availableTags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <MotiView
              key={tag}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "spring",
                delay: index * 50,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.filterTag,
                  isSelected && styles.filterTagSelected,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.filterTagText,
                    isSelected && styles.filterTagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>

      {/* Active filters indicator */}
      {selectedTags.length > 0 && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.activeFiltersContainer}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.activeFiltersText}>
              {selectedTags.length} filter{selectedTags.length > 1 ? "s" : ""}{" "}
              active
            </Text>
          </Animated.View>
          <TouchableOpacity
            onPress={() => {
              setSelectedTags([]);
              onFilterChange([]);
            }}
          >
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 30, 0.8)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.5)",
  },
  tagsScrollView: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  filterTagSelected: {
    backgroundColor: "rgba(255, 107, 107, 0.3)",
    borderColor: "#ff6b6b",
  },
  filterTagText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTagTextSelected: {
    color: "#ffffff",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  activeFiltersText: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "600",
  },
  clearFiltersText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
