import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ImageBackground, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { validateNitService } from '../services/loginService';
import fondoLogin from '../assets/images/fondoLogin.jpg';

export default function NitScreen({ onValidNit }: { onValidNit: (nit: string, extraData: any) => void }) {
  const [nit, setNit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidateNit = async () => {
    setLoading(true);
    try {
      const response = await validateNitService(nit);
      if (response.success || response.valido) {
        onValidNit(nit, response);
      } else {
        Alert.alert('Error', response.mensaje || response.error || 'NIT inválido');
      }
    } catch (e) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={fondoLogin} style={styles.bg} resizeMode="cover">
      <View style={styles.content}>
        <Text style={styles.title}>Ingrese su NIT</Text>
        <TextInput
          style={styles.input}
          placeholder="NIT"
          value={nit}
          onChangeText={setNit}
          keyboardType="numeric"
        />
        <Button title={loading ? 'Validando...' : 'Ingresar'} color={colors.primary} onPress={handleValidateNit} disabled={!nit || loading} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'center' },
  content: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, borderRadius: 16, alignItems: 'center', margin: 24 },
  title: { color: colors.white, fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: colors.white, borderRadius: 8, padding: 12, width: 220, marginBottom: 16, color: colors.text },
});
