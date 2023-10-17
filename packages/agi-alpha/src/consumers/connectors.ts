import * as z from "zod";
import {ConnectorParsingError, ConnectorServiceError, IConnectorFn} from "../lib/connector";
import {ask_llm_to_parse_task, cleanup_llm_response} from "../utils";

const taskZodSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
})

export const TaskParserConnector: IConnectorFn<z.infer<typeof taskZodSchema>> = async (task: string)=>{
    let formatted_response;

    try {
        formatted_response = await ask_llm_to_parse_task(task, "")
    }
    catch (e)
    {
        throw new ConnectorServiceError(`
            LLM dependency failed
        `)
    }
    const cleaned_up_response = cleanup_llm_response(formatted_response);

    let json;

    try {
        json = JSON.parse(cleaned_up_response)
    }
    catch (e)
    {
        throw new ConnectorServiceError(`
            JSON parsing failed invalid response from llm
        `)
    }

    const parsed = taskZodSchema.safeParse(json);

    if(!parsed.success){
        throw new ConnectorParsingError(`
            UNABLE TO PARSE TASK:
            ${
                Object.entries(parsed.error.formErrors.fieldErrors)
                    ?.filter(([k, v]) => v.length > 0).map(([field, errors], i)=>{
                        return (
                            `
                                ${field} has the following issues:
                                ${
                                    errors?.map((error, ind)=>{
                                        return (
                                            `
                                                ${ind + 1} ${error}
                                            `
                                        )
                                    })
                                }
                            `
                        )
                    })
             }
             
             USING ZOD SCHEMA:
             const taskZodSchema = z.object({
                name: z.string().optional(),
                description: z.string().optional(),
                date: z.string().optional(),
            })
        `)
    }


    return Promise.resolve(parsed.data)
}



export const TaskCreator: IConnectorFn = async (task: z.infer<typeof taskZodSchema>) => {
    // TODO: connect to db
    // TODO: creat new task

    return Promise.resolve("Successfully created new task")
}