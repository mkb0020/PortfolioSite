import pandas as pd
from datetime import datetime


from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from threading import Thread
from functools import wraps

from db_helpers import (
    NewContactSubmission, # add_contact_submission
    update_contact_status,
    NewSuggestion, # add_suggestion
    NewGuestbook, # add_guestbook_entry
    GetGuestbook, # get_guestbook_entries
    CheckAvailability, # check_item_availability DecreaseInventory, NewOrderNumber
    NewOrder, # create_order
    GetContactSubmissions, # get_all_contact_submissions
    GetSuggestions, # get_all_suggestions GetGuestbook, GetItemName
    GetOrders, # get_all_orders
    GetRealOrders, # get_real_purchase_orders 
    update_order_status,
    #get_all_partnership_inquiries,
    #update_partnership_status
)

app = Flask(__name__)

# ============================================ ENVIRONMENTAL VARIABLES ============================================
app.secret_key = os.environ.get("SECRET_KEY")  
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")  
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")  
RECEIVE_INBOX = os.environ.get("RECEIVE_EMAIL")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

# ============================================ ADMIN DECORATOR ============================================
def AdminRequired(f): # REQUIRE ADMIN LOGIN FOR DASHBOARD
    @wraps(f)
    def Decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return Decorated

# ============================================ EMAIL FUNCTIONS ============================================
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
            raise RuntimeError("Email settings not configured")

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
            print(f"✅ Email sent successfully for {UserInput.get('HumanName')}")
        else:
            print(f"❌ Email Error: {err}")
    except Exception as e:
        print(f"❌ Email Error: {type(e).__name__}: {e}")

