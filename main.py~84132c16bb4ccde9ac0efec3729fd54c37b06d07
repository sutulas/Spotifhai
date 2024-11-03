from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load OpenAI API key from environment variable
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

# Define request and response models
class UserQueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str

# Root endpoint
@app.get("/")
async def read_root():
    return QueryResponse(response="Hello World!")

@app.post("/getAiResponse", response_model=QueryResponse)
async def get_ai_response(user_query: UserQueryRequest):
    try:
        

        # response_text = openai_response.choices[0].text.strip()
        response_text = "Response!"

        return QueryResponse(response=response_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
