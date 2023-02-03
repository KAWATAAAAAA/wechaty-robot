const WechatyImpl = require('@/wechaty-robot/index.js')

module.exports = {
    async create(ctx, params){
        const res = await WechatyImpl.create(ctx, params)
        return res
    },
    async getSelfInfo(ctx, params){
        const res = await WechatyImpl.getUserSelf(ctx, params)
        return res
    },
    async pending(ctx, params){
        await WechatyImpl.pending(ctx, params)
    },
    async getContactList(ctx, params){
        const res = await WechatyImpl.getContactList(ctx, params)
        return res
    },
    async getRoomList(ctx, params){
        const res = await WechatyImpl.getRoomList(ctx, params)
        return res
    },
    async getContactInfo(ctx, params){
        const res = await WechatyImpl.queryContact(ctx, params)
        return res
    },
    async getRoomInfo(ctx, params){
        const res = await WechatyImpl.queryRoom(ctx, params)
        return res
    },
    async send(ctx, params){
        const { id, to, type, message } = params
        /* 发信息给群 */
        if(type === "ROOM"){
            const room = await WechatyImpl.queryRoom({
                name: params.name
            })
            // room.say()
        }
         /* 发信息给联系人 */
         /* 指定机器人id，指定发送给谁 */
         if(type === "CONTACT"){
            const contact = await WechatyImpl.queryContact(ctx, {
                id: id,
                name: to,
            })
            await contact.say(message.data)
         }
    }
}