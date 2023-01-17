const Router = require("koa-router")

const router = new Router()

router.get("/v1/abc",async (ctx,next) => {
    ctx.body = "ahhaha1"
})

module.exports = router