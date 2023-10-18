import {Decider, NoManagerDeciderError} from "../lib/decider";
import {ExecutionManager, IExecutionManager, IExecutionManagerFn} from "../lib/execution_manager";
import {decide_on_manager, parse_chosen_execution_manager} from "../utils";
import {TaskCreateExecutionManager} from "./managers";


export class TaskDecider implements Decider {
    decision: string = ""
    task: string = ""
    execution_managers: Array<IExecutionManager>

    constructor() {
        this.execution_managers = [
            new TaskCreateExecutionManager()
        ]
    }

    async decide(task: string) {
        this.task = task

        let execution_managers_descriptions = this.execution_managers.reduce((current_description, manager)=>{
            let new_description = `
                ======================
                = Name: ${manager.manager_name}
                = Description: ${manager.manager_description}
                ======================
            `
            return current_description + new_description
        }, "")

        const response = await decide_on_manager(task,execution_managers_descriptions)

        console.log(`
            TaskDecider
            
            OPENAI SAYS:
            ${response}
        `)

        this.decision = parse_chosen_execution_manager(response).trim()
    }

    async run(): Promise<string> {

        const manager = this.execution_managers.find(({manager_name})=> manager_name == this.decision )

        if(!manager){
            console.log("Decision", this.decision)
            throw new NoManagerDeciderError("NO MANAGER CAN COMPLETE THIS TASK")
        }

        const execution_response = await manager.execute(this.task)
        return execution_response
    }

}