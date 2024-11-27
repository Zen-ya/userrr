const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ajout de modules supplémentaires
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
};

module.exports = config;
