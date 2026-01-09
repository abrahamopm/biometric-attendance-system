# 1. Build the Docker Image
echo "--- Building Docker Image ---"
# We tell Docker the file is in ./backend/Dockerfile and to look inside ./backend for the code
docker build -t biometric-backend -f ./backend/Dockerfile ./backend

# 2. Stop and remove old container if it exists
echo "--- Cleaning up old containers ---"
docker stop biometric-container 2>$null
docker rm biometric-container 2>$null

# 3. Run the container
echo "--- Starting Backend Container ---"
docker run -d --name biometric-container -p 8000:8000 biometric-backend

# 4. Start Ngrok
echo "--- Starting Ngrok tunnel ---"
ngrok http 8000