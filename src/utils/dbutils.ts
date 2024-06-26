import levelup from "levelup";
import leveldown from "leveldown";
import encode from "encoding-down";
import { genSecret } from "./secret.js";

interface StorageValue {
  secret: string;
  channelId: string;
}

interface ReverseStorageValue {
  serverId: string;
  channelId: string;
}

const db = levelup(encode(leveldown("./secretsdb")));

export default db;

export const getByServerId = async function (
  serverId: string
): Promise<StorageValue> {
  return JSON.parse(await db.get(serverId)) as StorageValue;
};

export const getBySecret = async function (
  secret: string
): Promise<ReverseStorageValue | undefined> {
  let finalValue;
  try {
    const serverId: string = await db.get(secret);
    const { channelId } = JSON.parse(await db.get(serverId));
    finalValue = { serverId, channelId };
  } catch (err) {
    if (err instanceof Error && err.name === "NotFoundError") {
      finalValue = undefined;
    } else {
      console.error(err);
    }
  }

  return finalValue;
};

// places both a (serverId, {secret, channelId}) and a (secret, serverId) key/value pair into the db for reverse lookup by secret
export const putWithReverse = async function (
  key: string,
  value: StorageValue
): Promise<void> {
  await db.put(key, JSON.stringify(value));
  await db.put(value.secret, key);
};

export const resetSecret = async function (serverId: string, force?: boolean) {
  if (!force) {
    const current = await getByServerId(serverId);
    // clean up reverse index of (secret, key)
    db.del(current.secret);
    putWithReverse(serverId, {
      secret: genSecret(),
      channelId: current.channelId,
    });
    // something has likely gone very wrong if 'force' is required. It's possible that a reverse index (secret, serverId) remains in the database as a result.
    // Attempt to clean up records by iterating over db (this could be bad), then pave over existing (serverId, <StorageValue>)
    // and allow discord server admin to set SparkDouble's channel again.
  } else {
    cleanupReverseIndex(serverId);
    putWithReverse(serverId, { secret: genSecret(), channelId: "" });
  }
};

export const setServerChannel = async function (
  serverId: string,
  newChannelId: string
) {
  const data = await getByServerId(serverId);
  await db.put(
    serverId,
    JSON.stringify({ secret: data.secret, channelId: newChannelId })
  );
};

export const getServerChannel = async function (
  serverId: string
): Promise<string> {
  const data = await getByServerId(serverId);
  return data.channelId;
};

// used for when something goes wrong and the reverse index (secret, serverId) has to be manually found and removed
export const cleanupReverseIndex = function (serverId: string) {
  let foundKey: string[] = [];
  const readStream = db.createReadStream();
  readStream.on("data", (entry) => {
    if (entry.value === serverId) {
      foundKey.push(entry.key);
    }
  });
  readStream.on("end", () => {
    if (foundKey.length === 0) return;
    for (const key of foundKey) {
      db.del(key, (err) => {
        err
          ? console.error("Error while deleting:", err)
          : console.log("Successfully cleaned up reverse index:", key);
      });
    }
  });
  readStream.on("error", (err) => {
    console.error("Error while cleaning up reverse index:", err);
  });
};

// used for debugging and looking over the KV database
export const logDBDump = function (): void {
  db.createReadStream()
    .on("data", function (entry) {
      console.log("Key:", entry.key, "Value:", entry.value);
    })
    .on("error", function (err) {
      console.error("Error reading from database:", err);
    })
    .on("end", function () {
      console.log("Finished reading from database");
    });
};
