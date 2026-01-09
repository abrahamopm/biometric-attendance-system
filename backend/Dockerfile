FROM python:3.10-slim

# Install system dependencies for dlib/OpenCV math processing
RUN apt update && apt install -y \
    build-essential cmake libgtk-3-dev libboost-all-dev \
    libopenblas-dev liblapack-dev python3-dev git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]