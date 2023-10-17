/**
 * # Responder
 *   The Responder has full context of the outside world and therefore can properly format its responses
 *   for the user based on the output of the decider, and give full context of the execution
 *   context and instruct it with what and how to respond to the user
 *
 *   Since the responder needs to collect all the user's context before formulating a response
 *   it needs to have context ready to go
 *   so initialization needs to happen before respond is called
 */
interface Responder {
    respond(deciderResults: string):Promise<string>
    init():Promise<void>
}

class ResponderServiceError extends Error {
    ERROR_CODE = "RSEO1"
    constructor(message:string) {
        super(message);
    }
}