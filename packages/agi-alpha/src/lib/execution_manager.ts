import {IConnectorFn} from "./connector";

/**
 * # Execution Manager
 *   Execution Managers are meant to control a single pipeline
 *   a pipeline may contain multiple connectors
 *   Execution managers are required to notify their caller at the end of the pipeline execution
 *   Execution managers will always be asynchronous in nature
 *   Execution managers should carry out correlated tasks
 *   the input of an execution manager is expected to always be a string
 */
export type IExecutionManagerFn<ExecutionManagerResponse=any> = (this:{
    name: string // THE NAME OF THE EXECUTION MANAGER
    description: string // AN EXPLANATION OF WHAT THE EXECUTION MANAGER DOES TO BE USED BY THE DECIDER
},data: string, ...connectors: IConnectorFn[]) => Promise<ExecutionManagerResponse>

export interface IExecutionManager {
    execute:(task: string)=>Promise<any>
    manager_name: string
    manager_description: string
}

export abstract class ExecutionManager implements IExecutionManager {
    manager_name: string = "";
    manager_description: string = ""
    connectors: IConnectorFn[] = []

    protected constructor(name: string, description: string, ...connectors: IConnectorFn[]) {
        this.connectors = connectors
        this.manager_name = name
        this.manager_description = description
    }

    async execute(task: string): Promise<any>{
        throw new Error(`Execute method for ${task} ${this.manager_name} is yet to be implemented`)
    }
}


/**
 * # ExecutionPipelineParseError
 *   This error will occur when one of the connectors throws a {ConnectorParsingError}
 *
 */
export class ExecutionPipelineParseError extends Error {
    ERROR_CODE = "EPPEO1"
    constructor(message:string) {
        super(message);
    }
}


/**
 * # ExecutionPipelineServiceError
 *      This error will occur when one of the connectors throws a {ConnectorServiceError}
 *
 */
export class ExecutionPipelineParser extends  Error {
    ERROR_CODE = "EPSEO1"
    constructor(message:string) {
        super(message);
    }
}