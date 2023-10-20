### General Overview
![General Overvire](./public/general_overview.png)

# THE PEM AI PATTERN

- PEM is an acronymn for Prompt Execution Machine and includes the following building blocks
  - Principal
  - Decider
  - Execution Manager and;
  - Connectors
- These form a dependant component system, allowing you to insert complex LLM driven functionality into your applications
- This functionality may include:
  - The ability for your chat bots to perform tasks on behalf of the user
  - Ability to dynamically get and feed your chat bot with relevant realtime information as a user chats with it
- This pattern is meant to be language(programming language) agnostic, but for simplicity I'll use typescript

## Inspiration
- The first thing I do in the morning is open my phone and scan the web just to make sure no aliens had attacked the earth while I was asleep 😁
- So, that means I may have dull or great mornings depending on what I find
- After that I usually open up a project management app, Jira / Notion inorder to understand what my day looks like
- So I thought to myself, ... it would be great if the first thing I did was just talk to an ai assistant that can tell me how my day looks like, any important news etc and can also receive actionalble input like lets say "Create a meeting for 2pm"
- Of course Google assitant can do all this stuff, but hey I'm a developer so...

## The pattern
- **Disclaimer** I came up with this for my use case and my use case only, if you find it incomplete for your use case feel free to fork the project.

### An overview
- When a user sends a message, e.g `Hey could you add a meeting to my calendar for tomorrow morning, and set a reminder`
- A human like you(I think) would know exactly what the user needs to be done, and will click on some buttons, write some stuff and then voila the meeting for tomorrow morning gets added to the user's tasks, and ohh dont forget to set the reminder
- So basically, you go through a series of actions before the task is complete
- This process can be broken down into three phases
  - Inception phase(not the movie)
    - This is when you become aware of a task that needs to be executed
  - Decision Phase
    - This is where you decide on a flow for execution of that task
  - Execution Phase
    - This is where you act on the flow you just decided on.
    - This will include interacting with a ui entering some text and clicking a bunch of buttons.
    - And once you are done you press a submit button and have your task created
    - under the hood by submitting you will be making a request to an api endpoint, which will have a bunch of functions, responsible for parsing your request just to make sure its valid and writing the task to a db
- Well it turns out with LLMs like GPT4 you can achieve exactly the same thing. The only caveat though is that you need to modularize everything and be very descriptive.
- You also need to know how to work with strings 😁

### The Breakdown
-  As mentioned above, the building blocks for this pattern are
- The Principal
- The Decider
- The Execution Manager
- Connectors

#### The Principal
*  The Principal is the main monitor of the execution pipelines
*  They are responsible for deriving a list of tasks to execute based on the user's request input
*  Principals will directly interact with the user and will have all the message history within a specified message window e.g 5
*  They are also responsible for responding after receiving results from the responder
*  **Note**. Principals should not actually send results to the user. It is expected that the caller has that handled already
```ts
// An example principal interface
interface IPrincipal {
    tasks: string[]// A list of tasks that the principal will have to perform.
    init(message: string):Promise<void>
    execute():Promise<string[]> // decide and execute all tasks then return a message task
}
```

#### The Decider
- The decider is responsible for deciding what pipeline to trigger based on the user's intent in a message
- This is also the chief error handler this is because it's responsible for triggering the execution manager and receives messages directly from the principle, meaning it has access to all errors its children may have
  and the message from the user
- once execution is completed the decider can send generated results to the Responder
- No Error happening within the decider's children should propagate beyond the decider
```ts
export interface  Decider {
  decision: string | null // The chosen execution manager
  decide: (task: string) => void // modifies the decision variable
  run: () => Promise<string> // runs the chosen execution manager
  task: string // The task to execute passed in by the principal
  execution_managers: Array<IExecutionManager> // a list of different execution managers
}
```


