import ByteStream from "bytestream.ts";
import "lz4ts";
import getRandomValues from "polyfill-crypto.getrandomvalues";
import { siv } from "@noble/ciphers/aes";
import { TextDecoder } from '@polkadot/x-textdecoder';
import { TextEncoder } from "@polkadot/x-textencoder";

export default class Storage {
    path: string;
    key: Uint8Array;
    script: string;
    checksum: string;

    constructor(path: string, key: Uint8Array) {
        this.path = path;
        this.key = key;
        this.script = "";
        this.checksum = "";
    }

    load() {
        try {
            const file = new File(this.path, "rb+");
            const stream = new ByteStream(file.readBytes(), "big");
            const scriptSize = stream.readU32();
            const nonce = new Uint8Array(stream.readBytes(12));
            this.script = new TextDecoder().decode(
                LZ4.decompress(
                    siv(this.key, nonce).decrypt(
                        new Uint8Array(stream.readBytes(scriptSize))
                    )
                )
            );
            this.checksum = Checksum.compute("sha512", this.script);
        } catch (e) {
            (globalThis as any).console.error("Unable to load script, awaiting for response to save it");
        }
    }

    dump() {
        try {
            const file = new File(this.path, "wb+");
            const stream = new ByteStream(4 + 12 + this.script.length, "big");
            const nonce = new Uint8Array(12);
            getRandomValues(nonce);

            const result = siv(this.key, nonce).encrypt(
                LZ4.compress(
                    new TextEncoder().encode(this.script)
                )
            );

            stream.writeU32(result.length);
            stream.writeBytes(nonce);
            stream.writeBytes(result);
            file.write(stream.byteArray);
            file.close();
        } catch (e) {
            (globalThis as any).console.error("Unable to save script");
        }
    }
}
