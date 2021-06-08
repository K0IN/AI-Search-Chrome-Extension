'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const PATHS = require('./paths');
const TerserPlugin = require('terser-webpack-plugin');

const config = merge(common, {
    entry: {
        popup: PATHS.src + '/popup.js',
        contentScript: PATHS.src + '/contentScript.js',
        background: PATHS.src + '/background.js',
        options: PATHS.src + '/options.js',
    }
});

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        return merge(config, {
            optimization: {
                minimize: true,
                minimizer: [new TerserPlugin()],
            }
        });
    }
    return config;
};
