import * as z from "zod";
import {ConnectorParsingError, ConnectorServiceError, IConnectorFn} from "../lib/connector";
import {ask_llm_to_parse_task, cleanup_llm_response, convert_llm_task_response_to_json} from "../utils";
import fs from "node:fs"
import * as crypto from "crypto";

const taskZodSchema = z.object({
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    reminder: z.boolean().optional().nullable()
})

export const TaskParserConnector: IConnectorFn<z.infer<typeof taskZodSchema>> = async (task: string)=>{
    let formatted_response;

    try {
        formatted_response = await ask_llm_to_parse_task(task, `
            const taskZodSchema = z.object({
                name: z.string().optional().nullable(),
                description: z.string().optional().nullable(),
                date: z.string().optional().nullable(),
                reminder: z.boolean().optional().nullable()
            })
        `)

        console.log(`
            TaskParserConnector
            
            OPENAI SAYS:
            
            ${formatted_response}
        `)
    }
    catch (e)
    {
        throw new ConnectorServiceError(`
            LLM dependency failed
        `)
    }

    let json;

    try {
        json = convert_llm_task_response_to_json(formatted_response);
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
                name: z.string().optional().nullable(),
                description: z.string().optional().nullable(),
                date: z.string().optional().nullable(),
            })
        `)
    }


    return parsed.data
}



export const TaskCreator: IConnectorFn = async (task: z.infer<typeof taskZodSchema>) => {
    let unique_id = crypto.randomBytes(16).toString("hex")
    fs.writeFileSync(`./tasks/task-${Date.now()}-${unique_id}.json`, JSON.stringify(task), { encoding: 'utf-8' })

    return Promise.resolve("The task has been successfully created.")
}