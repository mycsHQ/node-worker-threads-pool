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
exports.Pool = void 0;
const events_1 = require("events");
const promiseWithTimer_1 = require("./promiseWithTimer");
const taskContainer_1 = require("./taskContainer");
class Pool extends events_1.EventEmitter {
    constructor(size) {
        super();
        this.deprecated = false;
        this.workers = [];
        this.taskQueue = [];
        if (typeof size !== 'number') {
            throw new TypeError('"size" must be the type of number!');
        }
        if (Number.isNaN(size)) {
            throw new Error('"size" must not be NaN!');
        }
        if (size < 1) {
            throw new RangeError('"size" must not be lower than 1!');
        }
        this.size = size;
        this.addSelfEventHandlers();
    }
    addSelfEventHandlers() {
        this.on('worker-ready', (worker) => {
            this.processTask(worker);
        });
    }
    addWorkerLifecycleHandlers(worker) {
        worker.on('ready', (worker) => this.emit('worker-ready', worker));
        worker.once('exit', (code) => {
            if (this.deprecated || code === 0) {
                return;
            }
            this.replaceWorker(worker);
        });
    }
    setWorkerFactory(createWorker) {
        this.createWorker = () => {
            const worker = createWorker();
            this.addWorkerLifecycleHandlers(worker);
            return worker;
        };
    }
    replaceWorker(worker) {
        const i = this.workers.indexOf(worker);
        this.workers[i] = this.createWorker();
    }
    getIdleWorker() {
        const worker = this.workers.find((worker) => worker.ready);
        return worker !== null && worker !== void 0 ? worker : null;
    }
    processTask(worker) {
        const task = this.taskQueue.shift();
        if (!task) {
            return;
        }
        const { param, resolve, reject, taskConfig } = task;
        worker
            .run(param, taskConfig)
            .then(resolve)
            .catch((error) => {
            if (promiseWithTimer_1.isTimeoutError(error)) {
                worker.terminate();
            }
            reject(error);
        });
    }
    fill(getWorker) {
        this.setWorkerFactory(getWorker);
        const size = this.size;
        for (let i = 0; i < size; i++) {
            this.workers.push(this.createWorker());
        }
    }
    runTask(param, taskConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.deprecated) {
                throw new Error('This pool is deprecated! Please use a new one.');
            }
            return new Promise((resolve, reject) => {
                const task = new taskContainer_1.TaskContainer(param, resolve, reject, taskConfig);
                this.taskQueue.push(task);
                const worker = this.getIdleWorker();
                if (worker) {
                    this.processTask(worker);
                }
            });
        });
    }
    /**
     * Destroy this pool and terminate all threads.
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.deprecated) {
                return;
            }
            this.deprecated = true;
            this.removeAllListeners();
            const workers = this.workers;
            this.workers = [];
            yield Promise.all(workers.map((worker) => worker.terminate()));
        });
    }
}
exports.Pool = Pool;
