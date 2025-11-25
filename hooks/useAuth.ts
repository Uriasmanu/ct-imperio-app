// src/hooks/useUsuario.ts
import { auth, db } from '@/config/firebaseConfig';
import { Filho, ModalidadeAluno, Usuario } from '@/types/usuarios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

const USUARIO_CACHE_KEY = '@academia:usuario_cache';
const LOGOUT_BY_USER_KEY = '@academia:logout_manual';
const CREDENCIAIS_SECURAS_KEY = 'academia_credenciais';

export async function salvarCredenciaisSeguras(email: string, senha: string) {
  try {
    await SecureStore.setItemAsync(
      CREDENCIAIS_SECURAS_KEY,
      JSON.stringify({ email, senha })
    );
    
  } catch (error) {
    console.error('❌ Erro ao salvar credenciais seguras:', error);
  }
}

export async function pegarCredenciaisSeguras() {
  try {
    const data = await SecureStore.getItemAsync(CREDENCIAIS_SECURAS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Erro ao pegar credenciais seguras:', error);
    return null;
  }
}

export async function removerCredenciaisSeguras() {
  try {
    await SecureStore.deleteItemAsync(CREDENCIAIS_SECURAS_KEY);
    
  } catch (error) {
    console.error('❌ Erro ao remover credenciais seguras:', error);
  }
}

export async function setLogoutByUserFlag(value: boolean) {
  try {
    await AsyncStorage.setItem(LOGOUT_BY_USER_KEY, JSON.stringify(value));
  } catch (err) {
    console.error('❌ Erro ao setar flag de logout:', err);
  }
}

export async function getLogoutByUserFlag() {
  try {
    const flag = await AsyncStorage.getItem(LOGOUT_BY_USER_KEY);
    return flag ? JSON.parse(flag) : false;
  } catch (err) {
    console.error('❌ Erro ao ler flag de logout:', err);
    return false;
  }
}

export const useAuth = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);
  const [estaOnline, setEstaOnline] = useState(true);

  // Carregar usuário do cache local
  const carregarUsuarioDoCache = async (): Promise<Usuario | null> => {
    try {
      const cache = await AsyncStorage.getItem(USUARIO_CACHE_KEY);
      if (cache) {
        const cacheData = JSON.parse(cache);
        const umDiaEmMs = 24 * 60 * 60 * 1000;
        const agora = Date.now();
        if (agora - cacheData.timestamp < umDiaEmMs) {
          
          return cacheData.usuario;
        } else {
          
          await AsyncStorage.removeItem(USUARIO_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cache:', error);
    }
    return null;
  };

  // Salvar usuário no cache local
  const salvarUsuarioNoCache = async (usuarioData: Usuario) => {
    try {
      const cacheData = {
        usuario: usuarioData,
        timestamp: Date.now(),
        atualizacao: atualizacao
      };
      await AsyncStorage.setItem(USUARIO_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
    }
  };

  // Migração de campos (mantida)
  const migrarModalidadeUnicaParaArray = async (userData: any, userRef: any) => {
    if (userData.modalidade && !userData.modalidades) {
      const modalidadeUnica: ModalidadeAluno = {
        modalidade: userData.modalidade,
        graduacao: userData.graduacao,
        dataInicio: userData.dataDeRegistro,
        ativo: true
      };
      userData.modalidades = [modalidadeUnica];
      try {
        await updateDoc(userRef, { modalidades: [modalidadeUnica] });
      } catch (err) {
        console.error('❌ Erro ao migrar modalidade:', err);
      }
    }
    if (!userData.modalidades) userData.modalidades = [];
  };

  // Carrega dados do Firestore e do cache
  const carregarUsuario = useCallback(async (forcarAtualizacao: boolean = false) => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        // Tenta carregar do Firebase
        const userRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const userData = snap.data() as any;
          await migrarModalidadeUnicaParaArray(userData, userRef);
          const usuarioAtualizado = userData as Usuario;

          setUsuario(usuarioAtualizado);
          setEstaOnline(true);
          await salvarUsuarioNoCache(usuarioAtualizado);

        } else {
          console.warn('Usuário não encontrado no Firebase');
        }
      } else {
        // Offline → carrega do cache
        const usuarioCache = await carregarUsuarioDoCache();
        if (usuarioCache) {
          setUsuario(usuarioCache);
          setEstaOnline(false);
          
        } else {
          Alert.alert("Sem conexão", "Você está offline e não há dados salvos localmente.");
        }
      }
    } catch (error) {
      console.error("❌ Erro geral ao carregar usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [atualizacao]);


  // Verifica pagamentos filhos (mantida)
  const verificarPagamentosFilhos = useCallback(async (usuarioParam: Usuario | null) => {
    if (!usuarioParam?.id || !usuarioParam.filhos) return;
    const hoje = new Date();
    let atualizou = false;

    const filhosAtualizados = usuarioParam.filhos.map(filho => {
      if (!filho.dataUltimoPagamento) return filho;
      const ultimaData = new Date(filho.dataUltimoPagamento);
      const diffDias = Math.floor((hoje.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias >= 30 && filho.pagamento) {
        atualizou = true;
        return { ...filho, pagamento: false };
      }
      return filho;
    });

    if (atualizou) {
      try {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          const userRef = doc(db, "usuarios", usuarioParam.id);
          await updateDoc(userRef, { filhos: filhosAtualizados });
          
        } else {
          
        }
        const usuarioAtualizado = { ...usuarioParam, filhos: filhosAtualizados };
        setUsuario(usuarioAtualizado);
        await salvarUsuarioNoCache(usuarioAtualizado);
        
      } catch (error) {
        console.error("❌ Erro ao atualizar pagamentos:", error);
      }
    }
  }, []);

  // Adicionar/editar filho (mantidas)
  const adicionarFilho = useCallback(async (filhoData: Omit<Filho, 'id'>) => {
    if (!usuario?.id) return false;
    try {
      const filhoCompleto: Filho = { ...filhoData, id: Date.now().toString() };
      const novosFilhos = [...(usuario.filhos || []), filhoCompleto];
      const usuarioAtualizado = { ...usuario, filhos: novosFilhos };

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        const userRef = doc(db, "usuarios", usuario.id);
        await updateDoc(userRef, { filhos: novosFilhos });
        
      } else {
        
      }

      setUsuario(usuarioAtualizado);
      await salvarUsuarioNoCache(usuarioAtualizado);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar filho:', error);
      return false;
    }
  }, [usuario]);

  const editarFilho = useCallback(async (filhoEditado: Filho) => {
    if (!usuario?.id) return false;
    try {
      const novosFilhos = (usuario.filhos || []).map((f) => f.id === filhoEditado.id ? filhoEditado : f);
      const usuarioAtualizado = { ...usuario, filhos: novosFilhos };

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        const userRef = doc(db, "usuarios", usuario.id);
        await updateDoc(userRef, { filhos: novosFilhos });
        
      } else {
        
      }

      setUsuario(usuarioAtualizado);
      await salvarUsuarioNoCache(usuarioAtualizado);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao editar filho:', error);
      return false;
    }
  }, [usuario]);

  // Ouve mudanças de autenticação (ÚNICO lugar do projeto)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Se tiver flag de logout manual antiga, limpa e reseta
      const logoutManual = await getLogoutByUserFlag();
      if (logoutManual) {
        
        await setLogoutByUserFlag(false);
      }

      // Tenta login automático se houver credenciais (apenas ao iniciar)
      const cred = await pegarCredenciaisSeguras();
      if (cred && mounted) {
        try {
          const { email, senha } = cred;
          await signInWithEmailAndPassword(auth, email, senha);
        } catch (err) {
          console.warn('❌ Falha no login automático ao iniciar:', err);
        }
      }
    };

    init();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      if (user) {
        // Quando existe user, carregamos dados do Firestore/cache
        await carregarUsuario();
      } else {
        // Sem user, limpa estado local e cache (mas não remove credenciais automaticamente)
        setUsuario(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [carregarUsuario]);

  // NetInfo listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setEstaOnline(online);
    });
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarUsuario(true);
  }, [carregarUsuario]);

  const handlePagamentoAtualizado = useCallback(() => {
    setAtualizacao(prev => prev + 1);
  }, []);

  const atualizarUsuario = useCallback(async (novoUsuario: Usuario | null) => {
    setUsuario(novoUsuario);
    if (novoUsuario) await salvarUsuarioNoCache(novoUsuario);
  }, []);

  // Logout manual (mantido — marca flag e remove credenciais)
  const logout = useCallback(async () => {
    try {
      await setLogoutByUserFlag(true);
      await removerCredenciaisSeguras();
      await AsyncStorage.removeItem(USUARIO_CACHE_KEY);
      await signOut(auth);
      setUsuario(null);
      
    } catch (err) {
      console.error('❌ Erro no logout:', err);
    }
  }, []);

    const forcarAtualizacao = useCallback(() => {
    setAtualizacao(prev => prev + 1);
  }, []);


  return {
    usuario,
    setUsuario: atualizarUsuario,
    loading,
    refreshing,
    carregarUsuario,
    onRefresh,
    handlePagamentoAtualizado: forcarAtualizacao,
    verificarPagamentosFilhos,
    setLoading,
    estaOnline,
    adicionarFilho,
    editarFilho,
    logout,
    forcarAtualizacao,
  };
};
