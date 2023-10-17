import {IPrincipal} from "../lib/principal";
import {breakDownRequestToTasks, decide_on_task_to_run, validate_request} from "../utils";
import {Decider} from "../lib/decider";
import {TaskDecider} from "./decider";


export class TaskPrincipal implements IPrincipal {
    tasks: string[] = []

    async init(message: string): Promise<void> {
        this.tasks = await breakDownRequestToTasks(message)
    }
    async execute(): Promise<string[]> {
        const execution_results: string[] = []
        const decider = new TaskDecider()

        for(const task of this.tasks){
            await decider.decide(task)
            const results = await decider.run()
            execution_results.push(results)
        }


        return execution_results
    }
}
