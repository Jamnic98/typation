# Typation

An adaptive typing program designed to improve speed and accuracy through personalised practice and analytics.

## Overview

Typation analyses a user’s typing patterns and generates words and exercises targeting letters or digraphs they struggle with. The goal is to accelerate improvement over time by focusing practice on weak points while tracking measurable progress.

The frontend is built with **React** and **Vite**, providing a responsive typing interface. The backend is written in **Python** with **FastAPI**, handling user performance tracking and serving dynamically generated practice words. Typing data is stored in JSON, and **Redis** is used as a job queue to process text generation requests asynchronously, keeping the app fast and responsive.

## Features

- Adaptive text generation based on user performance  
- Real-time WPM and accuracy tracking  
- Detailed analytics including digraph and character-level stats  
- Data visualisation with trends over time  
- Dockerised infrastructure for development and deployment  
- API-first backend design with GraphQL support  

## Tech Stack

- **Frontend:** TypeScript, React, Vite, HTML, CSS  
- **Backend:** Python, FastAPI, GraphQL, PostgreSQL  
- **Infrastructure:** Docker, Docker Compose  
- **Testing:** React Testing Library, Vitest, Pytest  
- **Other:** JSON (data storage), Redis (job queue)  

## Development Highlights

- Built a Python-based text generator to provide personalised practice words  
- Collected and visualised my own typing data using Matplotlib  
- Iteratively improved the interface and backend to support live analytics  
- Work in progress with continued improvements planned for production-ready deployment  

## Live App

[Live Project](https://typation.co.uk)

## GitHub Repository

[GitHub Repo](https://github.com/Jamnic98/typation)
