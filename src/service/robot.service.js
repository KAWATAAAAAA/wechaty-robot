const WechatyImpl = require("@/wechaty-robot/index.js");
const msgUtils = require("@/service/message-utils.service");
const idGen = require("@/utils/id-gen");


module.exports = {
  async create(ctx, params) {
    const res = await WechatyImpl.create(ctx, params);
    return res;
  },
  async getSelfInfo(ctx, params) {
    const res = await WechatyImpl.getUserSelf(ctx, params);
    return res;
  },
  async pending(ctx, params) {
    await WechatyImpl.pending(ctx, params);
  },
  async getContactList(ctx, params) {
    const res = await WechatyImpl.getContactList(ctx, params);
    return res;
  },
  async getRoomList(ctx, params) {
    const res = await WechatyImpl.getRoomList(ctx, params);
    return res;
  },
  async getContactInfo(ctx, params) {
    const res = await WechatyImpl.queryContact(ctx, params);
    return res;
  },
  async getRoomInfo(ctx, params) {
    const res = await WechatyImpl.queryRoom(ctx, params);
    return res;
  },
  // async send(ctx, params){
  //     const { id, to, type, message } = params
  //     /* 发信息给群 */
  //     if(type === "ROOM"){
  //         const room = await WechatyImpl.queryRoom({
  //             name: params.name
  //         })
  //         // room.say()
  //     }
  //      /* 发信息给联系人 */
  //      /* 指定机器人id，指定发送给谁 */
  //      if(type === "CONTACT"){
  //         const contact = await WechatyImpl.queryContact(ctx, {
  //             id: id,
  //             name: to,
  //         }, true)
  //         await contact.say(message.data).then((res,res2) => {

  //         })
  //      }

  // },
  async send(ctx, params) {
    const { id, to, type, message, interval = 0 } = params;
    let res;
    const instance = ctx.xsyx.robots[id]
    /* 发信息给群 */
    if (type === "ROOM") {
      const rooms = await msgUtils.queryAll(ctx, {
        id,
        to,
      });
      /* 若有间隔发送频率控制，则不等待执行结束, 反之await */
      if (interval) {
        msgUtils.sendByQueue(instance, rooms, message, interval);
      }
      if (interval === 0) {
        res = await msgUtils.sendByQueue(instance, rooms, message);
      }
    }
    /* 发信息给联系人 */
    if (type === "CONTACT") {

    }
    if (interval) {
      return [
        {
          seq: idGen.get(4),
          expect: to.length * interval,
        },
        "推送成功",
      ];
    }
    if (interval === 0) {
      const [isSuccess, successCount, failCount] = res;
      return [
        { isSuccess, successCount, failCount },
        `${isSuccess ? '推送成功' : '推送存在失败'}, 成功${successCount}条，失败${failCount}条`
      ]
    }
  },
  async logout(ctx, params) {
    await WechatyImpl.logout(ctx, params);
  },
};
