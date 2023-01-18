class idGen {
    static seed = Date.now()
    static get(n = 4){
        const current = `${idGen.seed++}`.split('').slice(-n).join('')
        return current
    }
    
}

module.exports = idGen