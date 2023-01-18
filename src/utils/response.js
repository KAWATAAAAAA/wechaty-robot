
function success(data, msg = "success", code = 1001) {
    this.response.status = 200
    this.response.body = {
        code,
        data,
        msg
    }
}



function fail(data, msg = "fail", code = 9999) {
    this.response.status = 200
    this.response.body = {
        code,
        data,
        msg
    }
}

const error = (code) => {
    this.response.status = code
}
module.exports = {
    success,
    fail,
    error
}