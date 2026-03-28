echo "Cleaning up existing tunnels (3307 & 7687)..."
lsof -ti:3307,7687 | xargs kill -9 2>/dev/null || true
pkill -9 -f "ssh.*3307" || true
pkill -9 -f "ssh.*7687" || true
sleep 1

echo "Establishing SSH tunnels (MySQL & Neo4j) via VPS..."

# MySQL Tunnel (via VPS for whitelisted IPv4 access)
# Linking Local 3307 -> VPS (31.97.73.249) -> Hostinger DB (195.35.59.14:3306)
sshpass -p "Svoboda13Muslic/" ssh -o StrictHostKeyChecking=no -N -L 127.0.0.1:3307:195.35.59.14:3306 root@31.97.73.249 &
PID1=$!

# Neo4j Tunnel (via VPS SSH)
# Linking Local 7687 -> VPS (31.97.73.249) -> Neo4j Container (172.21.0.2:7687)
sshpass -p "Svoboda13Muslic/" ssh -o StrictHostKeyChecking=no -N -L 127.0.0.1:7687:172.21.0.2:7687 root@31.97.73.249 &
PID2=$!

# Kill both tunnels on script exit
trap "kill $PID1 $PID2 2>/dev/null" EXIT

# Give tunnels a moment to initialize
echo "Tunnels initializing via VPS (31.97.73.249)..."
sleep 5

echo "Checking connectivity..."
nc -zv 127.0.0.1 3307 && echo "MySQL: CONNECTED" || echo "MySQL: FAILED"
nc -zv 127.0.0.1 7687 && echo "Neo4j: CONNECTED" || echo "Neo4j: FAILED"

echo "Ready for Next.js. Press CTRL+C to stop."
wait
