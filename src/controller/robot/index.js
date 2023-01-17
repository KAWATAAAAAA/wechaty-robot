const Router = require("koa-router")
const robotService = require("@service/robot.service.js")


const router = new Router()

router.post("/robot/online",async (ctx,next) => {
    /* 返回一个二维码给前端 */
    ctx.body = "二维码"
})
router.post("/robot/pending",async (ctx,next) => {
    /* 从post参数获取机器人id，从 koa的context中 找到对应机器人map，通过 map[id] 的方式操作机器人--挂起 */
    const params = ctx.request.body;
    await robotService.pending(ctx, params)
    ctx.body = "成功响应"
})
router.post("/robot/logout",async (ctx,next) => {
    /* 从post参数获取机器人id，从 koa的context中 找到对应机器人map，通过 map[id] 的方式操作机器人--离线 */
    ctx.body = "二维码"
})
router.get("/robot/getQRcode",async (ctx,next) => {
    /* 返回一个二维码给前端 */
    const params = ctx.request.body || {};
    const res = await robotService.create(ctx, params)
    next()
    ctx.body = res
})

router.post("/robot/send",async (ctx,next) => {
    /* 从post参数获取机器人id，从 koa的context中 找到对应机器人map，通过 map[id] 的方式操作机器人--发送一条消息 */
    ctx.body = "待生成QRcode"
})

module.exports = router