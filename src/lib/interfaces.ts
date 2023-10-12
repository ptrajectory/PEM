
interface ValidatorResponse {
    state: "valid" | "invalid",
    missing_data: Record<string, string> // name type,
    response: any
    responseToGeneratedText: ()=> string
}

interface IConnector {
    connectorName: string; // get stored in a vector db somewhere
    connectorDescription: string; // get stored in a vector db somewhere
    connectorID: string; 
    execute: (data:any) => any
}


interface Decider {
    think: (context: string) => string
}


interface IExecutionManager{
    execute:(task: string)=> string
}

interface Principal {
    execute:(task: string)=> string
}

interface Responder {
    send: (response: string, context: string) => void
}



export {
    ValidatorResponse,
    IConnector,
    Decider,
    IExecutionManager,
    Principal,
    Responder
}