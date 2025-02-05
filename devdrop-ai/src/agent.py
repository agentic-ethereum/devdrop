from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent
from twitter_lang import twitter_toolkit

tools = twitter_toolkit.get_tools()
llm = ChatOllama(model='llama3.2')
#print("Test question\n",llm.invoke('Hello how are you?'),'\n')

agent_executor = create_react_agent(llm,tools)

# example event: 

events = agent_executor.stream(
    {
        "messages":[
            HumanMessage(content=f"Please post 'Hello, World! This is a test tweet.'"),
        ],
    },
    stream_mode="values"
)

for event in  events:
    print(event['messages'][-1])