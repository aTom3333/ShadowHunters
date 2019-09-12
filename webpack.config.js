const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: path.join(__dirname, 'src/script/main.ts'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'public/script')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: [
        new MiniCssExtractPlugin({})
    ]
};
