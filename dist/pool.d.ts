/// <reference types="node" />
import { EventEmitter } from 'events';
import { PoolWorker } from './poolWorker';
import { TaskConfig } from './taskContainer';
export declare class Pool extends EventEmitter {
    private size;
    private deprecated;
    private workers;
    private createWorker;
    private taskQueue;
    constructor(size: number);
    private addSelfEventHandlers;
    private addWorkerLifecycleHandlers;
    private setWorkerFactory;
    private replaceWorker;
    private getIdleWorker;
    private processTask;
    protected fill(getWorker: () => PoolWorker): void;
    runTask<TParam, TResult>(param: TParam, taskConfig: TaskConfig): Promise<TResult>;
    /**
     * Destroy this pool and terminate all threads.
     */
    destroy(): Promise<void>;
}
