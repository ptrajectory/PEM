import {TaskPrincipal} from "./consumers/principal";


(async ()=>{

    const principal = new TaskPrincipal()

    await principal.init("I Just finished watching Hilda the netflix animation and I really love the design system. I would like to create a figma design system from that some day")
    const responses = await principal.execute()



})()
