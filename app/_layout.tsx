import { NotificationProvider } from '@/context/NotificationContext';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Home, Settings } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Componente separado para o HeaderLeft com a imagem
function HeaderLeftWithImage({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.headerImageContainer}
      onPress={onPress}
    >
      <Image
        source={require('@/assets/imagens/icon.png')}
        style={styles.headerImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

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
                  drawerLabelStyle: {
                    fontSize: 16,
                    color: '#FFFFFF',
                    fontWeight: '500'
                  },
                  drawerStyle: {
                    backgroundColor: '#000000',
                    width: 280,
                  },
                  headerStyle: {
                    backgroundColor: '#000000',
                  },
                  headerTintColor: '#FFFFFF',
                  headerTitleStyle: {
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                  },
                  drawerActiveBackgroundColor: '#1A1A1A',
                  drawerActiveTintColor: '#FFFFFF',
                  drawerInactiveTintColor: '#CCCCCC',
                }}
                drawerContent={(props) => (
                  <DrawerContentScrollView
                    {...props}
                    contentContainerStyle={{
                      flex: 1,
                      backgroundColor: '#000000',
                    }}
                  >
                    {/* Header do Drawer */}
                    <View style={styles.drawerHeader}>
                      <Image
                        source={require('@/assets/imagens/icon.png')}
                        style={styles.drawerHeaderImage}
                        resizeMode="cover"
                      />
                      <View style={styles.drawerHeaderText}>
                        <Text style={styles.drawerTitle}>CT Imperio</Text>
                        <Text style={styles.drawerSubtitle}>Bem-vindo(a)</Text>
                      </View>
                    </View>

                    {/* Lista de itens */}
                    <DrawerItemList {...props} />

                    <View style={{ flex: 1 }} />

                    {/* Item de Configurações */}
                    <DrawerItem
                      label="Configurações"
                      icon={({ color, size }) => (
                        <Settings size={size} color='#fff' />
                      )}
                      onPress={() => props.navigation.navigate('SettingsScreen')}
                      labelStyle={styles.drawerLabel}
                    />
                  </DrawerContentScrollView>
                )}
              >
                <Drawer.Screen
                  name="IndexScreen"
                  options={({ navigation }) => ({
                    drawerLabel: 'Início',
                    title: '',
                    drawerIcon: ({ color, size }) => (
                      <Home size={size} color={color} />
                    ),
                    // ✅ CORRETO: Agora recebe navigation como parâmetro
                    headerLeft: () => (
                      <HeaderLeftWithImage 
                        onPress={() => navigation.openDrawer()} 
                      />
                    ),
                  })}
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

            <SafeAreaView edges={["bottom"]} style={styles.bottomArea}>
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
    backgroundColor: '#000000',
  },
  drawerContainer: {
    flex: 1,
  },
  headerImageContainer: {
    marginLeft: 15,
    padding: 4,
  },
  headerImage: {
    width: 65,
    height: 65,
    borderRadius: 18,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerHeaderImage: {
    width: 80,
    height: 80,
    borderRadius: 25,
    marginRight: 15,
  },
  drawerHeaderText: {
    flex: 1,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  drawerLabel: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomArea: {
    backgroundColor: '#000000',
  },
});