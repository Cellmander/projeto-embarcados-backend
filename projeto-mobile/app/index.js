import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, Keyboard, ScrollView } from 'react-native';

export default function App() {
  // Estado para armazenar o IP do PC (Backend)
  const [ipAddress, setIpAddress] = useState('192.168.0.14');

  // Estados para Controle (Configurações)
  const [lumMin, setLumMin] = useState('');
  const [lumMax, setLumMax] = useState('');

  // Estado para Logs
  const [logs, setLogs] = useState([]);

  // Função auxiliar para gerar a URL base
  const getBaseUrl = () => `http://${ipAddress}:3000`;

  // 1. Buscar configurações atuais (GET /controle)
  const fetchConfig = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/controle`);
      const data = await response.json();
      
      if (data) {
        setLumMin(String(data.luminosidadeMin));
        setLumMax(String(data.luminosidadeMax));
        Alert.alert("Sucesso", "Configurações carregadas!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao conectar no backend. Verifique o IP.");
    }
  };

  // 2. Atualizar configurações (POST /controle)
  const updateConfig = async () => {
    try {
      Keyboard.dismiss();
      const body = {
        luminosidadeMin: parseInt(lumMin),
        luminosidadeMax: parseInt(lumMax)
      };

      const response = await fetch(`${getBaseUrl()}/controle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.ok) {
        Alert.alert("Sucesso", "Parâmetros atualizados no servidor!");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a configuração.");
    }
  };

  // 3. Buscar histórico de logs (GET /log)
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/log`);
      const data = await response.json();
      setLogs(data.reverse()); 
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar logs.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sistema Embarcado</Text>

      {/* CONFIGURAÇÃO DO IP */}
      <View style={styles.card}>
        <Text style={styles.label}>IP do Computador (Backend):</Text>
        <TextInput
          style={styles.input}
          value={ipAddress}
          onChangeText={setIpAddress}
          placeholder="Ex: 192.168.1.15"
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Use 'ipconfig' (Win) ou 'ifconfig' (Linux/Mac) no PC para descobrir.</Text>
      </View>

      <ScrollView style={{ width: '100%' }}>
        
        {/* ÁREA DE CONTROLE */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>⚙️ Configuração (Controle)</Text>
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 5 }}>
              <Text>Lum. Mínima</Text>
              <TextInput
                style={styles.input}
                value={lumMin}
                onChangeText={setLumMin}
                keyboardType="numeric"
                placeholder="Ex: 800"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 5 }}>
              <Text>Lum. Máxima</Text>
              <TextInput
                style={styles.input}
                value={lumMax}
                onChangeText={setLumMax}
                keyboardType="numeric"
                placeholder="Ex: 3500"
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.btnBlue]} onPress={fetchConfig}>
              <Text style={styles.btnText}>Ler Atual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.btnGreen]} onPress={updateConfig}>
              <Text style={styles.btnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ÁREA DE LOGS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📊 Histórico (Logs)</Text>
          
          <TouchableOpacity style={[styles.button, styles.btnOrange]} onPress={fetchLogs}>
            <Text style={styles.btnText}>Atualizar Lista</Text>
          </TouchableOpacity>

          {logs.length === 0 ? (
            <Text style={{ marginTop: 10, fontStyle: 'italic', color: '#666' }}>Nenhum log encontrado.</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logText}>💡 Luz: {log.valorLuz}</Text>
                <Text style={styles.logText}>
                  {log.sistemaAtivado ? '✅ Ativado' : 'Pc Parado'}
                </Text>
                <Text style={styles.logDate}>
                  {log.dataHora ? new Date(log.dataHora).toLocaleString() : '-'}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 50 }} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#444',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  btnBlue: { backgroundColor: '#2196F3' },
  btnGreen: { backgroundColor: '#4CAF50' },
  btnOrange: { backgroundColor: '#FF9800', width: '100%' },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 8,
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  logText: {
    fontSize: 16,
    color: '#333',
  },
  logDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});