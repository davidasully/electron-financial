module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                win: {
                  icon: './icon.ico'
                },
                publish: [{
                    provider: "github",
                    owner: "davidasully",
                    repo: "electron-financial"
                }]
            }
        }
    }
}