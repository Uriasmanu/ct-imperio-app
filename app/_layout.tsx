import { NotificationProvider } from '@/context/NotificationContext';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Settings } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NotificationProvider>
          <View style={styles.container}>
            <View style={styles.drawerContainer}>
              <Drawer
                screenOptions={{
                  headerShown: true,
                  drawerLabelStyle: { fontSize: 16 },
                }}
                drawerContent={(props) => (
                  <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
                    <View style={{ padding: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: "bold" }}>Menu</Text>
                    </View>
                    <DrawerItemList {...props} />

                    <View style={{ flex: 1 }} />

                    <DrawerItem
                      label="Configurações"
                      icon={() => <Settings />}
                      onPress={() => props.navigation.navigate('SettingsScreen')}
                    />
                  </DrawerContentScrollView>
                )}
              >
                <Drawer.Screen
                  name="IndexScreen"
                  options={{
                    drawerLabel: 'Início',
                    title: '',
                  }}
                />

                <Drawer.Screen
                  name="SettingsScreen"
                  options={{
                    drawerLabel: () => null,
                    drawerItemStyle: { display: 'none' },
                    title: 'Configurações',
                  }}
                />
              </Drawer>
            </View>

            <SafeAreaView edges={["bottom"]}>
              {/* <AdBannerMock /> <AdBanner forceRealAds={true} /> */}
            </SafeAreaView>
          </View>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
  },
});
