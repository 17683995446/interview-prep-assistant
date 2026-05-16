import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AchievementNotification from "@/components/AchievementNotification";
import { useTheme } from "@/hooks/useTheme";

const Home = lazy(() => import("./pages/Home"));
const Questions = lazy(() => import("./pages/Questions"));
const QuestionDetail = lazy(() => import("./pages/QuestionDetail"));
const Progress = lazy(() => import("./pages/Progress"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MistakeBook = lazy(() => import("./pages/MistakeBook"));
const Achievements = lazy(() => import("./components/Achievements"));
const MockInterview = lazy(() => import("./pages/MockInterview"));
const Ranking = lazy(() => import("./pages/Ranking"));
const CodeExecutionDemo = lazy(() => import("./pages/CodeExecutionDemo"));
const DataManagement = lazy(() => import("./pages/DataManagement"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
    </div>
  );
}

export default function App() {
  useTheme();
  return (
    <Router>
      <Navbar />
      <AchievementNotification />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mistakes" element={<MistakeBook />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/interview" element={<MockInterview />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/demo" element={<CodeExecutionDemo />} />
          <Route path="/data" element={<DataManagement />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
