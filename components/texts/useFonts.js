import * as Font from "expo-font"

export default useFonts = async () => {
    await Font.loadAsync({
        "semiBold": require('../../assets/fonts/open-sans.semibold.ttf'),
        "extraBold": require('../../assets/fonts/open-sans.extrabold.ttf'),
        "technology": require('../../assets/fonts/Technology.ttf'),
    })
}