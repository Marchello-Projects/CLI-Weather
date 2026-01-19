<img width="4213" height="1395" alt="Group 7" src="https://github.com/user-attachments/assets/246df07c-6642-4eac-a1a5-e64aa0f019dd" />

A simple **Node.js CLI application** to manage user profiles and check the current weather for your preferred city. The project uses a clean interface with **interactive prompts**, stores user preferences locally, and fetches weather data from the WeatherAPI.

---

## Features

* 🌟 **User Profile Management**

  * Set and update your username and preferred city.
  * Data is stored locally using `conf` for persistent configuration.

* ☁️ **Weather Information**

  * Get current temperature in Celsius and Fahrenheit.
  * See weather conditions and wind speed.

* 🎨 **Interactive CLI**

  * Colorful interface with `chalk`.
  * Loading spinners using `ora`.
  * Input validation with `inquirer`.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/weather-cli.git
cd weather-cli
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root and add your WeatherAPI key:

```
API_KEY=your_api_key_here
DOTENV_CONFIG_QUIET=true
```

---

## Usage

Run the CLI:

```bash
node index.js
```
