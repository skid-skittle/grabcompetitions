from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, File, UploadFile
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import random
import json
import aiofiles
import string
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Admin Configuration
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Olivia1josh2')

# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Create the main app
app = FastAPI(title="Grab Competitions API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# ====================== MODELS ======================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    balance: float = 0.0
    created_at: datetime
    is_admin: bool = False

class CompetitionCreate(BaseModel):
    title: str
    description: str
    prize_type: str  # cash, car, tech, luxury
    prize_value: float
    prize_image: str
    ticket_price: float
    total_tickets: int
    max_tickets_per_user: int = 10
    end_date: datetime
    is_instant_win: bool = False
    instant_win_prizes: Optional[List[Dict[str, Any]]] = None
    facebook_live_url: Optional[str] = None

class CompetitionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    prize_type: Optional[str] = None
    prize_value: Optional[float] = None
    prize_image: Optional[str] = None
    ticket_price: Optional[float] = None
    total_tickets: Optional[int] = None
    max_tickets_per_user: Optional[int] = None
    end_date: Optional[datetime] = None
    is_instant_win: Optional[bool] = None
    instant_win_prizes: Optional[List[Dict[str, Any]]] = None
    facebook_live_url: Optional[str] = None
    status: Optional[str] = None

class Competition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    competition_id: str
    title: str
    description: str
    prize_type: str
    prize_value: float
    prize_image: str
    ticket_price: float
    total_tickets: int
    sold_tickets: int = 0
    max_tickets_per_user: int = 10
    end_date: datetime
    status: str = "active"  # active, ended, sold_out, cancelled
    is_instant_win: bool = False
    instant_win_prizes: Optional[List[Dict[str, Any]]] = None
    facebook_live_url: Optional[str] = None
    winner_id: Optional[str] = None
    draw_date: Optional[datetime] = None
    created_at: datetime

class Ticket(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ticket_id: str
    ticket_number: str
    user_id: str
    competition_id: str
    order_id: str
    is_instant_win: bool = False
    instant_win_prize: Optional[Dict[str, Any]] = None
    created_at: datetime

class OrderCreate(BaseModel):
    competition_id: str
    ticket_count: int
    use_balance: bool = False

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str
    user_id: str
    competition_id: str
    ticket_count: int
    amount: float
    balance_used: float = 0.0
    status: str = "pending"  # pending, completed, failed, refunded
    stripe_session_id: Optional[str] = None
    tickets: List[str] = []
    created_at: datetime

class Winner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    winner_id: str
    competition_id: str
    user_id: str
    user_email: str
    user_name: str
    ticket_number: str
    prize_type: str
    prize_value: float
    announced_at: datetime

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    user_id: str
    order_id: str
    amount: float
    currency: str = "gbp"
    status: str = "pending"  # pending, completed, failed
    stripe_session_id: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

# ====================== HELPERS ======================

def generate_ticket_number():
    """Generate a unique 8-character ticket number"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request, credentials=Depends(security)) -> Optional[User]:
    """Get current user from JWT token (cookie or header)"""
    token = None
    
    # Try cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        # Check if it's an Emergent OAuth session
        session_doc = await db.user_sessions.find_one(
            {"session_token": session_token},
            {"_id": 0}
        )
        if session_doc:
            expires_at = session_doc.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user_doc = await db.users.find_one(
                    {"user_id": session_doc["user_id"]},
                    {"_id": 0}
                )
                if user_doc:
                    return User(**user_doc)
        token = session_token
    
    # Try Authorization header
    if credentials and credentials.credentials:
        token = credentials.credentials
    
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_doc = await db.users.find_one(
            {"user_id": payload["user_id"]},
            {"_id": 0}
        )
        if user_doc:
            return User(**user_doc)
    except jwt.ExpiredSignatureError:
        pass
    except jwt.InvalidTokenError:
        pass
    
    return None

async def require_auth(request: Request, credentials=Depends(security)) -> User:
    """Require authentication"""
    user = await get_current_user(request, credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(password: str):
    """Verify admin password"""
    if password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid admin password")
    return True

# ====================== AUTH ROUTES ======================

@api_router.post("/auth/register")
async def register(data: UserCreate):
    """Register a new user with email/password"""
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password": hash_password(data.password),
        "picture": None,
        "balance": 0.0,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id, data.email)
    
    return {
        "token": token,
        "user": {
            "user_id": user_id,
            "email": data.email,
            "name": data.name,
            "balance": 0.0
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin, response: Response):
    """Login with email/password"""
    user_doc = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user_doc["user_id"], user_doc["email"])
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "token": token,
        "user": {
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "name": user_doc["name"],
            "balance": user_doc.get("balance", 0.0),
            "picture": user_doc.get("picture")
        }
    }

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process Emergent OAuth session"""
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent auth endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        oauth_data = resp.json()
    
    email = oauth_data.get("email")
    name = oauth_data.get("name")
    picture = oauth_data.get("picture")
    session_token = oauth_data.get("session_token")
    
    # Find or create user
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "balance": 0.0,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return {
        "user": {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "balance": user_doc.get("balance", 0.0)
        }
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    """Get current user info"""
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "balance": user.balance,
        "is_admin": user.is_admin
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ====================== COMPETITION ROUTES ======================

@api_router.get("/competitions")
async def get_competitions(
    status: Optional[str] = None,
    prize_type: Optional[str] = None,
    sort: Optional[str] = "newest"  # newest, ending_soon, price_low, price_high
):
    """Get all competitions with filters"""
    query = {}
    
    if status:
        query["status"] = status
    else:
        query["status"] = {"$in": ["active", "ended"]}
    
    if prize_type:
        query["prize_type"] = prize_type
    
    # Sort options
    sort_options = {
        "newest": [("created_at", -1)],
        "ending_soon": [("end_date", 1)],
        "price_low": [("ticket_price", 1)],
        "price_high": [("ticket_price", -1)]
    }
    
    sort_by = sort_options.get(sort, [("created_at", -1)])
    
    competitions = await db.competitions.find(query, {"_id": 0}).sort(sort_by).to_list(100)
    
    # Convert datetime strings
    for comp in competitions:
        if isinstance(comp.get("end_date"), str):
            comp["end_date"] = datetime.fromisoformat(comp["end_date"])
        if isinstance(comp.get("created_at"), str):
            comp["created_at"] = datetime.fromisoformat(comp["created_at"])
    
    return competitions

@api_router.get("/competitions/featured")
async def get_featured_competitions():
    """Get featured active competitions"""
    competitions = await db.competitions.find(
        {"status": "active"},
        {"_id": 0}
    ).sort([("prize_value", -1)]).limit(6).to_list(6)
    
    for comp in competitions:
        if isinstance(comp.get("end_date"), str):
            comp["end_date"] = datetime.fromisoformat(comp["end_date"])
        if isinstance(comp.get("created_at"), str):
            comp["created_at"] = datetime.fromisoformat(comp["created_at"])
    
    return competitions

@api_router.get("/competitions/{competition_id}")
async def get_competition(competition_id: str):
    """Get single competition details"""
    competition = await db.competitions.find_one(
        {"competition_id": competition_id},
        {"_id": 0}
    )
    
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    return competition

# ====================== TICKET & ORDER ROUTES ======================

@api_router.post("/orders/create")
async def create_order(
    request: Request,
    data: OrderCreate,
    user: User = Depends(require_auth)
):
    """Create an order and initiate payment"""
    from emergentintegrations.payments.stripe.checkout import (
        StripeCheckout, CheckoutSessionRequest
    )
    
    # Get competition
    competition = await db.competitions.find_one(
        {"competition_id": data.competition_id},
        {"_id": 0}
    )
    
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    if competition["status"] != "active":
        raise HTTPException(status_code=400, detail="Competition is not active")
    
    available_tickets = competition["total_tickets"] - competition["sold_tickets"]
    if data.ticket_count > available_tickets:
        raise HTTPException(status_code=400, detail=f"Only {available_tickets} tickets available")
    
    if data.ticket_count > competition["max_tickets_per_user"]:
        raise HTTPException(status_code=400, detail=f"Maximum {competition['max_tickets_per_user']} tickets per user")
    
    # Check user's existing tickets for this competition
    user_ticket_count = await db.tickets.count_documents({
        "user_id": user.user_id,
        "competition_id": data.competition_id
    })
    
    if user_ticket_count + data.ticket_count > competition["max_tickets_per_user"]:
        raise HTTPException(
            status_code=400,
            detail=f"You already have {user_ticket_count} tickets. Maximum {competition['max_tickets_per_user']} allowed."
        )
    
    # Calculate amount
    total_amount = float(competition["ticket_price"]) * data.ticket_count
    balance_used = 0.0
    
    if data.use_balance and user.balance > 0:
        balance_used = min(user.balance, total_amount)
        total_amount -= balance_used
    
    # Create order
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "user_id": user.user_id,
        "competition_id": data.competition_id,
        "ticket_count": data.ticket_count,
        "amount": total_amount,
        "balance_used": balance_used,
        "status": "pending",
        "stripe_session_id": None,
        "tickets": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # If total amount is 0 (fully covered by balance), complete the order directly
    if total_amount <= 0:
        # Deduct balance
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$inc": {"balance": -balance_used}}
        )
        
        # Generate tickets
        tickets = await generate_tickets(user.user_id, data.competition_id, order_id, data.ticket_count, competition)
        
        order_doc["status"] = "completed"
        order_doc["tickets"] = [t["ticket_id"] for t in tickets]
        
        await db.orders.insert_one(order_doc)
        
        # Update sold tickets
        await db.competitions.update_one(
            {"competition_id": data.competition_id},
            {"$inc": {"sold_tickets": data.ticket_count}}
        )
        
        return {
            "order_id": order_id,
            "status": "completed",
            "tickets": tickets,
            "redirect_url": None
        }
    
    await db.orders.insert_one(order_doc)
    
    # Create Stripe checkout session
    body = await request.json()
    origin_url = body.get("origin_url", "")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/competitions/{data.competition_id}"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(total_amount),
        currency="gbp",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order_id,
            "user_id": user.user_id,
            "competition_id": data.competition_id,
            "ticket_count": str(data.ticket_count),
            "balance_used": str(balance_used)
        },
        payment_methods=["card"]
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update order with session ID
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"stripe_session_id": session.session_id}}
    )
    
    # Create payment transaction
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "order_id": order_id,
        "amount": total_amount,
        "currency": "gbp",
        "status": "pending",
        "stripe_session_id": session.session_id,
        "metadata": checkout_request.metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {
        "order_id": order_id,
        "status": "pending",
        "redirect_url": session.url
    }

