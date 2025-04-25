import React, { useContext } from "react"
import { View, Text } from "react-native"
import FeaturedCardComponent from "../cards/FeaturedCardComponent"



const images = [
  require("../../images//poolstat-logo.png"),
  require("../../images//poolstat-logo.png"),
  require("../../images//poolstat-logo.png"),
  require("../../images//poolstat-logo.png"),
]

const FeaturedItemsSection = () => {
  const { theme } = useGlobalContext()
  let activeColors = theme.colors[theme.mode]

  return (
    <View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          paddingHorizontal: 10,
          marginTop: 20,
          marginBottom: 15,
          color: activeColors.text,
        }}
      >

      </Text>
      <View style={{ flexDirection: "column", paddingHorizontal: 10 }}>
        {[...Array(2)].map((_, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: '100%',
              height: '100%',
              flex: 1
            }}
          >
            {[...Array(2)].map((_, colIndex) => (
              <FeaturedCardComponent
                // style={{ padding: 15 }}
                key={colIndex}
                // imageSource={images[rowIndex * 2 + colIndex]}
                // title={`Featured Item ${rowIndex * 2 + colIndex + 1}`}
                description="This is a sample description for the featured item."
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default FeaturedItemsSection
