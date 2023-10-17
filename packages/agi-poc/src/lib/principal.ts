import Decider from "./decider"
import { makeACallToOpenAI } from "./mocks"
import { parseOpenAIResponse } from "./utils"





export default class Principal {
    _request
    _execution_queue: any
    constructor (request: string) {
        this._request = request
    }


    init(){

        const responseFromOpenAI = makeACallToOpenAI(`
            I'M AN AI BOT SO, FROM THE REQUEST BELOW GIVE ME A TODO LIST:
            MARK THE BEGGINING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
            MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
            EACH NEW TASK SHOULD BE IN A NEW LINE AND LIKE THIS: {{THE_TASK}}
            
            HERE IS THE REQUEST FROM MY HUMAN::

            Hi there, I would like to create a new task for tomorrow afternoon, I'll be having a meeting with my design team
        `)


        const tasks_to_execute = parseOpenAIResponse(responseFromOpenAI)
        console.log("TASKS TO EXECUTE::",tasks_to_execute)
        this._execution_queue = tasks_to_execute
    }

    run(){

        this._execution_queue.map((task: any)=> {
            const decider = new Decider(task)
            decider.init()
            decider.decide()
            decider.run()
        })

    }



}