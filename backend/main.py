from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/stock/{ticker}")
def get_stock_price(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Priority Order for the absolute "Current" price:
        # 1. Extended Hours (if applicable)
        # 2. Bid or Ask (very fresh data)
        # 3. currentPrice (Yahoo's official session current)
        # 4. fast_info last_price
        # 5. regularMarketPrice (last regular close)
        
        price = None
        session = "Regular"
        
        # Check Extended Hours first
        if info.get('preMarketPrice'):
            price = info.get('preMarketPrice')
            session = "Pre-Market"
        elif info.get('postMarketPrice'):
            price = info.get('postMarketPrice')
            session = "After-Hours"

        # If not in extended hours or price is still missing, try live bid/ask or current
        if not price:
            # Prefer 'ask' as it's the current selling price, often very live
            price = info.get('ask') or info.get('bid') or info.get('currentPrice')
            
        if price is None:
            try:
                price = stock.fast_info['last_price']
            except:
                pass
                
        if price is None:
            price = info.get('regularMarketPrice')
            
        if price is None:
            # Final fallback
            history = stock.history(period="1d", interval="1m")
            if not history.empty:
                price = history['Close'].iloc[-1]
            else:
                raise HTTPException(status_code=404, detail=f"No data found for ticker: {ticker}")

        return {
            "symbol": ticker.upper(),
            "price": round(float(price), 2),
            "currency": info.get('currency', 'USD'),
            "name": info.get('longName', ticker.upper()),
            "lastUpdate": datetime.now().strftime("%H:%M:%S"),
            "session": session
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

