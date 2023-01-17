class idGen {
    static seed = Date.now()
    static get(n = 4){
        const now = Date.now()
        const current = Number(now.toString().split('').slice(-n).join(''))
        if(now == idGen.seed){
            current += 1
        }
        return current
    }
    
}

module.exports = idGen