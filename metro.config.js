// metro.config.js

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname, {
  isCSSEnabled: true,
});
config.resolver.unstable_enablePackageExports = false;

module.exports = {
  // start with everything Sentry gave you
  ...config,

  // now override / extend transformer
  transformer: {
    // keep any Sentry transformer settings
    ...config.transformer,

    // add your own getTransformOptions
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },

  // now override / extend resolver
  resolver: {
    // keep any Sentry resolver settings
    ...config.resolver,

    // add your extraNodeModules
    extraNodeModules: {
      // preserve any existing extraNodeModules
      ...((config.resolver && config.resolver.extraNodeModules) || {}),

      // point Metro at valueUnpacker for Reanimated v2
      valueUnpacker:
        __dirname +
        "/node_modules/react-native-reanimated/lib/module/valueUnpacker.js",
    },
    sourceExts: ["js", "json", "ts", "tsx", "jsx"],
  },
};
