import ByteStream from "bytestream.ts";
import Message from "./Message";

export default class AskScriptMessage extends Message {
    constructor(stream?: ByteStream) {
        super(stream);
        this.id = 52;
    }
    
    encode(): void {}
    
    decode(): void {}

    process(): void {}
}