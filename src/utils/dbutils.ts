import levelup from "levelup";
import leveldown from "leveldown";
import encode from "encoding-down";

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

export const getBySecret = async function (
  secret: string
): Promise<ReverseStorageValue> {
  const serverId = await db.get(secret);
  const { channelId } = JSON.parse(await db.get(serverId));

  return { serverId, channelId };
};

// places both a (serverId, {secret, channelId}) and a (secret, serverId) key/value pair into the db for reverse lookup by secret
export const putWithReverse = async function (
  key: string,
  value: StorageValue
): Promise<void> {
  await db.put(key, JSON.stringify(value));
  await db.put(value.secret, key);
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
