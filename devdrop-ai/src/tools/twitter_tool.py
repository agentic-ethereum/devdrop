from twitter_langchain import (
    TwitterApiWrapper, 
    TwitterToolkit
)

# Load the environment variables
from dotenv import load_dotenv
load_dotenv()

# Create a TwitterApiWrapper object
twitter_api_wrapper = TwitterApiWrapper()

twitter_toolkit = TwitterToolkit.from_twitter_api_wrapper(twitter_api_wrapper)


# tools = twitter_toolkit.get_tools()
# for tool in tools: 
#     print(tool.name)

