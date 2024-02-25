import ByteStream from "bytestream.ts";
import Message from "./Message";

export default class FinalizeMessage extends Message {
    constructor(stream?: ByteStream) {
        super(stream);
        this.id = 54;
    }
    
    encode(): void {}
    
    decode(): void {}

    process(): void {}
}