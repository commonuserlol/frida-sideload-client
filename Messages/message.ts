import { ByteStream } from "bytestream.ts";
import { Storage } from "../Utils/Storage";

export abstract class Message {
    stream: ByteStream;
    storage: Storage;

    id: number;

    constructor(storage: Storage);
    constructor(stream: ByteStream, storage: Storage);
    constructor(streamOrStorage: ByteStream | Storage, storage?: Storage) {
        const isStorage = streamOrStorage instanceof Storage;
        if (isStorage) {
            this.storage = streamOrStorage;
            this.stream = new ByteStream(1, "big", 0);
        }
        else
            this.stream = streamOrStorage ?? new ByteStream(1, "big", 0);

        if (storage)
            this.storage = storage;
    };

    abstract decode(): void;
    abstract encode(): void;
    abstract process(): Message | undefined;
    abstract isClientToServer(): boolean;
}