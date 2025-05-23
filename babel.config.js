module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current'
          }
        }
      ],
      '@babel/preset-typescript'
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@config': './src/config',
            '@controllers': './src/controllers',
            '@routes': './src/routes',
            '@middlewares':'./src/middlewares',
            '@models': './src/models/',
            '@services': './src/services',
            '@utils':'./src/utils/',
            '@interfaces':'./src/interfaces',
            '@custom-types': './src/types',
            '@factories': './src/factories'
          }
        }
      ]
    ]
  };