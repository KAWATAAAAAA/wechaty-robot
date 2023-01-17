const requireDirectory = require("require-directory")
const Router = require("koa-router")

class InitRegister {
    static init(app){
        InitRegister.registerControllerRouters(app)
    }
    static registerControllerRouters(app){
        const onLoadModule = (source) => {
            if(source instanceof Router){
                app.use(source.routes())
            }
        }
        const dir = `${process.cwd()}/src/controller`
        requireDirectory(module,dir,{
            visit:onLoadModule
        })
    }
}

module.exports = InitRegister
