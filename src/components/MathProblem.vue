<template>
  <div class="math-problem">
    <div v-if="!quizStarted" class="greeting">
      <h1>Hello!</h1>
      <p>Click the button below to start your math homework.</p>
      <button @click="startQuiz">Start Homework</button>
    </div>

    <div v-if="quizStarted">
      <div class="problem-section">
        <form @submit.prevent="checkAnswers">
          <div v-for="(problem, index) in problems" :key="index" class="problem">
            {{ problem.num1 }} {{ problem.operation }} {{ problem.num2 }} =
            <input type="number" v-model="userAnswers[index]" placeholder="Your answer" />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div v-if="submissionMessage" class="submission-message">
        {{ submissionMessage }}
      </div>
      <div v-if="results.length > 0" class="results">
        <h2>Results</h2>
        <ul>
          <li v-for="(result, index) in results" :key="index">
            {{ problems[index].num1 }} {{ problems[index].operation }} {{ problems[index].num2 }} = {{ userAnswers[index] }}
            <span v-if="result.correct" class="correct">✓ Correct!</span>
            <span v-else class="incorrect">✗ Incorrect</span>
          </li>
        </ul>
        <p>Total Score: {{ results.filter(r => r.correct).length }} / 20</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      quizStarted: false,
      problems: [],
      userAnswers: Array(20).fill(''),
      results: [],
      submissionMessage: '',
    };
  },
  methods: {
    async startQuiz() {
      this.quizStarted = true;
      await this.generateProblems();
    },
    async generateProblems() {
      try {
        const response = await fetch('/api/generateProblems');
        const data = await response.json();
        
        this.problems = data;

        // Ensure we have 20 problems and the format is correct. If not, retry or handle the error.
        if (!Array.isArray(this.problems) || this.problems.length !== 20 || !this.problems.every(p => typeof p === 'object' && 'num1' in p && 'num2' in p && 'operation' in p && 'answer' in p)) {

          console.error("Invalid problems format from Gemini:", this.problems);
          this.problems = []; // Clear problems to avoid issues.
        }
      } catch (error) {
        console.error("Error generating problems:", error);
        this.problems = []; // Clear problems to avoid issues.
        this.quizStarted = false;
      }
    },
    checkAnswers() {
      this.results = this.problems.map((problem, index) => {
        const userAnswer = parseInt(this.userAnswers[index]) || 0;
        return { correct: userAnswer === problem.answer };
      });
      this.submissionMessage = "Answers checked!";
    },
  },
};
</script>

<style scoped>
/* ... (your existing CSS styles) ... */

.greeting {
  text-align: center;
  padding: 20px;
}

.greeting h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.greeting p {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.greeting button {
  /* Style the button to match your existing submit button */
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px 2px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.greeting button:hover {
  background-color: #45a049;
}

.submission-message {
  text-align: center;
  font-size: 1.1em;
  margin-top: 10px;
  color: #333;
}
.math-problem {
  font-family: 'Arial', sans-serif; /* A more playful font */
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9; /* Light background */
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.problem-section {
  margin-bottom: 20px;
}

.problem-section h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
  border-bottom: 2px solid #eee;
  padding-bottom: 5px;
}

.problem {
  font-size: 1.2em;
  margin: 10px 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.problem input[type="number"] {
  width: 80px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
}

.results {
  margin-top: 20px;
  padding: 20px;
  background-color: #e9e9e9;
  border-radius: 10px;
}

.results h2 {
  font-size: 1.4em;
  color: #333;
  margin-bottom: 10px;
}

.results ul {
  list-style: none; /* Remove bullet points */
  padding: 0;
}

.results li {
  font-size: 1.1em;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.results li:last-child {
  border-bottom: none;
}

.results .correct {
  color: green;
  font-weight: bold;
}

.results .incorrect {
  color: red;
  font-weight: bold;
}

button[type="submit"] {
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px 2px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #45a049;
}
</style>