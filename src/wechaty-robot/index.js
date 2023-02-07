const {log, ScanStatus, WechatyBuilder, MiniProgram } = require("wechaty");
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
  const { token, id } = params
  const puppet = new PuppetPadlocal({
    token: token || "puppet_padlocal_a5e7e269ceb042a59b9c74f71885b7e4"
  })

  const robot = WechatyBuilder.build({
    name: id,
    puppet,
  })
  /* 记录机器人 */
  // const id = idGen.get()
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
  throw new Error("未找到机器人", {
    id: id
  })
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
  // .on("ready", async () => {
  //   let res = await instance.Room.findAll()
  //   console.log("---- 所有群 -----")
  //   console.log(res)
  // })
  .on("error", (error) => {
    log.error(LOGPRE, `on error: ${error}`);
  })

  // process.on('uncaughtException',(error) => {
  //   // debugger
  //   console.log(error)
  // })
  // process.on("unhandledRejection", (error) => {
  //   // debugger
  //   console.log(error)
  // })
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
const getUserSelf = async (ctx, params) => {
  const instance = _getRobot(ctx, params)
  const res = await instance.userSelf()
  return {
    id: res.id,
    payload: res.payload
  }
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
  await instance.ready()
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
const queryContact = async (ctx, params, getInstance = false) => {
  const { name } = params
  const instance = _getRobot(ctx, params)
  const one = await instance.Contact.find({
    name: name
  })
  if(!one){
    return
  }
  if(getInstance){
    return one
  }
  return {
    id: one.id,
    payload: one.payload
  }
}
const queryRoom = async (ctx, params, getInstance = false) => {
  const { topic } = params
  const instance = _getRobot(ctx, params)
  await instance.ready()
  const one = await instance.Room.find({
    topic: topic
  })
  if(!one){
    return
  }
  if(getInstance){
    return one
  }
  return {
    id: one.id,
    payload: {
      avatar: one.payload.avatar,
      id: one.payload.id,
      ownerId: one.payload.ownerId,
      topic: one.payload.topic,
    }
  }
}
const mpWrapper = (instance, params) => {
  const miniProgram = new instance.MiniProgram({
      username: 'gh_ff48e5a4d9bc@app',
      iconUrl: 'http://wx.qlogo.cn/mmhead/Q3auHgzwzM4PD4Ax636BGuURdTktic9A1WwII31oicpw9cX7QqfoRRiaQ/96',
      description: '兴盛优选',
      title: '【兴盛优选】麓谷总部店',//'郁金香 1盆 简易盆 高约25-30cm 冠幅约15-20cm 颜色随机',
      thumbUrl: 'https://image.xsyxsc.com/item/productShare/productDetailNone_new2023_0107.png?x-oss-process=image/watermark,image_c3VwcGx5L2l0ZW0vZGFpbHlQdXNoLzIwMjMwMTA2LzF6UG4wZUZaVWkuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMjM0LGhfMjM0LGxpbWl0XzAsbV9maXhlZC9yb3VuZGVkLWNvcm5lcnMscl84,g_nw,x_32,y_34/watermark,color_FF0000,size_30,g_nw,x_309,y_88,text_wqU=,type_d3F5LW1pY3JvaGVp/watermark,s_100,color_FF0000,size_48,g_nw,x_333,y_74,text_MTkuOTk=,type_ZmFuZ3poZW5naGVpdGk/watermark,color_FF0000,size_30,g_nw,x_393,y_141,text_MS445LiH,type_ZmFuZ3poZW5naGVpdGk',
      pagePath: "/subMain/main/index",
      // pagePath: "subMain/main/index?storeId=66880000043098&p=%7B%22c%22:600,%22s%22:66880000043098,%22device_id%22:%222fb28ce6ad1db4a4%22,%22f%22:%22personal_wechat%22,%22c_type%22:%22home%22,%22task_id%22:230103000434780%7D",
      // pagePath: "/pages/home/productDetail/productDetail?skuSn=028431103&spuSn=20230107910464101421803&storeId=66880000043098&p=%7B%22c%22:600,%22s%22:66880000043098,%22device_id%22:%22037b346822ae7aa3%22,%22f%22:%22personal_wechat%22,%22c_type%22:%22product%22,%22task_id%22:230112000153524%7D",
  });
  return miniProgram
}
const MessageType = {
  TEXT: 1,
  IMAGE: 2,
  VOICE: 3,
  VIDEO: 4,
  MINI_PROGRAM: 5,
};
const sendMessage = async (instance, to, message) => {
  const types = {
      [MessageType.TEXT]: async () => {
          await to.say(message.data)
      },
      [MessageType.MINI_PROGRAM]: async () => {
          await to.say(mpWrapper(instance, message))
      }
  }
  return types[message.type]()
}
module.exports = {
  create,
  pending,
  logout,
  getStatus,
  getUserSelf,
  getContactList,
  getRoomList,
  queryContact,
  queryRoom,
  sendMessage,
}