import {IConnectorFn} from "../lib/connector";
import openai from "./lama";

const RESPONSE_START = "::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::"
const RESPONSE_END = "::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::"

export const decide_on_manager = async (task: string, all_managers: string) => {
    const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                name: "emp",
                role: "system",
                content: `
                I'M AN AI BOT, 
                I HAVE A TASK THAT I NEED TO COMPLETE
                AND I HAVE A LIST OF MY SUB MODULES THAT COMPLETE THAT TASK,
                FOR YOUR RESPONSES FOLLOW THIS FORMATTING:
                MARK THE BEGINNING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
                PLACE YOUR CHOICE IN  {{YOUR CHOICE}}
                MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
                
                I HAVE THE FOLLOWING EXECUTABLE SUB MODULES, EACH OF THEM CAN COMPLETE A VERY SPECIFIC SET OF TASKS:
                ${all_managers}
                
                MY USER PROVIDED ME WITH THE FOLLOWING TASK TO COMPLETE:
                ${task}
                `
            }
        ]
    })
    const response = result.choices.map((choice)=>choice.message.content)
        .filter((c)=>c != null)
        .join("\n")

    return response
}

export const parse_chosen_execution_manager = (response: string) => {
    const unpacked = reponse_unpacker(response)
    let manager = unpacked?.split("{{")?.at(1)?.split("}}").at(0) ?? "NO MANAGER CHOSEN"
    return manager
}

export const validate_request = (request: string) => {
    return Promise.resolve("")
}


export const ask_llm_to_parse_task = async (task: string, schema: string) => {
    const result = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                name: "emp",
                role: "system",
                content:`
                    I'M AN AI BOT, AND I HAVE A TASK AND ITS DETAILS THAT I WOULD LIKE TO PARSE INTO AN OBJECT I CAN USE, YOUR RESPONSE SHOULD FOLLOW THIS FORMATTING:
                    MARK THE BEGINNING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
                    MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
        
                    HERE IS THE ZOD SCHEMA FOR THE RESULT I NEED:
                    ${schema}
        
                    WHILE CONVERTING MY USER'S PROMPT TO A JSON OBJECT ENSURE ITS HUMAN READABLE AND MAKES SENSE, 
                    - THE NAME PROPERTY IS THE NAME OF THE TASK, THIS NEEDS TO BE SHORT BUT DESCRIPTIVE
                    - THE DESCRIPTION NEEDS TO BE A COMPLETE UNDERSTANDABLE SENTENCE, 
                    DIRECTED AT THE USER, NOTE THE USER GIVES ME INSTRUCTIONS AND I TRANSLATE THEM INTO TASKS, 
                    AN EXAMPLE WOULD BE FOR THE TASK "CREATE A MEETING AT 5PM WITH THE DESIGN TEAM" -> "MEETING AT 5PM WITH DESIGN TEAM"
                    AND NOT "CREATE A MEETING WITH THE DESIGN TEAM"
                    - THE DATE IN CASE THE USER SPECIFIES A TIME LIKE TOMORROW OR 5PM TODAY. NOTE ALL TIMES ARE RELATIVE TO ${new Date().toISOString()}
                      THE DATE SHOULD INCLUDE AN ISO STRING THAT INCLUDES A TIME BASED OFF WHAT THE USER REQUESTED
                    - THE REMINDER FIELD SHOULD BE SET TO TRUE IF THE USER EXPLICITLY REQUESTS IT
                    
                    HERE IS THE USER'S REQUEST:
                    ${task}
                `
            }
        ]
    })

    let response = result.choices.map((choice)=>choice.message.content)
        .filter((c)=>c != null)
        .join("\n")

    return response
}

const reponse_unpacker = (response: string) =>{
    let unpacked = response.split(RESPONSE_START)?.at(1)
        ?.split(RESPONSE_END)?.at(0)
        ?.trim() ?? ""

    return unpacked
}

export const cleanup_llm_response = (response: string) => {
    // TODO: do some cleanup
    return response
}

export const convert_llm_task_response_to_json = (response: string) =>{
    const unpacked = reponse_unpacker(response)
    return JSON.parse(unpacked)
}

const asyncReducer = async (current_fn: IConnectorFn, previous_result: any) => {
    return await current_fn(previous_result)
}


export const asyncReduce = async (arr: Array<IConnectorFn>, initialValue: any) => {

    let acc = initialValue;

    for (const connector_fn of arr){
        acc = await asyncReducer(connector_fn, acc)
    }

    return acc
}


export const breakDownRequestToTasks = async (request: string) => {
    // NO TASK RESPOND 🤔
    const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                name: "epm",
                role: "system",
                content: `
                    I'M AN AI BOT
                    MY USER HAS SENT ME A REQUEST AND I NEED TO PARSE IT INTO AN ACTIONABLE LIST OF TASKS TO EXECUTE
                    YOUR RESPONSE SHOULD FOLLOW THIS FORMATTING:
                    MARK THE BEGINNING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
                    MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
        
                    WHILE CONVERTING THE REQUEST TO A LIST OF ACTIONABLE TASKS FOLLOW THE FOLLOWING RULES
                    1. EACH NEW TASK WILL BEGIN ON A NEWLINE 
                    2. EACH TASK WILL BE ENCASED IN MUSTACHE LIKE THIS {{TASK}}
                    3. EACH TASK WILL INCLUDE INCLUDE AN ACTION E.G CREATE NEW TASK AND A DESCRIPTION BASED ON THE USER'S REQUEST, THE DESCRIPTION WILL BE SOMETHING LIKE TASK NAME: TASK NAME, DESCRIPTION: DESCRIBE THE TASK IN DETAIL OF THE USER'S REQUEST
                    
                    
                    HERE IS THE USER'S REQUEST:
                    ${request}
                `
            }
        ]
    })

    const response = result.choices.map((choice)=>choice.message.content)
        .filter((c)=>c != null)
        .join("\n")


    console.log(`
        breakDownRequestToTasks
        
        OPENAI SAYS:
        ${response}
    `)

    const unpacked = reponse_unpacker(response);

    const tasks = unpacked.split("\n")?.filter((c)=> c?.trim().length > 0)?.map((task)=>{
        let mustacheless = task?.trim()?.replace("{{","").replace("}}", "")
        return mustacheless
    })


    return tasks
}
