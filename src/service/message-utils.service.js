const WechatyImpl = require('@/wechaty-robot/index.js')


module.exports = {
    async queryAll(ctx, params){
        /* 并发搜索，批量搜索群 */
        let batch = (params.to || []).map((name) => {
            return WechatyImpl.queryRoom(ctx, {
                id: params.id,
                topic: name,
            }, true)
        })
        const rooms = await Promise.all(batch)
        return rooms
    },
    /* 并发发送 */
    async sendByConcurrency(rooms = [], message){
        let successCount = 0
        let failCount = 0
        let sendQueue = []
        rooms.forEach((room) => {
            let promise = WechatyImpl.sendMessage(room, message)
            sendQueue.push(promise)
            promise.then(() => {
                successCount++
            }).catch(() => {
                failCount++
            })
        })
        await Promise.allSettled(sendQueue)
        return [successCount === rooms.length, successCount, failCount]
    },
    /* 排队发送 */
    async sendByQueue(instance, rooms = [], message, interval = 0){
        let successCount = 0
        let failCount = 0
        
        for(let room of rooms){
            await WechatyImpl.sendMessage(instance, room, message).then(() => {
                successCount++
            }).catch(() => {
                failCount++
            })
            interval && await WAIT_MOMENT(interval)
        }
        return [successCount === rooms.length, successCount, failCount]
    },
}


const WAIT_MOMENT = async (time) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}