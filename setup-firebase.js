#!/usr/bin/env node

/**
 * Script interactivo para configurar Firebase y Google Sign-In
 * Ejecutar con: node setup-firebase.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n===========================================');
  console.log('🔥 Firebase & Google Sign-In Setup 🔥');
  console.log('===========================================\n');

  console.log('Este script te ayudará a configurar Firebase y Google Sign-In.\n');
  console.log('Necesitarás:');
  console.log('1. Tu configuración de Firebase (de Firebase Console)');
  console.log('2. Tu Web Client ID de Google (de Google Cloud Console)\n');

  console.log('📋 Pasos previos:');
  console.log('1. Ve a https://console.firebase.google.com/');
  console.log('2. Crea o selecciona tu proyecto');
  console.log('3. Ve a Project Settings > General');
  console.log('4. En "Your apps", crea una app web si no tienes una');
  console.log('5. Copia la configuración de Firebase\n');

  const continuar = await question('¿Estás listo para continuar? (s/n): ');
  if (continuar.toLowerCase() !== 's') {
    console.log('\n👋 Configuración cancelada. Ejecuta este script cuando estés listo.');
    rl.close();
    return;
  }

  console.log('\n--- Configuración de Firebase ---\n');

  const apiKey = await question('Firebase API Key: ');
  const authDomain = await question('Auth Domain (ej: tu-proyecto.firebaseapp.com): ');
  const projectId = await question('Project ID: ');
  const storageBucket = await question('Storage Bucket (ej: tu-proyecto.appspot.com): ');
  const messagingSenderId = await question('Messaging Sender ID: ');
  const appId = await question('App ID: ');

  console.log('\n--- Configuración de Google Sign-In ---\n');
  console.log('Para obtener el Web Client ID:');
  console.log('1. Ve a https://console.cloud.google.com/');
  console.log('2. Selecciona tu proyecto de Firebase');
  console.log('3. Ve a APIs & Services > Credentials');
  console.log('4. Busca el "Web client" que termina en .apps.googleusercontent.com');
  console.log('5. Copia el Client ID completo\n');

  const webClientId = await question('Web Client ID (.apps.googleusercontent.com): ');

  // Validar que el Client ID sea válido
  if (!webClientId.includes('.apps.googleusercontent.com')) {
    console.log('\n❌ Error: El Web Client ID debe terminar en .apps.googleusercontent.com');
    rl.close();
    return;
  }

  console.log('\n--- Verificando configuración ---\n');
  console.log('Firebase Config:');
  console.log(`  API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`  Auth Domain: ${authDomain}`);
  console.log(`  Project ID: ${projectId}`);
  console.log(`  Web Client ID: ${webClientId.substring(0, 30)}...\n`);

  const confirmar = await question('¿Es correcta la configuración? (s/n): ');
  if (confirmar.toLowerCase() !== 's') {
    console.log('\n👋 Configuración cancelada. Ejecuta este script nuevamente.');
    rl.close();
    return;
  }

  // Actualizar environment.ts
  console.log('\n📝 Actualizando archivos de configuración...\n');

  const environmentContent = `export const environment = {
  production: false,
  firebase: {
    apiKey: "${apiKey}",
    authDomain: "${authDomain}",
    projectId: "${projectId}",
    storageBucket: "${storageBucket}",
    messagingSenderId: "${messagingSenderId}",
    appId: "${appId}"
  }
};
`;

  const environmentPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
  fs.writeFileSync(environmentPath, environmentContent, 'utf8');
  console.log('✅ environment.ts actualizado');

  // Actualizar capacitor.config.ts
  const capacitorConfigPath = path.join(__dirname, 'capacitor.config.ts');
  let capacitorConfig = fs.readFileSync(capacitorConfigPath, 'utf8');
  capacitorConfig = capacitorConfig.replace(
    'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    webClientId
  );
  fs.writeFileSync(capacitorConfigPath, capacitorConfig, 'utf8');
  console.log('✅ capacitor.config.ts actualizado');

  // Actualizar firebase-auth.service.ts
  const firebaseAuthPath = path.join(__dirname, 'src', 'app', 'shared', 'services', 'firebase-auth.service.ts');
  let firebaseAuth = fs.readFileSync(firebaseAuthPath, 'utf8');
  firebaseAuth = firebaseAuth.replace(
    'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    webClientId
  );
  fs.writeFileSync(firebaseAuthPath, firebaseAuth, 'utf8');
  console.log('✅ firebase-auth.service.ts actualizado');

  console.log('\n===========================================');
  console.log('✨ ¡Configuración completada! ✨');
  console.log('===========================================\n');

  console.log('📋 Próximos pasos:\n');
  console.log('1. Habilita Google Sign-In en Firebase Console:');
  console.log('   - Ve a Authentication > Sign-in method');
  console.log('   - Habilita el proveedor "Google"');
  console.log('   - Guarda los cambios\n');

  console.log('2. Para web (desarrollo local):');
  console.log('   - Ve a Google Cloud Console');
  console.log('   - APIs & Services > Credentials');
  console.log('   - Edita tu Web Client');
  console.log('   - Agrega "http://localhost:8100" en Authorized JavaScript origins');
  console.log('   - Agrega "http://localhost:8100" en Authorized redirect URIs\n');

  console.log('3. Ejecuta la aplicación:');
  console.log('   npm start\n');

  console.log('4. Para Android, necesitas configurar el SHA-1:');
  console.log('   cd android');
  console.log('   ./gradlew signingReport');
  console.log('   Luego agrega el SHA-1 en Firebase Console\n');

  console.log('📚 Para más detalles, consulta GOOGLE_SIGNIN_SETUP.md\n');

  rl.close();
}

main().catch((error) => {
  console.error('Error durante la configuración:', error);
  rl.close();
  process.exit(1);
});


