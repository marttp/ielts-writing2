<script lang="ts">
    import { onMount } from "svelte";
    import resetImage from "../assets/reset.svg";
    import { questions } from "../data/questions.json";
    import { reviewAnswer } from "./api";

    const task2RequiredWords: number = 250;

    let currentQuestion: string = "";
    let answer: string = "";
    let wordCount: number = 0;

    function randomizeQuestion() {
        const index = Math.floor(Math.random() * questions.length);
        currentQuestion = questions[index];
    }

    onMount(() => {
        randomizeQuestion();
    });

    $: wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

    let timeLeft: number = 60 * 60; // 60 minutes in seconds
    let timerRunning: boolean = false;
    let timerInterval: NodeJS.Timer;

    function startTimer() {
        if (!timerRunning) {
            timerRunning = true;
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                }
            }, 1000);
        }
    }

    $: minutes = Math.floor(timeLeft / 60);
    $: seconds = timeLeft % 60;
    $: timerDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    $: timerColor =
        timeLeft > 30 * 60
            ? "bg-green-500"
            : timeLeft > 20 * 60
              ? "bg-yellow-500"
              : "bg-red-500";

    let analyzing: boolean = false;
    let analysisResult: string = "";

    async function analyzeAnswer() {
        if (!answer.trim()) return;

        analyzing = true;
        analysisResult = "";

        try {
            const result = await reviewAnswer(answer);
            analysisResult = result;
        } finally {
            analyzing = false;
        }
    }
</script>

<div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">IELTS Writing Practice</h1>

    <div class="mb-4">
        <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Question:</h2>
            <div role="button" on:click={randomizeQuestion}>
                <img src={resetImage} class="logo" alt="Reset question" />
            </div>
        </div>
        <p class="mt-2 text-gray-700">{currentQuestion}</p>
    </div>

    <div class="mb-4">
        <textarea
            class="w-full h-48 p-2 border rounded"
            bind:value={answer}
            placeholder="Write your answer here..."
        ></textarea>
        <div class="text-right mt-1 text-gray-600">
            Word Count: {wordCount} / {task2RequiredWords}
        </div>
    </div>

    <div class="mb-4">
        <button
            class={`px-4 py-2 text-white rounded ${timerColor}`}
            on:click={startTimer}
        >
            {timerRunning ? timerDisplay : "Start Timer"}
        </button>
    </div>

    <div class="mb-4">
        <button
            class="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
            on:click={analyzeAnswer}
            disabled={analyzing ||
                !answer.trim() ||
                wordCount < task2RequiredWords}
        >
            {analyzing ? "Reviewing..." : "Review answer"}
        </button>
        {#if analyzing}
            <p class="mt-2 text-gray-600">
                Analyzing your answer, please wait...
            </p>
        {:else if analysisResult}
            <p class="mt-2 text-gray-800">{analysisResult}</p>
        {/if}
    </div>
</div>

<style>
    .logo {
        height: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }
    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }
</style>
