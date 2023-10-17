import {ExecutionManager, IExecutionManagerFn} from "../lib/execution_manager";
import {asyncReduce} from "../utils";
import {ConnectorParsingError, ConnectorServiceError} from "../lib/connector";
import {TaskCreator, TaskParserConnector} from "./connectors";
import {PipelineUnknownError} from "../lib/principal";



export class TaskCreateExecutionManager extends ExecutionManager {
    constructor() {
        super(
            "TaskCreateExecutionManager",
            "Creates a new task for the user",
            TaskParserConnector,
            TaskCreator
        );
    }

    async execute(task: string):Promise<string> {
        try {
            let execution_result =  await asyncReduce(this.connectors, task); // expects the execution result to be a string

            return execution_result
        }
        catch (e)
        {
            if(e instanceof ConnectorParsingError){
                // TODO: tell llm to generate a more human friendly message
            }

            if(e instanceof ConnectorServiceError){
                // TODO: tell llm to generate a more human friendly message
            }

            throw new PipelineUnknownError("Something went wrong")
        }
    }

}