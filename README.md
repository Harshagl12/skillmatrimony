# Skill Matrimony

Skill Matrimony is a comprehensive full-stack web application designed for engineering students to bridge the gap between their current skill sets and their future career paths. The platform uses AI to provide personalized career mapping, skill analytics, and educational support.

##  Features

### 📊 Student Dashboard

* **Activity Heatmap:** Track daily progress and consistency.
* **Skill Confidence Meter:** Visual representation of proficiency across different technologies.
* **Time Spent Analytics:** Detailed breakdown of time allocated to various learning modules.

### 🛣️ Career & Domain Mapping

* **Skill Showcase:** Dedicated pages to highlight specific technical domains.
* **Current Trends:** Live career news and industry updates powered by **Gemini 1.5 Flash**.
* **Career Mapping System:** Intelligent pathfinding to help students reach their professional goals.

### 🛡️ Zero-Failure Zone

* **AI File Checker Bot:** Automated analysis of project files and assignments.
* **Exam Prep Bot:** AI-driven study assistant designed to help students prepare for assessments effectively.

### 🌐 Event Hub

* **Public Event Feed:** Stay updated with the latest workshops, hackathons, and seminars.
* **HubBot:** A dedicated chatbot powered by Gemini for instant support and navigation within the event ecosystem.

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **Backend & Database:** Supabase (Authentication, Database, and Storage)
* **Artificial Intelligence:** Google Gemini 1.5 Flash API

## 🏁 Getting Started

### Prerequisites

* Node.js 18.x or later
* A Supabase account and project
* A Google AI Studio API Key (for Gemini)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Harshagl12/skillmatrimony.git
cd skillmatrimony

```


2. **Install dependencies:**
```bash
npm install

```


3. **Set up environment variables:**
Create a `.env.local` file in the root directory and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
for more go through .env

```


4. **Run the development server:**
```bash
npm run dev

```


5. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the result.

## 📄 License

This project is licensed under the MIT License.
