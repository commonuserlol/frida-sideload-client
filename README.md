# frida-sideload-client
Load your script from remote server

# Advantages
* No need to rebuild target with frida-gadget when script changed
* Compresses script, so it takes less space (both network and disk)
* Very simple binary protocol

# Usage
0. Setup [server part](https://github.com/commonuserlol/frida-sideload-server)
1. Create your project dir
2. Install this module via `npm i git+https://github.com/commonuserlol/frida-sideload-client`
3. Write simple code, example:
```typescript
import { Client } from "frida-sideload";

async function main() {
    const client = new Client("/home/commonuserlol/cached.bin");
    await client.connect("192.168.0.103", 1337, 5000, () => (globalThis as any).console.log("timeout"));
    await client.loop();
}
main();
```
Note: on Android cache path should be `/data/user/0/com.app.packagename/files/cached.bin`<br
4. Compile with esbuild using `npx esbuild --bundle index.ts --outfile=index.js`
5. Inject `index.js` with frida-gadget into target

# License
This project is licensed under two licenses:
* **GNU AGPLv3 only** for the client (this is a module, you can use it for commercial purposes if you do not change the module code)
* **MIT** for the server (this is not a module)