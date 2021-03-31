module.exports = {
    transpileDependencies: ["vuetify"],
    configureWebpack: {
        devServer: {
            headers: { "Access-Control-Allow-Origin": "*" },
        },
    },
};
