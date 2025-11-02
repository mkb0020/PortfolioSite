# db_helpers.py
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

def ConnectToDB():
    """Get PostgreSQL database connection"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="portfolio_site",
            user="postgres",
            password=os.getenv("POSTGRES_PASSWORD")
        )
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None


# ============================================
# CONTACT SUBMISSIONS
# ============================================
def NewContactSubmission(data):
    """Add a new contact form submission"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contact_submissions 
            (name, email, inquiry_type, product_request, app_request, message)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING submission_id
        """, (
            data.get('HumanName'),
            data.get('EmailAddy'),
            data.get('Request'),
            data.get('ProductRequest'),
            data.get('AppRequest'),
            data.get('message')
        ))
        submission_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Contact submission {submission_id} saved to database")
        return True
    except Exception as e:
        print(f"❌ Error saving contact submission: {e}")
        conn.rollback()
        conn.close()
        return False


def GetContactSubmissions():
    """Get all contact submissions (for admin dashboard)"""
    conn = ConnectToDB()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM contact_submissions 
            ORDER BY submitted_at DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"❌ Error fetching contact submissions: {e}")
        conn.close()
        return []


def update_contact_status(submission_id, new_status):
    """Update the status of a contact submission"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE contact_submissions 
            SET status = %s 
            WHERE submission_id = %s
        """, (new_status, submission_id))
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Updated contact submission {submission_id} to {new_status}")
        return True
    except Exception as e:
        print(f"❌ Error updating contact status: {e}")
        conn.rollback()
        conn.close()
        return False


# ============================================
# SUGGESTIONS
# ============================================
def NewSuggestion(data):
    """Add a new suggestion"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO suggestions 
            (name, email, suggestion_type, suggestion)
            VALUES (%s, %s, %s, %s)
            RETURNING suggestion_id
        """, (
            data.get('name', 'Anonymous'),
            data.get('email'),
            data.get('suggestion_type'),
            data.get('suggestion')
        ))
        suggestion_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Suggestion {suggestion_id} saved to database")
        return True
    except Exception as e:
        print(f"❌ Error saving suggestion: {e}")
        conn.rollback()
        conn.close()
        return False


def GetSuggestions():
    """Get all suggestions (for admin dashboard)"""
    conn = ConnectToDB()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM suggestions 
            ORDER BY submitted_at DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"❌ Error fetching suggestions: {e}")
        conn.close()
        return []


# ============================================
# GUESTBOOK
# ============================================
def NewGuestbook(data):
    """Add a new guestbook entry"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO guestbook_entries (name, message)
            VALUES (%s, %s)
            RETURNING entry_id
        """, (
            data.get('name', 'Anonymous'),
            data.get('message')
        ))
        entry_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Guestbook entry {entry_id} saved to database")
        return True
    except Exception as e:
        print(f"❌ Error saving guestbook entry: {e}")
        conn.rollback()
        conn.close()
        return False


def GetGuestbook():
    """Get all guestbook entries"""
    conn = ConnectToDB()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM guestbook_entries 
            WHERE is_approved = true
            ORDER BY posted_at DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"❌ Error fetching guestbook entries: {e}")
        conn.close()
        return []


# ============================================
# INVENTORY MANAGEMENT
# ============================================
def get_item_by_name(item_name):
    """Get inventory item by name"""
    conn = ConnectToDB()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM inventory 
            WHERE item_name = %s
        """, (item_name,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except Exception as e:
        print(f"❌ Error fetching item: {e}")
        conn.close()
        return None


def CheckAvailability(item_name):
    """Check if item is available for purchase"""
    item = get_item_by_name(item_name)
    if not item:
        return False
    return item['is_available'] and item['quantity_available'] > 0


def DecreaseInventory(item_name, quantity=1):
    """Decrease inventory quantity (for jewelry when sold)"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE inventory 
            SET quantity_available = quantity_available - %s,
                is_available = CASE 
                    WHEN quantity_available - %s <= 0 THEN false 
                    ELSE true 
                END
            WHERE item_name = %s
        """, (quantity, quantity, item_name))
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Decreased inventory for {item_name}")
        return True
    except Exception as e:
        print(f"❌ Error updating inventory: {e}")
        conn.rollback()
        conn.close()
        return False


