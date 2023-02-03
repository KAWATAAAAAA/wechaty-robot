// const f = require("@/utils/response")
const rules = {
    '/robot/getQRcode': {
        id: {
            required: true,
            type: 'string',
        },
        token: {
            required: true,
            type: 'string',
        }
    }
}

module.exports = () => {
    return async function requestValidator(ctx, next) {
        const _path = ctx.request.path
        let error = false
        /* 相应的路由有校验规则 */
        if(rules[_path]){
            const params = ctx.method === "GET" ? ctx.request.query : ctx.request.body
            error = Object.keys(rules[_path]).some(key => {
                const { required, type, validator } = rules[_path][key]
                if(required && !params[key]){
                    ctx.fail(null, `【${key}】字段必填`)
                    return true
                }
                if(type && (typeof params[key] !== type)){
                    ctx.fail(null, `【${key}】字段类型必须为 ${type}`)
                    return true
                }
            })
        }
        if(error){
            return
        }
        await next()
    }
}