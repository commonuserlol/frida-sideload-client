import ByteStream from "bytestream.ts";
import "lz4ts";
import getRandomValues from "polyfill-crypto.getrandomvalues";
import { siv } from "@noble/ciphers/aes";
import AskChecksumMessage from "./Protocol/AskChecksum";
import ClientSocket from "./Socket";
import Storage from "./Storage";
import Message from "./Protocol/Message";
import ChecksumMessage from "./Protocol/Checksum";
import AskScriptMessage from "./Protocol/AskScript";
import ScriptMessage from "./Protocol/Script";
import FinalizeMessage from "./Protocol/Finalize";

export default class Client {
    storage: Storage;
    socket: ClientSocket;
    key: Uint8Array;
    constructor(path: string, key: Uint8Array) {
        this.storage = new Storage(path, key);
        this.socket = new ClientSocket();
        this.key = key;
    }

    async connect(host: string, port: number) {
        this.storage.load();
        const i = setTimeout(() => { throw new Error("Timeout reached") }, 3000);
        await this.socket.connect(host, port);
        clearTimeout(i);
    }

    async finalize() {
        this.socket.disconnect();
        this.storage.dump();
    }

    /** @internal */
    async packAndSend(message: Message) {
        message.encode();
        const header = new ByteStream(1 + 12 + 4, "big", 0);
        const nonce = new Uint8Array(12);
        getRandomValues(nonce);
        const messageBytes = siv(this.key, nonce)
            .encrypt(new Uint8Array(message.stream.byteArray));
        header.writeU8(message.id);
        header.writeBytes(nonce);
        header.writeU16(messageBytes.byteLength);
        header.writeBytes(messageBytes);

        this.socket.send(header.byteArray);
        if (message.id != 54)
            await this.unpackAndProcess(await this.socket.recv(1 + 12 + 4));
    }

    async unpackAndProcess(payload: ArrayBuffer) {
        const header = new ByteStream(payload, "big");
        const id = header.readU8();
        const nonce = header.readBytes(12);
        const size = header.readU32();
        const body = siv(this.key, new Uint8Array(nonce))
            .decrypt(new Uint8Array(await this.socket.recv(size)));

        switch (id) {
            case 51: {
                const message = new ChecksumMessage(new ByteStream(body, "big"));
                message.decode();

                if (message.checksum == this.storage.checksum) {
                    Script.evaluate("/payload.js", this.storage.script);
                    return;
                }

                this.packAndSend(new AskScriptMessage());
                break;
            }
            case 53: {
                const decompressed = LZ4.decompress(new Uint8Array(body));
                const message = new ScriptMessage(new ByteStream(decompressed, "big"));
                message.decode();

                this.storage.script = message.script;
                this.storage.dump();

                Script.evaluate("/payload.js", message.script);

                this.packAndSend(new FinalizeMessage());
                this.finalize();
                break;
            }
        }
    }

    async loop() {
        try {
            await this.packAndSend(new AskChecksumMessage());
        } catch (e: any) {
            this.finalize();
            (globalThis as any).console.error(`Unable communicate with server: ${e.stack}`);
        }
    }
}
