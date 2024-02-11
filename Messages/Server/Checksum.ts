import { ByteStream } from "bytestream.ts";
import { Message } from "../message";
import { Storage } from "../../Utils/Storage";
import * as UTF8 from "../../Utils/UTF8";
import { AskScriptMessage } from "../Client/AskScript";

export class ChecksumMessage extends Message {
    checksum: string;

    constructor(storage: Storage);
    constructor(stream: ByteStream, storage: Storage);
    constructor(stream: ByteStream | Storage, storage?: Storage) {
        storage ? super(stream as ByteStream, storage) : super(stream as Storage);
        this.id = 1337;
    }

    decode(): void {
        const checksumLength = this.stream.readU8();
        this.checksum = UTF8.fromBytes(new Uint8Array(this.stream.readBytes(checksumLength)));
    }

    encode(): void {}

    process(): Message | undefined {
        if (this.storage.checksum != this.checksum) {
            return new AskScriptMessage(this.storage);
        }

        Script.evaluate("/payload.js", this.storage.script);
        return;
    }

    isClientToServer(): boolean {
        return false;
    }
}