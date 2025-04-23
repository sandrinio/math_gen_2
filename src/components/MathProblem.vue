<template>
  <div class="math-problem">
    <div v-if="!quizStarted" class="greeting">
      <h1>Hello!</h1>
      <p>Click the button below to start your math homework.</p>
      <button @click="startQuiz">Start Homework</button>
    </div>

    <div v-if="quizStarted">
      <form @submit.prevent="checkAnswers">
        <div class="problem-columns">
          <div class="problem-section">
            <h2>Addition Problems</h2>
            <div v-for="(problem, index) in additionProblems" :key="index" class="problem">
              {{ problem.num1 }} {{ problem.operation }} {{ problem.num2 }} =
              <input type="number" v-model="userAnswers[index]" placeholder="Your answer" />              
            </div>
          </div>
          <div class="problem-section subtraction-problems">
            <h2>Subtraction Problems</h2>


            <div v-for="(problem, index) in subtractionProblems" :key="index + additionProblems.length" class="problem">
              {{ problem.num1 }} {{ problem.operation }} {{ problem.num2 }} =
              <input type="number" v-model="userAnswers[index + additionProblems.length]" placeholder="Your answer" />
            </div>
          </div>
        </div>
          <button type="submit">Submit</button>
      </div>
      <div v-if="submissionMessage" class="submission-message">
        {{ submissionMessage }}
      </div>
      <div v-if="results.length > 0" class="results">
        <h2>Results</h2>
        <ul>        
          <li v-for="(result, index) in results" :key="index">            
            <span v-if="index < additionProblems.length">{{ additionProblems[index].num1 }} {{ additionProblems[index].operation }} {{ additionProblems[index].num2 }} = {{ userAnswers[index] }}</span>
            <span v-else>{{ subtractionProblems[index - additionProblems.length].num1 }} {{ subtractionProblems[index - additionProblems.length].operation }} {{ subtractionProblems[index - additionProblems.length].num2 }} = {{ userAnswers[index] }}</span>
            <span v-if="result.correct" class="correct">✓ Correct!</span>            
            <span v-else class="incorrect">✗ Incorrect</span>
          </li>        
        </ul>
        <p>Total Score: {{ results.filter(r => r.correct).length }} / 20</p>
      </div>
    </div>
  </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      quizStarted: false,
      additionProblems: [],
      subtractionProblems: [],
      userAnswers: Array(20).fill(''),
      results: [],
      submissionMessage: '',
    };
  },
  methods: {
    async startQuiz() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('dev') === 'true') {
        console.log("Dev mode: generating math problems locally");
      }
      this.quizStarted = true;
      await this.generateProblems();
    },
    async generateProblems() {
      // Check if the app is in development mode
      this.additionProblems = [];
      this.subtractionProblems = [];
      if (import.meta.env.DEV) {
        console.log("Dev mode: generating math problems locally");
        this.problems = this.generateLocalProblems();        
      } else if (new URLSearchParams(window.location.search).get('dev') === 'true') {
          console.log("Dev mode: generating math problems locally");
          this.problems = this.generateLocalProblems();
      } else {
      
        try {
          const response = await fetch('/api/generateProblems', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log("Response status:", response.status);
          console.log("Response headers:", response.headers);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (!data.additionProblems || !data.subtractionProblems) {
            console.error("Invalid problems format from server:", data);
            this.additionProblems = [];
            this.subtractionProblems = [];
          } else{
            this.additionProblems = data.additionProblems;
            this.subtractionProblems = data.subtractionProblems;
          }

        } catch (error) {


          console.error("Error generating problems:", error);
          this.problems = []; // Clear problems to avoid issues.
          this.quizStarted = false;
        }
      }
    },
    generateLocalProblems() {
      const additionProblems = [];
      const subtractionProblems = [];
      for (let i = 0; i < 10; i++) {
        const num1 = Math.floor(Math.random() * 49) + 1;
        const num2 = Math.floor(Math.random() * 49) + 1;
        additionProblems.push({ num1, num2, operation: '+', answer: num1 + num2 });
      }
      for (let i = 0; i < 10; i++) {
        const num1 = Math.floor(Math.random() * 49) + 1;
        const num2 = Math.floor(Math.random() * num1) + 1;
        subtractionProblems.push({ num1, num2, operation: '-', answer: num1 - num2 });
      }
      this.additionProblems = additionProblems;
      this.subtractionProblems = subtractionProblems;
    },

    checkAnswers() {
      this.results = [...this.additionProblems, ...this.subtractionProblems].map((problem, index) => {
        const userAnswer = parseInt(this.userAnswers[index]) || 0;
        return { correct: userAnswer === problem.answer };
      });
      this.submissionMessage = "Answers checked!";
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