# add_partnership_table.py
"""
Run this ONCE to add the partnership_inquiries table to your existing database
"""

import psycopg2
from dotenv import load_dotenv
import os

def add_partnership_table():
    """Add partnership inquiries table"""
    load_dotenv()
    password = os.getenv("POSTGRES_PASSWORD")
    
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="portfolio_site",
            user="postgres",
            password=password
        )
        cursor = conn.cursor()
        
        print("🤝 Creating partnership_inquiries table...")
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS partnership_inquiries (
                inquiry_id SERIAL PRIMARY KEY,
                
                -- Business Info
                business_name VARCHAR(200) NOT NULL,
                contact_name VARCHAR(100) NOT NULL,
                contact_email VARCHAR(100) NOT NULL,
                contact_phone VARCHAR(20),
                
                -- Business Details
                business_type VARCHAR(100),  -- 'Market Vendor', 'Retail Shop', 'Online Store', etc.
                market_locations TEXT,  -- Where they sell (Atlanta markets, etc.)
                
                -- Partnership Details
                interest_type VARCHAR(50),  -- 'Wholesale', 'Consignment', 'Both'
                estimated_quantity VARCHAR(50),  -- '10-25 pieces', '25-50 pieces', '50+ pieces'
                additional_info TEXT,
                
                -- Status & Timestamps
                status VARCHAR(30) DEFAULT 'new',  -- new, contacted, negotiating, partner, declined
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Admin Notes
                internal_notes TEXT
            )
        """)
        
        # Create index for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_partnership_date 
            ON partnership_inquiries(submitted_at DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_partnership_status 
            ON partnership_inquiries(status)
        """)
        
        conn.commit()
        print("✅ Partnership table created successfully!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating partnership table: {e}")


if __name__ == "__main__":
    add_partnership_table()