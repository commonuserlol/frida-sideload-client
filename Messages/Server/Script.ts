import { ByteStream } from "bytestream.ts";
import { Message } from "../message";
import { Storage } from "../../Utils/Storage";
import * as UTF8 from "../../Utils/UTF8";

export class ScriptMessage extends Message {
    constructor(storage: Storage);
    constructor(stream: ByteStream, storage: Storage);
    constructor(stream: ByteStream | Storage, storage?: Storage) {
        storage ? super(stream as ByteStream, storage) : super(stream as Storage);
        this.id = 1340;
    }

    decode(): void {
        const scriptLength = this.stream.readU32();
        this.storage.script = UTF8.fromBytes(new Uint8Array(this.stream.readBytes(scriptLength)));
    }

    encode(): void {}

    process(): Message | undefined {
        this.storage.flush();
        Script.evaluate("/payload.js", this.storage.script);
        return;
    }

    isClientToServer(): boolean {
        return false;
    }
}