#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Script: push-to-ecr.sh
# Purpose: Build all Docker images and push them to Amazon ECR
# Run this from: "Event Managment Backend" folder
# ═══════════════════════════════════════════════════════════════════

REGION="ap-south-1"  # Change this if using a different AWS region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_BASE="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ECR_BASE"

if [ $? -ne 0 ]; then
  echo "❌ ECR login failed! Check your AWS credentials."
  exit 1
fi

echo ""
echo "🏗️  Building and pushing backend services..."
echo "════════════════════════════════════════════"

BACKEND_SERVICES=(
  "event-service"
  "ticketing-service"
  "booking-service"
  "payment-service"
  "attendee-service"
  "venue-service"
  "vendor-service"
  "announcer-service"
  "loyalty-service"
  "sponsorship-service"
  "user-service"
  # "notification-service"
  # "review-service"
  # "analytics-service"
)

for SERVICE in "${BACKEND_SERVICES[@]}"; do
  if [ -d "./$SERVICE" ]; then
    echo ""
    echo "📦 Building: $SERVICE"
    # Build with linux/amd64 for AWS compatibility (important for M1/M2/M3 Macs)
    docker buildx build --platform linux/amd64 -t "$SERVICE:latest" "./$SERVICE"

    echo "   ⬆️  Pushing to ECR..."
    docker tag "$SERVICE:latest" "$ECR_BASE/$SERVICE:latest"
    docker push "$ECR_BASE/$SERVICE:latest"
    echo "   ✅ $SERVICE pushed!"
  else
    echo "   ⚠️  Directory ./$SERVICE not found — skipping"
  fi
done

echo ""
echo "🏗️  Building and pushing frontend..."
echo "════════════════════════════════════"
FRONTEND_DIR="../event-management-frontend"
if [ -d "$FRONTEND_DIR" ]; then
  docker buildx build --platform linux/amd64 -t "event-management-frontend:latest" "$FRONTEND_DIR"
  docker tag "event-management-frontend:latest" "$ECR_BASE/event-management-frontend:latest"
  docker push "$ECR_BASE/event-management-frontend:latest"
  echo "   ✅ Frontend pushed!"
else
  echo "   ⚠️  Frontend directory not found"
fi

echo ""
echo "🎉 All images pushed to ECR!"
echo ""
echo "Your ECR base URL: $ECR_BASE"
echo "Use this URL when creating ECS Task Definitions."
