<template>
  <div class="math-problem">
    <form @submit.prevent="checkAnswers">
      <h2>Addition</h2>
      <div class="problem-section" >
        <div v-for="(problem, index) in problems.slice(0, 10)" :key="index" class="problem" >
          {{ problem.num1 }} {{ problem.operation }} {{ problem.num2 }} =
          <input type="number" v-model="userAnswers[index]" placeholder="?" />
        </div>
      </div>
      <h2>Subtraction</h2>
       <div class="problem-section">
        <div v-for="(problem, index) in problems.slice(10)" :key="index + 10" class="problem" >
          {{ problem.num1 }} {{ problem.operation }} {{ problem.num2 }} =
          <input type="number" v-model="userAnswers[index + 10]" placeholder="?" />
        </div>
      </div>
      <button type="submit">Submit</button>
    </form>
    <p v-if="results.length > 0">Answers checked!</p>
    <div v-if="results.length > 0" class="results">
      <h2>Results</h2>
      <ul>
        <li v-for="(result, index) in results" :key="index">
          {{ problems[index].num1 }} {{ problems[index].operation }} {{ problems[index].num2 }} = {{ userAnswers[index] }}
         <span v-if="result.correct" class="correct">✓</span>
          <span v-else class="incorrect">✗</span>
        </li>
      </ul>
      <p>Total Score: {{ results.filter(r => r.correct).length }} / 20</p>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      problems: [],
      userAnswers: Array(20).fill(''),
      results: [],
    };
  },
  mounted() {
    this.generateProblems();
  },
  methods: {
    generateProblems() {
      this.problems = [];
      for (let i = 0; i < 10; i++) {
        const num1 = Math.floor(Math.random() * 49) + 1;
        const num2 = Math.floor(Math.random() * 49) + 1;
        this.problems.push({ num1, num2, operation: '+', answer: num1 + num2 });
      }
      for (let i = 0; i < 10; i++) {
        let num1, num2;
        do {
          num1 = Math.floor(Math.random() * 49) + 1;
          num2 = Math.floor(Math.random() * 49) + 1;
        } while (num1 - num2 === 0);
        this.problems.push({ num1, num2, operation: '-', answer: num1 - num2 });
      }
    },
    checkAnswers() {
      this.results = this.problems.map((problem, index) => {
        const userAnswer = parseInt(this.userAnswers[index]) || 0;
        return { correct: userAnswer === problem.answer };
      });
    },
  },
};

</script>

<style scoped>
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