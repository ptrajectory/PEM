



export const makeACallToOpenAI = (message: string) => {
    console.log("RESULT")
    return `
    ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
    {{Create a task for tomorrow afternoon: Meeting with design team}}
    ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
    `
}
export const makeACallToOpenAIDECIDER = (message: string) => {
    console.log("RESULT")
    return `
    ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
    {{task_creator_with_date}}
    ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
    `
}


export const makeFirstConnectorRequest = (message: string) => {
    console.log("Result")
    return `
    ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
    {
      "name": "Meeting with design team",
      "time": "2023-10-13T14:00:00.000Z",
      "description": "Create a task for tomorrow afternoon",
      "category": "work",
      "reminder": false
    }
    ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::    
    `
}


export const loadExecutors = () => {


    return {
        "task_creator": "Creates a single task in the user's task list with no extra information",
        "task_creator_with_date": "Creates a single tasks and adds the date for the task",
        "meeting_creator": "Schedules a meeting on the user's connected meeting callendar, if none is specified creates a simple task with a date for execution" 
    } as const // for now

}