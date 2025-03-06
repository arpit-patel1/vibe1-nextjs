# vibe1-nextjs

A Next.js application for kids' skill development.

## Deployment Guide

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Git

### Option 1: Deploy to Vercel (Recommended)

The easiest way to deploy this Next.js application is using Vercel, the platform built by the creators of Next.js.

1. **Push your code to GitHub, GitLab, or Bitbucket**

2. **Deploy to Vercel**
   - Visit [Vercel](https://vercel.com) and sign up or log in
   - Click "New Project" and import your repository
   - Vercel will automatically detect Next.js and configure the build settings
   - Click "Deploy"

3. **Configure Environment Variables (if needed)**
   - In the Vercel dashboard, go to your project settings
   - Add any required environment variables under the "Environment Variables" section

### Option 2: Self-Hosting

If you prefer to deploy on your own server:

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vibe1-nextjs
   ```

2. **Install dependencies**
   ```bash
   cd kidskills
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start the production server**
   ```bash
   npm start
   ```
   The application will be available at http://localhost:3000

### Option 3: Docker Deployment (Recommended for Production)

#### Prerequisites
- Docker and Docker Compose installed on your server

#### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vibe1-nextjs
   ```

2. **Copy the `.env.example` file to `.env`:**
   ```bash
   cp .env.example .env
   ```

3. **Edit the `.env` file and add your OpenRouter API key:**
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

4. **Run the application with Docker Compose:**
   ```bash
   docker compose up -d
   ```

5. **Access the application at http://localhost:3000**

#### Using Docker Directly

1. **Build the Docker image**
   ```bash
   docker build -t kidskills .
   ```

2. **Run the Docker container**
   ```bash
   docker run -d -p 3000:3000 \
     -e NEXT_PUBLIC_OPENROUTER_API_KEY=your_api_key_here \
     -e NEXT_PUBLIC_DEFAULT_AI_MODEL=your_preferred_model \
     kidskills:latest
   ```
   The application will be available at http://localhost:3000

3. **View logs**
   ```bash
   docker logs -f kidskills
   ```

4. **Stop the container**
   ```bash
   docker stop kidskills
   docker rm kidskills
   ```

## Production Considerations

- Set up proper environment variables for production
- Configure a reverse proxy (like Nginx) for SSL termination
- Set up monitoring and logging
- Consider using a container orchestration system like Kubernetes for larger deployments