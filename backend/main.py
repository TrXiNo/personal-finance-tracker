from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
import json
import hashlib

#To Start: uvicorn main:app --reload

# --------------------------------------------------
# SETTINGS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
FILE_NAME = BASE_DIR / "finance.json"


# --------------------------------------------------
# FASTAPI
# --------------------------------------------------

app = FastAPI(
    title="Personal Finance API",
    description="Personal Finance Tracker Backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# JSON
# --------------------------------------------------

def load_data():

    default_data = {
        "user": {
            "username": "",
            "password": ""
        },
        "transactions": [],
        "archives": []
    }

    try:
        with open(FILE_NAME, "r", encoding="utf-8") as file:
            data = json.load(file)

    except FileNotFoundError:
        save_data(default_data)
        return default_data

    # Eski JSON formatlarını destekle
    if "user" not in data:
        data["user"] = {
            "username": "",
            "password": ""
        }

    if "transactions" not in data:
        data["transactions"] = []

    if "archives" not in data:
        data["archives"] = []

    save_data(data)

    return data


def save_data(data):

    with open(FILE_NAME, "w", encoding="utf-8") as file:
        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False
        )


# --------------------------------------------------
# PASSWORD
# --------------------------------------------------

def hash_password(password):

    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


# --------------------------------------------------
# CALCULATIONS
# --------------------------------------------------

def calculate_balance(data):

    income = 0
    expense = 0

    for transaction in data["transactions"]:

        if transaction["type"] == "income":
            income += transaction["amount"]

        elif transaction["type"] == "expense":
            expense += transaction["amount"]

    return income - expense


def calculate_monthly(data):

    current_month = datetime.now().strftime("%Y-%m")

    income = 0
    expense = 0

    for transaction in data["transactions"]:

        transaction_date = transaction.get("date", "")

        if transaction_date.startswith(current_month):

            if transaction["type"] == "income":
                income += transaction["amount"]

            elif transaction["type"] == "expense":
                expense += transaction["amount"]

    return income, expense


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


# --------------------------------------------------
# ROUTES
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "Personal Finance API çalışıyor!"
    }


@app.get("/api/test")
def test():

    return {
        "status": "ok",
        "message": "Backend bağlantısı başarılı."
    }


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@app.post("/api/login")
def login(request: LoginRequest):

    data = load_data()

    hashed_password = hash_password(
        request.password
    )

    if (
        request.username == data["user"]["username"]
        and hashed_password == data["user"]["password"]
    ):

        return {
            "success": True,
            "message": "Giriş başarılı.",
            "username": data["user"]["username"]
        }

    return {
        "success": False,
        "message": "Kullanıcı adı veya şifre yanlış."
    }

class TransactionRequest(BaseModel):
    type: str
    amount: float
    description: str

class UserUpdateRequest(BaseModel):
    username: str

class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str

# --------------------------------------------------
# DASHBOARD
# --------------------------------------------------

@app.get("/api/dashboard")
def dashboard():

    data = load_data()

    balance = calculate_balance(data)

    monthly_income, monthly_expense = calculate_monthly(data)

    # Son 5 işlem
    recent_transactions = data["transactions"][-5:]

    # En yeni işlem en üstte olsun
    recent_transactions.reverse()

    return {
        "username": data["user"]["username"],
        "balance": balance,
        "monthly_income": monthly_income,
        "monthly_expense": monthly_expense,
        "recent_transactions": recent_transactions
    }

# --------------------------------------------------
# ADD TRANSACTION
# --------------------------------------------------

@app.post("/api/transactions")
def add_transaction(request: TransactionRequest):

    data = load_data()

    if request.type not in ["income", "expense"]:
        return {
            "success": False,
            "message": "Geçersiz işlem türü."
        }

    if request.amount <= 0:
        return {
            "success": False,
            "message": "Tutar 0'dan büyük olmalıdır."
        }

    if not request.description.strip():
        return {
            "success": False,
            "message": "Açıklama boş bırakılamaz."
        }

    now = datetime.now()

    transaction = {
        "type": request.type,
        "amount": request.amount,
        "description": request.description.strip(),
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S")
    }

    data["transactions"].append(
        transaction
    )

    save_data(data)

    return {
        "success": True,
        "message": "İşlem başarıyla eklendi.",
        "transaction": transaction
    }

# --------------------------------------------------
# GET TRANSACTIONS
# --------------------------------------------------

@app.get("/api/transactions")
def get_transactions():

    data = load_data()

    transactions = data["transactions"].copy()

    # En yeni işlem en üstte
    transactions.reverse()

    return {
        "transactions": transactions
    }

# --------------------------------------------------
# USER
# --------------------------------------------------

@app.get("/api/user")
def get_user():

    data = load_data()

    return {
        "username": data["user"]["username"]
    }


@app.put("/api/user")
def update_user(request: UserUpdateRequest):

    data = load_data()

    username = request.username.strip()

    if not username:
        return {
            "success": False,
            "message": "Kullanıcı adı boş bırakılamaz."
        }

    if len(username) < 3:
        return {
            "success": False,
            "message": "Kullanıcı adı en az 3 karakter olmalıdır."
        }

    data["user"]["username"] = username

    save_data(data)

    return {
        "success": True,
        "message": "Kullanıcı adı güncellendi.",
        "username": username
    }


# --------------------------------------------------
# NEW MONTH
# --------------------------------------------------

@app.post("/api/new-month")
def new_month():

    data = load_data()

    if not data["transactions"]:
        return {
            "success": False,
            "message": "Aktif ayda arşivlenecek işlem bulunmuyor."
        }

    now = datetime.now()

    current_month = now.strftime("%Y-%m")

    balance = calculate_balance(data)

    monthly_income, monthly_expense = calculate_monthly(data)

    archive = {
        "month": current_month,
        "closed_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "income": monthly_income,
            "expense": monthly_expense,
            "balance": balance
        },
        "transactions": data["transactions"].copy()
    }

    data["archives"].append(archive)

    # Aktif işlemleri temizle.
    # Bakiye, gelir ve gider işlemlerden hesaplandığı için
    # bunlar otomatik olarak 0 olacak.
    data["transactions"] = []

    save_data(data)

    return {
        "success": True,
        "message": "Yeni ay başarıyla başlatıldı.",
        "archived_month": current_month
    }

# --------------------------------------------------
# CHANGE PASSWORD
# --------------------------------------------------

@app.put("/api/password")
def change_password(request: PasswordUpdateRequest):

    data = load_data()

    current_password_hash = hash_password(
        request.current_password
    )

    # Mevcut şifre yanlışsa
    if current_password_hash != data["user"]["password"]:

        return {
            "success": False,
            "message": "Mevcut şifre yanlış."
        }

    # Yeni şifre kontrolü
    if len(request.new_password) < 4:

        return {
            "success": False,
            "message": "Yeni şifre en az 4 karakter olmalıdır."
        }

    # Eski şifreyle aynı olmasın
    new_password_hash = hash_password(
        request.new_password
    )

    if new_password_hash == data["user"]["password"]:

        return {
            "success": False,
            "message": "Yeni şifre eski şifreyle aynı olamaz."
        }

    # Yeni şifreyi kaydet
    data["user"]["password"] = new_password_hash

    save_data(data)

    return {
        "success": True,
        "message": "Şifre başarıyla değiştirildi."
    }