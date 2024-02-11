import { ByteStream } from "bytestream.ts";
import { Message } from "../message";
import { Storage } from "../../Utils/Storage";

export class AskScriptMessage extends Message {
    constructor(storage: Storage);
    constructor(stream: ByteStream, storage: Storage);
    constructor(stream: ByteStream | Storage, storage?: Storage) {
        storage ? super(stream as ByteStream, storage) : super(stream as Storage);
        this.id = 1339;
    }

    decode(): void {}

    encode(): void {}

    process(): Message | undefined {
        return;
    }
    
    isClientToServer(): boolean {
        return true;
    }
}