#### Execution Manager
- Execution Managers are meant to control a single pipeline
- a pipeline may contain multiple connectors
- Execution managers are required to notify their caller at the end of the pipeline execution
- Execution managers will always be asynchronous in nature
- Execution managers should carry out correlated tasks
- the input of an execution manager is expected to always be a string
```ts
export interface IExecutionManager {
  execute:(task: string)=>Promise<any>
  manager_name: string
  manager_description: string
}

export abstract class ExecutionManager implements IExecutionManager {
  manager_name: string = "";
  manager_description: string = ""
  connectors: IConnectorFn[] = []

  protected constructor(name: string, description: string, ...connectors: IConnectorFn[]) {
    this.connectors = connectors
    this.manager_name = name
    this.manager_description = description
  }

  async execute(task: string): Promise<any>{
    throw new Error(`Execute method for ${task} ${this.manager_name} is yet to be implemented`)
  }
}
``` 

#### Connectors
- connectors are meant to provide pluggable functionality
- this functionality may or may not include interactions with an LLM api
- they form the most basic building blocks for the entire system are where actual execution takes place.

- ***!!! NOTE***
- Each connector should only do a single task in your execution pipeline
- Each connector should only return a single object result
- Each connector should only receive a single object
- Connectors are expected to execute asynchronously
- Connectors need to provide their own parsing to validate data inputs and are to assume all data coming into them is invalid
```ts
type IConnectorFn<ConnectorResult = any>= (data: any) => Promise<ConnectorResult>
```

### Now lets write some code

