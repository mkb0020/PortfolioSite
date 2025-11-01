from flask import render_template, request, redirect, url_for, session
from functools import wraps
import os

# Import from db_helpers
from db_helpers import (
    get_all_contact_submissions,
    get_all_suggestions,
    get_all_orders,
    get_real_purchase_orders
)

# Simple password protection (you can make this more secure later)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "your_secure_password")


def admin_required(f):
    """Decorator to require admin login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function


# ============================================
# ADMIN LOGIN
# ============================================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        password = request.form.get("password")
        if password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            return render_template("admin_login.html", error="Invalid password")
    
    return render_template("admin_login.html")


@app.route("/admin/logout")
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('home'))


# ============================================
# ADMIN DASHBOARD
# ============================================
@app.route("/admin")
@admin_required
def admin_dashboard():
    """Main admin dashboard with overview"""
    
    # Get counts
    contacts = get_all_contact_submissions()
    suggestions = get_all_suggestions()
    orders = get_all_orders()
    real_orders = get_real_purchase_orders()
    
    stats = {
        'total_contacts': len(contacts),
        'total_suggestions': len(suggestions),
        'total_orders': len(orders),
        'real_purchases': len(real_orders),
        'recent_contacts': contacts[:5],  # Last 5
        'recent_real_orders': real_orders[:5]  # Last 5 real purchases
    }
    
    return render_template("admin_dashboard.html", stats=stats)


# ============================================
# ADMIN - VIEW ALL CONTACTS
# ============================================
@app.route("/admin/contacts")
@admin_required
def admin_contacts():
    """View all contact submissions"""
    contacts = get_all_contact_submissions()
    return render_template("admin_contacts.html", contacts=contacts)


# ============================================
# ADMIN - VIEW ALL SUGGESTIONS
# ============================================
@app.route("/admin/suggestions")
@admin_required
def admin_suggestions():
    """View all suggestions"""
    suggestions = get_all_suggestions()
    return render_template("admin_suggestions.html", suggestions=suggestions)


# ============================================
# ADMIN - VIEW ALL ORDERS
# ============================================
@app.route("/admin/orders")
@admin_required
def admin_orders():
    """View all orders"""
    orders = get_all_orders()
    return render_template("admin_orders.html", orders=orders)


# ============================================
# ADMIN - VIEW REAL PURCHASES ONLY
# ============================================
@app.route("/admin/real-purchases")
@admin_required
def admin_real_purchases():
    """View only real purchase orders"""
    real_orders = get_real_purchase_orders()
    return render_template("admin_real_purchases.html", orders=real_orders)
