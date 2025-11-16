from typing import Union, Optional
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import geocoder
import os
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(dotenv_path=env_path)
    print(f"📁 Loading .env from: {env_path}")
except ImportError:
    print("⚠️  python-dotenv not installed. Install with: pip install python-dotenv")
except Exception as e:
    print(f"⚠️  Could not load .env file: {e}")

class Song(BaseModel):
    name: str
    artists: str
class SongRecomendations(BaseModel):
    tracks: list[Song]
    explenation: str

app = FastAPI()

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🌐 {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
    response = await call_next(request)
    print(f"✅ {request.method} {request.url.path} -> {response.status_code}")
    return response

# CORS middleware - allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize OpenAI client with API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
if not OPENAI_API_KEY:
    print("⚠️  Warning: OPENAI_API_KEY not set in .env file.")
    print("   Create backend/.env with: OPENAI_API_KEY=your_key_here")
    client = None
else:
    print("✅ OpenAI API key loaded from environment")
    client = OpenAI(api_key=OPENAI_API_KEY)

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

# Frontend API endpoint - matches the format expected by the React Native app
class AreaType(str, Enum):
    CITY = "city"
    FOREST = "forest"
    SUBURBAN = "suburban"
    UNKNOWN = "unknown"

class LocationData(BaseModel):
    latitude: float
    longitude: float
    areaType: AreaType
    address: Optional[str] = None

class PlaylistGenerateRequest(BaseModel):
    theme: str
    location: LocationData
    limit: Optional[int] = 20

class PlaylistTrack(BaseModel):
    name: str
    artist: str
    spotifyId: Optional[str] = None
    previewUrl: Optional[str] = None

class PlaylistGenerateResponse(BaseModel):
    tracks: list[PlaylistTrack]
    playlistName: str
    metadata: Optional[dict] = None

@app.get("/")
def root():
    """Health check endpoint"""
    return {"message": "Ambient Playlist API", "status": "running"}

@app.get("/api/health")
def health_check():
    """Health check endpoint for connectivity testing"""
    return {
        "status": "ok",
        "openai_configured": client is not None,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.post("/api/playlist/generate", response_model=PlaylistGenerateResponse)
def generate_playlist(request: PlaylistGenerateRequest):
    print(f"📥 Received playlist generation request: theme={request.theme}, location={request.location.areaType}, limit={request.limit}")
    try:
        if not client:
            print("⚠️  OpenAI client not initialized, returning mock data")
            # Return mock data if OpenAI client not initialized
            return PlaylistGenerateResponse(
                tracks=[
                    PlaylistTrack(name="Mock Song", artist="Mock Artist")
                ] * request.limit,
                playlistName=f"{request.theme} {request.location.areaType}",
                metadata={
                    "totalTracks": request.limit,
                    "generatedAt": datetime.utcnow().isoformat() + "Z",
                    "location": request.location.dict()
                }
            )
        
        print(f"🤖 Calling OpenAI API for {request.limit} songs...")
        # Use the same OpenAI pattern as existing endpoints
        response = client.responses.parse(
            model="gpt-4o-2024-08-06",
            input=[
                {
                    "role": "system",
                    "content": f"You are a spotify recommender that recommends songs based on location and theme. The theme is {request.theme} and the location is {request.location.areaType} area at coordinates {request.location.latitude},{request.location.longitude}. Return exactly {request.limit} song recommendations.",
                },
                {"role": "user", "content": f"Recommend {request.limit} songs for {request.theme} theme in a {request.location.areaType} area."},
            ],
            text_format=SongRecomendations,
        )
        
        print("✅ OpenAI API call completed")
        song_recommendations = response.output_parsed
        
        # Transform to frontend format
        tracks = [
            PlaylistTrack(
                name=song.name,
                artist=song.artists,
                spotifyId=None,
                previewUrl=None
            )
            for song in song_recommendations.tracks
        ]
        
        playlist_name = f"{request.theme} {request.location.areaType.title()}"
        
        print(f"✅ Returning {len(tracks)} tracks")
        return PlaylistGenerateResponse(
            tracks=tracks,
            playlistName=playlist_name,
            metadata={
                "totalTracks": len(tracks),
                "generatedAt": datetime.utcnow().isoformat() + "Z",
                "location": request.location.dict()
            }
        )
    except Exception as e:
        print(f"❌ Error in generate_playlist: {e}")
        import traceback
        traceback.print_exc()
        # Return error response
        raise
