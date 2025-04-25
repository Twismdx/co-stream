import * as React from 'react';
import { Button, Text } from 'react-native'
import { Drawer } from 'react-native-drawer-layout';
import { useGlobalContext } from './timer/context';

export default function Draw() {
    const { user, setDrawerOpen, drawerOpen } = useGlobalContext()
  
    return (
      <Drawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        drawerType='front'
        renderDrawerContent={() => {
          return <Text>Drawer content</Text>;
        }}
      >
        <Button
          onPress={() => setDrawerOpen((prevOpen) => !prevOpen)}
          title={`${drawerOpen ? 'Close' : 'Open'} drawer`}
        />
      </Drawer>
    );
  }