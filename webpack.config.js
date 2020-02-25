module.exports = {
    entry: "./app/scripts/main.ts",
    output: {
        filename: "./app/dist/bundle.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // {
            //     test: /\.worker\.(js|ts)$/i,
            //     use: [{
            //       loader: 'worker-loader'
            //     }]
            // },
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { 
                test: /\.tsx?$/, 
                loader: "ts-loader" 
            }
        ]
    }
};
