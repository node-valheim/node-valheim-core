class ZPackage {
  buffer = null;
  index = 0;
  length = 0;

  constructor(buffer = null) {
    if (buffer === null) {
      this.buffer = Buffer.allocUnsafeSlow(128);
      this.index = 0;
      this.length = 0;
    }
    else {
      this.buffer = buffer;
      this.index = 0;
      this.length = buffer.length;
    }
  }

  writeByte(value) {
    this.write(value, 1, (value, index) => {
      this.buffer.writeUInt8(value, index)
    });
  }

  writeBoolean(value) {
    this.writeByte(value ? 1 : 0);
  }

  writeInt16(value) {
    this.write(value, 2, (value, index) => {
      this.buffer.writeInt16LE(value, index)
    });
  }

  writeInt32(value) {
    this.write(value, 4, (value, index) => {
      this.buffer.writeInt32LE(value, index)
    });
  }

  writeInt64(value) {
    this.write(value, 8, (value, index) => {
      this.buffer.writeBigInt64LE(value, index)
    });
  }

  writeUInt16(value) {
    this.write(value, 2, (value, index) => {
      this.buffer.writeUInt16LE(value, index)
    });
  }

  writeUInt32(value) {
    this.write(value, 4, (value, index) => {
      this.buffer.writeUInt32LE(value, index)
    });
  }

  writeUInt64(value) {
    this.write(value, 8, (value, index) => {
      this.buffer.writeBigUInt64LE(value, index)
    });
  }

  writeFloat(value) {
    this.write(value, 4, (value, index) => {
      this.buffer.writeFloatLE(value, index)
    });
  }

  writeDouble(value) {
    this.write(value, 8, (value, index) => {
      this.buffer.writeDoubleLE(value, index)
    });
  }

  write7BitEncodedInt(value)
  {
    while (value >= 0x80)
    {
      this.writeByte((value & 0xFF) | 0x80);
      value = value >> 7;
    }

    this.writeByte(value);
  }

  writeString(value) {
    // ok boys now it's time to get to work
    this.write7BitEncodedInt(value.length);
    this.write(value, value.length, (value, index) => {
      this.buffer.write(value, index)
    });
  }

  writeZDOId(value) {
    this.writeInt64(value.userId);
    this.writeUInt32(value.id);
  }

  writeVector3(value) {
    this.writeFloat(value.x);
    this.writeFloat(value.y);
    this.writeFloat(value.z);
  }

  writeVector2i(value) {
    this.writeInt32(value.x);
    this.writeInt32(value.y);
  }

  writeQuaternion(value) {
    this.writeFloat(value.x);
    this.writeFloat(value.y);
    this.writeFloat(value.z);
    this.writeFloat(value.w);
  }

  writeBuffer(buffer) {
    this.writeUInt32(buffer.length);

    this.checkRealloc(buffer.length);

    buffer.copy(this.buffer, this.index);

    this.advance(buffer.length);
  }

  writeZdo(zdo) {
    this.writeBoolean(zdo.persistant)
    this.writeBoolean(zdo.distant)
    this.writeInt64(zdo.timeCreated)
    this.writeInt32(zdo.pgwVersion)
    this.writeByte(zdo.objectType)
    this.writeInt32(zdo.prefab)
    this.writeQuaternion(zdo.rotation)

    let bitFlag = 0
    let bitFlagIndex = this.index

    this.writeInt32(bitFlag);

    if (zdo.hasOwnProperty('floats') && Object.keys(zdo.floats).length > 0) {
      bitFlag |= 1

      this.writeByte(Object.keys(zdo.floats).length)

      for (const hashCode in zdo.floats) {
        this.writeInt32(hashCode)
        this.writeFloat(zdo.floats[hashCode])
      }
    }

    if (zdo.hasOwnProperty('vector3s') && Object.keys(zdo.vector3s).length > 0) {
      bitFlag |= 2

      this.writeByte(Object.keys(zdo.vector3s).length)

      for (const hashCode in zdo.vector3s) {
        this.writeInt32(hashCode)
        this.writeVector3(zdo.vector3s[hashCode])
      }
    }

    if (zdo.hasOwnProperty('quaternions') && Object.keys(zdo.quaternions).length > 0) {
      bitFlag |= 4

      this.writeByte(Object.keys(zdo.quaternions).length)

      for (const hashCode in zdo.quaternions) {
        this.writeInt32(hashCode)
        this.writeQuaternion(zdo.quaternions[hashCode])
      }
    }

    if (zdo.hasOwnProperty('int32s') && Object.keys(zdo.int32s).length > 0) {
      bitFlag |= 8

      this.writeByte(Object.keys(zdo.int32s).length)

      for (const hashCode in zdo.int32s) {
        this.writeInt32(hashCode)
        this.writeInt32(zdo.int32s[hashCode])
      }
    }

    if (zdo.hasOwnProperty('int64s') && Object.keys(zdo.int64s).length > 0) {
      bitFlag |= 64

      this.writeByte(Object.keys(zdo.int64s).length)

      for (const hashCode in zdo.int64s) {
        this.writeInt32(hashCode)
        this.writeInt64(zdo.int64s[hashCode])
      }
    }

    if (zdo.hasOwnProperty('strings') && Object.keys(zdo.strings).length > 0) {
      bitFlag |= 16

      this.writeByte(Object.keys(zdo.strings).length)

      for (const hashCode in zdo.strings) {
        this.writeInt32(hashCode)
        this.writeString(zdo.strings[hashCode])
      }
    }

    if (zdo.hasOwnProperty('buffers') && Object.keys(zdo.buffers).length > 0) {
      bitFlag |= 128

      this.writeByte(Object.keys(zdo.buffers).length)

      for (const hashCode in zdo.buffers) {
        this.writeInt32(hashCode)
        this.writeBuffer(zdo.buffers[hashCode])
      }
    }

    let currentIndex = this.index
    this.index = bitFlagIndex

    this.writeInt32(bitFlag)

    this.index = currentIndex
  }

  writeStringList(value) {
    this.writeUInt32(value.length)

    for (const val of value)
      this.writeString(val)
  }

  writeHitData(value) {
    this.writeFloat(value.damage.damage)
    this.writeFloat(value.damage.blunt)
    this.writeFloat(value.damage.slash)
    this.writeFloat(value.damage.pierce)
    this.writeFloat(value.damage.chop)
    this.writeFloat(value.damage.pickaxe)
    this.writeFloat(value.damage.fire)
    this.writeFloat(value.damage.frost)
    this.writeFloat(value.damage.lightning)
    this.writeFloat(value.damage.poison)
    this.writeFloat(value.damage.spirit)

    this.writeInt32(value.toolTier)
    this.writeFloat(value.pushForce)
    this.writeFloat(value.backstabBonus)
    this.writeFloat(value.staggerMultiplier)
    this.writeBoolean(value.dodgeable)
    this.writeBoolean(value.blockable)
    this.writeVector3(value.point)
    this.writeVector3(value.direction)
    this.writeString(value.statusEffect)
    this.writeZDOId(value.attacker)
    this.writeInt32(value.skill)
  }

  writeTerrainOpSettings(value) {
    this.writeFloat(value.levelOffset)
    this.writeBoolean(value.level)
    this.writeFloat(value.levelRadius)
    this.writeBoolean(value.square)
    this.writeBoolean(value.raise)
    this.writeFloat(value.raiseRadius)
    this.writeFloat(value.raisePower)
    this.writeFloat(value.raiseDelta)
    this.writeBoolean(value.smooth)
    this.writeFloat(value.smoothRadius)
    this.writeFloat(value.smoothPower)
    this.writeBoolean(value.paintCleared)
    this.writeBoolean(value.paintHeightCheck)
    this.writeInt32(value.paintType)
    this.writeFloat(value.paintRadius)

    return value
  }

  readByte() {
    return this.read(1, this.buffer.readUInt8.bind(this.buffer));
  }

  readBoolean() {
    return this.readByte() !== 0;
  }

  readInt16() {
    return this.read(2, this.buffer.readInt16LE.bind(this.buffer));
  }

  readInt32() {
    return this.read(4, this.buffer.readInt32LE.bind(this.buffer));
  }

  readInt64() {
    return this.read(8, this.buffer.readBigInt64LE.bind(this.buffer));
  }

  readUInt16() {
    return this.read(2, this.buffer.readUInt16LE.bind(this.buffer));
  }

  readUInt32() {
    return this.read(4, this.buffer.readUInt32LE.bind(this.buffer));
  }

  readUInt64() {
    return this.read(8, this.buffer.readBigUInt64LE.bind(this.buffer));
  }

  readFloat() {
    return this.read(4, this.buffer.readFloatLE.bind(this.buffer));
  }

  readDouble() {
    return this.read(8, this.buffer.readDoubleLE.bind(this.buffer));
  }

  read7BitEncodedInt()
  {
    let num = this.readByte();
    let length = num & 0x7F;
    let shift = 7;

    while ((num & 0x80) > 0)
    {
      num = this.readByte();
      length |= ((num & 0x7F) << shift);
      shift += 7;
    }

    return length;
  }

  readString() {
    let length = this.read7BitEncodedInt();

    if (!this.checkReadBounds(length))
      throw new RangeError('String with length ' + length + ' extends past buffer');

    let value = this.buffer.toString('utf8', this.index, this.index + length);

    this.index += length;

    return value;
  }

  readZDOId() {
    let userId = this.readInt64();
    let id = this.readUInt32();

    return {
      userId,
      id
    };
  }

  readZdo() {
    let persistant = this.readBoolean()
    let distant = this.readBoolean()
    let timeCreated = this.readInt64()
    let pgwVersion = this.readInt32()
    let objectType = this.readByte()
    let prefab = this.readInt32()
    let rotation = this.readQuaternion()

    let zdo = {
      persistant,
      distant,
      timeCreated,
      pgwVersion,
      objectType,
      prefab,
      rotation
    }

    zdo.int32s = {}
    zdo.floats = {}
    zdo.vector3s = {}
    zdo.quaternions = {}
    zdo.int64s = {}
    zdo.strings = {}
    zdo.buffers = {}

    let bitFlag = this.readInt32()

    if ((bitFlag & 1) !== 0) {
      let count = this.readByte()

      zdo.floats = {}

      for (let i = 0; i < count; i++) {
        let hashCode = this.readInt32()
        let value = this.readFloat()

        zdo.floats[hashCode] = value
      }
    }

    if ((bitFlag & 2) !== 0) {
      let count = this.readByte()

      zdo.vector3s = {}

      for (let i = 0; i < count; i++) {
        let hashCode = this.readInt32()
        let value = this.readVector3()

        zdo.vector3s[hashCode] = value
      }
    }

    if ((bitFlag & 4) !== 0) {
      let count = this.readByte()

      zdo.quaternions = {}

      for (let i = 0; i < count; i++) {
        let hashCode = this.readInt32()
        let value = this.readQuaternion()

        zdo.quaternions[hashCode] = value
      }
    }

    if ((bitFlag & 8) !== 0) {
      let count = this.readByte()

      zdo.int32s = {}

      for (let i = 0; i < count; i++) {
        let hashCode = this.readInt32()
        let value = this.readInt32()

        zdo.int32s[hashCode] = value
      }
    }

    if ((bitFlag & 64) !== 0) {
      let count = this.readByte()

      zdo.int64s = {}

      for (let i = 0; i < count; i++) {
        let hashCode = this.readInt32()
        let value = this.readInt64()

        zdo.int64s[hashCode] = value
      }
    }

    if ((bitFlag & 16) !== 0) {
      let count = this.readByte()

      zdo.strings = {}

      for (let i = 0; i < count; i++) {
        let hashCode = this.readInt32()
        let value = this.readString()

        zdo.strings[hashCode] = value
      }
    }

    if ((bitFlag & 128) !== 0) {
      let count = this.readByte()

      zdo.buffers = {}

      for (let i = 0; i < count; i++) {
        let hashCode = this.readInt32()
        let value = this.readBuffer()

        zdo.buffers[hashCode] = value
      }
    }

    return zdo;
  }

  readVector3() {
    let x = this.readFloat();
    let y = this.readFloat();
    let z = this.readFloat();

    return { x, y, z };
  }

  readVector2i() {
    let x = this.readInt32();
    let y = this.readInt32();

    return { x, y };
  }

  readQuaternion() {
    let x = this.readFloat();
    let y = this.readFloat();
    let z = this.readFloat();
    let w = this.readFloat();

    return { x, y, z, w };
  }

  readBuffer() {
    let length = this.readUInt32();

    if (!this.checkReadBounds(length))
      throw new RangeError('Buffer with length ' + length + ' extends past buffer');

    let newBuffer = Buffer.allocUnsafe(length);
    this.buffer.copy(newBuffer, 0, this.index, this.index + length);

    this.index += length;

    return newBuffer;
  }

  readStringList() {
    let count = this.readUInt32()
    let value = []

    for (let i = 0; i < count; i++)
      value.push(this.readString())

    return value
  }

  readHitData() {
    let value = {
      damage: {}
    }

    value.damage.damage = this.readFloat()
    value.damage.blunt = this.readFloat()
    value.damage.slash = this.readFloat()
    value.damage.pierce = this.readFloat()
    value.damage.chop = this.readFloat()
    value.damage.pickaxe = this.readFloat()
    value.damage.fire = this.readFloat()
    value.damage.frost = this.readFloat()
    value.damage.lightning = this.readFloat()
    value.damage.poison = this.readFloat()
    value.damage.spirit = this.readFloat()

    value.toolTier = this.readInt32()
    value.pushForce = this.readFloat()
    value.backstabBonus = this.readFloat()
    value.staggerMultiplier = this.readFloat()
    value.dodgeable = this.readBoolean()
    value.blockable = this.readBoolean()
    value.point = this.readVector3()
    value.direction = this.readVector3()
    value.statusEffect = this.readString()
    value.attacker = this.readZDOId()
    value.skill = this.readInt32()

    return value

    /*

    None,
		Swords,
		Knives,
		Clubs,
		Polearms,
		Spears,
		Blocking,
		Axes,
		Bows,
		FireMagic,
		FrostMagic,
		Unarmed,
		Pickaxes,
		WoodCutting,
		Jump = 100,
		Sneak, // 101
		Run, // 102
		Swim, // 103
		All = 999


public bool Raise(float factor)
		{
			if (this.m_level >= 100f)
			{
				return false;
			}
			float num = this.m_info.m_increseStep * factor;
			this.m_accumulator += num;
			float nextLevelRequirement = this.GetNextLevelRequirement();
			if (this.m_accumulator >= nextLevelRequirement)
			{
				this.m_level += 1f;
				this.m_level = Mathf.Clamp(this.m_level, 0f, 100f);
				this.m_accumulator = 0f;
				return true;
			}
			return false;
		}

		// Token: 0x060010E7 RID: 4327 RVA: 0x0007869F File Offset: 0x0007689F
		private float GetNextLevelRequirement()
		{
			return Mathf.Pow(this.m_level + 1f, 1.5f) * 0.5f + 0.5f;
		}

		// Token: 0x060010E8 RID: 4328 RVA: 0x000786C4 File Offset: 0x000768C4
		public float GetLevelPercentage()
		{
			if (this.m_level >= 100f)
			{
				return 0f;
			}
			float nextLevelRequirement = this.GetNextLevelRequirement();
			return Mathf.Clamp01(this.m_accumulator / nextLevelRequirement);
		}

    */
  }

  readTerrainOpSettings() {
    let value = {}

    value.levelOffset = this.readFloat()
    value.level = this.readBoolean()
    value.levelRadius = this.readFloat()
    value.square = this.readBoolean()
    value.raise = this.readBoolean()
    value.raiseRadius = this.readFloat()
    value.raisePower = this.readFloat()
    value.raiseDelta = this.readFloat()
    value.smooth = this.readBoolean()
    value.smoothRadius = this.readFloat()
    value.smoothPower = this.readFloat()
    value.paintCleared = this.readBoolean()
    value.paintHeightCheck = this.readBoolean()
    value.paintType = /*(TerrainModifier.PaintType)*/this.readInt32()
    value.paintRadius = this.readFloat()

    return value
    /*
    public enum PaintType
    {
      // Token: 0x0400132D RID: 4909
      Dirt,
      // Token: 0x0400132E RID: 4910
      Cultivate,
      // Token: 0x0400132F RID: 4911
      Paved,
      // Token: 0x04001330 RID: 4912
      Reset
     }
     */
  }

  write(value, size, performWrite) {
    this.checkRealloc(size)

    performWrite(value, this.index)

    this.advance(size)
  }

  read(size, performRead) {
    if (!this.checkReadBounds(size))
      throw new RangeError('Tried to read out of bounds of buffer');

    let value = performRead(this.index);
    this.index += size;

    return value;
  }

  checkRealloc(size) {
    if (this.length + size > this.buffer.length) {
      let newLength = this.buffer.length * 2

      while (this.length + size > newLength)
        newLength *= 2;

      let newBuffer = Buffer.allocUnsafe(newLength);

      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
  }

  checkReadBounds(size) {
    if (this.index + size > this.length)
      return false;

    return true;
  }

  advance(size) {
    this.index += size;

    if (this.index > this.length)
      this.length = this.index;
  }

  getBuffer() {
    return this.buffer.slice(0, this.length);
  }
}

module.exports = ZPackage;