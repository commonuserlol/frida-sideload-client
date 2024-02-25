import ByteStream from "bytestream.ts";
import Message from "./Message";
import { TextDecoder } from '@polkadot/x-textdecoder';

export default class ChecksumMessage extends Message {
    checksum: string;

    constructor(stream?: ByteStream) {
        super(stream);
        this.id = 51;
    }

    encode(): void {}
    
    decode(): void {
        const checksumSize = this.stream.readU16();
        this.checksum = new TextDecoder().decode(new Uint8Array(this.stream.readBytes(checksumSize)));
        
    }
}