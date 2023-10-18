import {TaskPrincipal} from "./consumers/principal";


(async ()=>{

    const principal = new TaskPrincipal()
    // await principal.init("Hey, I'll be having a meeting with the design team later today from 4 to 5:30pm please add it to my tasks")
    // await principal.init("Hi, I would like to be reminded to go buy groceries in the evening")
    // await principal.init("My friend James, called and said he would be coming into town on thursday and told me to pick him up from the airpot at noon.")
    // await principal.init("I've been meaning to go watch the new spiderman movie with my girlfriend on friday, please create a reminder for me")
    await principal.init("I Just finished watching Hilda the netflix animation and I really love the design system. I would like to create a figma design system from that some day")
    const responses = await principal.execute()



})()
