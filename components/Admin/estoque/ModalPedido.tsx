import { ItemEstoque, ItemPedido, Pedido } from "@/types/estoque";
import { Usuario } from "@/types/usuarios";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ModalPedidoProps {
  visible: boolean;
  onClose: () => void;
  onSalvarPedido: (pedido: Omit<Pedido, "id">) => void;
  onAtualizarPedido?: (id: string, pedido: Partial<Pedido>) => void;
  produtos: ItemEstoque[];
  pedidoEditando?: Pedido | null;
  alunos?: Usuario[];
}

export const ModalPedido: React.FC<ModalPedidoProps> = ({
  visible,
  onClose,
  onSalvarPedido,
  onAtualizarPedido,
  pedidoEditando,
  produtos,
  alunos = [],
}) => {
  const [nomePessoa, setNomePessoa] = useState("");
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [pago, setPago] = useState(false);
  const [status, setStatus] = useState<
    "pendente" | "reservado" | "pago" | "entregue"
  >("pendente");
  const [mostrarListaAlunos, setMostrarListaAlunos] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Usuario | null>(
    null,
  );
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [buscaAluno, setBuscaAluno] = useState("");

  const [modalTamanhoVisivel, setModalTamanhoVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ItemEstoque | null>(null);

  useEffect(() => {
    if (pedidoEditando) {
      const pessoa = pedidoEditando.pessoa || "";
      setNomePessoa(pessoa);
      setItensPedido(pedidoEditando.itens);
      setObservacoes(pedidoEditando.observacoes || "");
      setStatus(pedidoEditando.status);
      setPago(pedidoEditando.pago);
      setUsuarioId(pedidoEditando.usuarioId || "");

      if (alunos.length > 0 && pessoa) {
        const alunoEncontrado = alunos.find((aluno) => {
          if (!aluno || !aluno.nome) return false;
          return aluno.nome.toLowerCase() === pessoa.toLowerCase();
        });

        if (alunoEncontrado) {
          setAlunoSelecionado(alunoEncontrado);
        } else {
          setAlunoSelecionado(null);
        }
      } else {
        setAlunoSelecionado(null);
      }
    } else {
      setNomePessoa("");
      setItensPedido([]);
      setObservacoes("");
      setStatus("pendente");
      setAlunoSelecionado(null);
      setUsuarioId("");
    }
  }, [pedidoEditando, visible, alunos]);

  const alunosFiltrados =
    buscaAluno.trim() === ""
      ? alunos
      : alunos.filter((aluno) =>
          aluno.nome.toLowerCase().includes(buscaAluno.toLowerCase()),
        );

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleClickProduto = (produto: ItemEstoque) => {
    if (Object.keys(produto.tamanhos).length > 0) {
      setProdutoSelecionado(produto);
      setModalTamanhoVisivel(true);
    } else {
      adicionarItem(produto);
    }
  };

  const adicionarItem = (produto: ItemEstoque) => {
    if (pedidoEditando) {
      const itemExistenteNoPedido = itensPedido.find(
        (item) => item.itemId === produto.id && !item.tamanho,
      );
      const quantidadeNoPedido = itemExistenteNoPedido
        ? itemExistenteNoPedido.quantidade
        : 0;

      const estoqueDisponivel = produto.quantidade + quantidadeNoPedido;

      if (estoqueDisponivel === 0) {
        Alert.alert("Estoque Insuficiente", "Este produto está sem estoque.");
        return;
      }

      const itemExistente = itensPedido.find(
        (item) => item.itemId === produto.id && item.tamanho === undefined,
      );

      if (itemExistente) {
        const quantidadeTotal = itemExistente.quantidade + 1;
        if (quantidadeTotal > estoqueDisponivel) {
          Alert.alert(
            "Estoque Insuficiente",
            `Só há ${estoqueDisponivel} unidades disponíveis.`,
          );
          return;
        }

        const novosItens = itensPedido.map((item) =>
          item.itemId === produto.id && item.tamanho === undefined
            ? {
                ...item,
                quantidade: quantidadeTotal,
                subtotal: quantidadeTotal * item.precoUnitario,
              }
            : item,
        );
        setItensPedido(novosItens);
      } else {
        const novoItem: ItemPedido = {
          itemId: produto.id,
          nome: produto.nome,
          quantidade: 1,
          precoUnitario: produto.preco,
          subtotal: produto.preco,
        };
        setItensPedido([...itensPedido, novoItem]);
      }
    } else {
      if (produto.quantidade === 0) {
        Alert.alert("Estoque Insuficiente", "Este produto está sem estoque.");
        return;
      }

      const itemExistente = itensPedido.find(
        (item) => item.itemId === produto.id && item.tamanho === undefined,
      );

      if (itemExistente) {
        const quantidadeTotal = itemExistente.quantidade + 1;
        if (quantidadeTotal > produto.quantidade) {
          Alert.alert(
            "Estoque Insuficiente",
            `Só há ${produto.quantidade} unidades disponíveis.`,
          );
          return;
        }

        const novosItens = itensPedido.map((item) =>
          item.itemId === produto.id && item.tamanho === undefined
            ? {
                ...item,
                quantidade: quantidadeTotal,
                subtotal: quantidadeTotal * item.precoUnitario,
              }
            : item,
        );
        setItensPedido(novosItens);
      } else {
        const novoItem: ItemPedido = {
          itemId: produto.id,
          nome: produto.nome,
          quantidade: 1,
          precoUnitario: produto.preco,
          subtotal: produto.preco,
        };
        setItensPedido([...itensPedido, novoItem]);
      }
    }
  };

  const adicionarItemComTamanho = (produto: ItemEstoque, tamanho: string) => {
    const estoqueTamanho = produto.tamanhos[tamanho] || 0;

    if (pedidoEditando) {
      const itemExistenteNoPedido = itensPedido.find(
        (item) => item.itemId === produto.id && item.tamanho === tamanho,
      );
      const quantidadeNoPedido = itemExistenteNoPedido
        ? itemExistenteNoPedido.quantidade
        : 0;

      const estoqueDisponivel = estoqueTamanho + quantidadeNoPedido;

      if (estoqueDisponivel === 0) {
        Alert.alert(
          "Estoque Insuficiente",
          `Não há estoque disponível para o tamanho ${tamanho}.`,
        );
        return;
      }

      const itemExistente = itensPedido.find(
        (item) => item.itemId === produto.id && item.tamanho === tamanho,
      );

      if (itemExistente) {
        const quantidadeTotal = itemExistente.quantidade + 1;
        if (quantidadeTotal > estoqueDisponivel) {
          Alert.alert(
            "Estoque Insuficiente",
            `Só há ${estoqueDisponivel} unidades disponíveis no tamanho ${tamanho}.`,
          );
          return;
        }

        const novosItens = itensPedido.map((item) =>
          item.itemId === produto.id && item.tamanho === tamanho
            ? {
                ...item,
                quantidade: quantidadeTotal,
                subtotal: quantidadeTotal * item.precoUnitario,
              }
            : item,
        );
        setItensPedido(novosItens);
      } else {
        const novoItem: ItemPedido = {
          itemId: produto.id,
          nome: produto.nome,
          quantidade: 1,
          tamanho: tamanho,
          precoUnitario: produto.preco,
          subtotal: produto.preco,
        };
        setItensPedido([...itensPedido, novoItem]);
      }
    } else {
      if (estoqueTamanho === 0) {
        Alert.alert(
          "Estoque Insuficiente",
          `Não há estoque disponível para o tamanho ${tamanho}.`,
        );
        return;
      }

      const itemExistente = itensPedido.find(
        (item) => item.itemId === produto.id && item.tamanho === tamanho,
      );

      if (itemExistente) {
        const quantidadeTotal = itemExistente.quantidade + 1;
        if (quantidadeTotal > estoqueTamanho) {
          Alert.alert(
            "Estoque Insuficiente",
            `Só há ${estoqueTamanho} unidades disponíveis no tamanho ${tamanho}.`,
          );
          return;
        }

        const novosItens = itensPedido.map((item) =>
          item.itemId === produto.id && item.tamanho === tamanho
            ? {
                ...item,
                quantidade: quantidadeTotal,
                subtotal: quantidadeTotal * item.precoUnitario,
              }
            : item,
        );
        setItensPedido(novosItens);
      } else {
        const novoItem: ItemPedido = {
          itemId: produto.id,
          nome: produto.nome,
          quantidade: 1,
          tamanho: tamanho,
          precoUnitario: produto.preco,
          subtotal: produto.preco,
        };
        setItensPedido([...itensPedido, novoItem]);
      }
    }

    setModalTamanhoVisivel(false);
    setProdutoSelecionado(null);
  };

  const removerItem = (index: number) => {
    const novosItens = itensPedido.filter((_, i) => i !== index);
    setItensPedido(novosItens);
  };

  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade < 1) {
      removerItem(index);
      return;
    }

    const item = itensPedido[index];
    const produto = produtos.find((p) => p.id === item.itemId);

    if (!produto) return;

    let estoqueDisponivel = produto.quantidade;
    if (item.tamanho) {
      estoqueDisponivel = produto.tamanhos[item.tamanho] || 0;
    }

    if (pedidoEditando) {
      const outrosItensMesmoProduto = itensPedido.filter(
        (itemFiltro, i) =>
          i !== index &&
          itemFiltro.itemId === item.itemId &&
          itemFiltro.tamanho === item.tamanho,
      );

      const quantidadeOutrosItens = outrosItensMesmoProduto.reduce(
        (total, itemFiltro) => total + itemFiltro.quantidade,
        0,
      );

      estoqueDisponivel += quantidadeOutrosItens;
    }

    if (novaQuantidade > estoqueDisponivel) {
      Alert.alert(
        "Estoque Insuficiente",
        `Só há ${estoqueDisponivel} unidades disponíveis.`,
      );
      return;
    }

    const novosItens = itensPedido.map((item, i) =>
      i === index
        ? {
            ...item,
            quantidade: novaQuantidade,
            subtotal: novaQuantidade * item.precoUnitario,
          }
        : item,
    );
    setItensPedido(novosItens);
  };

  const selecionarAluno = (aluno: Usuario) => {
    setAlunoSelecionado(aluno);
    setNomePessoa(aluno.nome);
    setUsuarioId(aluno.id);
    setMostrarListaAlunos(false);
    setBuscaAluno("");
  };

  const limparSelecaoAluno = () => {
    setAlunoSelecionado(null);
    setNomePessoa("");
    setUsuarioId("");
  };

  const handleSalvar = () => {
    let pessoaFinal = nomePessoa.trim();

    if (!pessoaFinal) {
      Alert.alert(
        "Erro",
        "Por favor, informe o nome da pessoa ou selecione um aluno",
      );
      return;
    }

    if (itensPedido.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos um item ao pedido");
      return;
    }

    if (alunoSelecionado && alunoSelecionado.nome) {
      pessoaFinal = alunoSelecionado.nome;
    }

    if (pedidoEditando && onAtualizarPedido) {
      const pedidoAtualizado: Partial<Pedido> = {
        pessoa: pessoaFinal,
        usuarioId,
        itens: itensPedido,
        total: calcularTotal(),
        observacoes: observacoes.trim(),
        pago,
        status,
        updatedAt: new Date(),
      };

      onAtualizarPedido(pedidoEditando.id, pedidoAtualizado);
    } else {
      const pedido: Omit<Pedido, "id"> = {
        pessoa: pessoaFinal,
        usuarioId,
        itens: itensPedido,
        data: new Date().toLocaleDateString("pt-BR"),
        dataTimestamp: Date.now(),
        pago: false,
        status: "pendente",
        total: calcularTotal(),
        observacoes: observacoes.trim(),
        createdAt: new Date(),
      };

      onSalvarPedido(pedido);
    }
  };

  const limparFormulario = () => {
    setNomePessoa("");
    setItensPedido([]);
    setObservacoes("");
    setPago(false);
    setAlunoSelecionado(null);
    setBuscaAluno("");
    setUsuarioId("");
  };

  const handleFechar = () => {
    if (itensPedido.length > 0 || nomePessoa.trim() || observacoes.trim()) {
      Alert.alert(
        "Atenção",
        "Tem certeza que deseja fechar? As alterações serão perdidas.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Fechar",
            style: "destructive",
            onPress: () => {
              limparFormulario();
              onClose();
            },
          },
        ],
      );
    } else {
      limparFormulario();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleFechar}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {pedidoEditando ? "Editar Pedido" : "Novo Pedido"}
          </Text>
          <TouchableOpacity onPress={handleFechar} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Cliente</Text>

            <View style={styles.alunoSelectorContainer}>
              <TouchableOpacity
                style={styles.alunoSelectorButton}
                onPress={() => alunos.length > 0 && setMostrarListaAlunos(true)}
                disabled={alunos.length === 0}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={alunos.length === 0 ? "#666" : "#B8860B"}
                />
                <Text
                  style={[
                    styles.alunoSelectorText,
                    alunos.length === 0 && styles.alunoSelectorTextDisabled,
                  ]}
                >
                  {alunos.length === 0
                    ? "Nenhum aluno cadastrado"
                    : alunoSelecionado
                      ? "Aluno selecionado"
                      : "Selecionar aluno da lista"}
                </Text>
                {alunos.length > 0 && (
                  <Ionicons name="chevron-down" size={20} color="#B8860B" />
                )}
              </TouchableOpacity>

              {alunoSelecionado && (
                <View style={styles.alunoSelecionadoContainer}>
                  <View style={styles.alunoSelecionadoInfo}>
                    <Ionicons name="person-circle" size={20} color="#B8860B" />
                    <Text style={styles.alunoSelecionadoNome}>
                      {alunoSelecionado.nome}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={limparSelecaoAluno}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.ouContainer}>
              <View style={styles.ouLinha} />
              <Text style={styles.ouTexto}>OU</Text>
              <View style={styles.ouLinha} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Digite o nome manualmente"
              placeholderTextColor="#666"
              value={nomePessoa}
              onChangeText={(text) => {
                setNomePessoa(text);

                if (alunoSelecionado && text !== alunoSelecionado.nome) {
                  setAlunoSelecionado(null);
                }
              }}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações (opcional)"
              placeholderTextColor="#666"
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.statusContainer}>
              {(["pendente", "pago", "entregue"] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.statusOption,
                    status === item && styles.statusOptionActive,
                  ]}
                  onPress={() => {
                    setStatus(item);
                    setPago(item === "pago" || item === "entregue");
                  }}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === item && styles.statusOptionTextActive,
                    ]}
                  >
                    {item.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Itens do Pedido</Text>
              <Text style={styles.totalText}>
                Total: R$ {calcularTotal().toFixed(2)}
              </Text>
            </View>

            {itensPedido.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nome}</Text>
                  {item.tamanho && (
                    <Text style={styles.itemSize}>Tamanho: {item.tamanho}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    R$ {item.precoUnitario.toFixed(2)} × {item.quantidade} = R${" "}
                    {item.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() =>
                      atualizarQuantidade(index, item.quantidade - 1)
                    }
                    style={styles.quantityButton}
                  >
                    <Ionicons name="remove" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantidade}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      atualizarQuantidade(index, item.quantidade + 1)
                    }
                    style={styles.quantityButton}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removerItem(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {itensPedido.length === 0 && (
              <View style={styles.emptyItems}>
                <Ionicons name="cart-outline" size={48} color="#666" />
                <Text style={styles.emptyItemsText}>
                  Nenhum item adicionado ao pedido
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produtos Disponíveis</Text>
            {produtos.map((produto) => (
              <TouchableOpacity
                key={produto.id}
                style={styles.produtoCard}
                onPress={() => handleClickProduto(produto)}
                disabled={
                  produto.quantidade === 0 &&
                  Object.keys(produto.tamanhos).length === 0
                }
              >
                <View style={styles.produtoInfo}>
                  <Text style={styles.produtoName}>{produto.nome}</Text>
                  <Text style={styles.produtoPrice}>
                    R$ {produto.preco.toFixed(2)}
                  </Text>
                  {Object.keys(produto.tamanhos).length > 0 ? (
                    <Text style={styles.produtoStock}>
                      Toque para selecionar tamanho
                    </Text>
                  ) : (
                    <Text style={styles.produtoStock}>
                      Estoque: {produto.quantidade} unidades
                    </Text>
                  )}
                </View>

                <View style={styles.produtoActions}>
                  <Ionicons
                    name={
                      Object.keys(produto.tamanhos).length > 0
                        ? "resize"
                        : "add-circle"
                    }
                    size={24}
                    color="#B8860B"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (itensPedido.length === 0 || !nomePessoa.trim()) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSalvar}
            disabled={itensPedido.length === 0 || !nomePessoa.trim()}
          >
            <Text style={styles.saveButtonText}>
              {pedidoEditando ? "Salvar Alterações" : "Criar Pedido"}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={mostrarListaAlunos}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setMostrarListaAlunos(false);
            setBuscaAluno("");
          }}
        >
          <View style={styles.modalAlunosContainer}>
            <View style={styles.modalAlunosHeader}>
              <Text style={styles.modalAlunosTitle}>Selecione um Aluno</Text>
              <TouchableOpacity
                onPress={() => {
                  setMostrarListaAlunos(false);
                  setBuscaAluno("");
                }}
                style={styles.modalAlunosCloseButton}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.buscaAlunoContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.buscaAlunoInput}
                placeholder="Buscar aluno..."
                placeholderTextColor="#666"
                value={buscaAluno}
                onChangeText={setBuscaAluno}
                autoFocus
              />
              {buscaAluno ? (
                <TouchableOpacity onPress={() => setBuscaAluno("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView style={styles.modalAlunosLista}>
              {alunosFiltrados.length > 0 ? (
                alunosFiltrados.map((aluno) => (
                  <TouchableOpacity
                    key={aluno.id}
                    style={styles.alunoItem}
                    onPress={() => selecionarAluno(aluno)}
                  >
                    <View style={styles.alunoItemInfo}>
                      <Ionicons
                        name="person-circle"
                        size={24}
                        color="#B8860B"
                      />
                      <View style={styles.alunoItemTextContainer}>
                        <Text style={styles.alunoItemNome}>{aluno.nome}</Text>
                        <Text style={styles.alunoItemInfoExtra}>
                          {aluno.email ||
                            aluno.telefone ||
                            "Sem informações adicionais"}
                        </Text>
                      </View>
                    </View>
                    {alunoSelecionado?.id === aluno.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#22C55E"
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.nenhumAlunoContainer}>
                  <Ionicons name="people-outline" size={48} color="#666" />
                  <Text style={styles.nenhumAlunoTexto}>
                    {buscaAluno
                      ? "Nenhum aluno encontrado"
                      : "Nenhum aluno cadastrado"}
                  </Text>
                  {buscaAluno && (
                    <TouchableOpacity
                      style={styles.limparBuscaButton}
                      onPress={() => setBuscaAluno("")}
                    >
                      <Text style={styles.limparBuscaTexto}>Limpar busca</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>

        <Modal
          visible={modalTamanhoVisivel}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setModalTamanhoVisivel(false);
            setProdutoSelecionado(null);
          }}
          transparent={true}
        >
          <View style={styles.modalTamanhoOverlay}>
            <View style={styles.modalTamanhoContainer}>
              <View style={styles.modalTamanhoHeader}>
                <Text style={styles.modalTamanhoTitle}>
                  {produtoSelecionado?.nome}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalTamanhoVisivel(false);
                    setProdutoSelecionado(null);
                  }}
                  style={styles.modalTamanhoCloseButton}
                >
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTamanhoSubtitle}>
                Selecione o tamanho desejado
              </Text>

              <Text style={styles.modalTamanhoPreco}>
                R$ {produtoSelecionado?.preco.toFixed(2)}
              </Text>

              <ScrollView style={styles.modalTamanhosLista}>
                {produtoSelecionado &&
                  Object.entries(produtoSelecionado.tamanhos).map(
                    ([tamanho, quantidade]) => (
                      <TouchableOpacity
                        key={tamanho}
                        style={[
                          styles.modalTamanhoItem,
                          quantidade === 0 && styles.modalTamanhoItemDisabled,
                        ]}
                        onPress={() =>
                          adicionarItemComTamanho(produtoSelecionado, tamanho)
                        }
                        disabled={quantidade === 0}
                      >
                        <View style={styles.modalTamanhoItemInfo}>
                          <Text
                            style={[
                              styles.modalTamanhoItemTamanho,
                              quantidade === 0 &&
                                styles.modalTamanhoItemTamanhoDisabled,
                            ]}
                          >
                            {tamanho}
                          </Text>
                          <Text
                            style={[
                              styles.modalTamanhoItemEstoque,
                              quantidade === 0 &&
                                styles.modalTamanhoItemEstoqueDisabled,
                            ]}
                          >
                            {quantidade === 0
                              ? "Sem estoque"
                              : `${quantidade} disponíveis`}
                          </Text>
                        </View>
                        {quantidade > 0 && (
                          <Ionicons
                            name="add-circle"
                            size={24}
                            color="#B8860B"
                          />
                        )}
                      </TouchableOpacity>
                    ),
                  )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  header: {
    backgroundColor: "#B8860B",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B8860B",
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    color: "#FFF",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
  },
  statusOptionActive: {
    backgroundColor: "#B8860B",
    borderColor: "#B8860B",
  },
  statusOptionText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "600",
  },
  statusOptionTextActive: {
    color: "#FFF",
  },
  itemCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemSize: {
    color: "#B8860B",
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    color: "#999",
    fontSize: 14,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    backgroundColor: "#B8860B",
    borderRadius: 4,
    padding: 4,
  },
  quantityText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  removeButton: {
    padding: 4,
    marginLeft: 4,
  },
  emptyItems: {
    alignItems: "center",
    padding: 32,
  },
  emptyItemsText: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
  produtoCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  produtoInfo: {
    flex: 1,
  },
  produtoName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  produtoPrice: {
    color: "#B8860B",
    fontSize: 14,
    marginBottom: 4,
  },
  produtoStock: {
    color: "#999",
    fontSize: 12,
  },
  produtoActions: {
    paddingLeft: 12,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  saveButton: {
    backgroundColor: "#B8860B",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#444",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  alunoSelectorContainer: {
    marginBottom: 12,
  },
  alunoSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#444",
    gap: 8,
  },
  alunoSelectorText: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
  },
  alunoSelectorTextDisabled: {
    color: "#666",
  },
  alunoSelecionadoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#B8860B",
  },
  alunoSelecionadoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alunoSelecionadoNome: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  ouContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  ouLinha: {
    flex: 1,
    height: 1,
    backgroundColor: "#444",
  },
  ouTexto: {
    color: "#666",
    fontSize: 12,
    marginHorizontal: 12,
  },
  modalAlunosContainer: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  modalAlunosHeader: {
    backgroundColor: "#B8860B",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalAlunosTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  modalAlunosCloseButton: {
    padding: 4,
  },
  buscaAlunoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    margin: 16,
    gap: 8,
  },
  buscaAlunoInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
  },
  modalAlunosLista: {
    flex: 1,
  },
  alunoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  alunoItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  alunoItemTextContainer: {
    flex: 1,
  },
  alunoItemNome: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  alunoItemInfoExtra: {
    color: "#999",
    fontSize: 12,
  },
  nenhumAlunoContainer: {
    alignItems: "center",
    padding: 48,
  },
  nenhumAlunoTexto: {
    color: "#666",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  limparBuscaButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  limparBuscaTexto: {
    color: "#B8860B",
    fontSize: 14,
  },

  modalTamanhoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalTamanhoContainer: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalTamanhoHeader: {
    backgroundColor: "#B8860B",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTamanhoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
  },
  modalTamanhoCloseButton: {
    padding: 4,
  },
  modalTamanhoSubtitle: {
    fontSize: 14,
    color: "#999",
    padding: 16,
    paddingBottom: 8,
  },
  modalTamanhoPreco: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B8860B",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalTamanhosLista: {
    maxHeight: 400,
  },
  modalTamanhoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  modalTamanhoItemDisabled: {
    opacity: 0.5,
    backgroundColor: "#1F1F1F",
  },
  modalTamanhoItemInfo: {
    flex: 1,
  },
  modalTamanhoItemTamanho: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  modalTamanhoItemTamanhoDisabled: {
    color: "#666",
  },
  modalTamanhoItemEstoque: {
    fontSize: 14,
    color: "#999",
  },
  modalTamanhoItemEstoqueDisabled: {
    color: "#666",
  },
});
