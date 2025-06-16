from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# SQLite Database Setup
DATABASE = 'notes.db'

def init_db():
    # Only create database if it doesn't exist
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT
            )
        ''')
        conn.commit()
        conn.close()
        print("Fresh database created with notes table")
    else:
        print("Using existing database")

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/notes', methods=['GET'])
def get_notes():
    date = request.args.get('date')
    if not date:
        return jsonify({"error": "Date parameter is required"}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM notes 
        WHERE date = ?
        ORDER BY created_at DESC
    ''', (date,))
    notes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(notes)

@app.route('/notes', methods=['POST'])
def add_note():
    data = request.json
    required_fields = ['title', 'description', 'date']
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing required fields: {required_fields}"}), 400
    
    note_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO notes 
            (id, title, description, date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            note_id,
            data['title'],
            data['description'],
            data['date'],
            created_at,
            None
        ))
        conn.commit()
        
        # Return the newly created note
        cursor.execute('SELECT * FROM notes WHERE id = ?', (note_id,))
        new_note = dict(cursor.fetchone())
        return jsonify(new_note), 201
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if note exists
        cursor.execute('SELECT id FROM notes WHERE id = ?', (note_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Note not found"}), 404
        
        # Prepare update
        updates = []
        params = []
        for field in ['title', 'description', 'date']:
            if field in data:
                updates.append(f"{field} = ?")
                params.append(data[field])
        
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400
        
        # Add updated_at
        updates.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        
        # Execute update
        params.append(note_id)
        cursor.execute(f'''
            UPDATE notes 
            SET {', '.join(updates)}
            WHERE id = ?
        ''', params)
        conn.commit()
        
        # Return updated note
        cursor.execute('SELECT * FROM notes WHERE id = ?', (note_id,))
        updated_note = dict(cursor.fetchone())
        return jsonify(updated_note)
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id FROM notes WHERE id = ?', (note_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Note not found"}), 404
        
        cursor.execute('DELETE FROM notes WHERE id = ?', (note_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Note deleted"})
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()  # This will only run once when the DB doesn't exist
    app.run(host='0.0.0.0', port=5000, debug=True)