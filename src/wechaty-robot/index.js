const {log, ScanStatus, WechatyBuilder } = require("wechaty");
const {PuppetPadlocal} = require("wechaty-puppet-padlocal");
const {dingDongBot, getMessagePayload, LOGPRE} = require("./helper.js");
const QR = require("qrcode-terminal")

const idGen = require("@/utils/id-gen.js")
/****************************************
 * 去掉注释，可以完全打开调试日志
 ****************************************/
// log.level("silly");


// 同意加好友 TakeOver 1

// 同意拉进群 TakeOver 2

// 在群中推送一条消息 TakeOver 3


const create = async (ctx, params) => {
  const { token } = params
  const puppet = new PuppetPadlocal({
    token: token || "puppet_padlocal_6f5447f25c0c497997bbddb997348892"
  })

  const robot = WechatyBuilder.build({
    name: "PadLocalDemo1",
    puppet,
  })
  /* 记录机器人 */
  const id = idGen.get()
  ctx.xsyx.robots[id] = robot
  /* 设置监听器 */
  _listens(robot)
  /* 启动机器人 */
  await robot.start()
  /* 等待返回二维码链接 */
  const qrRes =  await _getQRcode(robot)
  return {
    ...qrRes,
    id: id
  }
}

const _getRobot = (ctx, params) => {
  const { id } = params
  const robot = ctx.xsyx.robots[id]
  if(robot){
    return robot
  }
  /* 错误的情况，未找到机器人 */
  console.log("🤖️ 未找到机器人")
}
const _getQRcode = async (instance) => {
  return new Promise((resolve) => {
    /* 垃圾命名，实际上是需要扫码的时候，而不是用户扫码后未点击确认的事件 */
    /** 
     * 没有登录缓存说明
     * 1. 是用户在手机端点击退出登录
     * 2. 登录状态过期
     * 3. 新号创建机器人
     */
    instance.on("scan", (qrcode, status) => {
      if (status === ScanStatus.Waiting && qrcode) {
        const qrcodeImageUrl = [
          'https://wechaty.js.org/qrcode/',
          encodeURIComponent(qrcode),
        ].join('')

        log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);

        console.log("\n==================================================================");
        console.log("\n* Two ways to sign on with qr code");
        console.log("\n1. Scan following QR code:\n");

        QR.generate(qrcode, {small: true})  // show qrcode on console

        console.log(`\n2. Or open the link in your browser: ${qrcodeImageUrl}`);
        console.log("\n==================================================================\n");
        resolve({
          qrcodeImageUrl,
          isAutoLogin: false
        })
      } else {
        log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`);
      }
      
    })
    /* 在这个阶段如果触发了login事件，说明已经有了登录缓存，直接返回 */
    instance.on("login", (user) => {
      resolve({
        qrcodeImageUrl: "",
        isAutoLogin: true
      })
    })
  })
  
}
const _listens = (instance) => {

  instance.on("login", (user) => {
    log.info(LOGPRE, `${user} login`);
  })

  .on("logout", (user, reason) => {
    log.info(LOGPRE, `${user} logout, reason: ${reason}`);
  })

  .on("message", async (message) => {
    log.info(LOGPRE, `on message: ${message.toString()}`);

    await getMessagePayload(message);

    await dingDongBot(message);
    if (message.self()) {
      // Don't deal with message = yourself.
      return
    }
  })

  .on("room-invite", async (roomInvitation) => {
    // log.info(LOGPRE, `on room-invite: ${roomInvitation}`);
    // await roomInvitation.accept()
    try {
      await roomInvitation.accept()
    } catch (e) {
      console.error(e)
    }
    log.info("TakeOver--自动接受")
  })

  .on("room-join", (room, inviteeList, inviter, date) => {
    log.info(LOGPRE, `on room-join, room:${room}, inviteeList:${inviteeList}, inviter:${inviter}, date:${date}`);
  })

  .on("room-leave", (room, leaverList, remover, date) => {
    log.info(LOGPRE, `on room-leave, room:${room}, leaverList:${leaverList}, remover:${remover}, date:${date}`);
  })

  .on("room-topic", (room, newTopic, oldTopic, changer, date) => {
    log.info(LOGPRE, `on room-topic, room:${room}, newTopic:${newTopic}, oldTopic:${oldTopic}, changer:${changer}, date:${date}`);
  })

  .on("friendship", async (friendship) => {
    // log.info(LOGPRE, `on friendship: ${friendship}`);
    const secret_words = friendship.hello()
    const type = friendship.type()
    log.info("监听到建立好友关系请求"),
    log.info("请求类型：", type)
    log.info("请求备注信息：", secret_words)
    log.info("请求发起人：", friendship.contact())
    console.log(friendship.contact())

    /* 类型 + 暗号 = 通过 */
    if(type === 2 && secret_words === '[:@xsyx.friendship.request]'){
      await friendship.accept()
      log.info("TakeOver--自动接受好友请求")
    }
    
  })

  .on("error", (error) => {
    log.error(LOGPRE, `on error: ${error}`);
  })
}


const pending = async (ctx, params) => {
  const instance = _getRobot(ctx, params)
  await instance.stop().then(() => {
    log.info(LOGPRE, "🤖️ 机器人被挂起.");
  });
}

const logout = async (ctx, params) => {
  instance = _getRobot(ctx, params)
  await instance.logout().then(() => {
    log.info(LOGPRE, "🤖️ 机器人退出登陆.");
  });
}

const getStatus = async (ctx, params) => {
  const instance = _getRobot(ctx, params)
  const status = await instance.logonoff()
  return status
}

/* 获取联系人列表 */
/* 不符合直觉的方法，老子真的是艹了，看问题👉 https://github.com/wechaty/wechaty/issues/1320 */
const getContactList = async (ctx, params) => {
  const instance = _getRobot(ctx, params)
  /* 会返回所有的联系人，即使是群中的，群里边的所有群员也会返回 */
  const list = await instance.Contact.findAll()
  /* 过滤掉非好友*/
  const actual = (list || []).filter(contact => !!contact.friend())
  return actual.map(item => {
    return {
      id: item.id,
      payload: item.payload
    }
  })
}
/* 获取群列表 */
const getRoomList = async (ctx, params) => {
  const instance = _getRobot(ctx, params)
  const list = await instance.Room.findAll()
  return (list || []).map(item => {
    const {
      payload
    } = item
    return {
      id: item.id,
      payload: {
        id: payload.id,
        topic: payload.topic,
        avatar: payload.avatar,
        ownerId: payload.ownerId,
      },
    }
  })
}
const queryContact = async (ctx, params) => {
  const { name } = params
  const instance = _getRobot(ctx, params)
  const one = await instance.Contact.find({
    name: name
  })
  return one
}
const queryRoom = async (ctx, params) => {
  const instance = _getRobot(ctx, params)
  const one = await instance.Room.find({
    params
  })
  return one
}
module.exports = {
  create,
  pending,
  logout,
  getStatus,
  getContactList,
  getRoomList,
  queryContact,
  queryRoom
}