#### What we're gonna be building
- I found that the best way to demonstrate this design pattern in action was to create an PEM engine(yes I'm calling it that) that creates tasks for a user. so basically an ai powered todo list.
- feel free to go over the code in ``src/consumers`` or follow along while we construct it.
- Now lets get started.

##### Connectors
- Lets go with the bottom up approach, starting with a connector while working our way up to a principal.
- We are gonna create 2 connectors, one for parsing the user input and converting it into a json object that our secound connector can understand and execute actions on.
- Here is the code for the first connector
```ts
const TaskParserConnector: IConnectorFn<z.infer<typeof taskZodSchema>> = async (task: string)=>{
  let formatted_response;

  try {
    formatted_response = await ask_llm_to_parse_task(task, `
            const taskZodSchema = z.object({
                name: z.string().optional().nullable(),
                description: z.string().optional().nullable(),
                date: z.string().optional().nullable(),
                reminder: z.boolean().optional().nullable()
            })
        `)

    console.log(`
            TaskParserConnector
            
            OPENAI SAYS:
            
            ${formatted_response}
        `)
  }
  catch (e)
  {
    throw new ConnectorServiceError(`
            LLM dependency failed
        `)
  }

  let json;

  try {
    json = convert_llm_task_response_to_json(formatted_response);
  }
  catch (e)
  {
    throw new ConnectorServiceError(`
            JSON parsing failed invalid response from llm
        `)
  }

  const parsed = taskZodSchema.safeParse(json);

  if(!parsed.success){
    throw new ConnectorParsingError(`
            UNABLE TO PARSE TASK:
            ${
            Object.entries(parsed.error.formErrors.fieldErrors)
                    ?.filter(([k, v]) => v.length > 0).map(([field, errors], i)=>{
              return (
                      `
                                ${field} has the following issues:
                                ${
                              errors?.map((error, ind)=>{
                                return (
                                        `
                                                ${ind + 1} ${error}
                                            `
                                )
                              })
                      }
                            `
              )
            })
    }
             
             USING ZOD SCHEMA:
             const taskZodSchema = z.object({
                name: z.string().optional().nullable(),
                description: z.string().optional().nullable(),
                date: z.string().optional().nullable(),
            })
        `)
  }


  return parsed.data
}
```
- First we ask our llm to parse the task received from the execution manager into an object following the specified zod schema using the ``ask_llm_to_parse`` function. Here's how the ask_llm_to_parse function looks
```ts
const ask_llm_to_parse_task = async (task: string, schema: string) => {
  const result = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        name: "emp",
        role: "system",
        content:`
                    I'M AN AI BOT, AND I HAVE A TASK AND ITS DETAILS THAT I WOULD LIKE TO PARSE INTO AN OBJECT I CAN USE, YOUR RESPONSE SHOULD FOLLOW THIS FORMATTING:
                    MARK THE BEGINNING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
                    MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
        
                    HERE IS THE ZOD SCHEMA FOR THE RESULT I NEED:
                    ${schema}
        
                    WHILE CONVERTING MY USER'S PROMPT TO A JSON OBJECT ENSURE ITS HUMAN READABLE AND MAKES SENSE, 
                    - THE NAME PROPERTY IS THE NAME OF THE TASK, THIS NEEDS TO BE SHORT BUT DESCRIPTIVE
                    - THE DESCRIPTION NEEDS TO BE A COMPLETE UNDERSTANDABLE SENTENCE, 
                    DIRECTED AT THE USER, NOTE THE USER GIVES ME INSTRUCTIONS AND I TRANSLATE THEM INTO TASKS, 
                    AN EXAMPLE WOULD BE FOR THE TASK "CREATE A MEETING AT 5PM WITH THE DESIGN TEAM" -> "MEETING AT 5PM WITH DESIGN TEAM"
                    AND NOT "CREATE A MEETING WITH THE DESIGN TEAM"
                    - THE DATE IN CASE THE USER SPECIFIES A TIME LIKE TOMORROW OR 5PM TODAY. NOTE ALL TIMES ARE RELATIVE TO ${new Date().toISOString()}
                      THE DATE SHOULD INCLUDE AN ISO STRING THAT INCLUDES A TIME BASED OFF WHAT THE USER REQUESTED
                    - THE REMINDER FIELD SHOULD BE SET TO TRUE IF THE USER EXPLICITLY REQUESTS IT
                    
                    HERE IS THE USER'S REQUEST:
                    ${task}
                `
      }
    ]
  })

  let response = result.choices.map((choice)=>choice.message.content)
          .filter((c)=>c != null)
          .join("\n")

  return response
}
```
- Note how descriptive the prompt is, in terms of specifying the formatting to be used as well as what fields go where. Of course this can change depending on what you are trying to build, and it took me 5 alterations to get to this one.
- Next we convert our llm's response to json, this is done using simple string manipulation and lastly ``JSON.parse``
```ts
export const convert_llm_task_response_to_json = (response: string) =>{
    const unpacked = reponse_unpacker(response)
    return JSON.parse(unpacked)
}
```
- Here's how the ``response_unpacker`` function looks
```ts
const reponse_unpacker = (response: string) =>{
    let unpacked = response.split(RESPONSE_START)?.at(1)
        ?.split(RESPONSE_END)?.at(0)
        ?.trim() ?? ""

    return unpacked
}
```
- The values of ``RESPONSE_END`` and ``RESPONSE_START`` are
```ts
const RESPONSE_START = "::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::"
const RESPONSE_END = "::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::"
```
- Once we have the json, we then do some validation against our ZOD schema, here's what the schema looks like
```ts
const taskZodSchema = z.object({
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  reminder: z.boolean().optional().nullable()
})
```
- After validation we can return the parsed data for the next connector in the pipeline to handle.
- The second connector simply writes our task to disk but this can be extended to anything like writing it to a database or sending a notification
- Here's the code:
```ts
export const TaskCreator: IConnectorFn = async (task: z.infer<typeof taskZodSchema>) => {
  let unique_id = crypto.randomBytes(16).toString("hex")
  fs.writeFileSync(`./tasks/task-${Date.now()}-${unique_id}.json`, JSON.stringify(task), { encoding: 'utf-8' })

  return Promise.resolve("The task has been successfully created.")
}
```
- and just like that, we have a new task created.
- ![](https://media3.giphy.com/media/HiR2vHwG8m6DoDXQHp/giphy.gif?cid=ecf05e47nf54hztd28rqnn4lfkmvftczoxtopnjqa76nv7j5&ep=v1_gifs_search&rid=giphy.gif&ct=g)

### Execution Managers
- The Execution Manager is a composition layer. Where we define an execution pipeline.
- An execution piepline is a collection of connectors that will execute one after the other, with the previous connector passing its results directly to the next connector.
- Here's some code:
```ts
class TaskCreateExecutionManager extends ExecutionManager {
  constructor() {
    super(
            "TaskCreateExecutionManager",
            "Can Create a new task for the user",
            TaskParserConnector,
            TaskCreator
    );
  }

  async execute(task: string):Promise<string> {
    try {
      let execution_result =  await asyncReduce(this.connectors, task); // expects the execution result to be a string

      return execution_result
    }
    catch (e)
    {
      if(e instanceof ConnectorParsingError){
        console.log(e.message)
        // TODO: tell llm to generate a more human friendly message
      }

      if(e instanceof ConnectorServiceError){
        console.log(e.message)
        // TODO: tell llm to generate a more human friendly message
      }

      throw new PipelineUnknownError("Something went wrong")
    }
  }

}
```
- The ``TaskCreateExecutionManager`` class extends the ``ExecutionManager`` class which I had defined previously. (jst scroll up, if you missed it 😁)
- It provides a name and description for the execution manager, these are later used when the ``Decider`` is choosing what task to execute
- We also list out, in sequence what connectors are to be used, in this case the ``TaskParseConnector`` then the ``TaskCreator``
- The next important thing to note is in the ``execute`` method we have an ``asyncReduce`` function that takes in the connectors, and a provided task.
- The async reduce is an asynchronous version of ``array.reduce``. Here's the code:
```ts
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
```

### Decider
- Its expected that you may have multiple execution managers in your application.
- The Decider's job is to decide which pipeline to execute based on the provided task
- Here's some code:
```ts
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
```
- When initializing our ``TaskDecider`` class we specify what execution managers our application will use in this case ``TaskCreateExecutionManager``
- Next we decide on what execution pipeline to run based on the task passed to the ``Decider`` by the ``Principal``.
- After generating a list with all the names and descriptions of our execution managers, we ask our llm to choose one based on the task
```ts
export const decide_on_manager = async (task: string, all_managers: string) => {
  const result = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        name: "emp",
        role: "system",
        content: `
                I'M AN AI BOT, 
                I HAVE A TASK THAT I NEED TO COMPLETE
                AND I HAVE A LIST OF MY SUB MODULES THAT COMPLETE THAT TASK,
                FOR YOUR RESPONSES FOLLOW THIS FORMATTING:
                MARK THE BEGINNING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
                PLACE YOUR CHOICE IN  {{YOUR CHOICE}}
                MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
                
                I HAVE THE FOLLOWING EXECUTABLE SUB MODULES, EACH OF THEM CAN COMPLETE A VERY SPECIFIC SET OF TASKS:
                ${all_managers}
                
                MY USER PROVIDED ME WITH THE FOLLOWING TASK TO COMPLETE:
                ${task}
                `
      }
    ]
  })
  const response = result.choices.map((choice)=>choice.message.content)
          .filter((c)=>c != null)
          .join("\n")

  return response
}
```
- After deciding what execution pipeline is going to work for the current task we then execute that manager as shown:
```ts
const execution_response = await manager.execute(this.task)
```

### The Principal
- The Principal is the entry point of our execution pipeline and is responsible for generating a list of tasks to execute based on the user's input
- Once its generated a list of tasks to execute it then runs the decider for each of those tasks.
- Here's some code:
```ts
class TaskPrincipal implements IPrincipal {
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
```
- We use an llm to break down the request into a set of actionable tasks as shown.
```ts
const breakDownRequestToTasks = async (request: string) => {
  
  const result = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        name: "epm",
        role: "system",
        content: `
                    I'M AN AI BOT
                    MY USER HAS SENT ME A REQUEST AND I NEED TO PARSE IT INTO AN ACTIONABLE LIST OF TASKS TO EXECUTE
                    YOUR RESPONSE SHOULD FOLLOW THIS FORMATTING:
                    MARK THE BEGINNING WITH THIS: ::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
                    MARK THE END WITH THIS:       ::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
        
                    WHILE CONVERTING THE REQUEST TO A LIST OF ACTIONABLE TASKS FOLLOW THE FOLLOWING RULES
                    1. EACH NEW TASK WILL BEGIN ON A NEWLINE 
                    2. EACH TASK WILL BE ENCASED IN MUSTACHE LIKE THIS {{TASK}}
                    3. EACH TASK WILL INCLUDE INCLUDE AN ACTION E.G CREATE NEW TASK AND A DESCRIPTION BASED ON THE USER'S REQUEST, THE DESCRIPTION WILL BE SOMETHING LIKE TASK NAME: TASK NAME, DESCRIPTION: DESCRIBE THE TASK IN DETAIL OF THE USER'S REQUEST
                    
                    
                    HERE IS THE USER'S REQUEST:
                    ${request}
                `
      }
    ]
  })

  const response = result.choices.map((choice)=>choice.message.content)
          .filter((c)=>c != null)
          .join("\n")


  console.log(`
        breakDownRequestToTasks
        
        OPENAI SAYS:
        ${response}
    `)

  const unpacked = reponse_unpacker(response);

  const tasks = unpacked.split("\n")?.filter((c)=> c?.trim().length > 0)?.map((task)=>{
    let mustacheless = task?.trim()?.replace("{{","").replace("}}", "")
    return mustacheless
  })


  return tasks
}
```

### Lets run it 🚀
- Now with all those different layers defined, we can do this:
```ts
const principal = new TaskPrincipal()
await principal.init("I Just finished watching Hilda the netflix animation and I really love the design system. I would like to create a figma design system from that some day")
const responses = await principal.execute()
```
- running this will create very detailed tasks of what to do.
- Now when testing I expected it to only create a single task but was blown away when it created 5 detailed tasks.
- Here's what my prompt returned:
```shell
::::::::::::::MESSAGE_FOR_BOT_START::::::::::::::::
{{TASK: TASK NAME: Research Hilda Netflix animation design, DESCRIPTION: Spend some time watching Hilda Netflix animation and take note of the design elements, colours, characters, and environment}}
{{TASK: TASK NAME: Prepare Visual References, DESCRIPTION: Capture or download screenshots of key scenes, design elements and characters that showcase the design style of Hilda for reference}}
{{TASK: TASK NAME: Study Figma Design Systems, DESCRIPTION: Research how to create a design system in Figma. Study existing examples and guides online to understand the methodology and best practices}}
{{TASK: TASK NAME: Sketch Initial Designs, DESCRIPTION: Using the references collected, sketch out initial designs and layouts in a sketching application or on paper}}
{{TASK: TASK NAME: Create the Figma Design System, DESCRIPTION: Start creating the design system in Figma using the references and sketches. Build the basic components first, then gradually expand to more detailed elements}}
{{TASK: TASK NAME: Refine and Complete the Design System, DESCRIPTION: Continually refine the design components. Ensure consistency across all elements. Complete the design system by finalising all necessary elements}}
::::::::::::::MESSAGE_FOR_BOT_END::::::::::::::::::
```
- It then goes ahead to create all these tasks for me (no hands 👐)
- ![](https://media3.giphy.com/media/3o8dFn5CXJlCV9ZEsg/giphy.gif?cid=ecf05e47nr9z0mznzbtazthw1br7ilt5xq4cxgnonww3gc53&ep=v1_gifs_search&rid=giphy.gif&ct=g)
- of course the results may vary, but try it out for yourself.

### THE END(not sure what to call this section)
- With this pattern you can add ai tooling into your current applications in an organized and composable way without having to make big changes to your current codebase
- Hope it helps
