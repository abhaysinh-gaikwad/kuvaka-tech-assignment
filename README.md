Gemini Backend Clone
A Node.js-based backend for a chat application with user authentication, chatroom management, and subscription handling via Stripe, built as part of the Kuvaka Tech assignment. The application is containerized using Docker, with PostgreSQL for data storage, Redis for caching, and Stripe CLI for webhook testing. It includes input validation using Yup and standardized API responses.
Table of Contents

Features
Tech Stack
Prerequisites
Project Structure
Setup Instructions
Local Development
EC2 Deployment


Environment Variables
Running the Application
API Endpoints
Testing with Postman
Input Validation
Response Format
Troubleshooting
Deployment Notes
Contributing
License

Features

User Authentication: Signup, OTP-based login, password reset, and user profile retrieval.
Chatroom Management: Create, list, and retrieve chatrooms; send messages with Gemini API integration.
Subscription System: Upgrade to Pro tier via Stripe Checkout; webhook handling for subscription updates.
Rate Limiting: Limits Basic tier users to 50 messages per day.
Input Validation: Ensures valid inputs (e.g., 10-digit mobile, 6-digit OTP) using Yup.
Standardized Responses: All API responses follow { success, data, message } format.
Containerized Setup: Runs in Docker with PostgreSQL, Redis, and Stripe CLI.
Caching: Uses Redis to cache chatroom lists for 10 minutes.
Scalable Deployment: Deployed on AWS EC2; ready for platforms like Render.

Tech Stack

Backend: Node.js, Express.js
Database: PostgreSQL 15
Cache: Redis 7
Payments: Stripe API (Checkout and Webhooks)
Validation: Yup
Containerization: Docker, Docker Compose
Authentication: JWT
Queue: Bull (for Gemini API integration)
Deployment: AWS EC2 (or Render)

Prerequisites

Docker: Install Docker and Docker Compose on your machine or EC2 instance.
Node.js: For local dependency installation (optional if using Docker).
Git: To clone the repository.
AWS EC2: For deployment (t2.micro or higher recommended).
Postman: For API testing (collection provided).
Stripe Account: For API keys and webhook testing.
Gemini API Key: For chatroom message processing.

Project Structure
kuvaka-tech-assignment/
├── Dockerfile              # Docker configuration for Node.js app
├── docker-compose.yml      # Docker Compose for app, postgres, redis, stripe-cli
├── .env                    # Environment variables (not committed)
├── .gitignore              # Git ignore file
├── package.json            # Node.js dependencies
├── package-lock.json       # Dependency lock file
├── src/
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entry point
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection
│   │   ├── redis.js        # Redis connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication endpoints
│   │   ├── chatroomController.js # Chatroom endpoints
│   │   ├── stripeController.js # Stripe subscription endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT authentication
│   │   ├── rateLimitMiddleware.js # Rate limiting for Basic tier
│   │   ├── validationMiddleware.js # Yup validation
│   ├── queues/
│   │   ├── geminiQueue.js     # Bull queue for Gemini API
│   ├── routes/
│   │   ├── authRoutes.js      # Auth routes
│   │   ├── chatroomRoutes.js  # Chatroom routes
│   │   ├── stripeRoutes.js    # Stripe routes
│   ├── utils/
│   │   ├── otpGenerator.js    # OTP generation
│   ├── validators/
│   │   ├── authValidators.js  # Yup schemas for auth
│   │   ├── chatroomValidators.js # Yup schemas for chatrooms

Setup Instructions
Local Development

Clone the Repository:
git clone --branch sandbox --single-branch https://github.com/abhaysinh-gaikwad/kuvaka-tech-assignment.git
cd kuvaka-tech-assignment


Install Dependencies (if modifying code locally):
npm install


Create .env File:
nano .env

Add the following (replace with your values):
DB_USER=postgres
DB_HOST=postgres
DB_NAME=gemini_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your_random_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_test_51your_stripe_secret_key
STRIPE_PRO_PRICE_ID=price_1your_stripe_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:3000
PORT=3000


Obtain STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_WEBHOOK_SECRET from Stripe Dashboard.
Generate JWT_SECRET (e.g., openssl rand -base64 32).
Get GEMINI_API_KEY from Google Cloud.


Run Docker Containers:
docker-compose up -d --build


Builds and starts app, postgres, redis, and stripe-cli containers.
Exposes app on http://localhost:3000.


Verify Containers:
docker ps

