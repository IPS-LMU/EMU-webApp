const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: "./dist/bundle.js",
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CopyPlugin([
            { from: 'app/index.html', to: '.' },
            { from: 'app/views', to: 'views' },
            { from: 'app/schemaFiles', to: 'schemaFiles' },
            { from: 'app/assets', to: 'assets' },
            { from: 'app/configFiles', to: 'configFiles' },
            { from: 'app/img', to: 'img' },
            { from: 'app/NEWS.md', to: '.' },
            { from: 'app/demoDBs', to: 'demoDBs' },
            { from: 'app/manual', to: 'manual' },
        ]),
    ],
    optimization: {
        minimize: false // can't minimize 4 now see: https://scotch.io/tutorials/declaring-angularjs-modules-for-minification
    }
});