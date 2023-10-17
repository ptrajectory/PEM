import { TaskCreationConnector, TaskInputParseConnector } from "./connectors";
import { IExecutionManager } from "./interfaces";





export class ExecutionManager implements IExecutionManager {
    execute(task: string){
        const parser = new TaskInputParseConnector()
        const creator = new TaskCreationConnector()

        const data = parser.execute(task)
        creator.execute(data)
        console.log("DONE")
        return "DONE"
    }
}