import {Decider} from "./decider";

/**
 * # Principal
 *  The Principal is the main monitor of the execution pipelines
 *  They are responsible for deciding if messages are executable instructions or if they should respond directly
 *  Principals will directly interact with the user and will have all the message history within a specified message window e.g 5
 *  They are also responsible for responding after receiving results from the responder
 *
 *
 *  !!!Note. Principals should not actually send results to the user. It is expected that the caller has that handled already
 */
export interface IPrincipal {
    tasks: string[]// A list of tasks that the principal will have to perform.
    init(message: string):Promise<void>
    execute():Promise<string[]> // decide and execute all tasks then return a message task
}

/**
 * # PrincipalUnknownError
 *   This error occurs in case any of the principal's children throw an unknown error
 *   An unknown error means the caller has to default to using one of its own error messages
 *
 */
export class PrincipalUnknownError extends Error{
    ERROR_CODE = "PUEO1"
    constructor(message:string) {
        super(message);
    }
}



/**
 * # PrincipalServiceError
 *   This error occurs in case any of the principal's children throw an error
 *   However unlike {PrincipalUnknownError} the service provided an llm generated error
 *
 */
export class PrincipalServiceError extends Error{
    ERROR_CODE = "PSEO1"
    constructor(message:string) {
        super(message);
    }
}




export class PipelineUnknownError extends Error{
    ERROR_CODE = "PUEO2"
    constructor(message:string) {
        super(message);
    }
}