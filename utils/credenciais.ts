
import * as SecureStore from 'expo-secure-store';

const CREDENCIAIS_SECURAS_KEY = 'academia_credenciais';

export async function salvarCredenciaisSeguras(email: string, senha: string) {
  await SecureStore.setItemAsync(
    CREDENCIAIS_SECURAS_KEY,
    JSON.stringify({ email, senha })
  );
}

export async function removerCredenciaisSeguras() {
  await SecureStore.deleteItemAsync(CREDENCIAIS_SECURAS_KEY);
}
