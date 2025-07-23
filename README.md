# 🧠 Touch Typing

A full-stack application to improve typing speed and accuracy by analysing individual typing patterns and adapting practice content accordingly.

---

## 🚀 Tech Stack

- **Frontend:** TypeScript, React, Vite, HTML, CSS
- **Backend:** Python, Go (Golang), GraphQL, PostgreSQL
- **Testing:** React Testing Library, Vitest, Pytest
- **Infrastructure:** Docker, Docker Compose
- **Data Formats:** JSON
- **Other Tools:** Redis (for async job queuing), Matplotlib (for data visualisation)

---

## 🧩 Description

**Touch Typing** is an adaptive typing trainer that helps users accelerate their improvement by targeting weak areas in their typing ability.

The frontend is built using React + Vite, providing a clean and responsive interface. The backend uses FastAPI and GraphQL, with an asynchronous architecture. FastAPI handles authentication via REST endpoints, while GraphQL is used to manage user stats and settings. The backend also powers a personalised text generation service, using unigram and bigram analysis to adapt practice content to the user's typing patterns.

### Key Features:

- **Letter-level performance tracking:**  
  Every keystroke is analysed in real time, with hit/miss ratios tracked at both individual letter and letter-pair levels.
- **Dynamic practice generation:**  
  A Python service generates words tailored to the user's weaknesses using stored performance data. This service runs as a background job, managed by **Redis** for efficiency and responsiveness.

<!-- - **Data visualisation:**
  After collecting usage data, a Python script can parse the results and generate insightful graphs using **Matplotlib**, helping visualise improvement trends. -->

- **Containerised environment:**  
  The entire stack is managed via **Docker and Docker Compose**, ensuring consistent and reproducible development and deployment setups.

---

## 📈 Current Status

The project is a **work in progress**. After a short development pause (due to similarities with an existing product I drew inspiration from), work has resumed with a fresh roadmap and clearer goals.

---

## 📬 Contributing

This project is currently in solo development, but if you're interested in contributing or testing it out, feel free to reach out or open an issue!

<!-- ## 🧠 Future Plans

- A/B testing for different practice strategies
- Full account system for tracking long-term progress
- Leaderboards and gamified challenges
- Accessibility enhancements and mobile support -->

## 📜 Licence

MIT Licence (TBD)
