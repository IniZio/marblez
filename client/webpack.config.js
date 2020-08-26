const path = require("path");
const extract = require("mini-css-extract-plugin");
const copy = require("copy-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const dotenvFile = process.env.NODE_ENV === 'production'
    ? '.env.local'
    : '.env.production'

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "index.js",
        path: __dirname + "/dist"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: "ts-loader"
            },
            {
                test: /\.(scss)$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function() {
                                return [require("autoprefixer")];
                            }
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ]
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            util: path.resolve(__dirname, 'mocks/utils.js'),
            glob: path.resolve(__dirname, 'mocks/empty-module.js'),
            fs: path.resolve(__dirname, 'mocks/empty-module.js'),
            path: path.resolve(__dirname, 'mocks/empty-module.js'),
        }
    },
    plugins: [
        new extract({
            filename: "bundle.css"
        }),
        new copy({ patterns: [{ from: "node_modules/tripetto/fonts/", to: "fonts/" }]}),
        new HTMLWebpackPlugin(),
        new Dotenv({
            path: dotenvFile,
            systemvars: true,
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            inlineWorkboxRuntime: true,
            runtimeCaching: [
                {
                    urlPattern: /assets/,
                    handler: 'CacheFirst',
                },
                {
                    urlPattern: /.*/,
                    handler: 'NetworkFirst',
                },
            ],
        }),
        new WebpackPwaManifest({
            name: 'Marblez',
            short_name: 'Marblez',
            // inject: false,
            // fingerprints: false,
            start_url: '/',
            description: 'Piece of Cake',
            theme_color: '#FF385C',
            background_color: '#FFFFFF',
            icons: [
                {
                src: path.resolve('./src/images/logo.svg'),
                sizes: [192, 384, 512],
                },
            ],
        }),
    ],
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        port: 1234,
        host: "0.0.0.0"
    }
};
