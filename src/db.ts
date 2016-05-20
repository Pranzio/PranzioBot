/// <reference path="../typings/tsd.d.ts" />
import redis = require('redis');
import Promise = require('bluebird');

// DB client
export default class DB {

    static USERS = 'user_ids';

    client;

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

    async deleteUser(id) {
        await this.client.sremAsync(DB.USERS, id);
    }

    async getUsers() {
        return await this.client.smembersAsync(DB.USERS);
    }

}

//# sourceMappingURL=db.js.map