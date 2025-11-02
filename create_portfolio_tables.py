# create_portfolio_tables.py
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

load_dotenv()

def create_portfolio_database():
    """Create all tables for portfolio site"""
    password = os.getenv("POSTGRES_PASSWORD")
    
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="portfolio_site",
            user="postgres",
            password=password
        )
        cursor = conn.cursor()
        
        # ============================================
        # 1. CONTACT SUBMISSIONS
        # ============================================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_submissions (
                submission_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                inquiry_type VARCHAR(100) NOT NULL,
                product_request VARCHAR(200),
                app_request TEXT,
                message TEXT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'unread'
            )
        """)
        
        # ============================================
        # 2. SUGGESTIONS BOX
        # ============================================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS suggestions (
                suggestion_id SERIAL PRIMARY KEY,
                name VARCHAR(100) DEFAULT 'Anonymous',
                email VARCHAR(100),
                suggestion_type VARCHAR(50) NOT NULL,
                suggestion TEXT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'new'
            )
        """)
        
        # ============================================
        # 3. GUESTBOOK ENTRIES
        # ============================================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS guestbook_entries (
                entry_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_approved BOOLEAN DEFAULT true
            )
        """)
        
        # ============================================
        # 4. INVENTORY - Art & Jewelry Items
        # ============================================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS inventory (
                item_id SERIAL PRIMARY KEY,
                item_name VARCHAR(200) NOT NULL UNIQUE,
                item_type VARCHAR(50) NOT NULL,
                description TEXT,
                materials TEXT,
                price DECIMAL(8,2) NOT NULL,
                image_url VARCHAR(300),
                quantity_available INT DEFAULT 1,
                is_available BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # ============================================
        # 5. ORDERS (Main Order Info)
        # ============================================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                order_id SERIAL PRIMARY KEY,
                order_number VARCHAR(30) UNIQUE NOT NULL,
                
                customer_name VARCHAR(100) NOT NULL,
                customer_email VARCHAR(100) NOT NULL,
                customer_phone VARCHAR(20),
                
                address VARCHAR(200) NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(50) NOT NULL,
                zip_code VARCHAR(20) NOT NULL,
                
                total_amount DECIMAL(8,2) NOT NULL,
                
                is_real_purchase BOOLEAN DEFAULT false,
                order_status VARCHAR(30) DEFAULT 'demo',
                
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                internal_notes TEXT
            )
        """)
        
        # ============================================
        # 6. ORDER ITEMS (What's in each order)
        # ============================================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                order_item_id SERIAL PRIMARY KEY,
                order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
                item_id INT REFERENCES inventory(item_id),
                
                item_name VARCHAR(200) NOT NULL,
                item_price DECIMAL(8,2) NOT NULL,
                quantity INT DEFAULT 1,
                
                item_image_url VARCHAR(300)
            )
        """)
        
        # ============================================
        # 7. PARTNERSHIP INQUIRIES
        # ============================================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS partnership_inquiries (
                inquiry_id SERIAL PRIMARY KEY,
                
                business_name VARCHAR(200) NOT NULL,
                contact_name VARCHAR(100) NOT NULL,
                contact_email VARCHAR(100) NOT NULL,
                contact_phone VARCHAR(20),
                
                business_type VARCHAR(100),
                market_locations TEXT,
                
                interest_type VARCHAR(50),
                estimated_quantity VARCHAR(50),
                additional_info TEXT,
                
                status VARCHAR(30) DEFAULT 'new',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                internal_notes TEXT
            )
        """)
        
        # ============================================
        # CREATE INDEXES for faster queries
        # ============================================
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_orders_date 
            ON orders(order_date DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_orders_real_purchase 
            ON orders(is_real_purchase)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_inventory_available 
            ON inventory(is_available)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_partnership_date 
            ON partnership_inquiries(submitted_at DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_partnership_status 
            ON partnership_inquiries(status)
        """)
        
        conn.commit()
        print("✅ All portfolio tables created successfully!")
        
        # Populate inventory
        populate_inventory(conn)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")


def populate_inventory(conn):
    """Populate inventory with your current art/jewelry items"""
    cursor = conn.cursor()
    
    # Check if inventory already has items
    cursor.execute("SELECT COUNT(*) FROM inventory")
    if cursor.fetchone()[0] > 0:
        print("ℹ️ Inventory already populated")
        return
    
    items = [
        # Art Prints (unlimited quantity)
        ("INTO THE WIRE", "art_print", "Inspired by Serial Experiments Lain", "Color Pencil Drawing", 10.00, "/static/images/art/SketchLain.JPEG", 999),
        ("TIME'S UP", "art_print", "Inspired by Time Is Up by Poppy", "Color Pencil Drawing", 10.00, "/static/images/art/SketchCyborg.JPEG", 999),
        ("SAM THE SANDOWN CLOWN", "art_print", "This 7ft tall, wooden robot-alien-clown was spotted by two children in the 70's in Sandown, Isle of Wight after they heard intense wailing. Even though he was holding a mic, Sam communicated with written notes and telepathy and called itself 'All Colors Sam'", "Color Pencil Drawing", 10.00, "/static/images/art/Sam.jpg", 999),
        
        # Jewelry (one-of-a-kind, quantity = 1)
        ("BRACELET-51", "jewelry", "An out-of-this-world set of UAP-inspired bracelets. The Alien Charm was handmade by me using foam clay and fingernail polish", "Glass Beads, Alien Charm, D20 Dice, Lightning Charm, Foam Clay, Fingernail Polish", 35.00, "/static/images/art/Bracelet51.png", 1),
        ("BUTTERFLY EFFECT", "jewelry", "Make an unpredictable difference in someone's life and buy them this bracelet set", "Glass Beads, D20 Dice, Gold Chain, Rose Quarts Beads, Kuromi Charm, Butterfly Charm, Candy Charm", 35.00, "/static/images/art/ButterflyEffect.png", 1),
        ("CHAOTIC NEUTRAL", "jewelry", "The chaotic classical counterpart", "Glass Beads, D20 Dice, Lollipop Charm", 30.00, "/static/images/art/ChaoticNeutral.png", 1),
        ("CHARM QUARK", "jewelry", "It's charming. It's quarky. It could be yours!", "Glass Beads, Lollipop Charm", 25.00, "/static/images/art/CharmQuark.png", 1),
        ("DECOHERENCE GARDEN", "jewelry", "Fairy-core inspired. The rose was handmade by me using foam clay and fingernail polish", "Glass Beads, Foam Clay, Butterfly Charm, Heart Charm, Purple Chain", 35.00, "/static/images/art/DecoherenceGarden.png", 1),
        ("LAWFUL CUTE", "jewelry", "Be your girl's knight in shining armor and get her this cute set", "Glass Beads, D20 Dice, Gummy Bear Charm, Lollipop Charm, Butterfly Charm, Silver Chain, Popcicle Charm", 35.00, "/static/images/art/static/LawfulCute.png", 1),
        ("QUANTUM COUTURE", "jewelry", "Bring some entropy into your style", "Glass Beads, D20 Dice, Gummy Bear Charm", 30.00, "/static/images/art/ChaoticCouture.png", 1),
        ("QUANTUM ROYALE", "jewelry", "The Quantum Quarter Pounder (does not actually weigh a quarter pound)", "Glass Beads, Gold Moon Charm, Lightning Charm, Gold Chain", 35.00, "/static/images/art/QuantumRoyale.png", 1),
        ("SCHRODINGER'S TRINKETS", "jewelry", "The only way to find out if this set exists is the purchase it. The rose was handmade by me using foam clay and fingernail polish", "Glass Beads, Rose Charm, Hello Kitty Charm, Lightning Charm, Black Chain", 35.00, "/static/images/art/ShrodingersTrinkets.png", 1),
        ("SINGULARITY", "jewelry", "Infinite style", "Glass Beads, D20 Dice, Lightning Charm, Gold Chain", 30.00, "/static/images/art/Singularity.png", 1),
        ("SUGAR SUPERPOSITION", "jewelry", "When you have a sweet tooth but you're not hungry", "Glass Beads, Lollipop Charm", 25.00, "/static/images/art/SugarSuperposition.png", 1),
        ("UNCERTAINTY POP", "jewelry", "You can rock it better than Heisenberg", "Glass Beads, Lollipop Charm, Candy Charms, Purple Chain", 30.00, "/static/images/art/UncertaintyPop.png", 1),
    ]
    
    for item_name, item_type, description, materials, price, image_url, quantity in items:
        cursor.execute("""
            INSERT INTO inventory (item_name, item_type, description, materials, price, image_url, quantity_available)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (item_name) DO NOTHING
        """, (item_name, item_type, description, materials, price, image_url, quantity))
    
    conn.commit()
    print("✅ Inventory populated with art and jewelry items!")


if __name__ == "__main__":
    create_portfolio_database()