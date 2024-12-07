'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import BackgroundAnimation from "../components/Background";
import axios from 'axios';
import questionsData from '../questions.json';

interface Question {
  id: number;
  question: string;
  type: string;
  required?: boolean;
}

const questions: Question[] = questionsData;

export default function Questionnaire() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (textInput.trim() !== "") {
      setAnswers((prev) => ([ ...prev, textInput ]));
      setTextInput("");
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        inputRef.current?.focus();
      } else {
        setIsCompleted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setTextInput(answers[currentQuestion - 1] || "");
    }
  };
const uploadQuestions = async () => {
  console.log(answers);
  const response = await axios.post('https://f23a-14-195-142-82.ngrok-free.app/trade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(answers),
  });
  const data = await response.data;
  console.log(data);
}
  useEffect(() => {
    if (isCompleted) {
      localStorage.setItem('questionnaireAnswers', JSON.stringify(answers));
      uploadQuestions()
      setTimeout(() => {
        router.push('/choiceform');
      }, 1000);
    }
  }, [isCompleted, answers, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4 sm:p-8">
      <BackgroundAnimation />
      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8"
        >
          <div className="mb-8">
            <div className="text-sm text-blue-300 mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {questions[currentQuestion].question}
            </h2>
          </div>

          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleNext()}
              className="w-full p-4 rounded-lg bg-white/5 text-white border border-white/10 focus:border-blue-500 focus:outline-none transition-all duration-200"
              placeholder="Type your answer..."
              autoFocus
            />

            <div className="flex justify-between pt-8">
              {currentQuestion > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 rounded-lg transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!textInput.trim()}
                className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                  !textInput.trim()
                    ? "bg-blue-500/20 text-blue-300/50 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
              </button>
            </div>
          </div>

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-green-400"
            >
              Profile assessment completed! Redirecting to verification...
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}