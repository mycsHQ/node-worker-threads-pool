/// <reference types="node" />
import { Worker } from 'worker_threads';
import { TaskConfig } from './taskContainer';
export declare class PoolWorker extends Worker {
    private _ready;
    constructor(...args: ConstructorParameters<typeof Worker>);
    get ready(): boolean;
    run(param: any, taskConfig: TaskConfig): Promise<any>;
    private setReadyToWork;
    terminate(): Promise<number>;
}
