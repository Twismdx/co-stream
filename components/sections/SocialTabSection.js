import React, { useRef, useState, useContext } from "react"
import { View, ScrollView, Dimensions, StyleSheet, RefreshControl } from "react-native"
import CategoryCard from "../cards/CategoryTabCard"
import { useGlobalContext } from '../timer/context'

const SocialTabSection = () => {
  const { user, theme } = useGlobalContext()
  const activeColors = theme.colors[theme.mode]
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = () => {
    setRefreshing(true)

    // Fetch new data here and update your state

    // After fetching the data, set refreshing to false
    setRefreshing(false)
  }

  const categoriesScrollViewRef = useRef(null)
  const [selectedCategory, setSelectedCategory] = useState("Profile")

  const categoryPositions = useRef([]) // To store the position and width of each category

  const handleCategoryPress = (category, index) => {
    setSelectedCategory(category)

    const screenWidth = Dimensions.get('window').width

    // Get the x-position and width of the clicked category
    const { x: categoryX, width: categoryWidth } = categoryPositions.current[index]

    // Calculate where to scroll to center the selected category
    const scrollToX = categoryX - (screenWidth / 2) + (categoryWidth / 2)

    categoriesScrollViewRef.current.scrollTo({
      x: scrollToX,
      animated: true,
    })
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[
        {
          backgroundColor: activeColors.primary,
        },
        styles.Container,
      ]}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ flexGrow: 1 }}>
        <ScrollView>
          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              paddingHorizontal: 10,
            }}
          ></View>
          <View style={{
            backgroundColor: activeColors.primary
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={categoriesScrollViewRef}
            >
              {['Search', 'Profile', 'FriendsList', 'Chats', 'My Match History'].map((category, index) => (
                <View
                  key={category}
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout
                    categoryPositions.current[index] = { x, width } // Store x position and width of each category
                  }}
                >
                  <CategoryCard
                    title={category}
                    onPress={() => handleCategoryPress(category, index)}
                    isActive={category === selectedCategory}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 25,
    marginLeft: 25,
    marginBottom: 25,
  },
})

export default SocialTabSection
