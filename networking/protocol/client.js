const ZPackage = require('../zpackage')

module.exports.parsePeerInfo = (buffer) => {
  let peerInfo = new ZPackage(buffer)
  let uid = peerInfo.readInt64()
  let version = peerInfo.readString()
  let referencePosition = peerInfo.readVector3()
  let name = peerInfo.readString()
  let passwordHash = Buffer.from(peerInfo.readString())
  let sessionTicket = peerInfo.readBuffer()

  return {
    uid,
    version,
    referencePosition,
    name,
    passwordHash,
    sessionTicket
  }
}

module.exports.writePeerInfo = (uid, version, referencePosition, name, passwordHash, authTicket) => {
  let peerInfo = new ZPackage()

  peerInfo.writeInt64(uid)
  peerInfo.writeString(version)
  peerInfo.writeVector3(referencePosition)
  peerInfo.writeString(name)
  peerInfo.writeString(passwordHash.toString())
  peerInfo.writeBuffer(authTicket)

  return peerInfo.getBuffer()
}