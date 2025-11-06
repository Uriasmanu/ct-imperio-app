import { useAdminAuth } from '@/hooks/useAdminAuth';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Clock, Home, Megaphone, MessageCircleQuestion, Settings, ShieldCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
        source={require('@/assets/images/icon.png')}
        style={styles.headerImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

// Componente de Drawer personalizado
function CustomDrawerContent(props: any) {
  const { isAdmin, loading } = useAdminAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowAdmin(isAdmin);
    }
  }, [isAdmin, loading]);

  // Filtra as rotas que devem aparecer no drawer
  const filteredRoutes = props.state.routes.filter((route: any) => {
    // Se for a tela adminScreen, só mostra se for admin
    if (route.name === 'adminScreen') {
      return showAdmin;
    }
    // Para outras telas, sempre mostra (exceto as que estão configuradas para não aparecer)
    return route.name !== 'settingsScreen' && 
           route.name !== 'perfilScreen' && 
           route.name !== 'registroScreen';
  });

  return (
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
          source={require('@/assets/images/icon.png')}
          style={styles.drawerHeaderImage}
          resizeMode="cover"
        />
        <View style={styles.drawerHeaderText}>
          <Text style={styles.drawerTitle}>CT Imperio</Text>
          <Text style={styles.drawerSubtitle}>
            {showAdmin ? 'Administrador' : 'Bem-vindo(a)'}
          </Text>
        </View>
      </View>

      {/* Renderiza os itens manualmente */}
      {filteredRoutes.map((route: any, index: number) => {
        const { options } = props.descriptors[route.key];
        const isFocused = props.state.index === index;
        
        // Se for uma tela que não deve aparecer no drawer, não renderiza
        if (options.drawerItemStyle?.display === 'none') {
          return null;
        }

        return (
          <DrawerItem
            key={route.key}
            label={
              typeof options.drawerLabel === 'function'
                ? options.drawerLabel({ focused: isFocused, color: '#FFFFFF' })
                : options.drawerLabel || route.name
            }
            icon={({ color, size }) => {
              if (options.drawerIcon) {
                return options.drawerIcon({ color, size });
              }
              return null;
            }}
            focused={isFocused}
            onPress={() => props.navigation.navigate(route.name)}
            labelStyle={[styles.drawerLabel, { color: '#FFFFFF' }]}
            activeTintColor="#FFFFFF"
            inactiveTintColor="#FFFFFF"
            activeBackgroundColor="#1A1A1A"
            inactiveBackgroundColor="transparent"
          />
        );
      })}

      <View style={{ flex: 1 }} />

      {/* Item de Configurações */}
      <DrawerItem
        label="Configurações"
        icon={({ color, size }) => (
          <Settings size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate('settingsScreen')}
        labelStyle={[styles.drawerLabel, { color: '#FFFFFF' }]}
        activeTintColor="#FFFFFF"
        inactiveTintColor="#FFFFFF"
        activeBackgroundColor="#1A1A1A"
        inactiveBackgroundColor="transparent"
      />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
                drawerInactiveTintColor: '#FFFFFF',
              }}
              drawerContent={(props) => <CustomDrawerContent {...props} />}
            >
              <Drawer.Screen
                name="index"
                options={{
                  drawerLabel: 'Início',
                  title: '',
                  drawerIcon: ({ color, size }) => (
                    <Home size={size} color={color} />
                  ),
                }}
              />
              <Drawer.Screen
                name="aulasScreen"
                options={{
                  drawerLabel: 'Aulas',
                  title: '',
                  drawerIcon: ({ color, size }) => (
                    <Clock size={size} color={color} />
                  ),
                }}
              />
              <Drawer.Screen
                name="faqScreen"
                options={{
                  drawerLabel: 'Dúvidas Frequentes',
                  title: '',
                  drawerIcon: ({ color, size }) => (
                    <MessageCircleQuestion size={size} color={color} />
                  ),
                }}
              />
              <Drawer.Screen
                name="tatameScreen"
                options={{
                  drawerLabel: 'Regras do Tatame',
                  title: '',
                  drawerIcon: ({ color, size }) => (
                    <ShieldCheck size={size} color={color} />
                  ),
                }}
              />
              <Drawer.Screen
                name="avisosScreen"
                options={{
                  drawerLabel: 'Avisos',
                  title: '',
                  drawerIcon: ({ color, size }) => (
                    <Megaphone size={size} color={color} />
                  ),
                }}
              />
              
              {/* Tela Admin - sempre definida, mas só aparece no drawer para admins */}
              <Drawer.Screen
                name="adminScreen"
                options={{
                  drawerLabel: "Painel Admin",
                  title: "Painel Administrativo",
                  drawerIcon: ({ color, size }) => (
                    <ShieldCheck size={size} color={color} />
                  ),
                }}
              />

              {/* Telas que não aparecem no drawer */}
              <Drawer.Screen
                name="settingsScreen"
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { display: 'none' },
                  title: 'Configurações',
                }}
              />
              <Drawer.Screen
                name="perfilScreen"
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { display: 'none' },
                  title: 'Perfil',
                }}
              />
              <Drawer.Screen
                name="registroScreen"
                options={{
                  drawerLabel: () => null,
                  drawerItemStyle: { display: 'none' },
                  title: 'Registro',
                }}
              />
            </Drawer>
          </View>

          <SafeAreaView edges={["bottom"]} style={styles.bottomArea}>
            {/* <AdBannerMock /> <AdBanner forceRealAds={true} /> */}
          </SafeAreaView>
        </View>
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