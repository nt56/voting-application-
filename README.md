# Voting Application

This is a backend application for a voting system where users can vote for candidates. It provides functionalities for user authentication, candidate management, and voting.

# Features

- User sign up and login with Aadhar Card Number and password
- User can view the list of candidates
- User can vote for a candidate (only once)
- Admin can manage candidates (add, update, delete)
- Admin cannot vote

# Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Tokens (JWT) for authentication

# Authentication

1. Sign Up
    - POST /signup: Sign up a user
2. Login
    - POST /login: Login a user

# Candidates

1. Get Candidates
    - GET /candidates: Get the list of candidates
2. Add Candidate
    - POST /candidates: Add a new candidate (Admin only)
3. Update Candidate
    - PUT /candidates/:id: Update a candidate by ID (Admin only)
4. Delete Candidate
    - DELETE /candidates/:id: Delete a candidate by ID (Admin only)

# Voting

1. Get Vote Count
    - GET /candidates/vote/count: Get the count of votes for each candidate
2. Vote for Candidate
    - POST /candidates/vote/:id: Vote for a candidate (User only)

# User Profile

1. Get Profile
    - GET /users/profile: Get user profile information
2. Change Password
    - PUT /users/profile/password: Change user password