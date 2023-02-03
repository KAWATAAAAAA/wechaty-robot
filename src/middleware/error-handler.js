module.exports = () => {
    return async function errorHandler(ctx, next) {
        try {
            await next()
        } catch (e) {
            debugger
            ctx.fail(null, e.message)
        }
    }
}