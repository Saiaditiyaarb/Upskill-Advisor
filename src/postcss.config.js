module.exports = {
    plugins: {
        'postcss-preset-env': {
            stage: 1,
            features: {
                'color-function': { preserve: false },
                'oklab-function': { preserve: false },
            },
        },
        tailwindcss: {},
        autoprefixer: {},
    },
}
