'use client';

import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BackgroundAnimation from "../components/Background";

export default function ChoiceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  const handleChoice = (choice: 'virtual' | 'previous') => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      localStorage.setItem('trainingChoice', choice);
      router.push('/dex');
      setLoading(false);
    }, 2000); // Adjust time as needed
  };

  const handleAnswerSubmit = () => {
    setAnswers([...answers, currentAnswer]);
    setCurrentAnswer(''); // Clear input after submission
    setQuestionCount(questionCount + 1);
  };

  const handleFeedbackSubmit = () => {
    // Handle feedback submission logic here
    setIsModalOpen(false); // Close modal after submission
  };

  return (
    <main className="min-h-screen bg-[#0A0F1E] flex items-center justify-center relative overflow-hidden">
      <BackgroundAnimation />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[20%] left-[10%] w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[10%] w-[25rem] h-[25rem] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {loading ? (
        <div className="loader">Loading...</div> 
      ) : (
        <div className="relative z-10 w-full max-w-[1800px] p-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-7xl font-bold mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-400">
                Choose Your Path
              </span>
            </h1>
            <p className="text-2xl text-blue-200/80 max-w-3xl mx-autoscann ">Select your preferred training environment</p>
          </motion.div>

          <div className="flex flex-row justify-center items-stretch gap-36 ">
            {/* Virtual Environment Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group relative w-[650px] bg-gradient-to-b from-white/[0.12] to-white/[0.04] rounded-3xl overflow-hidden "
              onClick={() => handleChoice('virtual')}
              style={{marginRight: '2rem'}} 
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-[-1px] bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-blue-500/50 rounded-3xl" />
              </div>
              
              <div className="relative border border-white/10 rounded-3xl p-10 h-full">
                {/* Card Content */}
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-white group-hover:text-blue-200 transition-colors">Virtual Environment</h2>
                    </div>
                    <p className="text-lg text-blue-200/80 pl-[88px]">Train your bot in a risk-free simulated environment</p>
                  </div>

                  {/* Features */}
                  <div className="flex-grow">
                    <ul className="space-y-4 mb-8 pl-[88px]">
                      <li className="flex items-center text-blue-100/80 text-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                        Zero Financial Risk
                      </li>
                      <li className="flex items-center text-blue-100/80 text-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                        Instant Strategy Testing
                      </li>
                      <li className="flex items-center text-blue-100/80 text-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                        Accelerated Learning
                      </li>
                    </ul>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    Start Virtual Training
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Previous Transactions Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group relative w-[650px] bg-gradient-to-b from-white/[0.12] to-white/[0.04] rounded-3xl overflow-hidden"
              onClick={() => handleChoice('previous')}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-[-1px] bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-blue-500/50 rounded-3xl" />
              </div>
              
              <div className="relative border border-white/10 rounded-3xl p-10 h-full">
                {/* Card Content */}
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-white group-hover:text-blue-200 transition-colors">Previous Transactions</h2>
                    </div>
                    <p className="text-lg text-blue-200/80 pl-[88px]">Train using your real trading history</p>
                  </div>

                  {/* Features */}
                  <div className="flex-grow">
                    <ul className="space-y-4 mb-8 pl-[88px]">
                      <li className="flex items-center text-blue-100/80 text-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                        Real Market Data
                      </li>
                      <li className="flex items-center text-blue-100/80 text-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                        Personal Trading Style
                      </li>
                      <li className="flex items-center text-blue-100/80 text-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                        Proven Strategies
                      </li>
                    </ul>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    Use Trading History
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Show Feedback button after 10 questions */}
          {questionCount >= 9 && (
            <button onClick={() => setIsModalOpen(true)}>Feedback</button>
          )}

          {/* Modal for feedback input */}
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>Feedback</h2>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback here..."
                />
                <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
                <button onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}