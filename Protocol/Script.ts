import ByteStream from "bytestream.ts";
import Storage from "../Storage";
import Message from "./Message";
import { TextDecoder } from '@polkadot/x-textdecoder';

export default class ScriptMessage extends Message {
    script: string;

    constructor(stream?: ByteStream) {
        super(stream);
        this.id = 53;
    }

    encode(): void {}
    
    decode(): void {
        const scriptSize = this.stream.readU32();
        this.script = new TextDecoder().decode(new Uint8Array(this.stream.readBytes(scriptSize)));
        
    }
}