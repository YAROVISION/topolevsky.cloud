#!/bin/bash
# Script to establish an SSH tunnel for local database access
source .env
sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -p 65002 -N -L 127.0.0.1:3307:127.0.0.1:3306 "$SSH_USER@$SSH_HOST"