async def generate_tickets(user_id: str, competition_id: str, order_id: str, count: int, competition: dict) -> List[dict]:
    """Generate tickets for an order"""
    tickets = []
    instant_win_prizes = competition.get("instant_win_prizes", []) or []
    
    for _ in range(count):
        ticket_number = generate_ticket_number()
        
        # Check for unique ticket number
        while await db.tickets.find_one({"competition_id": competition_id, "ticket_number": ticket_number}):
            ticket_number = generate_ticket_number()
        
        is_instant_win = False
        instant_win_prize = None
        
        # Check for instant win
        if competition.get("is_instant_win") and instant_win_prizes:
            # Random chance for instant win (e.g., 1 in 50)
            if random.randint(1, 50) == 1:
                # Pick a random prize
                prize = random.choice(instant_win_prizes)
                if prize.get("remaining", 0) > 0:
                    is_instant_win = True
                    instant_win_prize = prize
                    # Decrement remaining
                    for p in instant_win_prizes:
                        if p == prize:
                            p["remaining"] = p.get("remaining", 0) - 1
        
        ticket_doc = {
            "ticket_id": f"ticket_{uuid.uuid4().hex[:12]}",
            "ticket_number": ticket_number,
            "user_id": user_id,
            "competition_id": competition_id,
            "order_id": order_id,
            "is_instant_win": is_instant_win,
            "instant_win_prize": instant_win_prize,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.tickets.insert_one(ticket_doc)
        tickets.append(ticket_doc)
    
    # Update instant win prizes in competition
    if competition.get("is_instant_win"):
        await db.competitions.update_one(
            {"competition_id": competition_id},
            {"$set": {"instant_win_prizes": instant_win_prizes}}
        )
    
    return tickets

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, user: User = Depends(require_auth)):
    """Check payment status and complete order if paid"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    # Check if already processed
    transaction = await db.payment_transactions.find_one(
        {"stripe_session_id": session_id},
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] == "completed":
        order = await db.orders.find_one(
            {"order_id": transaction["order_id"]},
            {"_id": 0}
        )
        tickets = await db.tickets.find(
            {"order_id": transaction["order_id"]},
            {"_id": 0}
        ).to_list(100)
        return {
            "status": "completed",
            "payment_status": "paid",
            "order": order,
            "tickets": tickets
        }
    
    # Check with Stripe
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    checkout_status = await stripe_checkout.get_checkout_status(session_id)
    
    if checkout_status.payment_status == "paid" and transaction["status"] != "completed":
        # Complete the order
        order = await db.orders.find_one({"stripe_session_id": session_id}, {"_id": 0})
        
        if order:
            competition = await db.competitions.find_one(
                {"competition_id": order["competition_id"]},
                {"_id": 0}
            )
            
            # Generate tickets
            tickets = await generate_tickets(
                order["user_id"],
                order["competition_id"],
                order["order_id"],
                order["ticket_count"],
                competition
            )
            
            # Deduct balance if used
            if order["balance_used"] > 0:
                await db.users.update_one(
                    {"user_id": order["user_id"]},
                    {"$inc": {"balance": -order["balance_used"]}}
                )
            
            # Update order
            await db.orders.update_one(
                {"order_id": order["order_id"]},
                {
                    "$set": {
                        "status": "completed",
                        "tickets": [t["ticket_id"] for t in tickets]
                    }
                }
            )
            
            # Update competition sold tickets
            await db.competitions.update_one(
                {"competition_id": order["competition_id"]},
                {"$inc": {"sold_tickets": order["ticket_count"]}}
            )
            
            # Check if sold out
            updated_comp = await db.competitions.find_one(
                {"competition_id": order["competition_id"]},
                {"_id": 0}
            )
            if updated_comp["sold_tickets"] >= updated_comp["total_tickets"]:
                await db.competitions.update_one(
                    {"competition_id": order["competition_id"]},
                    {"$set": {"status": "sold_out"}}
                )
            
            # Update transaction
            await db.payment_transactions.update_one(
                {"stripe_session_id": session_id},
                {
                    "$set": {
                        "status": "completed",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            return {
                "status": "completed",
                "payment_status": "paid",
                "order": {**order, "status": "completed"},
                "tickets": tickets
            }
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "order": None,
        "tickets": []
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            # Process the payment
            transaction = await db.payment_transactions.find_one(
                {"stripe_session_id": session_id},
                {"_id": 0}
            )
            
            if transaction and transaction["status"] != "completed":
                # Same logic as checkout status endpoint
                pass
        
        return {"received": True}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"received": False, "error": str(e)}

# ====================== USER DASHBOARD ROUTES ======================

@api_router.get("/user/entries")
async def get_user_entries(user: User = Depends(require_auth)):
    """Get user's competition entries"""
    # Get unique competition IDs from user's tickets
    pipeline = [
        {"$match": {"user_id": user.user_id}},
        {"$group": {
            "_id": "$competition_id",
            "ticket_count": {"$sum": 1},
            "tickets": {"$push": "$ticket_number"}
        }}
    ]
    
    entries = await db.tickets.aggregate(pipeline).to_list(100)
    
    result = []
    for entry in entries:
        competition = await db.competitions.find_one(
            {"competition_id": entry["_id"]},
            {"_id": 0}
        )
        if competition:
            result.append({
                "competition": competition,
                "ticket_count": entry["ticket_count"],
                "tickets": entry["tickets"]
            })
    
    return result

