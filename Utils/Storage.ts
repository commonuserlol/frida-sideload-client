import * as UTF8 from "./UTF8";

export class Storage {
    path: string;
    file: File;
    script: string;
    checksum: string;

    constructor(path: string) {
        this.path = path;
        this.file = new File(path, "rb+");
    }

    parse() {
        const data = new Uint8Array(this.file.readBytes());
        try {
            this.script = UTF8.fromBytes(LZ4.decompress(data));
            this.checksum = Checksum.compute("sha256", this.script);
        } catch (e) {
            (globalThis as any).console.log(`Cannot parse script due ${e}`);
        }
    }

    flush() {
        this.file.close();
        this.file = new File(this.path, "wb+");
        try {
            this.file.write(
                LZ4.compress(new Uint8Array(UTF8.toBytes(this.script))).buffer as ArrayBuffer
            );
            this.file.close();
        } catch (e) {
            (globalThis as any).console.log(`Cannot flush script due ${e}`);
        }
    }
}