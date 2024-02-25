export default class ClientSocket {
    isAlive: boolean;
    connection: SocketConnection;

    /** @internal */
    assertIsAlive() {
        if (!this.isAlive)
            throw new Error("Connection died");
    }

    async connect(host: string, port: number) {
        this.isAlive = true;
        this.connection = await Socket.connect({
            "family": "ipv4",
            "host": host,
            "port": port
        });
    }

    async disconnect() {
        this.isAlive = false;
        await this.connection.close();
    }

    async recv(n: number) {
        this.assertIsAlive();
        return await this.connection.input.readAll(n);
    }

    async send(payload: ArrayBuffer) {
        this.assertIsAlive();
        await this.connection.output.writeAll(payload);
    }
}
