import { ExecutionManager } from "./managers"
import { loadExecutors, makeACallToOpenAI, makeACallToOpenAIDECIDER } from "./mocks"
import { parseOpenAIResponseDecider } from "./utils"



export default class Decider {
    task
    available_executors: Record<string,string> = {}
    execution_manager = ""
    constructor(task: string){
        this.task = task
    }

    init(){
        this.available_executors = loadExecutors()
    }


    decide(){

        const responseFromGPT = makeACallToOpenAIDECIDER(`

            I'M AN AI BOT SO, AND I HAVE SOME EXECUTION MANAGERS FOR SPECIFIC TASKS WHICH ILL LIST BELOW, FOR YOUR RESPONSES:
            MARK THE BEGINING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
            MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
            SELECT ONE EXECUTION MANAGER THAT CAN SATISFY THE SPECIFIED TASK: AND RETURN A RESPONSE LIKE THIS: {{EXECUTION_MANAGER_NAME}}

            EXECUTION MANAGERS:
            ${
                Object.entries(this.available_executors).map(([k, v])=>{
                    return (
                        `
                            NAME: ${k}
                            DESCRIPTION: ${v}\n\n

                        `
                    )
                })
            }

            TASK: 
            ${this.task}
        
        `)

        this.execution_manager = parseOpenAIResponseDecider(responseFromGPT) ?? "none"
        console.log("manager::", this.execution_manager)
    }

    run(){

        const task_creator_with_date_manager = new ExecutionManager()

        switch(this.execution_manager){
            case "task_creator_with_date":{
                task_creator_with_date_manager.execute(this.task)
                return;
            }
            default: {
                console.log("Unable to complete task")
            }
        }

    }

}