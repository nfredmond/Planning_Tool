# TransportVoice

TransportVoice is a platform for better transportation experiences, allowing users to share insights, find solutions to transportation challenges, and collaborate to improve mobility for all.

## Project Structure

This project is divided into two main parts:

- **Client**: React-based frontend application
- **Server**: Express-based backend API

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd transportvoice
```

### Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory with the following content:

```
PORT=5000
NODE_ENV=development
```

### Client Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the client directory with the following content:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

#### Server

```bash
cd server
npm run dev
```

#### Client

```bash
cd client
npm start
```

### Production Mode

#### Build the Client

```bash
cd client
npm run build
```

#### Run the Server in Production Mode

```bash
cd ../server
NODE_ENV=production npm start
```

## Features

- Easy transportation planning
- Real-time transportation updates
- Community insights and collaboration

## Technologies Used

### Frontend

- React
- React Router
- Axios
- CSS3

### Backend

- Express.js
- Node.js
- Helmet (Security)
- CORS
- Morgan (Logging)

## License

This project is licensed under the MIT License. 