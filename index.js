String.prototype.getStableHashCode = function () {
    let hash1 = 5381;
    let hash2 = hash1;

    for(let i = 0; i < this.length && this.charAt(i) !== '\0'; i += 2) {
        hash1 = (((hash1 << 5) & 0xffffffff )+ hash1) ^ this.charCodeAt(i)

        if (i === this.length - 1 || this.charAt(i + 1) === '\0')
            break;

        hash2 = (((hash2 << 5) & 0xffffffff) + hash2) ^ this.charCodeAt(i + 1)
    }

    return (hash1 + Math.imul(hash2, 1566083941)) & 0xffffffff
}

const ZPackage = require('./networking/zpackage')
const protocol = require('./networking/protocol')

module.exports = { ZPackage, protocol }