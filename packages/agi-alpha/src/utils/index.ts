import {IConnectorFn} from "../lib/connector";

export const decide_on_task_to_run = (all_my_tasks: string) => {
    return Promise.resolve("")
}

export const parse_chosen_task = (response: string) => {
    return Promise.resolve("")
}

export const validate_request = (request: string) => {
    return Promise.resolve("")
}


export const ask_llm_to_parse_task = (task: string, schema: string) => {
    return Promise.resolve("")
}

export const cleanup_llm_response = (response: string) => {
    // TODO: do some cleanup
    return response
}

export const convert_llm_task_response_to_json = (response: string) =>{

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
    return Promise.resolve([
        "Create new meeting task at 2pm 18th october"
    ])
}