@api_router.get("/user/tickets")
async def get_user_tickets(user: User = Depends(require_auth)):
    """Get all user's tickets"""
    tickets = await db.tickets.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    return tickets

@api_router.get("/user/wins")
async def get_user_wins(user: User = Depends(require_auth)):
    """Get user's wins"""
    wins = await db.winners.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    
    # Also include instant wins
    instant_wins = await db.tickets.find(
        {"user_id": user.user_id, "is_instant_win": True},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "main_wins": wins,
        "instant_wins": instant_wins
    }

@api_router.get("/user/orders")
async def get_user_orders(user: User = Depends(require_auth)):
    """Get user's orders"""
    orders = await db.orders.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort([("created_at", -1)]).to_list(100)
    
    return orders

# ====================== WINNERS ROUTES ======================

@api_router.get("/winners")
async def get_winners():
    """Get all winners"""
    winners = await db.winners.find({}, {"_id": 0}).sort([("announced_at", -1)]).to_list(100)
    
    # Get competition details for each winner
    result = []
    for winner in winners:
        competition = await db.competitions.find_one(
            {"competition_id": winner["competition_id"]},
            {"_id": 0}
        )
        result.append({
            **winner,
            "competition": competition
        })
    
    return result

# ====================== ADMIN ROUTES ======================

