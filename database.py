"""
Database management layer using SQLite with full-text search and JSON attribute support.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from seed_data import BOOKS_DATA, SUBJECT_TAXONOMY, LEARNING_PATHS

DB_PATH = os.path.join(os.path.dirname(__file__), "library.db")

class LibraryDatabase:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Books table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                year INTEGER,
                isbn TEXT,
                ddc_code TEXT,
                loc_code TEXT,
                category TEXT,
                subcategories TEXT,
                tags TEXT,
                synopsis TEXT,
                key_excerpt TEXT,
                floor INTEGER,
                section TEXT,
                aisle TEXT,
                shelf_unit INTEGER,
                tier INTEGER,
                shelf_label TEXT,
                pos_x REAL,
                pos_y REAL,
                metrics TEXT,
                prerequisites TEXT,
                reading_paths TEXT,
                copies_total INTEGER,
                copies_available INTEGER,
                rating REAL,
                cover_color TEXT
            )
            """)

            # Reservations table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'Confirmed',
                hold_shelf TEXT,
                FOREIGN KEY (book_id) REFERENCES books (id)
            )
            """)

            conn.commit()

            # Seed if empty
            cursor.execute("SELECT COUNT(*) FROM books")
            count = cursor.fetchone()[0]
            if count == 0:
                self._seed_books(cursor)
                conn.commit()

    def _seed_books(self, cursor):
        for book in BOOKS_DATA:
            loc = book.get("location", {})
            cursor.execute("""
            INSERT OR REPLACE INTO books (
                id, title, author, year, isbn, ddc_code, loc_code, category,
                subcategories, tags, synopsis, key_excerpt,
                floor, section, aisle, shelf_unit, tier, shelf_label, pos_x, pos_y,
                metrics, prerequisites, reading_paths, copies_total, copies_available,
                rating, cover_color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                book["id"],
                book["title"],
                book["author"],
                book["year"],
                book["isbn"],
                book["ddc_code"],
                book["loc_code"],
                book["category"],
                json.dumps(book.get("subcategories", [])),
                json.dumps(book.get("tags", [])),
                book["synopsis"],
                book["key_excerpt"],
                loc.get("floor", 1),
                loc.get("section", ""),
                loc.get("aisle", ""),
                loc.get("shelf_unit", 1),
                loc.get("tier", 1),
                loc.get("shelf_label", ""),
                loc.get("x", 0.0),
                loc.get("y", 0.0),
                json.dumps(book.get("metrics", {})),
                json.dumps(book.get("prerequisites", [])),
                json.dumps(book.get("reading_paths", [])),
                book.get("copies_total", 1),
                book.get("copies_available", 1),
                book.get("rating", 4.5),
                book.get("cover_color", "#1e3a8a")
            ))

    def _row_to_dict(self, row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "title": row["title"],
            "author": row["author"],
            "year": row["year"],
            "isbn": row["isbn"],
            "ddc_code": row["ddc_code"],
            "loc_code": row["loc_code"],
            "category": row["category"],
            "subcategories": json.loads(row["subcategories"]) if row["subcategories"] else [],
            "tags": json.loads(row["tags"]) if row["tags"] else [],
            "synopsis": row["synopsis"],
            "key_excerpt": row["key_excerpt"],
            "location": {
                "floor": row["floor"],
                "section": row["section"],
                "aisle": row["aisle"],
                "shelf_unit": row["shelf_unit"],
                "tier": row["tier"],
                "shelf_label": row["shelf_label"],
                "x": row["pos_x"],
                "y": row["pos_y"]
            },
            "metrics": json.loads(row["metrics"]) if row["metrics"] else {},
            "prerequisites": json.loads(row["prerequisites"]) if row["prerequisites"] else [],
            "reading_paths": json.loads(row["reading_paths"]) if row["reading_paths"] else [],
            "copies_total": row["copies_total"],
            "copies_available": row["copies_available"],
            "rating": row["rating"],
            "cover_color": row["cover_color"]
        }

    def get_all_books(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM books ORDER BY title ASC")
            rows = cursor.fetchall()
            return [self._row_to_dict(r) for r in rows]

    def get_book_by_id(self, book_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
            row = cursor.fetchone()
            return self._row_to_dict(row) if row else None

    def search_books(self, query: str = "", category: str = "", floor: Optional[int] = None) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            sql = "SELECT * FROM books WHERE 1=1"
            params = []

            if query:
                pattern = f"%{query}%"
                sql += """ AND (
                    title LIKE ? OR 
                    author LIKE ? OR 
                    synopsis LIKE ? OR 
                    ddc_code LIKE ? OR 
                    tags LIKE ? OR 
                    subcategories LIKE ?
                )"""
                params.extend([pattern, pattern, pattern, pattern, pattern, pattern])

            if category and category != "All":
                sql += " AND category = ?"
                params.append(category)

            if floor is not None and floor in [1, 2]:
                sql += " AND floor = ?"
                params.append(floor)

            sql += " ORDER BY rating DESC, title ASC"
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            return [self._row_to_dict(r) for r in rows]

    def reserve_book(self, book_id: str, user_name: str = "Library Patron") -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT copies_available, title, floor, aisle, shelf_label FROM books WHERE id = ?", (book_id,))
            row = cursor.fetchone()
            if not row:
                return {"success": False, "error": "Book not found"}

            if row["copies_available"] <= 0:
                return {"success": False, "error": f"'{row['title']}' is currently fully checked out. Placed on waitlist."}

            # Decrement available copies
            new_copies = row["copies_available"] - 1
            cursor.execute("UPDATE books SET copies_available = ? WHERE id = ?", (new_copies, book_id))
            
            hold_shelf = f"Floor {row['floor']} Hold Locker #{10 + (hash(book_id) % 20)}"
            cursor.execute("""
            INSERT INTO reservations (book_id, user_name, hold_shelf)
            VALUES (?, ?, ?)
            """, (book_id, user_name, hold_shelf))
            conn.commit()

            return {
                "success": True,
                "book_id": book_id,
                "title": row["title"],
                "copies_remaining": new_copies,
                "hold_shelf": hold_shelf,
                "pickup_deadline": "48 Hours from reservation timestamp",
                "message": f"Successfully reserved '{row['title']}'. Held at {hold_shelf}."
            }

    def get_categories(self) -> List[str]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT category FROM books ORDER BY category ASC")
            return [r[0] for r in cursor.fetchall()]
