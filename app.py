from flask import Flask, render_template, request, redirect, url_for, session
import pandas as pd
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from threading import Thread


app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")  

SUBMISSIONS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'submissions.parquet')
ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'orders.parquet')
SUGGESTIONS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'suggestions.parquet')
GUESTBOOK_FILE = os.path.join(os.path.dirname(__file__), 'data', 'guestbook.parquet')

SENDER_EMAIL = os.environ.get("SENDER_EMAIL")  
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")  
RECEIVE_INBOX = os.environ.get("RECEIVE_EMAIL", "MK.BARRIAULT@outlook.com")

os.makedirs(os.path.dirname(SUBMISSIONS_FILE), exist_ok=True)

BASE_DIR = os.path.dirname(__file__) 
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

def SendSMTP(message): #_send_smtp_message / TRY 587 THEN 465
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.starttls()
        server.login(SENDER_EMAIL, EMAIL_PASSWORD)
        server.sendmail(message["From"], message["To"], message.as_string())
        server.quit()
        return True, None
    except Exception as e1:
        try:
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
            server.login(SENDER_EMAIL, EMAIL_PASSWORD)
            server.sendmail(message["From"], message["To"], message.as_string())
            server.quit()
            return True, None
        except Exception as e2:
            return False, f"587 error: {e1}; 465 error: {e2}"

def SendEmail(UserInput):
    try:
        print(f"DEBUG: Starting email send for {UserInput.get('HumanName')}...")
        if not SENDER_EMAIL or not EMAIL_PASSWORD:
            raise RuntimeError("Email settings not configured (SENDER_EMAIL and EMAIL_PASSWORD required).")

        message = MIMEMultipart("alternative")
        subject = f"New Request from Portfolio: {UserInput.get('Request', 'Contact')}"
        message["Subject"] = subject
        message["From"] = SENDER_EMAIL
        message["To"] = RECEIVE_INBOX

        text = (
            f"New submission from your portfolio website!\n\n"
            f"Name: {UserInput.get('HumanName')}\n"
            f"Email: {UserInput.get('EmailAddy')}\n"
            f"Inquiry Type: {UserInput.get('Request')}\n"
            f"Product Request: {UserInput.get('ProductRequest') or 'N/A'}\n"
            f"App Request: {UserInput.get('AppRequest') or 'N/A'}\n"
            f"Message: {UserInput.get('message')}\n"
            f"Timestamp: {UserInput.get('timestamp')}\n"
        )
        part = MIMEText(text, "plain")
        message.attach(part)

        ok, err = SendSMTP(message)
        if ok:
            print(f"✅ Email sent successfully for submission from {UserInput.get('HumanName')}")
        else:
            print(f"❌ Email Error: {err}")
    except Exception as e:
        print(f"❌ Email Error: {type(e).__name__}: {e}")

def SendOrderEmail(order_data):
    try:
        print("DEBUG: Starting order email send...")
        if not SENDER_EMAIL or not EMAIL_PASSWORD:
            raise RuntimeError("Email settings not configured (SENDER_EMAIL and EMAIL_PASSWORD required).")

        message = MIMEMultipart("alternative")
        message["Subject"] = f"{'REAL PURCHASE REQUEST' if order_data.get('real_purchase') else 'Demo Order'} from {order_data.get('name')}"
        message["From"] = SENDER_EMAIL
        message["To"] = RECEIVE_INBOX

        items_text = "\n".join([f"- {item['name']} (${item['price']:.2f})" for item in order_data.get("items", [])])
        purchase_status = "CUSTOMER WANTS TO ACTUALLY PURCHASE! Contact them to arrange payment." if order_data.get("real_purchase") else "This is a demo order - customer is just testing the site."

        text = (
            f"{'REAL PURCHASE REQUEST!' if order_data.get('real_purchase') else 'Demo Order Received'}\n\n"
            f"{purchase_status}\n\n"
            f"Customer Info:\nName: {order_data.get('name')}\nEmail: {order_data.get('email')}\nPhone: {order_data.get('phone')}\n\n"
            f"Shipping Address:\n{order_data.get('address')}\n{order_data.get('city')}, {order_data.get('state')} {order_data.get('zip')}\n\n"
            f"Order Details:\n{items_text}\n\n"
            f"Total: ${order_data.get('total', 0):.2f}\nOrder Date: {order_data.get('timestamp')}\n"
        )
        part = MIMEText(text, "plain")
        message.attach(part)

        ok, err = SendSMTP(message)
        if ok:
            print("✅ Order email sent successfully!")
        else:
            print(f"❌ Order Email Error: {err}")
    except Exception as e:
        print(f"❌ Order Email Error: {type(e).__name__}: {e}")

def EmailAsync(submission):
    thread = Thread(target=SendEmail, args=(submission,))
    thread.daemon = True
    thread.start()

def OrderEmailAsync(order_data):
    thread = Thread(target=SendOrderEmail, args=(order_data,))
    thread.daemon = True
    thread.start()

@app.route("/")
def home():
    return render_template("about.html")

@app.route("/resume")
def resume():
    return render_template("resume.html")

@app.route("/coding")
def coding():
    return render_template("coding.html")

@app.route("/jewelry")
def jewelry():
    return render_template("jewelry.html")

