# 🛒 E-Commerce Platform

A Full Stack E-Commerce Platform built using **React, Spring Boot, MySQL, JWT Authentication, AWS EC2 and Nginx**.

## 🚀 Tech Stack

### Frontend
- React.js
- Axios
- Bootstrap

### Backend
- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- JWT Authentication
- Maven

### Database
- MySQL

### Deployment
- AWS EC2
- Nginx
- Spring Boot Executable JAR

---

# ✨ Features

- User Registration & Login
- JWT Authentication
- Role Based Authorization
- Product Management
- Category Management
- Shopping Cart
- Order Management
- User Address Management
- Admin Dashboard
- Swagger API Documentation

---

# 📂 Project Structure

```
ecommerce-platform
│
├── frontend
├── backend
├── database
└── docker-compose.yml
```

---

# ⚙️ Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+
- MySQL 8+

---

## Lombok Setup (Required for Eclipse Users)

This project uses Lombok annotations.

If you are using Eclipse:

1. Download Lombok from:
   https://projectlombok.org/download

2. Run:

```bash
java -jar lombok.jar
```

3. Select your Eclipse installation and click **Install/Update**.

4. Restart Eclipse.

---

# 🗄️ Database Setup

Create a database named:

```sql
CREATE DATABASE ecommerce_db;
```

Import the database schema:

```
database/schema.sql
```

Import the seed data:

```
database/seed.sql
```

---

# 🔐 Default Admin Credentials

Email

```
admin@ecommerce.com
```

Password

```
admin123
```

---

# ▶️ Backend Setup

Navigate to backend folder

```bash
cd backend
```

Run the application

```bash
mvn spring-boot:run
```

or

```bash
mvn clean package
```

Run generated JAR

```bash
java -jar target/ecommerce-platform-0.0.1-SNAPSHOT.jar
```

Backend URL

```
http://localhost:8080/api/v1
```

Swagger

```
http://localhost:8080/api/v1/swagger-ui/index.html
```

---

# 💻 Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

Build Production

```bash
npm run build
```

---

# ☁️ AWS Deployment

Frontend

- React Production Build
- Nginx

Backend

- Spring Boot Executable JAR

Database

- MySQL

---

# 📌 Future Enhancements

- Docker
- Docker Compose
- Jenkins CI/CD
- Kubernetes
- Terraform
- AWS RDS
- AWS S3
- GitHub Actions

---

# 👨‍💻 Author

Vikrant Thakur