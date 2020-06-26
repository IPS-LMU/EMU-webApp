const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        emuwebapp: "./src/app/main.ts"
    },
    output: {
        filename: "./dist/[name].bundle.js",
        path: path.resolve(__dirname, 'src')
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": 'jquery'
        }),
        new webpack.ContextReplacementPlugin(
            // if you have anymore problems tweet me at @gdi2290
            // The (\\|\/) piece accounts for path separators for Windows and MacOS
            /(.+)?angular(\\|\/)core(.+)?/,
            path.join(__dirname, 'src'), // location of your src
            {} // a map of your routes
        )
    ],
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".scss", ".json"]
    },
    module: {
        rules: [
                {
                    test: /\.worker\.ts$/i,
                    use: [{
                        loader: 'comlink-loader',
                        options: {
                            singleton: true
                        }
                    }]
                },
                { 
                    // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
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
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                      {
                        loader: 'file-loader',
                        options: {
                          name: '[name].[ext]',
                          outputPath: 'fonts/'
                        }
                      }
                    ]
                }
            ]
        }
    };
