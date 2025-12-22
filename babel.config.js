module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          // Configuración balanceada: compatible con Android 9 pero mantiene funcionalidad
          android: '5.0',
          chrome: '70',
          ios: '10',
          safari: '10'
        },
        useBuiltIns: false,
        modules: false,
        debug: false,
        // Configuración menos agresiva para mantener funcionalidad de Angular 20
        loose: false,
        bugfixes: true,
        shippedProposals: false,
        // Solo incluir transformaciones específicamente problemáticas en Android 9
        include: [
          '@babel/plugin-transform-optional-chaining',
          '@babel/plugin-transform-nullish-coalescing-operator',
          '@babel/plugin-transform-logical-assignment-operators',
          '@babel/plugin-transform-numeric-separator',
          '@babel/plugin-transform-classes',
          '@babel/plugin-transform-spread'
        ],
        // Excluir transformaciones que pueden romper Angular 20
        exclude: [
          '@babel/plugin-transform-async-to-generator',
          '@babel/plugin-transform-arrow-functions'
        ]
      }
    ]
  ],
  plugins: [
    // Solo las transformaciones esenciales para Android 9
    '@babel/plugin-transform-optional-chaining',
    '@babel/plugin-transform-nullish-coalescing-operator',
    '@babel/plugin-transform-logical-assignment-operators',
    '@babel/plugin-transform-numeric-separator',
    '@babel/plugin-transform-classes',
    ['@babel/plugin-transform-class-properties', { loose: true }],
    '@babel/plugin-transform-spread'
  ]
};
