/// <reference path="../typings/index.d.ts" />
import redis = require('redis');
import Promise = require('bluebird');

// DB client
export default class DB {

    private static USERS = 'user_ids';

    private client;

    constructor(url?: string) {
        let tmp = redis.createClient(url || process.env.REDIS_URL);
        this.client = Promise.promisifyAll(tmp);
    }

    async drop() {
        await this.client.flushall();
    }

    async addUser(id) {
        await this.client.saddAsync(DB.USERS, id);
    }

    async removeUser(id) {
        await this.client.sremAsync(DB.USERS, id);
    }

    async getUsers(): Promise<string[]> {
        return await this.client.smembersAsync(DB.USERS);
    }

}

//# sourceMappingURL=db.js.map