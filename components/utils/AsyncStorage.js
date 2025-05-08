import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error setting item:", error);
  }
};

export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
    //!= null ? JSON.parse(value) : null
  } catch (error) {
    console.error("Error getting item:", error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing item:", error);
  }
};

export const mergeItem = async (key, value) => {
  try {
    await AsyncStorage.mergeItem(key, value);
  } catch (error) {
    console.error("Error merging item:", error);
  }
};

export const clear = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
};

export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error("Error getting all keys:", error);
    return [];
  }
};

export const getAllItems = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    return items.reduce((accumulator, [key, value]) => {
      accumulator[key] = JSON.parse(value);
      return accumulator;
    }, {});
  } catch (error) {
    console.error("Error getting all items:", error);
    return {};
  }
};

/**
 * Store a JavaScript object under the given key.
 *
 * @param {string} key
 * @param {Object} object
 */
export const setObject = async (key, object) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error("Error setting object:", error);
  }
};

/**
 * Retrieve a JavaScript object previously stored with setObject.
 *
 * @param {string} key
 * @returns {Object|null} the parsed object, or null if none/failure
 */
export const getObject = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error getting object:", error);
    return null;
  }
};
