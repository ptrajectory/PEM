# THE EPM AGI PATTERN

- EPM is an acronymn for Execution Prompt Machine and includes the following building blocks
  - Principal
  - Decider 
  - Execution Manager and;
  - Connectors
- These form a dependant component system, allowing you to insert complex LLM driven functionality into your applications
- This functionality may include:
  - The ability for your chat bots to perform tasks on behalf of the user
  - Ability to dynamically get and feed your chat bot with relevant realtime information as a user chats with it
- This pattern is meant to be language agnostic, but for simplicity I'll use typescript

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
  - The Responder()

#### The Principal
*  The Principal is the main monitor of the execution pipelines
*  They are responsible for deciding if messages are executable instructions or if they should respond directly
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
- This is also the chief error handler this is because its responsible for triggering the execution manager and receives messages directly from the principle, meaning it has access to all errors its children may have
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