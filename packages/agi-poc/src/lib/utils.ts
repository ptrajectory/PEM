//::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
// {{Create a task for tomorrow afternoon: Meeting with design team}}
// ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
const MESSAGE_FOR_BOT_START = "::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::" as const
const MESSAGE_FOR_BOT_END = "::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::" as const

export const parseOpenAIResponse = (response: string) => {

    let tasks_in_text = response.split(MESSAGE_FOR_BOT_START).at(1)
    tasks_in_text = tasks_in_text?.split(MESSAGE_FOR_BOT_END).at(0) 

    let task_list = tasks_in_text?.split("\n")
    task_list = task_list?.filter((t,i) => t.replaceAll(" ", "").length > 0 ).map((task)=> task.replace("{{", "").replace("}}", "").trim())

    return task_list
}
export const parseOpenAIResponseDecider = (response: string) => {

    let execution_manager = response.split(MESSAGE_FOR_BOT_START).at(1)
    execution_manager = execution_manager?.split(MESSAGE_FOR_BOT_END).at(0)

    const manager=  execution_manager?.trim().replaceAll("{{", "").replaceAll("}}","")
    return manager

}


export const parseResponseForFirstConnector = (response: string) => {

    let json_string = response.split(MESSAGE_FOR_BOT_START).at(1)
    json_string = json_string?.split(MESSAGE_FOR_BOT_END).at(0)
    
    const actual_json = json_string ? JSON.parse(json_string) as {
        name: string,
        description?: string
        time?: string,
        category?: "work" | "personal"
        reminder: boolean
    } : null
    
    return actual_json

}   