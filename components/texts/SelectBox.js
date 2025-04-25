import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, LogBox } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../CustomButton';
import { useGlobalContext } from '../timer/context';

const STORAGE_KEY = '@selectedSource';
const DEFAULT_WIDTH = 350;

const SelectBox = () => {
  const {
    theme,
    selectedSource,
    setSelectedSource,
    sources,
    setSelectedItem,
  } = useGlobalContext();

  const activeColors = theme.colors[theme.mode];

  const { ref, open, close } = useBottomSheet();

  // Memoize storage operations
  const getSelectedSource = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      return value;
    } catch (error) {
      console.error('Error reading selected source:', error);
      return null;
    }
  }, []);

  const setSrc = useCallback(
    async (value) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, value);
        setSelectedSource(value);
        setSelectedItem(value);
        close();
      } catch (error) {
        console.error('Error saving selected source:', error);
      }
    },
    [setSelectedSource, setSelectedItem, close]
  );

  // Handle initial source loading
  useEffect(() => {
    const checkSelectedSource = async () => {
      const value = await getSelectedSource();
      if (value) {
        setSelectedSource(value);
      }
    };

    checkSelectedSource();
  }, [getSelectedSource, setSelectedSource]);

  // Ignore specific LogBox warnings
  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality - use another VirtualizedList-backed container instead.',
    ]);
  }, []);

  const styles = {
    container: {
      flex: 1,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 50,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: DEFAULT_WIDTH,
    },
    actionText: {
      color: activeColors.onPrimary,
    },
    sheetContent: {
      maxHeight: '75%',
      backgroundColor: activeColors.primary,
    },
    sheetItem: {
      backgroundColor: activeColors.primary,
      padding: 16,
    },
  };

  const renderSheetItem = useCallback(
    ({ id, sourcename }, index) => (
      <TouchableOpacity
        key={index}
        style={styles.sheetItem}
        onPress={() => setSrc(id)}
      >
        <Text style={styles.actionText}>{sourcename}</Text>
      </TouchableOpacity>
    ),
    [setSrc, styles.actionText, styles.sheetItem]
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <CustomButton
          color="white"
          gradientColors={['#BB86FC', '#6200EA']}
          label="Select Data Source"
          onPress={open}
        />
      </View>

        <BottomSheet>
          <BottomSheetContent ref={ref} backgroundStyle={styles.sheetContent}>
            <BottomSheetHeader>
              <Text style={styles.actionText}>Select Data Source</Text>
              <BottomSheetCloseTrigger>
                <Text style={styles.actionText}>Close</Text>
              </BottomSheetCloseTrigger>
            </BottomSheetHeader>
            <BottomSheetView>
              {sources.map(renderSheetItem)}
              <TouchableOpacity style={styles.sheetItem} onPress={close}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </BottomSheetView>
          </BottomSheetContent>
        </BottomSheet>
    </View>
  );
};

export default SelectBox;