# ============================================
# ORDERS
# ============================================
def NewOrderNumber():
    """Generate unique order number like ORD-20250129-001"""
    date_str = datetime.now().strftime("%Y%m%d")
    conn = ConnectToDB()
    if not conn:
        return f"ORD-{date_str}-001"
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM orders 
            WHERE order_date::date = CURRENT_DATE
        """)
        count = cursor.fetchone()[0] + 1
        cursor.close()
        conn.close()
        return f"ORD-{date_str}-{count:03d}"
    except Exception as e:
        print(f"❌ Error generating order number: {e}")
        conn.close()
        return f"ORD-{date_str}-001"


def NewOrder(order_data, cart_items):
    """Create a new order with items"""
    conn = ConnectToDB()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        order_number = NewOrderNumber()
        
        # Insert main order
        cursor.execute("""
            INSERT INTO orders 
            (order_number, customer_name, customer_email, customer_phone,
             address, city, state, zip_code, total_amount, is_real_purchase, order_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING order_id
        """, (
            order_number,
            order_data['name'],
            order_data['email'],
            order_data.get('phone'),
            order_data['address'],
            order_data['city'],
            order_data['state'],
            order_data['zip'],
            order_data['total'],
            order_data['real_purchase'],
            'real_pending' if order_data['real_purchase'] else 'demo'
        ))
        
        order_id = cursor.fetchone()[0]
        
        # Insert order items
        for item in cart_items:
            # Get item_id from inventory
            cursor.execute("""
                SELECT item_id FROM inventory WHERE item_name = %s
            """, (item['name'],))
            result = cursor.fetchone()
            item_id = result[0] if result else None
            
            cursor.execute("""
                INSERT INTO order_items 
                (order_id, item_id, item_name, item_price, quantity, item_image_url)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_id,
                item_id,
                item['name'],
                item['price'],
                1,
                item['image']
            ))
            
            # If real purchase and jewelry, decrease inventory
            if order_data['real_purchase'] and item_id:
                cursor.execute("""
                    SELECT item_type FROM inventory WHERE item_id = %s
                """, (item_id,))
                item_type_result = cursor.fetchone()
                if item_type_result and item_type_result[0] == 'jewelry':
                    DecreaseInventory(item['name'], 1)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Order {order_number} created successfully!")
        return order_number
        
    except Exception as e:
        print(f"❌ Error creating order: {e}")
        conn.rollback()
        conn.close()
        return None


def GetOrders():
    """Get all orders with items (for admin dashboard)"""
    conn = ConnectToDB()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT o.*, 
                   json_agg(
                       json_build_object(
                           'item_name', oi.item_name,
                           'item_price', oi.item_price,
                           'quantity', oi.quantity
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            GROUP BY o.order_id
            ORDER BY o.order_date DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"❌ Error fetching orders: {e}")
        conn.close()
        return []


def GetRealOrders():
    """Get only real purchase orders (for quick checking)"""
    conn = ConnectToDB()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT o.*, 
                   json_agg(
                       json_build_object(
                           'item_name', oi.item_name,
                           'item_price', oi.item_price
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.is_real_purchase = true
            GROUP BY o.order_id
            ORDER BY o.order_date DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"❌ Error fetching real purchase orders: {e}")
        conn.close()
        return []


def update_order_status(order_id, new_status):
    """Update the status of an order"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE orders 
            SET order_status = %s 
            WHERE order_id = %s
        """, (new_status, order_id))
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Updated order {order_id} to {new_status}")
        return True
    except Exception as e:
        print(f"❌ Error updating order status: {e}")
        conn.rollback()
        conn.close()
        return False


# ============================================
# PARTNERSHIP INQUIRIES
# ============================================
def add_partnership_inquiry(data):
    """Add a new partnership/wholesale inquiry"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO partnership_inquiries 
            (business_name, contact_name, contact_email, contact_phone,
             business_type, market_locations, interest_type, 
             estimated_quantity, additional_info)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING inquiry_id
        """, (
            data.get('business_name'),
            data.get('contact_name'),
            data.get('contact_email'),
            data.get('contact_phone'),
            data.get('business_type'),
            data.get('market_locations'),
            data.get('interest_type'),
            data.get('estimated_quantity'),
            data.get('additional_info')
        ))
        inquiry_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Partnership inquiry {inquiry_id} saved to database")
        return True
    except Exception as e:
        print(f"❌ Error saving partnership inquiry: {e}")
        conn.rollback()
        conn.close()
        return False


def get_all_partnership_inquiries():
    """Get all partnership inquiries (for admin dashboard)"""
    conn = ConnectToDB()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT * FROM partnership_inquiries 
            ORDER BY submitted_at DESC
        """)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"❌ Error fetching partnership inquiries: {e}")
        conn.close()
        return []


def update_partnership_status(inquiry_id, new_status):
    """Update the status of a partnership inquiry"""
    conn = ConnectToDB()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE partnership_inquiries 
            SET status = %s 
            WHERE inquiry_id = %s
        """, (new_status, inquiry_id))
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ Updated partnership inquiry {inquiry_id} to {new_status}")
        return True
    except Exception as e:
        print(f"❌ Error updating partnership status: {e}")
        conn.rollback()
        conn.close()
        return False