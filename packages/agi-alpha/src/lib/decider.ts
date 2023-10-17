import {IExecutionManager} from "./execution_manager";

/**
 * # Decider
 *   The decider is responsible for deciding what pipeline to trigger based on the user's intent in a message
 *   The is also the chief error handler this is because its responsible for triggering the execution manager
 *   and receives messages directly from the principle, meaning it has access to all errors its children may have
 *   and the message from the user
 *   once execution is completed the decider can send generated results to the Responder
 *   No Error happening within the decider's children should propagate beyond the decider
 */
export interface  Decider {
    decision: string | null // The chosen execution manager
    decide: (task: string) => void // modifies the decision variable
    run: () => Promise<string> // runs the chosen execution manager
    task: string // The task to execute passed in by the principal
    execution_managers: Array<IExecutionManager> // a list of different execution managers
}

export class NoManagerDeciderError extends Error {
    ERROR_CODE = "DE01"
    constructor(message: string) {
        super(message);
    }
}