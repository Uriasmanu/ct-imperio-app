import { StyleSheet, Text, View } from 'react-native';


export default function IndexScreen() {
  return (
    <View>
     <Text>Index</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
