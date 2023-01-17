const Router = require("koa-router")

const router = new Router()

router.get("/v2/abc",async (ctx,next) => {
    ctx.body = "ahhaha2"
})

router.get("/v2/ex",async (ctx,next) => {

    ctx.body = "ahhaha2"
})
module.exports = router