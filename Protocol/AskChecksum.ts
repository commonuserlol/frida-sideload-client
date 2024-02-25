import ByteStream from "bytestream.ts";
import Message from "./Message";

export default class AskChecksumMessage extends Message {
    constructor(stream?: ByteStream) {
        super(stream);
        this.id = 50;
    }
    encode(): void {
        this.stream.writeU8(2); // client version
    }
    
    decode(): void {}
}