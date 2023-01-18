/* 模块导入名称映射方案，务必顶层首行引入 */
require("module-alias/register")

const CoreRegister = require("./src/config/init.js")
const Koa = require("koa")
const { koaBody } = require('koa-body');
const CONSTANCE = require("./src/config/constance.js")
const xsyx = require("./src/config/xsyx.js")
const response = require("./src/utils/response.js")



const app = new Koa()

/* ⚠️时刻注意中间件的加载顺序 */
// app.use(ErrorHandler)  //预期未来加一个全局异常捕获和 log 日志生成

/* 路由注册 */
CoreRegister.init(app)
/* 解析请求体 */
app.use(koaBody());

/* 全局配置 */
app.context.$config = CONSTANCE
/* 自定义属性 */
app.context.xsyx = xsyx
app.context.success = response.success
app.context.fail = response.fail

app.listen(3000);