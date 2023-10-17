import {Decider, NoManagerDeciderError} from "../lib/decider";
import {ExecutionManager, IExecutionManager, IExecutionManagerFn} from "../lib/execution_manager";
import {decide_on_task_to_run, parse_chosen_task} from "../utils";
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
        // TODO: add description
        let execution_managers_descriptions = this.execution_managers.reduce((current_description, manager)=>{
            let new_description = `
                ======================
                = Name: ${manager.manager_name}
                = Description: ${manager.manager_description}
                ======================
                
                
                Which of the above tasks solve this:
                ${task}
            `
            return current_description + new_description
        }, "")

        // TODO: ask llm to decide
        const response = await decide_on_task_to_run(execution_managers_descriptions)
        this.decision = await parse_chosen_task(response)
    }

    async run(): Promise<string> {

        const manager = this.execution_managers.find(({manager_name})=> manager_name == this.decision )

        if(!manager){
            throw new NoManagerDeciderError("")
        }

        const execution_response = await manager.execute(this.task)
        return execution_response
    }

}