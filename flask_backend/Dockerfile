# Use official Python base image
FROM python:3.10-slim

# Install system dependencies for dlib, opencv, etc.
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Download the .dat file
RUN curl -L -o shape_predictor_68_face_landmarks.dat.bz2 https://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2 \
    && bzip2 -d shape_predictor_68_face_landmarks.dat.bz2

# Expose port (Render expects this)
EXPOSE 10000

# Run the app
CMD ["python", "main.py"]
