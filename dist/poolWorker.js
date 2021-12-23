"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolWorker = void 0;
const worker_threads_1 = require("worker_threads");
const promiseWithTimer_1 = require("./promiseWithTimer");
class PoolWorker extends worker_threads_1.Worker {
    constructor(...args) {
        super(...args);
        this._ready = false;
        this.once('online', () => this.setReadyToWork());
    }
    get ready() {
        return this._ready;
    }
    run(param, taskConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            this._ready = false;
            const { timeout = 0, transferList } = taskConfig;
            const taskPromise = new Promise((resolve, reject) => {
                const onMessage = (res) => {
                    this.removeListener('error', onError);
                    this.setReadyToWork();
                    resolve(res);
                };
                const onError = (err) => {
                    this.removeListener('message', onMessage);
                    reject(err);
                };
                this.once('message', onMessage);
                this.once('error', onError);
                this.once('exit', (exitCode) => {
                    setImmediate(() => {
                        this.removeAllListeners();
                    });
                    if (exitCode !== 0) {
                        const err = new Error("process in worker thread exited badly");
                        onError(err);
                    }
                });
                this.postMessage(param, transferList);
            });
            return new promiseWithTimer_1.PromiseWithTimer(taskPromise, timeout).startRace();
        });
    }
    setReadyToWork() {
        this._ready = true;
        this.emit('ready', this);
    }
    terminate() {
        const _super = Object.create(null, {
            terminate: { get: () => super.terminate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.terminate.call(this);
        });
    }
}
exports.PoolWorker = PoolWorker;
