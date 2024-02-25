import ByteStream from 'bytestream.ts';

export default abstract class Message {
    id: number; // u8
    stream: ByteStream;

    constructor (stream?: ByteStream) {
        this.stream = stream ?? new ByteStream(1, "big", 0);
    }

    abstract encode(): void;
    abstract decode(): void;
}