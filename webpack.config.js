const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const public_dir = path.join(__dirname, "frontend", "public");
const smp = new SpeedMeasurePlugin();

const config = smp.wrap({
    entry: './frontend/src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: /frontend/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                include: /frontend/,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            },
            {
                test: /\.(png|svg)$/,
                include: /frontend/,
                use: 'file-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                include: /frontend/,
                type: 'asset/resource',
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(public_dir, 'index.html'),
            favicon: path.join(public_dir, 'favicon.ico'),
            name: "index.html"
        })
    ]
});

module.exports = config;