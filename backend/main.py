from typing import Union
from fastapi import FastAPI, Request
from openai import OpenAI
import geocoder
from pydantic import BaseModel
class Song(BaseModel):
    name: str
    artists: str
class SongRecomendations(BaseModel):
    tracks: list[Song]
    explenation: str

app = FastAPI()
client = OpenAI(api_key="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")

@app.get("/updatelocation/{lat}/{lon}/{numSongs}")
def process_location(lat: float, lon: float,numSongs:int):
    response = client.responses.parse(
        model="gpt-4o-2024-08-06",
        input=[
            {
                "role": "system",
                "content": "You are now a spotify recomender that will recomend songs when given a lat lon and number of songs to recomend",
            },
            {"role": "user", "content": f"{lat},{lon},{numSongs}"},
        ],
        text_format=SongRecomendations,
    )
    math_reasoning = response.output_parsed
    return math_reasoning

@app.get("/updatelocation/nogps/{numSongs}")
def no_location(request: Request,numSongs:int):
    location=geocoder.ip(request.client.host)
    response = client.responses.parse(
        model="gpt-4o-2024-08-06",
        input=[
            {
                "role": "system",
                "content": "You are now a spotify recomender that will recomend songs when given a lat lon and number of songs to recomend",
            },
            {"role": "user", "content": f"{location.latlng[0]},{location.latlng[1]},{numSongs}"},
        ],
        text_format=SongRecomendations,
    )
    math_reasoning = response.output_parsed
    return math_reasoning
