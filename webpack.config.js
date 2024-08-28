const path = require('path');

module.exports = {
  mode: 'development',  // Set development mode to avoid minification
  entry: './src/screens/combatscene.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',  // Enable source maps for development builds
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),  // Serve static files from 'dist'
    },
    compress: true,
    port: 9000,  // Port to serve the game in the browser
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
