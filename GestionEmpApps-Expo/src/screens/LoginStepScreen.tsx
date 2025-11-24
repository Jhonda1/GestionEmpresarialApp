import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { colors } from '../theme/colors';
import { loginService } from '../services/loginService';

export default function LoginStepScreen({ nit, onBack, onLoginSuccess }: { nit: string, onBack: () => void, onLoginSuccess: (user: any) => void }) {
  const [numDocu, setNumDocu] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginService({ nit, num_docu: numDocu, password });
      if (response.valido) {
        onLoginSuccess(response.usuario);
      } else if (response.password) {
        Alert.alert('Atención', 'Debes cambiar tu contraseña.');
        // Aquí podrías navegar a la pantalla de cambio de contraseña
      } else {
        Alert.alert('Error', response.mensaje || 'Credenciales incorrectas');
      }
    } catch (e) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="N° Documento"
        value={numDocu}
        onChangeText={setNumDocu}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Text style={styles.toggle}>{showPassword ? 'Ocultar' : 'Mostrar'} contraseña</Text>
      </TouchableOpacity>
      <Button title={loading ? 'Ingresando...' : 'Iniciar sesión'} color={colors.primary} onPress={handleLogin} disabled={!numDocu || !password || loading} />
      <Button title="Regresar" color={colors.secondary} onPress={onBack} />
      <View style={styles.empresaInfo}>
  <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.infoText}>Servicio al Cliente (6) 3151720 - Móvil 320 632 1074</Text>
        <Text style={styles.copyright}>Copyright (c) By Prosof S.A.S</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.white, fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: colors.white, borderRadius: 8, padding: 12, width: 220, marginBottom: 16, color: colors.text },
  toggle: { color: colors.primary, marginBottom: 16 },
  empresaInfo: { marginTop: 32, alignItems: 'center' },
  logo: { width: 120, height: 60, resizeMode: 'contain', marginBottom: 8 },
  infoText: { color: colors.white, fontSize: 14, marginBottom: 4 },
  copyright: { color: colors.white, fontSize: 12, opacity: 0.8 },
});
