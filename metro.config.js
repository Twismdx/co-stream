// metro.config.js

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const sentryConfig = getSentryExpoConfig(__dirname, {
  isCSSEnabled: true,
});
sentryConfig.resolver.unstable_enablePackageExports = false;

module.exports = {
  // start with everything Sentry gave you
  ...sentryConfig,

  // now override / extend transformer
  transformer: {
    // keep any Sentry transformer settings
    ...sentryConfig.transformer,

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
    ...sentryConfig.resolver,

    // add your extraNodeModules
    extraNodeModules: {
      // preserve any existing extraNodeModules
      ...((sentryConfig.resolver && sentryConfig.resolver.extraNodeModules) ||
        {}),

      // point Metro at valueUnpacker for Reanimated v2
      valueUnpacker:
        __dirname +
        "/node_modules/react-native-reanimated/lib/module/valueUnpacker.js",
    },
    sourceExts: ["js", "json", "ts", "tsx", "jsx"],
  },
};