class AdminAuth(BaseModel):
    password: str

# Image upload helper
async def save_upload_file(upload_file: UploadFile, subfolder: str = "images") -> str:
    # Create upload directory if it doesn't exist
    upload_dir = ROOT_DIR / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(upload_file.filename).suffix
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    
    # Return public URL (adjust for your domain)
    return f"https://grabcompetitions.onrender.com/{subfolder}/{unique_filename}"

@api_router.post("/admin/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file (admin only)"""
    # You may want to add admin auth here if needed
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_url = await save_upload_file(file, "images")
    return {"url": file_url}

@api_router.post("/admin/verify")
async def verify_admin(data: AdminAuth):
    """Verify admin password"""
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid admin password")
    return {"verified": True}

@api_router.post("/admin/competitions")
async def create_competition(data: CompetitionCreate, admin: AdminAuth):
    """Create a new competition (admin only)"""
    await require_admin(admin.password)
    
    competition_id = f"comp_{uuid.uuid4().hex[:12]}"
    competition_doc = {
        "competition_id": competition_id,
        "title": data.title,
        "description": data.description,
        "prize_type": data.prize_type,
        "prize_value": data.prize_value,
        "prize_image": data.prize_image,
        "ticket_price": data.ticket_price,
        "total_tickets": data.total_tickets,
        "sold_tickets": 0,
        "max_tickets_per_user": data.max_tickets_per_user,
        "end_date": data.end_date.isoformat(),
        "status": "active",
        "is_instant_win": data.is_instant_win,
        "instant_win_prizes": data.instant_win_prizes,
        "facebook_live_url": data.facebook_live_url,
        "winner_id": None,
        "draw_date": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.competitions.insert_one(competition_doc)
    
    return {"competition_id": competition_id, "message": "Competition created"}

@api_router.post("/admin/competitions/{competition_id}/instant-win")
async def instant_win_competition(competition_id: str, admin: AdminAuth):
    """Instantly select a winner for a competition (admin only)"""
    await require_admin(admin.password)
    
    competition = await db.competitions.find_one(
        {"competition_id": competition_id},
        {"_id": 0}
    )
    
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    if competition.get("winner_id"):
        raise HTTPException(status_code=400, detail="Winner already selected")
    
    # Get all tickets for this competition
    tickets = await db.tickets.find(
        {"competition_id": competition_id},
        {"_id": 0}
    ).to_list(10000)
    
    if not tickets:
        raise HTTPException(status_code=400, detail="No tickets sold")
    
    # Random selection
    winning_ticket = random.choice(tickets)
    
    # Get winner user
    winner_user = await db.users.find_one(
        {"user_id": winning_ticket["user_id"]},
        {"_id": 0, "password": 0}
    )
    
    # Create winner record
    winner_id = f"winner_{uuid.uuid4().hex[:12]}"
    winner_doc = {
        "winner_id": winner_id,
        "competition_id": competition_id,
        "user_id": winning_ticket["user_id"],
        "user_email": winner_user["email"],
        "user_name": winner_user["name"],
        "ticket_number": winning_ticket["ticket_number"],
        "prize_type": competition["prize_type"],
        "prize_value": competition["prize_value"],
        "announced_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.winners.insert_one(winner_doc)
    
    # Update competition
    await db.competitions.update_one(
        {"competition_id": competition_id},
        {
            "$set": {
                "winner_id": winner_id,
                "status": "ended",
                "draw_date": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "winner_id": winner_id,
        "winner_name": winner_user["name"],
        "winning_ticket": winning_ticket["ticket_number"],
        "prize_value": competition["prize_value"]
    }

@api_router.put("/admin/competitions/{competition_id}")
async def update_competition(competition_id: str, data: CompetitionUpdate, admin: AdminAuth):
    """Update a competition (admin only)"""
    await require_admin(admin.password)
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if "end_date" in update_data and isinstance(update_data["end_date"], datetime):
        update_data["end_date"] = update_data["end_date"].isoformat()
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.competitions.update_one(
        {"competition_id": competition_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    return {"message": "Competition updated"}

@api_router.delete("/admin/competitions/{competition_id}")
async def delete_competition(competition_id: str, admin: AdminAuth):
    """Delete a competition (admin only)"""
    await require_admin(admin.password)
    
    result = await db.competitions.delete_one({"competition_id": competition_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    return {"message": "Competition deleted"}

@api_router.get("/admin/competitions")
async def get_all_competitions_admin(password: str):
    """Get all competitions for admin"""
    await require_admin(password)
    
    competitions = await db.competitions.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(1000)
    return competitions

@api_router.get("/admin/users")
async def get_all_users(password: str):
    """Get all users (admin only)"""
    await require_admin(password)
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/admin/orders")
async def get_all_orders(password: str):
    """Get all orders (admin only)"""
    await require_admin(password)
    
    orders = await db.orders.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(1000)
    return orders

@api_router.get("/admin/competition/{competition_id}/entrants")
async def get_competition_entrants(competition_id: str, password: str):
    """Get entrants for a competition (admin only)"""
    await require_admin(password)
    
    tickets = await db.tickets.find(
        {"competition_id": competition_id},
        {"_id": 0}
    ).to_list(10000)
    
    # Get user info for each ticket
    entrants = {}
    for ticket in tickets:
        user_id = ticket["user_id"]
        if user_id not in entrants:
            user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
            entrants[user_id] = {
                "user": user,
                "tickets": []
            }
        entrants[user_id]["tickets"].append(ticket["ticket_number"])
    
    return list(entrants.values())

@api_router.post("/admin/competition/{competition_id}/draw")
async def draw_winner(competition_id: str, admin: AdminAuth):
    """Draw a winner for a competition (admin only)"""
    await require_admin(admin.password)
    
    competition = await db.competitions.find_one(
        {"competition_id": competition_id},
        {"_id": 0}
    )
    
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    if competition.get("winner_id"):
        raise HTTPException(status_code=400, detail="Winner already drawn")
    
    # Get all tickets for this competition
    tickets = await db.tickets.find(
        {"competition_id": competition_id},
        {"_id": 0}
    ).to_list(10000)
    
    if not tickets:
        raise HTTPException(status_code=400, detail="No tickets sold")
    
    # Random selection
    winning_ticket = random.choice(tickets)
    
    # Get winner user
    winner_user = await db.users.find_one(
        {"user_id": winning_ticket["user_id"]},
        {"_id": 0, "password": 0}
    )
    
    # Create winner record
    winner_id = f"winner_{uuid.uuid4().hex[:12]}"
    winner_doc = {
        "winner_id": winner_id,
        "competition_id": competition_id,
        "user_id": winning_ticket["user_id"],
        "user_email": winner_user["email"],
        "user_name": winner_user["name"],
        "ticket_number": winning_ticket["ticket_number"],
        "prize_type": competition["prize_type"],
        "prize_value": competition["prize_value"],
        "announced_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.winners.insert_one(winner_doc)
    
    # Update competition
    await db.competitions.update_one(
        {"competition_id": competition_id},
        {
            "$set": {
                "winner_id": winner_id,
                "status": "ended",
                "draw_date": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "winner_id": winner_id,
        "winner_name": winner_user["name"],
        "winning_ticket": winning_ticket["ticket_number"],
        "prize_value": competition["prize_value"]
    }

@api_router.post("/admin/user/{user_id}/add-balance")
async def add_user_balance(user_id: str, admin: AdminAuth, amount: float):
    """Add balance to user account (admin only)"""
    await require_admin(admin.password)
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$inc": {"balance": amount}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"Added £{amount} to user balance"}

@api_router.get("/admin/analytics")
async def get_analytics(password: str):
    """Get platform analytics (admin only)"""
    await require_admin(password)
    
    total_users = await db.users.count_documents({})
    total_competitions = await db.competitions.count_documents({})
    active_competitions = await db.competitions.count_documents({"status": "active"})
    total_orders = await db.orders.count_documents({"status": "completed"})
    total_tickets = await db.tickets.count_documents({})
    
    # Calculate total revenue
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "total_users": total_users,
        "total_competitions": total_competitions,
        "active_competitions": active_competitions,
        "total_orders": total_orders,
        "total_tickets": total_tickets,
        "total_revenue": total_revenue
    }

# ====================== HEALTHCHECK ======================

@api_router.get("/")
async def root():
    return {"message": "Grab Competitions API", "status": "healthy"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Serve uploaded images
from fastapi.staticfiles import StaticFiles
app.mount("/images", StaticFiles(directory="images"), name="images")

# Include the router
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

