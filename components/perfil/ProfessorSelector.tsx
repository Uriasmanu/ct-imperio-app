// src/components/perfil/ProfessorSelector.tsx
import { Professor, professores } from '@/types/admin';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfessorSelectorProps {
  professoresSelecionados: string[]; // Array de IDs dos professores
  onProfessoresChange: (professoresIds: string[]) => void;
}

export const ProfessorSelector: React.FC<ProfessorSelectorProps> = ({
  professoresSelecionados,
  onProfessoresChange,
}) => {
  const toggleProfessor = (professorId: string) => {
    const existe = professoresSelecionados.includes(professorId);
    
    if (existe) {
      // Remove o professor
      onProfessoresChange(professoresSelecionados.filter(id => id !== professorId));
    } else {
      // Adiciona o professor
      onProfessoresChange([...professoresSelecionados, professorId]);
    }
  };

  const getProfessorById = (id: string): Professor | undefined => {
    return professores.find(prof => prof.id === id);
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.professoresGrid}>
        {professores.map((professor) => {
          const selecionado = professoresSelecionados.includes(professor.id);
          
          return (
            <View key={professor.id} style={styles.professorItem}>
              <TouchableOpacity
                style={[
                  styles.professorButton,
                  selecionado && styles.professorButtonSelected
                ]}
                onPress={() => toggleProfessor(professor.id)}
              >
                <View style={styles.professorInfo}>
                  <Text style={[
                    styles.professorNome,
                    selecionado && styles.professorNomeSelected
                  ]}>
                    {professor.nome}
                  </Text>
                  <Text style={[
                    styles.professorEmail,
                    selecionado && styles.professorEmailSelected
                  ]}>
                    {professor.email}
                  </Text>
                </View>
                <Ionicons
                  name={selecionado ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={selecionado ? "#000" : "#666"}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Lista de professores selecionados */}
      {professoresSelecionados.length > 0 && (
        <View style={styles.selecionadosContainer}>
          <Text style={styles.selecionadosLabel}>Professores selecionados:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selecionadosList}>
            {professoresSelecionados.map(professorId => {
              const professor = getProfessorById(professorId);
              return professor ? (
                <View key={professor.id} style={styles.professorChip}>
                  <Text style={styles.professorChipText}>{professor.nome}</Text>
                </View>
              ) : null;
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  professoresGrid: {
    gap: 8,
    marginBottom: 16,
  },
  professorItem: {
    width: '100%',
  },
  professorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
  },
  professorButtonSelected: {
    backgroundColor: '#B8860B',
    borderColor: '#DAA520',
  },
  professorInfo: {
    flex: 1,
  },
  professorNome: {
    color: '#CCC',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 4,
  },
  professorNomeSelected: {
    color: '#000',
    fontWeight: '600',
  },
  professorEmail: {
    color: '#888',
    fontSize: 12,
  },
  professorEmailSelected: {
    color: '#333',
  },
  selecionadosContainer: {
    marginTop: 8,
  },
  selecionadosLabel: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 8,
  },
  selecionadosList: {
    flexDirection: 'row',
  },
  professorChip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#B8860B',
  },
  professorChipText: {
    color: '#B8860B',
    fontSize: 12,
    fontWeight: '500',
  },
});