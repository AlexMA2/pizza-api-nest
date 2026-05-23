# Restaurant Management & Menu System

A cloud-based web application designed to manage restaurant menus efficiently, utilizing modern infrastructure for rapid deployment, secure access control, and AI-driven content generation.

## Project Overview

This project focuses on a decoupled architecture that allows users to interact with a digital menu while providing administrative tools for staff. It integrates cloud computing, relational databases, automated triggers, and Large Language Models (LLMs) to streamline the process of updating and marketing culinary offerings.

## Technical Requirements & Infrastructure

### 1. Frontend & API Layer

Hosting: Deployed on AWS EC2

Functionality: A streamlined web interface that displays a dynamic list of available dishes.

### 2. Security & Identity Management

Implementation of AWS IAM to enforce Role-Based Access Control (RBAC):

Chef Role: Full CRUD (Create, Read, Update, Delete) permissions for menu management.

Customer Role: Read-only access to the menu.

### 3. Storage & Media Management

Provider: AWS S3.

Purpose: Dedicated object storage for high-resolution images of the dishes.

### 4. Database Schema

Managed via AWS RDS. The Dishes table includes the following attributes:

Name: String (Title of the dish).

Price: Decimal (Current cost).

Flavor Profile: String (e.g., Savory, Sweet, Sour).

Image URL: String (Reference to the cloud storage object).

Metadata: JSON/Structured data for professional-grade specifications.

### 5. Networking & Security

Virtual Network: Configured within a VPC (AWS).

Restriction: The database instance is isolated, strictly accepting connections only from the Web Server’s private IP/Security Group.

### 6. Serverless Automation

Technology: AWS Lambda.

Trigger: Automatically executed upon new image uploads to the storage bucket.

Action: Updates the corresponding record in the database with the generated public or signed URL of the photo.

### 7. AI Integration (LLM)

Service: AWS Bedrock.

Feature: A "Generate Description" tool that utilizes the dish name to create concise, engaging marketing copy (e.g., "Delicious Arroz con Pollo, seasoned to perfection")
