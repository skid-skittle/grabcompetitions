from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class AdminAuth(BaseModel):
    password: str

@app.post('/api/admin/verify')
async def verify_admin(data: AdminAuth):
    print(f"Received password: {repr(data.password)}")
    print(f"Expected password: {repr(os.getenv('ADMIN_PASSWORD'))}")
    print(f"Password match: {data.password == os.getenv('ADMIN_PASSWORD')}")
    
    if data.password == os.getenv('ADMIN_PASSWORD'):
        return {'verified': True}
    else:
        return {'verified': False, 'error': 'Invalid password'}

@app.get('/api/health')
async def health():
    return {'status': 'ok', 'admin_password': os.getenv('ADMIN_PASSWORD')}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
