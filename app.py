from flask import Flask, render_template, request, redirect, url_for, session
import pandas as pd
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from threading import Thread

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")


SUBMISSIONS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'submissions.parquet')
ORDERS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'orders.parquet')

os.makedirs(os.path.dirname(SUBMISSIONS_FILE), exist_ok=True)

def SendEmail(UserInput):
    """Send an email notification when a new submission is received"""
    try:
        print(f"DEBUG: Starting email send for {UserInput['HumanName']}...")
        
        SenderEmail = os.getenv("SENDER_EMAIL", "MKultra0020@gmail.com")
        EmailPW = os.getenv("EMAIL_PASSWORD")  
        ReceiveInbox = "MK.BARRIAULT@outlook.com"
        
        print(f"DEBUG: Connecting to Gmail SMTP...")
        
        message = MIMEMultipart("alternative")
        message["Subject"] = f"New Request from Portfolio: {UserInput['Request']}"
        message["From"] = SenderEmail
        message["To"] = ReceiveInbox
        
        text = f"""
New submission from your portfolio website!

Name: {UserInput['HumanName']}
Email: {UserInput['EmailAddy']}
Inquiry Type: {UserInput['Request']}
Product Request: {UserInput['ProductRequest'] if UserInput['ProductRequest'] else 'N/A'}
App Request: {UserInput['AppRequest'] if UserInput['AppRequest'] else 'N/A'}
Message: {UserInput['message']}
Timestamp: {UserInput['timestamp']}
        """
        
        part = MIMEText(text, "plain")
        message.attach(part)
        
        print(f"DEBUG: Logging in and sending...")
        try:
            server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
            server.starttls()
            server.login(SenderEmail, EmailPW)
            server.sendmail(SenderEmail, ReceiveInbox, message.as_string())
            server.quit()
        except Exception as e1:
            print(f"DEBUG: Port 587 failed ({e1}), trying port 465...")
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
            server.login(SenderEmail, EmailPW)
            server.sendmail(SenderEmail, ReceiveInbox, message.as_string())
            server.quit()
        
        print(f"✅ Email sent successfully for submission from {UserInput['HumanName']}")
    except Exception as e:
        print(f"❌ Email Error: {type(e).__name__}: {e}")

def SendOrderEmail(order_data):
    """Send order confirmation email"""
    try:
        print(f"DEBUG: Starting order email send...")
        
        SenderEmail = os.getenv("SENDER_EMAIL", "MKultra0020@gmail.com")
        EmailPW = os.getenv("EMAIL_PASSWORD") 
        ReceiveInbox = "MK.BARRIAULT@outlook.com"
        
        message = MIMEMultipart("alternative")
        message["Subject"] = f"New Order from {order_data['name']}"
        message["From"] = SenderEmail
        message["To"] = ReceiveInbox
        
       
        items_text = "\n".join([f"- {item['name']} (${item['price']:.2f})" for item in order_data['items']]) #BUILD ITEMS LIST
        
        text = f"""
🛒 NEW ORDER RECEIVED!

Customer Info:
Real Purchase: {order_data['real_purchase']}
Name: {order_data['name']}
Email: {order_data['email']}
Phone: {order_data['phone']}

Shipping Address:
{order_data['address']}
{order_data['city']}, {order_data['state']} {order_data['zip']}

Order Details:
{items_text}

Total: ${order_data['total']:.2f}

Order Date: {order_data['timestamp']}
        """
        
        part = MIMEText(text, "plain")
        message.attach(part)
        
        try:
            server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
            server.starttls()
            server.login(SenderEmail, EmailPW)
            server.sendmail(SenderEmail, ReceiveInbox, message.as_string())
            server.quit()
        except Exception as e1:
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
            server.login(SenderEmail, EmailPW)
            server.sendmail(SenderEmail, ReceiveInbox, message.as_string())
            server.quit()
        
        print(f"✅ Order email sent successfully!")
    except Exception as e:
        print(f"❌ Order Email Error: {type(e).__name__}: {e}")

def EmailAsync(submission):
    """Send email in background thread"""
    thread = Thread(target=SendEmail, args=(submission,))
    thread.daemon = True
    thread.start()

def OrderEmailAsync(order_data):
    """Send order email in background thread"""
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
        
        # Save order to parquet
        try:
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
            'timestamp': order_data['timestamp']
        }
        
        df = pd.concat([df, pd.DataFrame([order_record])], ignore_index=True)
        df.to_parquet(ORDERS_FILE, index=False)
        
        # Send order email
        OrderEmailAsync(order_data)
        
        # Clear cart
        session['cart'] = []
        session.modified = True
        
        return redirect(url_for('order_confirmation'))
    
    return render_template("checkout.html", cart_items=cart_items, total=total)

@app.route("/order_confirmation")
def order_confirmation():
    return render_template("order_confirmation.html")

if __name__ == "__main__":
    app.run(debug=True)