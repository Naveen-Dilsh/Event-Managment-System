#!/bin/bash
# ═══════════════════════════════════════════════════════
# Script: create-ecr-repos.sh
# Purpose: Create one AWS ECR repository per microservice
# Run this ONCE before pushing any images.
# ═══════════════════════════════════════════════════════

REGION="ap-south-1"  # Change this if using a different AWS region

SERVICES=(
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
  "event-management-frontend"
  # "notification-service"
  # "review-service"
  # "analytics-service"
)

echo "Creating ECR repositories in region: $REGION"
echo "────────────────────────────────────────────"

for SERVICE in "${SERVICES[@]}"; do
  echo "📦 Creating: $SERVICE"
  aws ecr create-repository --repository-name "$SERVICE" --region "$REGION" 2>/dev/null \
    && echo "   ✅ Created" \
    || echo "   ⚠️  Already exists (skip)"
done

echo ""
echo "✅ Done! All ECR repositories are ready."
echo ""
echo "Next step: Run ./push-to-ecr.sh to build and push all images."
