import { z } from "zod";
import { IConnector, ValidatorResponse } from "./interfaces";
import { makeFirstConnectorRequest } from "./mocks";
import { parseResponseForFirstConnector } from "./utils";


const schema = z.object({
    name: z.string(),
    time: z.string().optional(), // a valid iso date string
    description: z.string().optional(),
    category: z.enum(["work","personal"]).optional(),
    reminder: z.boolean().default(false)
});


export class TaskInputParseConnector implements IConnector {
    connectorName: string = "TaskInputParseConnector"
    connectorDescription: string = "Parses input and decides on what can be executed"
    connectorID: string = "1"


    execute(request: string){
        
        
        const response =  makeFirstConnectorRequest(`

            I'M AN AI BOT SO, AND I HAVE A TASK AND ITS DETAILS THAT I WOULD LIKE TO PARSE INTO AN OBJECT I CAN USE, YOUR RESPONSE SHOULD FOLLOW THIS FORMATTING:
            MARK THE BEGGINING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
            MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::

            HERE IS THE ZOD SCHEMA FOR THE RESULT I NEED:
            z.object({
                name: z.string() // a short user friendly name for the task,
                time: z.string().optional(), // a valid iso date string
                description: z.string().optional(), // description for the task based on the request and details
                category: z.enum(["work","personal"]).optional(), categorize the task 
                reminder: z.boolean().default(false)
            })

            AND HERE IS THE TASK AND DETAILS I NEED TO EXECUTE, THE DATA IN THE JSON OBJECT NEEDS TO BE USER FRIENLY AS ITS GOING TO BE USED IN A TODO LIST FOR MY USER: 
            Create a task for tomorrow afternoon: Meeting with design team

            RETURN A JSON.parsable string based of these two elements 

            NOTE: THE RESPONSE SHOULD FOLLOW FORMATTING GUIDLINES

        `)
        
        const task = parseResponseForFirstConnector(response)

        return task
        
    }
    
}


export class TaskCreationConnector implements IConnector {
    connectorName: string = "creator";
    connectorDescription: string = "description";
    connectorID: string = "connector" ;
    execute(data: any){
        const parsed = schema.parse(data)
        console.log("The parsed stuff::", parsed )
    }
}