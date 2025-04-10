const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');

const paths = {
  src: path.resolve(__dirname, 'src'),
  build: path.resolve(__dirname, 'build')
}

const htmlConfig = {
  template: path.join(paths.src, 'index.html'),
  minify : {
    collapseWhitespace: true,
  }
}

const common = {
  entry: path.join(paths.src, 'index.js'),
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    path: paths.build,
    filename: 'bundle.[hash].js',
    publicPath: '/',
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env','@babel/react']
          }
        }
      },
      {
        test: /\.(ts)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            useCache: false,
          }
        }
      },
      {
        test: /\.(css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1 // 0 default, 1 postcss-loader, 2 postcss-loader & sass-loader
            }
          },
          'postcss-loader'
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(htmlConfig),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: false,
    }),
  ]
};

const devSettings = {
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    quiet: false,
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env': {
      "env":JSON.stringify("development"),
      "dataEnv": JSON.stringify("development"),
      "userEnv": JSON.stringify("development")
    }}),
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(),
  ]
}

const devDefaultSettings = {
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    quiet: false,
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env': {
      "env":JSON.stringify("development"),
      "dataEnv":JSON.stringify("default"),
      "userEnv":JSON.stringify("default"),
    }}),
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(),
  ]
}

const prodSettings = {
  optimization: {
    minimize: true,
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({ 'process.env': {
      "env":JSON.stringify("build"),
      "dataEnv":JSON.stringify("build"),
      "userEnv":JSON.stringify("build"),
    }}),
    new OptimizeCssAssetsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
  ]
}

/**
* Exports
**/

const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;

if (TARGET === 'start') {
  module.exports = merge(common, devSettings)
}

if (TARGET === 'start-default') {
  module.exports = merge(common, devDefaultSettings)
}

if (TARGET === 'build' || !TARGET) {
  module.exports = merge(common, prodSettings)
}
