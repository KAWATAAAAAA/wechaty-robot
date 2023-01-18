const Router = require("koa-router")
const robotService = require("@service/robot.service.js")


const router = new Router()

router.post("/robot/online",async (ctx) => {
    /* 返回一个二维码给前端 */
    ctx.body = "二维码"
})
router.post("/robot/pending",async (ctx) => {
    /* 从post参数获取机器人id，从 koa的context中 找到对应机器人map，通过 map[id] 的方式操作机器人--挂起 */
    const params = ctx.request.body;
    await robotService.pending(ctx, params)
    ctx.body = "成功响应"
})
router.post("/robot/logout",async (ctx) => {
    /* 从post参数获取机器人id，从 koa的context中 找到对应机器人map，通过 map[id] 的方式操作机器人--离线 */
    ctx.body = "二维码"
})
router.get("/robot/getQRcode",async (ctx) => {
    /* 返回一个二维码给前端 */
    const params = ctx.request.body || {};
    const res = await robotService.create(ctx, params)
    ctx.body = res
})
router.get("/robot/getContactList",async (ctx) => {
    /* 返回一个二维码给前端 */
    const params = ctx.request.query || {};
    const res = await robotService.getContactList(ctx, params)
    ctx.body = res
})
router.get("/robot/getRoomList",async (ctx) => {
    /* 返回一个二维码给前端 */
    const params = ctx.request.query || {};
    const res = await robotService.getRoomList(ctx, params)
    ctx.body = res
})

router.post("/robot/send",async (ctx) => {
    /* 从post参数获取机器人id，从 koa的context中 找到对应机器人map，通过 map[id] 的方式操作机器人--发送一条消息 */
    const params = ctx.request.body || {};
    const res = await robotService.send(ctx, params)
    ctx.body = "发送成功"
})

module.exports = router