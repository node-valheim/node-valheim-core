const ZPackage = require('../zpackage')

module.exports.parseZDOData = (buffer) => {
  let zdoData = new ZPackage(buffer)

  let invalidSectors = []
  let invalidSectorCount = zdoData.readUInt32()

  for (let i = 0; i < invalidSectorCount; i++)
    invalidSectors.push(zdoData.readZDOId())

  let zdos = []
  let zdoId = zdoData.readZDOId()

  while (zdoId.userId != 0 || zdoId.id !== 0) {
    let ownerRevision = zdoData.readUInt32()
    let dataRevision = zdoData.readUInt32()
    let owner = zdoData.readInt64()
    let position = zdoData.readVector3()
    let zdoBuffer = zdoData.readBuffer()
    let zdoReader = new ZPackage(zdoBuffer)
    let zdo = zdoReader.readZdo()

    zdos.push({
      id: zdoId,
      ownerRevision,
      dataRevision,
      owner,
      position,
      zdo,
    })

    zdoId = zdoData.readZDOId()
  }

  return {
    invalidSectors,
    zdos,
  }
}

module.exports.writeZDOData = (invalidSectors, zdos) => {
  let zdoData = new ZPackage()

  zdoData.writeUInt32(invalidSectors.length)

  for (const invalidSector of invalidSectors)
    zdoData.writeZDOId(invalidSector)

  for (const zdo of zdos) {
    zdoData.writeZDOId(zdo.id)
    zdoData.writeUInt32(zdo.ownerRevision)
    zdoData.writeUInt32(zdo.dataRevision)
    zdoData.writeInt64(zdo.owner)
    zdoData.writeVector3(zdo.position)

    let zdoPkg = new ZPackage();
    zdoPkg.writeZdo(zdo.zdo);

    zdoData.writeBuffer(zdoPkg.getBuffer())
  }

  zdoData.writeZDOId({ userId: 0n, id: 0 })

  return zdoData.getBuffer()
}

module.exports.parseRoutedRPC = (buffer) => {
  let routedRpc = new ZPackage(buffer)

  let msgId = routedRpc.readInt64()
  let senderPeerId = routedRpc.readInt64()
  let targetPeerId = routedRpc.readInt64()
  let zdoId = routedRpc.readZDOId()
  let methodHash = routedRpc.readInt32()
  let parameters = routedRpc.readBuffer()

  return {
    msgId,
    senderPeerId,
    targetPeerId,
    zdoId,
    methodHash,
    parameters,
  }
}

module.exports.writeRoutedRPC = (msgId, senderPeerId, targetPeerId, zdoId, methodHash, parameters) => {
  let routedRpc = new ZPackage()

  routedRpc.writeInt64(msgId)
  routedRpc.writeInt64(senderPeerId)
  routedRpc.writeInt64(targetPeerId)
  routedRpc.writeZDOId(zdoId)
  routedRpc.writeInt32(methodHash)
  routedRpc.writeBuffer(parameters)

  return routedRpc.getBuffer()
}