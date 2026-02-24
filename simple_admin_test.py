from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

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
    admin_password = 'Olivia1josh2'  # Hardcoded for testing
    print(f"Received: '{data.password}'")
    print(f"Expected: '{admin_password}'")
    print(f"Match: {data.password == admin_password}")
    
    if data.password == admin_password:
        return {'verified': True}
    else:
        return {'verified': False, 'error': 'Invalid password'}

@app.get('/api/health')
async def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    import uvicorn
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host='0.0.0.0', port=8000, log_level='info')
