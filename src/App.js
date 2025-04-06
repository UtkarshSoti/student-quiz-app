import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

const initialQuizData = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Lisbon"],
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Venus", "Mars", "Jupiter"],
    answer: "Mars",
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    answer: "William Shakespeare",
  },
];

export default function StudentQuiz() {
  const [quizData, setQuizData] = useState(initialQuizData);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newAnswer, setNewAnswer] = useState("");
  const [studentName, setStudentName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (quizStarted && timeLeft === 0) {
      handleAnswer(null);
      return;
    }
    if (!quizStarted) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted]);

  useEffect(() => {
    setTimeLeft(10);
  }, [currentQuestion]);

  const handleAnswer = (option) => {
    if (selected !== null) return;

    setSelected(option);
    if (option === quizData[currentQuestion].answer) {
      setScore(score + 1);
    }
    setTimeout(() => {
      setSelected(null);
      const next = currentQuestion + 1;
      if (next < quizData.length) {
        setCurrentQuestion(next);
      } else {
        setShowScore(true);
        submitScore();
      }
    }, 800);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(10);
    setQuizStarted(false);
  };

  const handleNewQuestionSubmit = () => {
    if (newQuestion && newOptions.every(opt => opt) && newAnswer) {
      setQuizData([
        ...quizData,
        {
          question: newQuestion,
          options: newOptions,
          answer: newAnswer,
        },
      ]);
      setNewQuestion("");
      setNewOptions(["", "", "", ""]);
      setNewAnswer("");
    }
  };

  const submitScore = async () => {
  if (!studentName) return;
  try {
    await addDoc(collection(db, "scores"), {
      name: studentName,
      score: score,
    });
    fetchLeaderboard(); // update as needed
  } catch (e) {
    console.error("Error saving to Firebase", e);
  }
};
  const fetchLeaderboard = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "scores"));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    data.sort((a, b) => b.score - a.score);
    setLeaderboard(data);
  } catch (e) {
    console.error("Error fetching leaderboard:", e);
  }
};

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!quizStarted ? (
        <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", maxWidth: "400px", width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Enter Your Name to Start</h1>
          <input
            placeholder="Your name"
            style={{ padding: "0.5rem", marginBottom: "1rem", width: "100%" }}
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <button onClick={() => studentName && setQuizStarted(true)} style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.5rem" }}>Start Quiz</button>
        </div>
      ) : (
        <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", maxWidth: "600px", width: "100%", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Student Quiz</h1>
          {showScore ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{studentName}, you scored {score} out of {quizData.length}</p>
              <button style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.5rem" }} onClick={resetQuiz}>Try Again</button>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: "1rem", fontWeight: "500" }}>{quizData[currentQuestion].question}</p>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {quizData[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={selected !== null}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #ccc",
                      backgroundColor:
                        selected === option
                          ? option === quizData[currentQuestion].answer
                            ? "#16a34a"
                            : "#dc2626"
                          : "white",
                      color: selected === option ? "white" : "black"
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "gray" }}>Question {currentQuestion + 1} of {quizData.length}</p>
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", fontWeight: "bold", color: "#dc2626" }}>Time left: {timeLeft}s</p>
            </div>
          )}
        </div>
      )}

      {leaderboard.length > 0 && (
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", maxWidth: "600px", width: "100%", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>Leaderboard</h2>
          <ul>
            {leaderboard.map((entry, index) => (
              <li key={index} style={{ marginBottom: "0.25rem" }}>{index + 1}. {entry.name}: {entry.score}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", maxWidth: "600px", width: "100%" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Add New Question</h2>
        <input
          placeholder="Enter question"
          style={{ padding: "0.5rem", marginBottom: "0.5rem", width: "100%" }}
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        {newOptions.map((opt, idx) => (
          <input
            key={idx}
            placeholder={`Option ${idx + 1}`}
            style={{ padding: "0.5rem", marginBottom: "0.5rem", width: "100%" }}
            value={opt}
            onChange={(e) => {
              const updatedOptions = [...newOptions];
              updatedOptions[idx] = e.target.value;
              setNewOptions(updatedOptions);
            }}
          />
        ))}
        <input
          placeholder="Enter correct answer"
          style={{ padding: "0.5rem", marginBottom: "1rem", width: "100%" }}
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
        />
        <button onClick={handleNewQuestionSubmit} style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.5rem" }}>Add Question</button>
      </div>
    </div>
  );
}