def SendOrderEmail(order_data):
    try:
        print("DEBUG: Starting order email send...")
        if not SENDER_EMAIL or not EMAIL_PASSWORD:
            raise RuntimeError("Email settings not configured")

        message = MIMEMultipart("alternative")
        message["Subject"] = f"{'REAL PURCHASE REQUEST' if order_data.get('real_purchase') else 'Demo Order'} from {order_data.get('name')}"
        message["From"] = SENDER_EMAIL
        message["To"] = RECEIVE_INBOX

        items_text = "\n".join([f"- {item['name']} (${item['price']:.2f})" for item in order_data.get("items", [])])
        purchase_status = "CUSTOMER WANTS TO ACTUALLY PURCHASE! Contact them to arrange payment." if order_data.get("real_purchase") else "This is a demo order - customer is just testing the site."

        text = (
            f"{'🚨 REAL PURCHASE REQUEST!' if order_data.get('real_purchase') else 'Demo Order Received'}\n\n"
            f"{purchase_status}\n\n"
            f"Order Number: {order_data.get('order_number')}\n\n"
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

def EmailAsync(submission): # SEND EMAIL IN BACKGROUND THREAD
    thread = Thread(target=SendEmail, args=(submission,))
    thread.daemon = True
    thread.start()

def OrderEmailAsync(order_data): # SEND ORDER CONFIRMATION EMAIL IN BACKGROUND THREAD
    thread = Thread(target=SendOrderEmail, args=(order_data,))
    thread.daemon = True
    thread.start()

#============================================ PUBLIC PAGE ROUTES ============================================
@app.route("/")
def home():
    return render_template("about.html")

@app.route("/resume")
def resume():
    return render_template("resume.html")

@app.route("/coding")
def coding():
    return render_template("coding.html")


# ============================================  ART ============================================


@app.route("/jewelry")
def jewelry():
    return render_template("jewelry.html")

@app.route("/art")
def art():
    return render_template("art.html")


@app.route("/partnerships")
def partnerships():
    return render_template("partnerships.html")

@app.route("/partnerships", methods=["GET", "POST"]) # PARTNERSHIP PAGE
def partnerships():
    if request.method == "POST":
        new_inquiry = {
            "business_name": request.form.get("business_name"),
            "contact_name": request.form.get("contact_name"),
            "contact_email": request.form.get("contact_email"),
            "contact_phone": request.form.get("contact_phone"),
            "business_type": request.form.get("business_type"),
            "market_locations": request.form.get("market_locations"),
            "interest_type": request.form.get("interest_type"),
            "estimated_quantity": request.form.get("estimated_quantity"),
            "additional_info": request.form.get("additional_info")
        }
        
        if add_partnership_inquiry(new_inquiry):
            # TODO: Send email notification
            return redirect(url_for("partnerships", success=True))
        else:
            return "Error saving partnership inquiry", 500
    
    success = request.args.get("success", False)
    return render_template("partnerships.html", success=success)

# ============================================  GUESTBOOK ============================================
@app.route("/guestbook", methods=["GET", "POST"])
def guestbook():
    if request.method == "POST":
        new_entry = {
            "name": request.form.get("name", "Anonymous"),
            "message": request.form.get("message")
        }
        
        if NewGuestbook(new_entry):
            return redirect(url_for("guestbook"))
        else:
            return "Error saving guestbook entry", 500

    entries = GetGuestbook() # GET ENTRIES FROM POSTGRESQL
    
    comments = [] # CONVERT TO FORMAT EXPECTED BY TEMPLATE
    for entry in entries:
        comments.append({
            "name": entry['name'],
            "message": entry['message'],
            "timestamp": entry['posted_at'].strftime("%Y-%m-%d %H:%M:%S")
        })
    
    return render_template("guestbook.html", comments=comments)

# ============================================ CONTACT ME ============================================
@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        NewRequest = {
            "HumanName": request.form.get("HumanName"),
            "EmailAddy": request.form.get("EmailAddy"),
            "Request": request.form.get("Request"),
            "ProductRequest": request.form.get("ProductRequest", ""),
            "AppRequest": request.form.get("AppRequest", ""),
            "message": request.form.get("message"),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        if NewContactSubmission(NewRequest):
            EmailAsync(NewRequest)
            return redirect(url_for("contact", success=True))
        else:
            return "Error saving contact submission", 500
    
    success = request.args.get("success", False)
    return render_template("contact.html", success=success)

# ============================================ SUGGESTIONS ============================================
@app.route("/suggestions", methods=["GET", "POST"])
def suggestions():
    if request.method == "POST":
        new_suggestion = {
            "name": request.form.get("name", "Anonymous"),
            "email": request.form.get("email", ""),
            "suggestion_type": request.form.get("suggestion_type"),
            "suggestion": request.form.get("suggestion")
        }
        
        if NewSuggestion(new_suggestion):
            return redirect(url_for("suggestions", success=True))
        else:
            return "Error saving suggestion", 500

    success = request.args.get("success", False)
    return render_template("suggestions.html", success=success)

# ============================================ CART ROUTES ============================================
@app.route("/add_to_cart", methods=["POST"])
def add_to_cart():
    item_name = request.form.get("item_name")
    item_price = float(request.form.get("item_price"))
    item_image = request.form.get("item_image")
    
    if not CheckAvailability(item_name): # MAKE SURE ITEM IS AVAILABLE ( FOR JEWELRY)
        # TODO: SHOW ERROR MESSAGE TO USER
        print(f"⚠️ Item {item_name} is no longer available")
        return redirect(request.referrer)
    
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

# ============================================ CHECKOUT ============================================
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
            'total': total,
            'real_purchase': real_purchase,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        order_number = NewOrder(order_data, cart_items) #SAVE TO POSTGRESQL
        
        if order_number: # ADD ORDER NUMBER TO EMAIL
            order_data['order_number'] = order_number 
            order_data['items'] = cart_items
            
            OrderEmailAsync(order_data) # SEND EMAIL
            
            session['cart'] = [] # CLEAR CART
            session.modified = True
            
            return redirect(url_for('order_confirmation'))
        else:
            return "Error creating order", 500
    
    return render_template("checkout.html", cart_items=cart_items, total=total)

@app.route("/order_confirmation")
def order_confirmation():
    return render_template("order_confirmation.html")

# ============================================ ADMIN ROUTES ============================================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login(): #admin_login
    if request.method == "POST":
        password = request.form.get("password")
        if password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            return render_template("admin_login.html", error="Invalid password")
    
    return render_template("admin_login.html")

@app.route("/admin/logout")
def admin_logout(): #admin_logout
    session.pop('admin_logged_in', None)
    return redirect(url_for('home'))

@app.route("/admin")
@AdminRequired
def admin_dashboard(): # MAIN ADMIN DASHBOARD WITH OVERVIEW   
    # GET DATA
    contacts = GetContactSubmissions()
    suggestions = GetSuggestions()
    orders = GetOrders()
    real_orders = GetRealOrders()
    
    stats = {
        'total_contacts': len(contacts),
        'total_suggestions': len(suggestions),
        'total_orders': len(orders),
        'real_purchases': len(real_orders),
        'recent_contacts': contacts[:5],  # LAST 5
        'recent_real_orders': real_orders[:5]  # LAST 5 REAL ORDERS
    }
    
    return render_template("admin_dashboard.html", stats=stats)

@app.route("/admin/contacts")
@AdminRequired
def admin_contacts(): # admin_contacts / VIEW ALL CONTACT SUBMISSIONS
    contacts = GetContactSubmissions()
    return render_template("admin_contacts.html", contacts=contacts)

@app.route("/admin/suggestions")
@AdminRequired
def admin_suggestions(): #admin_suggestions / VIEW ALL SUGGESTIONS
    suggestions = GetSuggestions()
    return render_template("admin_suggestions.html", suggestions=suggestions)

@app.route("/admin/orders")
@AdminRequired
def admin_orders():# VIEW ALL ORDERS
    orders = GetOrders()
    return render_template("admin_orders.html", orders=orders)

@app.route("/admin/real-purchases")
@AdminRequired
def admin_real_purchases(): # VIEW REAL ORDERS ONLY
    real_orders = GetRealOrders()
    return render_template("admin_real_purchases.html", orders=real_orders)

@app.route("/admin/contact/update-status/<int:submission_id>/<status>", methods=["POST"])
@AdminRequired
def update_contact_submission_status(submission_id, status): #UPDATE CONTACT SUBMISSION STATUS
    if update_contact_status(submission_id, status):
        return redirect(url_for('admin_contacts'))
    else:
        return "Error updating status", 500
    
@app.route("/admin/order/update-status/<int:order_id>/<status>", methods=["POST"])
@AdminRequired
def update_order_status_route(order_id, status):
    """Update order status"""
    if update_order_status(order_id, status):
        # Redirect back to the referring page
        return redirect(request.referrer or url_for('admin_orders'))
    else:
        return "Error updating status", 500



@app.route("/admin/partners")
@AdminRequired
def admin_partners():
    """View all partnership inquiries"""
    partners = get_all_partnership_inquiries()
    return render_template("admin_partners.html", partners=partners)

@app.route("/admin/partnership/update-status/<int:inquiry_id>/<status>", methods=["POST"])
@AdminRequired
def update_partnership_status_route(inquiry_id, status):
    """Update partnership inquiry status"""
    if update_partnership_status(inquiry_id, status):
        return redirect(url_for('admin_partners'))
    else:
        return "Error updating status", 500

# ============================================ MAIN ============================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)




