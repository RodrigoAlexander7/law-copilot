import React, { useState } from "react";
import {
  View as RNView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView as RNScrollView,
} from "react-native";

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
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name, specialty, or tags..."
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearch("")}
            style={styles.clearButton}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

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
            <TouchableOpacity
              key={index}
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
          );
        })}
      </ScrollView>

      {/* Active filters indicator */}
      {selectedTags.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {selectedTags.length} filter{selectedTags.length > 1 ? "s" : ""} active
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedTags([]);
              onFilterChange([]);
            }}
          >
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
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
