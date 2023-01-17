const WechatyImpl = require('@/wechaty-robot/index.js')

module.exports = {
    async create(ctx, params){
        const res = await WechatyImpl.create(ctx, params)
        return res
    },
    async pending(ctx, params){
        await WechatyImpl.pending(ctx, params)
    }
}