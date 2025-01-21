const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ajoutez la gestion des fichiers .mp3
config.resolver.assetExts.push('mp3');

// Ajout de modules supplémentaires si nécessaire
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
};

module.exports = config;
