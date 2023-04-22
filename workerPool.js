export class WorkerPool {
  constructor() {
    this.workerCount = 0;
    this.taskQueue = [];
    this.workers = new Set();
  }
  
  // 添加任务到队列
  enqueueTask(task, workerType, onMessageCallback) {
    this.taskQueue.push({ task, workerType , onMessageCallback});
    //this._assignTasks();
  }
  
  // 创建一个新的 worker
  addWorker(workerScript, workerType, workerModule) {
    
    if(workerModule == 'module'){
      var worker = new Worker(workerScript, { type: 'module' });
    }else{
      //console.log("workerScript");
      var worker = new Worker(workerScript);
    }

    //const worker = new Worker(workerScript);
    worker.workerType = workerType;
    worker.id = this.workerCount++;// 给 worker 设置一个唯一的 ID 和类型
    worker.workerType = workerType;
    
    worker.hasTask = false;

    worker.addEventListener('message', (event) => {
      //console.log(`Worker ${worker.id} received result:`, event.data);
      if (event.data.type === 'ready') {
        console.log(`Worker ${worker.id} is ready.`);
        //this.workers.push(worker);
        this.workers.add(worker);
        this._assignTasks();
      }
      
      // if (this.taskQueue.length > 0) {
      //   console.log("TeskGO")
      //   this._assignTasks();
      // }
    });
    //this._assignTasks();
  }
  
    // 销毁一个 worker
  removeWorker(workerId) {
    const workerArray = Array.from(this.workers);
    const workerIndex = workerArray.findIndex((worker) => worker.id === workerId);
    //const workerIndex = this.workers.findIndex((worker) => worker.id === workerId);
    console.log("workerIndex",workerIndex);
  
    if (workerIndex !== -1) {
      const workerToRemove = workerArray[workerIndex];
      workerToRemove.terminate(); // 结束 worker
      this.workers.delete(workerToRemove); // 从 Set 中移除 worker
      //this.workers[workerIndex].terminate(); // 结束 worker
      //this.workers.splice(workerIndex, 1); // 从数组中移除 worker
    }
  }
  
    // 为闲置的 worker 分配任务
  _assignTasks() {
    console.log(`Assigning tasks to workers...`);
    for (const worker of this.workers) {
      if (this.taskQueue.length === 0 || worker.hasTask) {
        console.log(`No tasks to assign.`);
        continue;
      }

      const suitableTaskIndex = this.taskQueue.findIndex(
        (taskObj) => taskObj.workerType === worker.workerType
      );

      //console.log(`Suitable task index: ${suitableTaskIndex}`);

      if (suitableTaskIndex !== -1) {
        //console.log(`Worker ${worker.id} is assigned task:`, taskObj.task)
        const taskObj = this.taskQueue.splice(suitableTaskIndex, 1)[0];
        worker.hasTask = true;

        // 添加用于处理 'result' 消息的事件监听器
        const resultListener = (event) => {
          if (event.data.type === 'result') {
            taskObj.onMessageCallback(event);
            worker.removeEventListener('message', resultListener);
          }
        };
        worker.addEventListener('message', resultListener);

        worker.postMessage(taskObj.task);
      }
    }
  }
}