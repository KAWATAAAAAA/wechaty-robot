require("module-alias/register")
const CoreRegister = require("./src/config/init.js")
const Koa = require("koa")
const { koaBody } = require('koa-body');
const CONSTANCE = require("./src/config/constance.js")
const xsyx = require("./src/config/xsyx.js")



const app = new Koa()
app.use(koaBody());
CoreRegister.init(app)

/* 全局配置 */
app.context.$config = CONSTANCE
/* 自定义属性 */
app.context.xsyx = xsyx




app.listen(3000);