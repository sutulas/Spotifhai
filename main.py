from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import sys
from io import StringIO
import json
import pandas

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
class QueryRequest(BaseModel):
    prompt: str
    data: str = None

class QueryResponse(BaseModel):
    response: str

# Root endpoint with token, userId, and message parameters
@app.get("/")
async def read_root(
    token: str = Query(..., description="Authorization token"),
    userId: str = Query(..., description="User ID"),
    message: str = Query(..., description="Message to process"),
):
    # Check if token, userId, and message are valid (Example logic)
    if not token or not userId or not message:
        raise HTTPException(status_code=400, detail="Missing required parameters")

    # Example response, echoing the inputs for demonstration
    response_message = f"Received message: '{message}' from user: '{userId}' with token: '{token}'"
    return QueryResponse(response=response_message)
