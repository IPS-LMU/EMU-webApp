const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: "./app/scripts/main.ts",
    output: {
        filename: "./dist/bundle.js",
        path: path.resolve(__dirname, 'app')
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": 'jquery'
        })
    ],
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".scss", ".json"]
    },
    module: {
        rules: [
            // {
                //     test: /\.worker\.ts$/,
                //     use: { loader: 'worker-loader' }
                // },
                // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
                { 
                    test: /\.tsx?$/, 
                    loader: "ts-loader" 
                },
                {
                    test: /\.s[ac]ss$/,
                    loaders: [
                        // Creates `style` nodes from JS strings
                        "style-loader", 
                        // Translates CSS into CommonJS
                        "css-loader", 
                        // resolve url in sass files
                        "resolve-url-loader",
                        // Compiles Sass to CSS
                        "sass-loader"
                    ]
                }
            ]
        }
    };
