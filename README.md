**USE FRIDA PORTAL INSTEAD**<br>

# frida-sideload-client
Load your script from remote server

# Advantages
* No need to rebuild target with frida-gadget when script changed
* Compresses & encrypts script, so it takes less space (both network and disk)
* Very simple binary protocol

# Usage
0. Setup [server part](https://github.com/commonuserlol/frida-sideload-server)
1. Create your project dir
2. Install this module via `npm i git+https://github.com/commonuserlol/frida-sideload-client`
3. Write simple code, example below
4. **CHANGE ENCRYPTION KEY (it must have 32 bytes size)!!! DEFAULT ONE IS UTF8 encoded "mysupersecretkeymysupersecretkey"**<br>
    Encryption key used for both networking and local storage, nonces are unique for every message and local script update
5. Compile with esbuild using `npx esbuild --bundle index.ts --outfile=index.js`<br>
    * If you're developing your tool, pass `--sourcemap=inline` flag, so frida will use source map
    * If your tool ready, pass `--minify` flag (and drop `sourcemap` flag!), it will reduce script size
6. Obfuscate or protect by other ways your script, very important to keep key in secret
7. Inject `index.js` with frida-gadget into target

# Example
```typescript
import { Client } from "frida-sideload";

async function main() {
    const client = new Client("/home/commonuserlol/cached.bin", new Uint8Array(
        [109, 121, 115, 117, 112, 101, 114, 115, 101, 99, 114, 101, 116, 107, 101, 121, 109, 121, 115, 117, 112, 101, 114, 115, 101, 99, 114, 101, 116, 107, 101, 121]
    ));
    await client.connect("192.168.0.103", 1337);
    await client.loop();
}

main();
```
Note: on Android cache path should be `/data/user/0/com.app.packagename/files/cached.bin`<br>

# License
This project is licensed under two licenses:
* **GNU AGPLv3 only** for the client (this is a module, you can use it for commercial purposes if you do not change the module code)
* **MIT** for the server (this is not a module)
