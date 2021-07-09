const ZPackage = require('../zpackage')

module.exports.parsePeerInfo = (buffer) => {
  let peerInfo = new ZPackage(buffer)
  let uid = peerInfo.readInt64()
  let version = peerInfo.readString()
  let referencePosition = peerInfo.readVector3()
  let name = peerInfo.readString()
  let worldName = peerInfo.readString()
  let worldSeed = peerInfo.readInt32()
  let seedName = peerInfo.readString()
  let worldUid = peerInfo.readInt64()
  let worldGenVersion = peerInfo.readInt32()
  let netTime = peerInfo.readDouble()

  return {
    uid,
    version,
    referencePosition,
    name,
    worldName,
    worldSeed,
    seedName,
    worldUid,
    worldGenVersion,
    netTime
  }
}

module.exports.writePeerInfo = (uid, version, referencePosition, name, worldName, worldSeed, seedName, worldUid, worldGenVersion, netTime) => {
  let peerInfo = new ZPackage();

  peerInfo.writeInt64(uid);
  peerInfo.writeString(version);
  peerInfo.writeVector3(referencePosition);
  peerInfo.writeString(name);
  peerInfo.writeString(worldName)
  peerInfo.writeInt32(worldSeed)
  peerInfo.writeString(seedName)
  peerInfo.writeInt64(worldUid)
  peerInfo.writeInt32(worldGenVersion)
  peerInfo.writeDouble(netTime)

  return peerInfo.getBuffer();
}

module.exports.parsePlayerList = (buffer) => {
  let playerList = new ZPackage(buffer)

  let playerCount = playerList.readInt32()

  let players = [];

  for (let i = 0; i < playerCount; i++) {
    let playerName = playerList.readString()
    let host = playerList.readString()
    let characterId = playerList.readZDOId()
    let publicPosition = playerList.readBoolean()
    let position = null

    if (publicPosition)
      position = playerList.readVector3()

    players.push({
      name: playerName,
      host,
      characterId,
      publicPosition,
      position
    })
  }

  return players
}

module.exports.writePlayerList = (players) => {
  let playerList = new ZPackage()

  playerList.writeInt32(players.length)

  for (const player of players) {
    playerList.writeString(player.name)
    playerList.writeString(player.host)
    playerList.writeString(player.characterId)
    playerList.writeString(player.publicPosition)

    if (player.publicPosition)
      playerList.writeVector3(player.position);
  }

  return playerList.getBuffer();
}