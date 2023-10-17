/**
 * ## Connector
 *   connectors are meant to provide pluggable functionality
 *   this functionality may or may not include interactions with an AI api
 *   they form building blocks for the entire agi system
 *   are meant to be executed by execution managers
 *
 *   !!! NOTE
 *   Each connector should only do a single task in your execution pipeline
 *
 *   Each connector should only return a single object result
 *
 *   Each connector should only receive a single object
 *
 *   Connectors are expected to execute asynchronously
 *
 *   Connectors need to provide there own parsing to validate data inputs and are to assume all data coming into them is invalid
 *
 *
 *   ## Jst so you know :)
 *   Connectors will be executed from an array using Array.reduce in sequence
 */
export type IConnectorFn<ConnectorResult = any>= (data: any) => Promise<ConnectorResult>


/**
 * ## ConnectorParsingError
 *    In case of a parsing error a connector needs to explicitly throw a **ConnectorParsingError** to halt execution of the pipeline
 *    ConnectorParseErrors need to be as descriptive as possible
 *
 *    ## Jst so you know :)
 *    ConnectorParseError.message will be shown to the user after parsing through a llm to generate a more user friendly message
 */
export class ConnectorParsingError extends Error {
    ERROR_CODE = "CO1"
    constructor(message: string) {
        super(message);
    }
}


/**
 * ## ConnectorServiceError
 *    In case of an unanticipated error, e.g one of the connector dependencies failing throw a **ConnectorServiceError** to halt execution of the pipeline
 *    ConnectorServiceErrors need to be as descriptive as possible
 *
 *
 *    ## Jst so you know :)
 *    ConnectorParseError.message will be shown to the user after parsing through a llm to generate a more user friendly message
 */
export class ConnectorServiceError extends Error {
    ERROR_CODE = "CO2"
    constructor(message:string) {
        super(message);
    }
}