@app.route("/art")
def art():
    return render_template("art.html")

@app.route("/guestbook", methods=["GET", "POST"])
def guestbook():
    try:
        df = pd.read_parquet(GUESTBOOK_FILE)
    except (FileNotFoundError, Exception):
        df = pd.DataFrame(columns=["name", "message", "timestamp"])

    if request.method == "POST":
        name = request.form.get("name", "Anonymous")
        message = request.form.get("message")
        new_entry = {
            "name": name if name else "Anonymous",
            "message": message,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
        df.to_parquet(GUESTBOOK_FILE, index=False)
        return redirect(url_for("guestbook"))

    comments = df.to_dict(orient="records")[::-1]  # NEWEST FIRST
    return render_template("guestbook.html", comments=comments)


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        HumanName = request.form.get("HumanName")
        EmailAddy = request.form.get("EmailAddy")
        Request = request.form.get("Request")
        ProductRequest = request.form.get("ProductRequest", "")
        AppRequest = request.form.get("AppRequest", "")
        message = request.form.get("message")
        
        NewRequest = {
            "HumanName": HumanName,
            "EmailAddy": EmailAddy,
            "Request": Request,
            "ProductRequest": ProductRequest,
            "AppRequest": AppRequest,
            "message": message,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        try:
            df = pd.read_parquet(SUBMISSIONS_FILE)
        except (FileNotFoundError, Exception):
            df = pd.DataFrame()
        
        df = pd.concat([df, pd.DataFrame([NewRequest])], ignore_index=True)
        df.to_parquet(SUBMISSIONS_FILE, index=False)
        EmailAsync(NewRequest)
        
        return redirect(url_for("contact", success=True))
    
    success = request.args.get("success", False)
    return render_template("contact.html", success=success)

@app.route("/suggestions", methods=["GET", "POST"])
def suggestions():
    try:
        df = pd.read_parquet(SUGGESTIONS_FILE)
    except (FileNotFoundError, Exception):
        df = pd.DataFrame(columns=["name", "email", "suggestion_type", "suggestion", "timestamp"])

    if request.method == "POST":
        new_suggestion = {
            "name": request.form.get("name", "Anonymous"),
            "email": request.form.get("email", ""),
            "suggestion_type": request.form.get("suggestion_type"),
            "suggestion": request.form.get("suggestion"),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        df = pd.concat([df, pd.DataFrame([new_suggestion])], ignore_index=True)
        df.to_parquet(SUGGESTIONS_FILE, index=False)
        return redirect(url_for("suggestions", success=True))

    success = request.args.get("success", False)
    return render_template("suggestions.html", success=success)

# CART ROUTES
@app.route("/add_to_cart", methods=["POST"])
def add_to_cart():
    item_name = request.form.get("item_name")
    item_price = float(request.form.get("item_price"))
    item_image = request.form.get("item_image")
    
    if 'cart' not in session:
        session['cart'] = []
    
    session['cart'].append({
        'name': item_name,
        'price': item_price,
        'image': item_image
    })
    session.modified = True
    
    return redirect(request.referrer)

@app.route("/cart")
def cart():
    cart_items = session.get('cart', [])
    total = sum(item['price'] for item in cart_items)
    return render_template("cart.html", cart_items=cart_items, total=total)

@app.route("/remove_from_cart/<int:index>")
def remove_from_cart(index):
    if 'cart' in session and 0 <= index < len(session['cart']):
        session['cart'].pop(index)
        session.modified = True
    return redirect(url_for('cart'))

@app.route("/checkout", methods=["GET", "POST"])
def checkout():
    cart_items = session.get('cart', [])
    if not cart_items:
        return redirect(url_for('cart'))
    
    total = sum(item['price'] for item in cart_items)
    
    if request.method == "POST":
        real_purchase = request.form.get('real_purchase') == 'yes'
        
        order_data = {
            'name': request.form.get('name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'address': request.form.get('address'),
            'city': request.form.get('city'),
            'state': request.form.get('state'),
            'zip': request.form.get('zip'),
            'items': cart_items,
            'total': total,
            'real_purchase': real_purchase,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        try: #SAVE ORDER TO PARQUET
            df = pd.read_parquet(ORDERS_FILE)
        except (FileNotFoundError, Exception):
            df = pd.DataFrame()
        
        order_record = {
            'name': order_data['name'],
            'email': order_data['email'],
            'phone': order_data['phone'],
            'address': order_data['address'],
            'city': order_data['city'],
            'state': order_data['state'],
            'zip': order_data['zip'],
            'items': str(cart_items),
            'total': total,
            'real_purchase': real_purchase,
            'timestamp': order_data['timestamp']
        }
        
        df = pd.concat([df, pd.DataFrame([order_record])], ignore_index=True)
        df.to_parquet(ORDERS_FILE, index=False)
        
        OrderEmailAsync(order_data) #SEND ORDER EMAIL
        
        session['cart'] = [] #CLEAR CART
        session.modified = True
        
        return redirect(url_for('order_confirmation'))
    
    return render_template("checkout.html", cart_items=cart_items, total=total)

@app.route("/order_confirmation")
def order_confirmation():
    return render_template("order_confirmation.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)







