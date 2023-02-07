const pkg = require("../../package.json")

/* 本意是让这个对象注入到 context 上 */
module.exports = {
    appname: "wechaty-robot-test",
    version: pkg.version,
}


