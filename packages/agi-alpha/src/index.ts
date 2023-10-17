import {TaskPrincipal} from "./consumers/principal";


(async ()=>{

    const principal = new TaskPrincipal()
    await principal.init("Hey, I would like to create a new task on my notion workspace.")
    const responses = await principal.execute()


})()