Expected:
CONTAINER ID   IMAGE                        COMMAND                  STATUS          PORTS
<id>           kuvaka-tech-assignment-app   "docker-entrypoint.s…"   Up              0.0.0.0:3000->3000/tcp
<id>           stripe/stripe-cli:latest     "/bin/stripe listen …"   Up
<id>           postgres:15                  "docker-entrypoint.s…"   Up              0.0.0.0:5432->5432/tcp
<id>           redis:7                      "docker-entrypoint.s…"   Up              0.0.0.0:6379->6379/tcp


Check Logs:
docker-compose logs app
docker-compose logs stripe-cli


Look for Server running on port 3000 and Ready! Your webhook signing secret is whsec_....



EC2 Deployment

Launch EC2 Instance:

Use a t2.micro instance with Amazon Linux 2.
Allow ports 3000 (app), 5432 (PostgreSQL), 6379 (Redis), and 22 (SSH) in the security group.


Install Docker and Docker Compose:
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose


Clone Repository:
git clone --branch sandbox --single-branch https://github.com/abhaysinh-gaikwad/kuvaka-tech-assignment.git
cd kuvaka-tech-assignment


Create .env File:
nano .env

Add the same .env content as in local setup, but update FRONTEND_URL to your EC2 public IP or domain (e.g., http://<ec2-public-ip>:3000).

Run Docker Containers:
docker-compose up -d --build


Verify Access:

Access the app at http://<ec2-public-ip>:3000.
Check logs: docker-compose logs app and docker-compose logs stripe-cli.



Environment Variables
The .env file must include:

DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT: PostgreSQL connection details.
REDIS_HOST, REDIS_PORT: Redis connection details.
JWT_SECRET: Secret for JWT signing.
GEMINI_API_KEY: API key for Google Gemini API.
STRIPE_SECRET_KEY: Stripe API key (test mode).
STRIPE_PRO_PRICE_ID: Stripe price ID for Pro subscription.
STRIPE_WEBHOOK_SECRET: Webhook secret for Stripe CLI.
FRONTEND_URL: URL for Stripe Checkout redirects.
PORT: App port (default 3000).

Note: Keep .env in .gitignore to avoid committing sensitive data.
Running the Application

Start Containers:
docker-compose up -d --build


Stop Containers:
docker-compose down


Restart Specific Service (e.g., app):
docker-compose up -d app


View Logs:
docker-compose logs app



API Endpoints
All endpoints follow the standardized response format (see Response Format).
Authentication

POST /auth/signup
Body: { "mobile": "1234567890", "name": "John Doe" }
Response: { success: true, data: {}, message: "User registered successfully" }


POST /auth/send-otp
Body: { "mobile": "1234567890" }
Response: { success: true, data: { otp: "123456" }, message: "OTP sent successfully" }


POST /auth/verify-otp
Body: { "mobile": "1234567890", "otp": "123456" }
Response: { success: true, data: { token: "..." }, message: "OTP verified successfully" }


POST /auth/forgot-password
Body: { "mobile": "1234567890" }
Response: { success: true, data: { otp: "123456" }, message: "OTP sent for password reset" }


POST /auth/change-password
Headers: Authorization: Bearer <token>
Body: { "password": "newpassword123" }
Response: { success: true, data: {}, message: "Password changed successfully" }


GET /auth/me
Headers: Authorization: Bearer <token>
Response: { success: true, data: { id, mobile, name, subscription_tier }, message: "User details retrieved successfully" }



Chatroom

POST /chatroom
Headers: Authorization: Bearer <token>
Body: { "name": "My Chatroom" }
Response: { success: true, data: { id, name, user_id }, message: "Chatroom created successfully" }


GET /chatroom
Headers: Authorization: Bearer <token>
Response: { success: true, data: [{ id, name, user_id }, ...], message: "Chatrooms retrieved successfully" }


GET /chatroom/:id
Headers: Authorization: Bearer <token>
Response: { success: true, data: { id, name, user_id }, message: "Chatroom retrieved successfully" }


POST /chatroom/:id/message
Headers: Authorization: Bearer <token>
Body: { "message": "Hello, Gemini!" }
Response: { success: true, data: {}, message: "Message sent, processing response" }



Subscription

POST /subscribe/pro
Headers: Authorization: Bearer <token>
Body: {}
Response: { success: true, data: { url: "https://checkout.stripe.com/..." }, message: "Checkout session created successfully" }


POST /webhook/stripe
Headers: Content-Type: application/json
Body: Stripe webhook payload
Response: { success: true, data: { received: true }, message: "Webhook processed successfully" }


GET /subscription/status
Headers: Authorization: Bearer <token>
Response: { success: true, data: { subscriptionTier: "pro" }, message: "Subscription status retrieved successfully" }



Testing with Postman

Import Collection:

Download GeminiBackendClone.postman_collection.json from Postman link.
Import into Postman.


Set Environment Variables:

baseUrl: http://<ec2-public-ip>:3000 (or http://localhost:3000 locally).
token: Set after calling /auth/verify-otp.


Test Endpoints:

Signup:
POST {{baseUrl}}/auth/signup
Body: { "mobile": "1234567890", "name": "John Doe" }
Expected: 201 { success: true, data: {}, message: "User registered successfully" }


Send OTP:
POST {{baseUrl}}/auth/send-otp
Body: { "mobile": "1234567890" }
Expected: 200 { success: true, data: { otp: "123456" }, message: "OTP sent successfully" }


Verify OTP:
POST {{baseUrl}}/auth/verify-otp
Body: { "mobile": "1234567890", "otp": "123456" }
Expected: 200 { success: true, data: { token: "..." }, message: "OTP verified successfully" }
Save token to environment.


Invalid Input (e.g., signup):
Body: { "mobile": "12345", "name": "too long..." }
Expected: 400 { success: false, message: "Validation failed", details: [...] }


Subscribe Pro:
POST {{baseUrl}}/subscribe/pro
Headers: Authorization: Bearer {{token}}
Body: {}
Expected: 200 { success: true, data: { url: "..." }, message: "Checkout session created successfully" }
Open url in browser, use test card 4242 4242 4242 4242, expiry 12/26, CVC 123, ZIP 12345.


Webhook:
Check logs: docker-compose logs stripe-cli for 200 responses.
Expected: checkout.session.completed event updates user to pro.


Subscription Status:
GET {{baseUrl}}/subscription/status
Headers: Authorization: Bearer {{token}}
Expected: 200 { success: true, data: { subscriptionTier: "pro" }, message: "Subscription status retrieved successfully" }




Verify Database:
docker exec -it kuvaka-tech-assignment-postgres-1 psql -U postgres -d gemini_db -c "SELECT subscription_tier FROM users WHERE id = 2;"

Expected: pro


Input Validation

Mobile: Exactly 10 digits (e.g., 1234567890).
Name: Max 100 characters (for users and chatrooms).
OTP: Exactly 6 digits (e.g., 123456).
Password: 8–100 characters.
Message: Max 1000 characters, non-empty.
Validation Library: Yup.
Error Format: { success: false, message: "Validation failed", details: [{ field: "field", message: "error" }] }

Response Format

Success: { success: true, data: {...}, message: "Descriptive success message" }
Error: { success: false, message: "Descriptive error message" } or { success: false, message: "Validation failed", details: [...] }

Troubleshooting

Validation Errors:
Check docker-compose logs app for Yup errors.
Verify yup is installed: docker exec -it kuvaka-tech-assignment-app-1 npm list yup.


Webhook Errors:
Check docker-compose logs stripe-cli for 200 responses.
Ensure app.js uses express.raw for /webhook/stripe.
Test: curl -X POST http://<ec2-public-ip>:3000/webhook/stripe -H "Content-Type: application/json" -d '{}'
Expected: 400 { success: false, message: "Webhook processing failed" }




Database Issues:
Verify: docker exec -it kuvaka-tech-assignment-postgres-1 psql -U postgres -d gemini_db.
Check DB_HOST=postgres in .env.


Redis Issues:
Verify: docker exec -it kuvaka-tech-assignment-redis-1 redis-cli ping.
Expected: PONG.


Port Conflicts:
Check: sudo netstat -tuln | grep 3000.
Update docker-compose.yml to use a different port (e.g., 3001:3000).



Deployment Notes

EC2:
Ensure security group allows ports 3000, 5432, 6379.
Update FRONTEND_URL in .env to EC2 public IP or domain.
Disable stripe-cli service in production; configure webhook in Stripe Dashboard (https://<ec2-public-ip>:3000/webhook/stripe).


Render or Other Platforms:
Remove stripe-cli service from docker-compose.yml.
Add .env variables to platform’s environment settings.
Update Stripe webhook to https://<your-domain>/webhook/stripe.
Ensure HTTPS is enabled.


Scaling:
Use a load balancer for multiple EC2 instances.
Consider managed services (e.g., AWS RDS for PostgreSQL, ElastiCache for Redis).



Contributing

Fork the repository.
Create a feature branch: git checkout -b feature/your-feature.
Commit changes: git commit -m "Add your feature".
Push: git push origin feature/your-feature.
Open a pull request to the sandbox branch.

License
MIT License. See LICENSE for details.