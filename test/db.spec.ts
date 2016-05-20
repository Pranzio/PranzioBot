/// <reference path="../typings/tsd.d.ts" />
import DB from '../src/db';
import {expect} from 'chai';

describe('DB', () => {

    var db: DB;

    beforeEach(async () => {
        db = new DB();
        await db.drop();
    });

    describe('#getUsers', async () => {
        it('should get an empty set if no user was added', async () => {
            let users = await db.getUsers();
            expect(users).to.be.empty;
        });
    });

    describe('#addUser', async () => {
        it('should add a new user', async () => {
            await db.addUser('ciao');
            let users = await db.getUsers();
            expect(users).to.have.members(['ciao']);
        });
        it('should not duplicate users', async () => {
            await db.addUser('ciao');
            await db.addUser('ciao');
            let users = await db.getUsers();
            expect(users).to.have.members(['ciao']);
        });
            it('should add all users', async () => {
            await db.addUser('ciao');
            await db.addUser('hello');
            let users = await db.getUsers();
            expect(users).to.have.members(['ciao', 'hello']);
        });
    });
    
    describe('#deleteUser', async () => {
        it('should not delete a non-existing user', async () => {
            await db.deleteUser('ciao');
            let users = await db.getUsers();
            expect(users).to.be.empty;
        });
        it('should not delete an existing user', async () => {
            await db.addUser('ciao');
            await db.addUser('hello');
            await db.deleteUser('ciao')
            let users = await db.getUsers();
            expect(users).to.have.members(['hello']);
        });
    });
    
});