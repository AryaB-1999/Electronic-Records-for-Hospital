const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'login.js',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'login',
      template: './src/login.html',
      filename: 'login.html',
    }),
    new HtmlWebpackPlugin({
      title: 'index',
      template: './src/index.html',
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'signup',
      template: './src/signup.html',
      filename: 'signup.html',
    }),
    new HtmlWebpackPlugin({
      title: 'MI Dash',
      template: './src/midash.html',
      filename: 'midash.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Doc Dash',
      template: './src/docdash.html',
      filename: 'docdash.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Patient Dash',
      template: './src/patdash.html',
      filename: 'patdash.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Con',
      template: './src/consensus.html',
      filename: 'consensus.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Create EHR',
      template: './src/createEHR.html',
      filename: 'createEHR.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Fetch EHR',
      template: './src/fetchEHR.html',
      filename: 'fetchEHR.html',
    }),
    new CopyWebpackPlugin([{ from: './src/index.html', to: 'index.html' }]),
  ],
  devServer: { contentBase: path.join(__dirname, 'dist'), compress: true },
  node: {
    fs: 'empty',
  },
}
