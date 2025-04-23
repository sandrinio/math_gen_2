<template>
  <div class="container mt-5">
    <div id="toast-container" aria-live="polite" aria-atomic="true" class="position-fixed top-0 end-0 p-3" style="z-index: 1050;"></div>
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div v-if="!quizStarted" class="text-center">
          <h1 class="mb-4">Hello!</h1>
          <p class="mb-4">Click the button below to start your math homework.</p>
          <button class="btn btn-success me-2" @click="startQuiz">Start Homework</button>
          <button class="btn btn-primary me-2" @click="generateLocalProblemsButton">Generate Locally</button>
          <button class="btn btn-info" @click="generateAIProblemsButton">Generate AI</button>
        </div>

        <div v-if="quizStarted">
          <div class="row">
            <div class="col-md-6">
              <h2 class="mb-3">Addition Problems</h2>
              <form @submit.prevent="checkAnswers">
                <div v-for="(problem, index) in additionProblems" :key="`add-${index}`" class="problem">
                  {{ problem.num1 }} {{ problem.operation }} {{ problem.num2 }} =
                  <input type="number" class="form-control d-inline-block w-auto" v-model="userAnswers[index]" placeholder="Your answer" />
                </div>
              </form>
            </div>

            <div class="col-md-6">
              <h2 class="mb-3">Subtraction Problems</h2>
              <form @submit.prevent="checkAnswers">
                <div v-for="(problem, index) in subtractionProblems" :key="`sub-${index}`" class="problem">
                  {{ problem.num1 }} {{ problem.operation }} {{ problem.num2 }} =
                  <input type="number" class="form-control d-inline-block w-auto" v-model="userAnswers[additionProblems.length + index]" placeholder="Your answer" />
                </div>
              </form>
            </div>
          </div>

          <button type="submit" class="btn btn-success mt-3" @click="checkAnswers">Submit</button>

          <div v-if="submissionMessage" class="alert alert-info mt-3">
            {{ submissionMessage }}
          </div>

          <div v-if="results.length > 0" class="results mt-4">
            <h2>Results</h2>
            <ul class="list-group">
              <li v-for="(result, index) in results" :key="index" class="list-group-item">
                {{ problems[index].num1 }} {{ problems[index].operation }} {{ problems[index].num2 }} = {{ userAnswers[index] }}
                <span v-if="result.correct" class="text-success fw-bold">✓ Correct!</span>
                <span v-else class="text-danger fw-bold">✗ Incorrect</span>
              </li>
            </ul>
            <p class="mt-3">Total Score: {{ results.filter(r => r.correct).length }} / 20</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default {
  data() {
    return {
      quizStarted: false,
      problems: [],
      additionProblems: [],
      subtractionProblems: [],
      userAnswers: Array(20).fill(''),
      results: [],
      submissionMessage: '',
    };
  },
  methods: {
    async startQuiz() {
      this.showToast('info', 'Starting quiz...');
      this.quizStarted = true;
      await this.generateProblems();
      this.showToast('success', 'Quiz started successfully!');
    },
    async generateProblems() {
      this.problems = [];
      try {
        const response = await fetch('/api/generateProblems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data.additionProblems) || !Array.isArray(data.subtractionProblems)) {
          this.showToast('error', 'Invalid problems format from server');
          this.problems = [];
        } else {
          this.additionProblems = data.additionProblems.map(problem => ({
            num1: problem.num1,
            num2: problem.num2,
            operation: '+',
            answer: problem.num1 + problem.num2,
          }));

          this.subtractionProblems = data.subtractionProblems.map(problem => ({
            num1: problem.num1,
            num2: problem.num2,
            operation: '-',
            answer: problem.num1 - problem.num2,
          }));

          this.problems = [...this.additionProblems, ...this.subtractionProblems];
          this.showToast('success', 'Problems generated successfully!');
        }
      } catch (error) {
        this.showToast('error', 'Error generating problems: ' + error.message);
        this.problems = [];
        this.quizStarted = false;
      }
    },
    checkAnswers() {
      this.results = this.problems.map((problem, index) => {
        const userAnswer = parseInt(this.userAnswers[index]) || 0;
        return { correct: userAnswer === problem.answer };
      });
      this.submissionMessage = 'Answers checked!';
      this.showToast('success', 'Answers checked successfully!');
    },
    generateLocalProblemsButton() {
      this.showToast('info', 'Generating problems locally...');
      this.problems = this.generateLocalProblems();
      this.quizStarted = true;
      this.showToast('success', 'Local problems generated and quiz started!');
    },
    generateAIProblemsButton() {
      this.showToast('info', 'Generating problems using AI...');
      this.generateProblems();
      this.quizStarted = true;
      this.showToast('success', 'AI problems generated and quiz started!');
    },
    showToast(type, message) {
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast align-items-center text-bg-${type} border-0`;
      toast.role = 'alert';
      toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      `;
      toastContainer.appendChild(toast);
      const bootstrapToast = new bootstrap.Toast(toast);
      bootstrapToast.show();
      toast.addEventListener('hidden.bs.toast', () => toast.remove());
    },
  },
};
</script>

<style scoped>
.math-problem {
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.greeting {  
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.greeting h1 {  
  margin-bottom: 10px;
}

.greeting p {  
  margin-bottom: 20px;
}

.greeting button, button[type="submit"] {
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
button[type="submit"] {
  display: block;
  margin: 20px auto;  
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

.problem-columns {
  display: flex;  
  gap: 20px;
  flex-wrap: wrap;
}

.problem-columns .problem-section {  
  flex-grow: 1;
  flex-basis: 0;
}

.subtraction-problems {
  margin-left: 20px;  
}

/* Media query for smaller screens */
@media (max-width: 600px) {
  .problem-columns { 
    flex-direction: column;  
  }
  .subtraction-problems {
    margin-left: 0;  
  }
}

.problem-section {
  margin-bottom: 20px;
}

.problem-section h2 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.problem {
  font-size: 1.2em;
  margin: 10px 0;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ddd;
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
button[type="submit"]:hover {
  background-color: #45a049;
}

</style>