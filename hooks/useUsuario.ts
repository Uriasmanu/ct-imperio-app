import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from 'react';
import { Alert } from "react-native";

import { auth, db } from "@/config/firebaseConfig";
import { Filho, ModalidadeAluno, Usuario } from "@/types/usuarios";

// Chave para armazenar no AsyncStorage
const USUARIO_CACHE_KEY = '@academia:usuario_cache';

export const useUsuario = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);
  const [estaOnline, setEstaOnline] = useState(true);

  // Salvar usuário no cache local
  const salvarUsuarioNoCache = async (usuarioData: Usuario) => {
    try {
      const cacheData = {
        usuario: usuarioData,
        timestamp: new Date().getTime(),
        atualizacao: atualizacao
      };
      await AsyncStorage.setItem(USUARIO_CACHE_KEY, JSON.stringify(cacheData));
      console.log('✅ Dados do usuário e filhos salvos no cache');
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
    }
  };

  // Carregar usuário do cache local
  const carregarUsuarioDoCache = async (): Promise<Usuario | null> => {
    try {
      const cache = await AsyncStorage.getItem(USUARIO_CACHE_KEY);
      if (cache) {
        const cacheData = JSON.parse(cache);
        // Verificar se o cache tem menos de 1 dia (24 horas)
        const umDiaEmMs = 24 * 60 * 60 * 1000;
        const agora = new Date().getTime();
        
        if (agora - cacheData.timestamp < umDiaEmMs) {
          console.log('📂 Dados carregados do cache (incluindo filhos)');
          return cacheData.usuario;
        } else {
          // Cache expirado, remover
          console.log('🗑️ Cache expirado, removendo...');
          await AsyncStorage.removeItem(USUARIO_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cache:', error);
    }
    return null;
  };

  const migrarModalidadeUnicaParaArray = async (userData: any, userRef: any) => {
    if (userData.modalidade && !userData.modalidades) {
      const modalidadeUnica: ModalidadeAluno = {
        modalidade: userData.modalidade,
        graduacao: userData.graduacao,
        dataInicio: userData.dataDeRegistro,
        ativo: true
      };
      userData.modalidades = [modalidadeUnica];
      
      await updateDoc(userRef, {
        modalidades: [modalidadeUnica]
      });
    }
    
    if (!userData.modalidades) {
      userData.modalidades = [];
    }
  };

  const carregarUsuario = useCallback(async (forcarAtualizacao: boolean = false) => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Tentar carregar do cache primeiro (se não for forçado)
      let usuarioCache: Usuario | null = null;
      if (!forcarAtualizacao) {
        usuarioCache = await carregarUsuarioDoCache();
      }

      // Se tem cache e não é forçado, usar cache
      if (usuarioCache && !forcarAtualizacao) {
        setUsuario(usuarioCache);
        setEstaOnline(false); // Usando dados offline
      }

      // Sempre tentar buscar da internet para atualizar (se estiver online)
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            const userData = snap.data() as any;
            await migrarModalidadeUnicaParaArray(userData, userRef);
            const usuarioAtualizado = userData as Usuario;
            
            setUsuario(usuarioAtualizado);
            setEstaOnline(true);
            
            // Salvar no cache (INCLUINDO OS FILHOS)
            await salvarUsuarioNoCache(usuarioAtualizado);
            console.log('🌐 Dados atualizados do Firebase e salvos no cache');
          }
        } catch (firebaseError) {
          console.error("❌ Erro ao carregar do Firebase:", firebaseError);
          
          // Se não conseguiu do Firebase e não tem cache, mostrar erro
          if (!usuarioCache) {
            Alert.alert(
              "Erro de conexão", 
              "Não foi possível carregar os dados. Verifique sua conexão com a internet.",
              [{ text: "OK" }]
            );
          } else {
            console.log('📱 Usando dados do cache devido a erro no Firebase');
          }
        }
      } else {
        // Não está online, usar cache se disponível
        if (!usuarioCache) {
          Alert.alert(
            "Sem conexão", 
            "Você está offline e não há dados salvos localmente.",
            [{ text: "OK" }]
          );
        } else {
          console.log('📱 Modo offline - usando dados do cache');
        }
      }

    } catch (error) {
      console.error("❌ Erro geral ao carregar usuário:", error);
      if (!usuario) {
        Alert.alert("Erro", "Não foi possível carregar os dados.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [atualizacao]);

  const verificarPagamentosFilhos = useCallback(async (usuario: Usuario | null) => {
    if (!usuario?.id || !usuario.filhos) return;

    const hoje = new Date();
    let atualizou = false;

    const filhosAtualizados = usuario.filhos.map(filho => {
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
        // Verificar se está online antes de tentar atualizar
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected && netInfo.isInternetReachable) {
          const userRef = doc(db, "usuarios", usuario.id);
          await updateDoc(userRef, { filhos: filhosAtualizados });
          console.log('✅ Pagamentos dos filhos atualizados no Firebase');
        } else {
          console.log('📱 Offline - pagamentos atualizados apenas localmente');
        }
        
        // Atualizar localmente de qualquer forma
        const usuarioAtualizado = { ...usuario, filhos: filhosAtualizados };
        setUsuario(usuarioAtualizado);
        
        // Atualizar cache também (INCLUINDO OS FILHOS ATUALIZADOS)
        await salvarUsuarioNoCache(usuarioAtualizado);
        console.log('💾 Dados dos filhos salvos no cache local');
      } catch (error) {
        console.error("❌ Erro ao atualizar pagamentos:", error);
      }
    }
  }, []);

  // Função para adicionar filho (com cache)
  const adicionarFilho = useCallback(async (filhoData: Omit<Filho, 'id'>) => {
    if (!usuario?.id) return;

    try {
      const filhoCompleto: Filho = {
        ...filhoData,
        id: Date.now().toString(),
      };

      const novosFilhos = [...(usuario.filhos || []), filhoCompleto];
      const usuarioAtualizado = { ...usuario, filhos: novosFilhos };

      // Verificar se está online antes de tentar atualizar no Firebase
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        const userRef = doc(db, "usuarios", usuario.id);
        await updateDoc(userRef, { filhos: novosFilhos });
        console.log('✅ Filho adicionado no Firebase');
      } else {
        console.log('📱 Offline - filho adicionado apenas localmente');
      }

      // Atualizar estado local e cache
      setUsuario(usuarioAtualizado);
      await salvarUsuarioNoCache(usuarioAtualizado);
      console.log('💾 Filho salvo no cache local');

      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar filho:', error);
      return false;
    }
  }, [usuario]);

  // Função para editar filho (com cache)
  const editarFilho = useCallback(async (filhoEditado: Filho) => {
    if (!usuario?.id) return;

    try {
      const novosFilhos = (usuario.filhos || []).map((f) =>
        f.id === filhoEditado.id ? filhoEditado : f
      );
      const usuarioAtualizado = { ...usuario, filhos: novosFilhos };

      // Verificar se está online antes de tentar atualizar no Firebase
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        const userRef = doc(db, "usuarios", usuario.id);
        await updateDoc(userRef, { filhos: novosFilhos });
        console.log('✅ Filho editado no Firebase');
      } else {
        console.log('📱 Offline - filho editado apenas localmente');
      }

      // Atualizar estado local e cache
      setUsuario(usuarioAtualizado);
      await salvarUsuarioNoCache(usuarioAtualizado);
      console.log('💾 Alterações do filho salvas no cache');

      return true;
    } catch (error) {
      console.error('❌ Erro ao editar filho:', error);
      return false;
    }
  }, [usuario]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarUsuario(true); // Forçar atualização no refresh
  }, [carregarUsuario]);

  const handlePagamentoAtualizado = useCallback(() => {
    setAtualizacao(prev => prev + 1);
  }, []);

  const atualizarUsuario = useCallback(async (novoUsuario: Usuario | null) => {
    setUsuario(novoUsuario);
    if (novoUsuario) {
      await salvarUsuarioNoCache(novoUsuario);
    }
  }, []);

  // Verificar status da conexão usando NetInfo
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected !== null &&
        state.isConnected &&
        state.isInternetReachable !== null &&
        state.isInternetReachable;
      
      setEstaOnline(online);
      console.log(online ? '🌐 Online' : '📱 Offline');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await carregarUsuario();
      } else {
        setLoading(false);
        // Limpar cache ao deslogar
        await AsyncStorage.removeItem(USUARIO_CACHE_KEY);
        console.log('🚪 Cache limpo ao deslogar');
      }
    });

    return unsubscribe;
  }, [carregarUsuario, atualizacao]);

  useEffect(() => {
    if (usuario && estaOnline) {
      verificarPagamentosFilhos(usuario);
    }
  }, [usuario, verificarPagamentosFilhos, estaOnline]);

  return {
    usuario,
    setUsuario: atualizarUsuario,
    loading,
    refreshing,
    carregarUsuario,
    onRefresh,
    handlePagamentoAtualizado,
    setLoading,
    estaOnline,
    adicionarFilho, 
    editarFilho     
  };
};