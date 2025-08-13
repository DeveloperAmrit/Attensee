import io
from flask import Flask, request, jsonify, Response
import face_recognition
import requests
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import cv2
from werkzeug.utils import secure_filename
from datetime import datetime
import pytz
import re
import threading
import json
from flask_cors import CORS
from imutils import face_utils
import dlib
import time


app = Flask(__name__)
CORS(app)

    

load_dotenv()
username = os.getenv("DB_USERNAME")
password = os.getenv("PASSWORD")
india_tz = pytz.timezone('Asia/Kolkata')


client = MongoClient(f"mongodb+srv://{username}:{password}@cluster0.myzmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['test']  # <- your DB name
students_col = db['students']  # <- your collection


@app.route('/register_face', methods=['POST'])
def register_face():
    data = request.json
    rollNumber = data['rollNumber']
    image_url = data['image_url']

    # Handle Google Drive links
    if "drive.google.com" in image_url:
        image_url = convert_drive_url_to_direct(image_url)
        if not image_url:
            return jsonify({"error": "Invalid Google Drive URL"}), 400

    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        return jsonify({"error": "Failed to fetch image", "details": str(e)}), 400

    try:
        img = face_recognition.load_image_file(io.BytesIO(response.content))
        encodings = face_recognition.face_encodings(img)
    except Exception as e:
        return jsonify({"error": "Invalid image data", "details": str(e)}), 400

    if not encodings:
        return jsonify({"error": "No face found"}), 400

    face_encoding = encodings[0].tolist()

    # Store in DB
    students_col.update_one(
        {"rollNumber": rollNumber},
        {"$set": {
            "encoding": face_encoding,
            "image_url": image_url
        }},
        upsert=True
    )

    return jsonify({"message": "Student face registered successfully"}), 200




UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Add these global variables
progress_trackers = {}
processing_stages = {
    'frame_processing': {'total': 100, 'current': 0},
    'face_matching': {'total': 0, 'current': 0},
    'database': {'total': 1, 'current': 0},
    'attendance': {'total': 1, 'current': 0}
}

@app.route('/upload_video', methods=['POST'])
def upload_video():
    print("Video uploaded")
    # Get video and metadata from request
    if 'video' not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video_file = request.files['video']
    uploadId = request.form.get('uploadId')
    subsectionId = request.form.get('subsectionId')
    username = request.form.get('username')

    if not uploadId or not subsectionId:
        return jsonify({"error": "uploadId and subsectionId are required"}), 400

    # Save video temporarily
    filename = secure_filename(video_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    video_file.save(filepath)

    print("Data saved")



    
    # Start processing in background thread
    threading.Thread(target=process_video_background, args=(
        filepath, 
        uploadId, 
        subsectionId, 
        username
    )).start()

    return jsonify({"message": "Upload successful", "uploadId": uploadId})


detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(r"D:\work_\websites_\Attensee\flask_backend\shape_predictor_68_face_landmarks.dat")  # Download required

def eye_aspect_ratio(eye):
    A = np.linalg.norm(eye[1] - eye[5])
    B = np.linalg.norm(eye[2] - eye[4])
    C = np.linalg.norm(eye[0] - eye[3])
    return (A + B) / (2.0 * C)

def is_engaged(shape):
    # Use left and right eye for EAR
    leftEye = shape[42:48]
    rightEye = shape[36:42]
    ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0

    # EAR threshold: if < 0.2, likely drowsy or not engaged
    return ear > 0.2

def process_video_background(filepath, uploadId, subsectionId, username):
    engagement_map = {}
    try:
        # Initialize progress tracking
        progress_trackers[uploadId] = {
            'stages': processing_stages.copy(),
            'messages': []
        }
        
        # Load known encodings
        students = list(students_col.find({
            "encoding": {"$exists": True},
            "assignedSections": subsectionId
        }))
        known_encodings = [np.array(s['encoding']) for s in students]
        known_rolls = [s['rollNumber'] for s in students]
        
        # Process video
        cap = cv2.VideoCapture(filepath)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        progress_trackers[uploadId]['stages']['frame_processing']['total'] = frame_count
        
        matched_rolls = set()
        current_frame = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            current_frame += 1
            
            # Update frame progress
            progress_trackers[uploadId]['stages']['frame_processing']['current'] = current_frame
            progress_trackers[uploadId]['messages'].append({
                "type": "info", 
                "text": f"Processing frame {current_frame}/{frame_count}",
                "stage": "processing"
            })
            
            print("Processing frame ", current_frame)
            if current_frame % 10 != 0:  
                continue

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            for (encoding, (top, right, bottom, left)) in zip(encodings, face_locations):
                matches = face_recognition.compare_faces(known_encodings, encoding, tolerance=0.5)
                if True in matches:
                    idx = matches.index(True)
                    roll = known_rolls[idx]

                    # Detect facial landmarks
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    rect = dlib.rectangle(left, top, right, bottom)
                    shape = predictor(gray, rect)
                    shape_np = face_utils.shape_to_np(shape)

                    # Check engagement
                    engaged = is_engaged(shape_np)

                    # Store alertState
                    if roll not in engagement_map:
                        engagement_map[roll] = {"active": 0, "passive": 0}
                    engagement_map[roll]["active" if engaged else "passive"] += 1

                    matched_rolls.add(roll)



        print("Writing in database")
        # Database update
        present_students = []
        for roll in matched_rolls:
            data = engagement_map.get(roll, {"active": 0, "passive": 0})
            alert_state = "active" if data["active"] >= data["passive"] else "passive"
            present_students.append({
                "rollNumber": roll,
                "alertState": alert_state
            })
        upload_doc = {
            "uploadId": uploadId,
            "subsectionId": subsectionId,
            "uploadedBy": username or "",
            "presentStudents": present_students,
            "dateTime": datetime.now(tz=india_tz)
        }
        db['uploads'].insert_one(upload_doc)
        progress_trackers[uploadId]['messages'].append({
            "type": "success", 
            "text": "Database updated",
            "stage": "database"
        })
        
        # Final completion
        progress_trackers[uploadId]['messages'].append({
            "type": "completed",
            "text": f"{len(present_students)} students present out of {len(students)}",
            "stage": "completed"
        })

        print("Completed!")
        
    except Exception as e:
        progress_trackers[uploadId]['messages'].append({
            "type": "error", 
            "text": str(e)
        })
    finally:
        cap.release()
        os.remove(filepath)

    

@app.route('/progress/<uploadId>')
def progress(uploadId):
    # In /progress route:
    def generate():
        while True:
            if uploadId in progress_trackers:
                tracker = progress_trackers[uploadId]
                while tracker['messages']:
                    msg = tracker['messages'].pop(0)
                    yield f"data: {json.dumps(msg)}\n\n"
                    time.sleep(0.05)
                
                # Add progress percentage calculation
                total_frames = tracker['stages']['frame_processing']['total']
                current_frame = tracker['stages']['frame_processing']['current']
                if total_frames > 0:
                    percent = int((current_frame / total_frames) * 100)
                    yield f"data: {json.dumps({'type': 'progress', 'percent': percent})}\n\n"
                
                # Completion check
                if any(m.get('type') == 'completed' for m in tracker['messages']):
                    del progress_trackers[uploadId]
                    break

    return Response(generate(), mimetype='text/event-stream')


def convert_drive_url_to_direct(url):
    match = re.search(r'/d/([a-zA-Z0-9_-]{25,})', url)
    if match:
        file_id = match.group(1)
        return f'https://drive.google.com/uc?export=download&id={file_id}'
    return None


if __name__ == '__main__':
    print("🚀 Server is running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
