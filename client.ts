import "lz4ts";
import { ByteStream } from "bytestream.ts";
import { Message } from "./Messages/message";
import { AskChecksumMessage } from "./Messages/Client/AskChecksum";
import { ChecksumMessage } from "./Messages/Server/Checksum";
import { ScriptMessage } from "./Messages/Server/Script";
import { Storage } from "./Utils/Storage";
import * as UTF8 from "./Utils/UTF8";

export class Client {
    connection: SocketConnection;
    storage: Storage;

    constructor(cachePath: string) {
        this.storage = new Storage(cachePath);
    }

    async connect(ip: string, port: number, timeout: number = 5000, timeoutCallback: () => void) {
        const i = setTimeout(timeoutCallback, timeout);
        this.connection = await Socket.connect({
            "family": "ipv4",
            "host": ip,
            "port": port,
        });
        this.connection.setNoDelay(true);
        clearTimeout(i);
    }

    async disconnect() {
        await this.connection.close();
    }

    async recvMessage() {
        const headerStream = new ByteStream(2 + 4 + 64, "big");
        headerStream.writeBytes(await this.connection.input.readAll(2 + 4 + 64));
        headerStream.reset();
        const id = headerStream.readU16();
        const size = headerStream.readU32();
        const checksum = UTF8.fromBytes(new Uint8Array(headerStream.readBytes(64)));
        const body = LZ4.decompress(new Uint8Array(await this.connection.input.readAll(size)));

        const expectedChecksum = Checksum.compute("sha256", body.buffer as ArrayBuffer);
        if (expectedChecksum != checksum)
            throw new Error("Data is corrupted");

        switch (id) {
            case 1338:
                return new ChecksumMessage(new ByteStream(body, "big"), this.storage);
            case 1340:
                return new ScriptMessage(new ByteStream(body, "big"), this.storage);
        }
    }

    async sendMessage(message: Message) {
        const compressed = LZ4.compress(new Uint8Array(message.stream.byteArray));
        const checksum = Checksum.compute("sha256", message.stream.byteArray);
        const headerStream = new ByteStream(2 + 4 + 64 + checksum.length, "big");
        headerStream.writeU16(message.id);
        headerStream.writeU32(compressed.length);
        headerStream.writeBytes(UTF8.toBytes(checksum));
        headerStream.writeBytes(compressed);

        await this.connection.output.writeAll(headerStream.byteArray);
    }

    async loop() {
        this.storage.parse();
        await this.sendMessage(new AskChecksumMessage(this.storage));
        do {
            const message = await this.recvMessage();
            if (message === undefined)
                break;

            message.decode();
            const messageToSend = message.process();
            if (messageToSend == undefined)
                break;

            await this.sendMessage(messageToSend);
            
        } while (true);
        await this.connection.close();
    }
}