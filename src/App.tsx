import React, { useState, useEffect } from "react";
import { Navbar } from "./components/navbar";
import { PlayerJoin } from "./components/player/player_join";
import { PlayerWaiting } from "./components/player/player_waiting";
import { PlayerQuestion } from "./components/player/player_question";
import { PlayerResult } from "./components/player/player_result";
import { QuizEditor } from "./components/host/quiz_editor";
import { HostLobby } from "./components/host/host_lobby";
import { HostQuestion } from "./components/host/host_question";
import { HostLeaderboard } from "./components/host/host_leaderboard";
import { HostAuthModal } from "./components/host/host_auth_modal";
import {
  Quiz,
  GameSession,
  SessionParticipant,
  PlayerAnswer,
} from "./types/quiz";
import {
  fetchQuizzes,
  createGameSession,
  updateSessionStatus,
  submitPlayerAnswer,
  subscribeToSession,
  getSessionParticipants,
  getPlayerAnswersForQuestion,
  fetchSessionParticipants,
  verifyGameSessionPin,
} from "./lib/supabase";
import { soundFx } from "./lib/audio";

const STORAGE_KEYS = {
  HOST_AUTH: "qcpp_host_auth",
  ACTIVE_HOST_SESSION: "qcpp_active_host_session",
  ACTIVE_PLAYER_SESSION: "qcpp_active_player_session",
};

export const App: React.FC = () => {
  // Navigation & Host Authentication State (Persists across refresh)
  const [activeMode, setActiveMode] = useState<"player" | "host" | "editor">(
    "player"
  );
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isHostAuthenticated, setIsHostAuthenticated] = useState<boolean>(
    () => {
      return (
        localStorage.getItem(STORAGE_KEYS.HOST_AUTH) === "true" ||
        sessionStorage.getItem(STORAGE_KEYS.HOST_AUTH) === "true"
      );
    }
  );
  const [showHostAuthModal, setShowHostAuthModal] = useState<boolean>(false);
  const [pendingMode, setPendingMode] = useState<"host" | "editor" | null>(
    null
  );

  // Quizzes Data
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Host Game State
  const [hostSession, setHostSession] = useState<GameSession | null>(null);
  const [hostParticipants, setHostParticipants] = useState<
    SessionParticipant[]
  >([]);
  const [hostCurrentQuestionIdx, setHostCurrentQuestionIdx] =
    useState<number>(0);
  const [hostCurrentAnswers, setHostCurrentAnswers] = useState<PlayerAnswer[]>(
    []
  );
  const [hostStep, setHostStep] = useState<
    "LOBBY" | "QUESTION" | "LEADERBOARD"
  >("LOBBY");

  // Player Game State
  const [playerPin, setPlayerPin] = useState<string>("");
  const [participantName, setParticipantName] = useState<string>("");
  const [playerAvatar, setPlayerAvatar] = useState<string>("🚀");
  const [playerStep, setPlayerStep] = useState<
    "JOIN" | "WAITING" | "QUESTION" | "RESULT" | "FINAL"
  >("JOIN");
  const [playerRoomParticipants, setPlayerRoomParticipants] = useState<
    SessionParticipant[]
  >([]);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(
    null
  );
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    totalScore: number;
    streak: number;
    correctText: string;
  } | null>(null);

  // Load Initial Quizzes & Restore Active Sessions on Refresh
  useEffect(() => {
    async function initApp() {
      const list = await fetchQuizzes();
      setQuizzes(list);

      // 1. Restore Active Host Session on Refresh if authenticated
      const savedHostSession = localStorage.getItem(STORAGE_KEYS.ACTIVE_HOST_SESSION);
      if (savedHostSession) {
        try {
          const parsed = JSON.parse(savedHostSession);
          if (parsed && parsed.pin) {
            const validSession = await verifyGameSessionPin(parsed.pin);
            if (validSession) {
              setHostSession(validSession);
              setHostCurrentQuestionIdx(parsed.questionIndex || 0);
              setHostStep(parsed.step || "LOBBY");

              const parts = await fetchSessionParticipants(validSession.id);
              setHostParticipants(parts);

              // Auto switch to host mode on refresh if host was active
              if (localStorage.getItem(STORAGE_KEYS.HOST_AUTH) === "true") {
                setActiveMode("host");
              }
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_HOST_SESSION);
        }
      }

      // 2. Restore Active Player Session on Refresh
      const savedPlayerSession = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAYER_SESSION);
      if (savedPlayerSession) {
        try {
          const parsed = JSON.parse(savedPlayerSession);
          if (parsed && parsed.pin && parsed.participantName) {
            const validSession = await verifyGameSessionPin(parsed.pin);
            if (validSession) {
              setPlayerPin(parsed.pin);
              setParticipantName(parsed.participantName);
              setPlayerAvatar(parsed.avatar || "🚀");
              setPlayerStep(parsed.step || "WAITING");

              const parts = await fetchSessionParticipants(validSession.id);
              setPlayerRoomParticipants(parts);
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAYER_SESSION);
        }
      }
    }

    initApp();
  }, []);

  // Audio Toggle
  const handleToggleAudio = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Safe Mode Switcher with Host Auth Guard
  const handleSelectMode = (mode: "player" | "host" | "editor") => {
    if (mode === "player") {
      setActiveMode("player");
      return;
    }

    // Require Host Authentication for 'host' or 'editor' mode
    if (!isHostAuthenticated) {
      setPendingMode(mode);
      setShowHostAuthModal(true);
    } else {
      setActiveMode(mode);
    }
  };

  const handleHostAuthSuccess = () => {
    setIsHostAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.HOST_AUTH, "true");
    sessionStorage.setItem(STORAGE_KEYS.HOST_AUTH, "true");
    setShowHostAuthModal(false);
    if (pendingMode) {
      setActiveMode(pendingMode);
      setPendingMode(null);
    } else {
      setActiveMode("host");
    }
  };

  const handleHostLogout = () => {
    setIsHostAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.HOST_AUTH);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_HOST_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.HOST_AUTH);
    setHostSession(null);
    setActiveMode("player");
    soundFx.playClick();
  };

  // ==========================================
  // HOST ACTIONS & PERSISTENCE
  // ==========================================

  const handleSelectQuizToHost = async (quizId: string) => {
    if (!isHostAuthenticated) {
      setPendingMode("host");
      setShowHostAuthModal(true);
      return;
    }

    const session = await createGameSession(quizId);
    setHostSession(session);
    setHostParticipants(getSessionParticipants(session.id));
    setHostCurrentQuestionIdx(0);
    setHostStep("LOBBY");
    setActiveMode("host");

    // Persist Host Session state across refreshes
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_HOST_SESSION,
      JSON.stringify({
        id: session.id,
        pin: session.pin,
        quizId: session.quiz_id,
        step: "LOBBY",
        questionIndex: 0,
      })
    );

    // Subscribe to player join events
    subscribeToSession(session.id, (event: any) => {
      if (event.type === "PLAYER_JOINED" || event.type === "ANSWER_SUBMITTED") {
        if (event.participants && event.participants.length > 0) {
          setHostParticipants([...event.participants]);
        }
        if (event.type === "ANSWER_SUBMITTED") {
          const currentQ = session.quiz?.questions[hostCurrentQuestionIdx];
          if (currentQ) {
            setHostCurrentAnswers(
              getPlayerAnswersForQuestion(session.id, currentQ.id)
            );
          }
        }
      }
    });
  };

  // Cross-Device Auto-Sync Interval (Polls Supabase DB every 2 seconds for new players)
  useEffect(() => {
    if (!hostSession) return;
    async function syncParticipants() {
      const liveList = await fetchSessionParticipants(hostSession.id);
      if (liveList && liveList.length >= 0) {
        setHostParticipants(liveList);
      }
    }

    syncParticipants();
    const interval = setInterval(syncParticipants, 2000);
    return () => clearInterval(interval);
  }, [hostSession]);

  const handleHostStartQuiz = async () => {
    if (!hostSession) return;
    setHostStep("QUESTION");
    setHostCurrentQuestionIdx(0);
    const q0 = hostSession.quiz?.questions[0];
    if (q0) {
      setHostCurrentAnswers(getPlayerAnswersForQuestion(hostSession.id, q0.id));
    }

    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_HOST_SESSION,
      JSON.stringify({
        id: hostSession.id,
        pin: hostSession.pin,
        quizId: hostSession.quiz_id,
        step: "QUESTION",
        questionIndex: 0,
      })
    );

    await updateSessionStatus(hostSession.id, "QUESTION", 0);
  };

  const handleHostNextQuestion = async () => {
    if (!hostSession || !hostSession.quiz) return;
    const questionsList = hostSession.quiz.questions || [];
    const totalQs = questionsList.length;
    const nextIdx = hostCurrentQuestionIdx + 1;

    if (nextIdx < totalQs) {
      setHostCurrentQuestionIdx(nextIdx);
      const nextQ = questionsList[nextIdx];
      if (nextQ) {
        setHostCurrentAnswers(
          getPlayerAnswersForQuestion(hostSession.id, nextQ.id)
        );
      }

      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_HOST_SESSION,
        JSON.stringify({
          id: hostSession.id,
          pin: hostSession.pin,
          quizId: hostSession.quiz_id,
          step: "QUESTION",
          questionIndex: nextIdx,
        })
      );

      await updateSessionStatus(hostSession.id, "QUESTION", nextIdx);
    } else {
      setHostStep("LEADERBOARD");
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_HOST_SESSION,
        JSON.stringify({
          id: hostSession.id,
          pin: hostSession.pin,
          quizId: hostSession.quiz_id,
          step: "LEADERBOARD",
          questionIndex: hostCurrentQuestionIdx,
        })
      );
      await updateSessionStatus(hostSession.id, "FINISHED");
    }
  };

  // ==========================================
  // PLAYER ACTIONS & PERSISTENCE
  // ==========================================

  const handlePlayerJoined = (pin: string, pName: string, avatar: string) => {
    setPlayerPin(pin);
    setParticipantName(pName);
    setPlayerAvatar(avatar);
    setPlayerStep("WAITING");

    // Persist Player Session state across refreshes
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_PLAYER_SESSION,
      JSON.stringify({
        pin,
        participantName: pName,
        avatar,
        step: "WAITING",
      })
    );

    // Find local or hosted session reference
    const sessId = hostSession?.pin === pin ? hostSession.id : `sess-${pin}`;
    setPlayerRoomParticipants(getSessionParticipants(sessId));

    // Subscribe to host events (Game Start, Question Switch)
    subscribeToSession(sessId, (event: any) => {
      if (event.type === "PLAYER_JOINED") {
        setPlayerRoomParticipants([...event.participants]);
      } else if (event.type === "SESSION_UPDATED") {
        if (event.status === "QUESTION") {
          setPlayerStep("QUESTION");
          setHasAnsweredCurrent(false);
          setSelectedAnswerIdx(null);
        } else if (event.status === "FINISHED") {
          setPlayerStep("FINAL");
        }
      }
    });
  };

  const handlePlayerSubmitAnswer = async (
    answerIndex: number,
    timeTaken: number
  ) => {
    if (!hostSession || !hostSession.quiz) return;
    const currentQ = hostSession.quiz.questions[hostCurrentQuestionIdx];
    if (!currentQ) return;

    setHasAnsweredCurrent(true);
    setSelectedAnswerIdx(answerIndex);

    const isCorrect = answerIndex === currentQ.correct_option_index;
    const speedRatio = Math.max(
      0,
      (currentQ.time_limit - timeTaken) / currentQ.time_limit
    );
    const pointsEarned = isCorrect
      ? Math.round(currentQ.points * (0.5 + 0.5 * speedRatio))
      : 0;

    await submitPlayerAnswer(
      hostSession.id,
      currentQ.id,
      participantName,
      answerIndex,
      isCorrect,
      pointsEarned,
      timeTaken
    );

    const updatedParts = getSessionParticipants(hostSession.id);
    const myStats = updatedParts.find(
      (p) => p.participant_name === participantName
    );

    setLastResult({
      isCorrect,
      pointsEarned,
      totalScore: myStats?.score || 0,
      streak: myStats?.streak || 0,
      correctText: currentQ.options[currentQ.correct_option_index],
    });

    setPlayerStep("RESULT");
  };

  return (
    <div className="min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        isHostAuthenticated={isHostAuthenticated}
        onHostLogout={handleHostLogout}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* VIEW MODE 1: PLAYER (PESERTA QUIZ - PUBLIC ACCESS) */}
        {activeMode === "player" && (
          <>
            {playerStep === "JOIN" && (
              <PlayerJoin
                onJoined={handlePlayerJoined}
                onSwitchToHost={() => handleSelectMode("host")}
              />
            )}

            {playerStep === "WAITING" && (
              <PlayerWaiting
                pin={playerPin}
                participantName={participantName}
                avatar={playerAvatar}
                participants={
                  playerRoomParticipants.length > 0
                    ? playerRoomParticipants
                    : hostParticipants
                }
              />
            )}

            {playerStep === "QUESTION" && hostSession?.quiz && hostSession.quiz.questions && (
              <PlayerQuestion
                question={hostSession.quiz.questions[hostCurrentQuestionIdx] || hostSession.quiz.questions[0]}
                questionIndex={hostCurrentQuestionIdx}
                totalQuestions={(hostSession.quiz.questions || []).length}
                onSubmitAnswer={handlePlayerSubmitAnswer}
                hasAnswered={hasAnsweredCurrent}
                selectedAnswerIndex={selectedAnswerIdx}
              />
            )}

            {playerStep === "RESULT" && lastResult && (
              <PlayerResult
                isCorrect={lastResult.isCorrect}
                pointsEarned={lastResult.pointsEarned}
                totalScore={lastResult.totalScore}
                streak={lastResult.streak}
                correctAnswerText={lastResult.correctText}
              />
            )}

            {playerStep === "FINAL" && (
              <HostLeaderboard
                participants={hostParticipants}
                onPlayAgain={() => {
                  localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAYER_SESSION);
                  setPlayerStep("JOIN");
                }}
              />
            )}
          </>
        )}

        {/* VIEW MODE 2: HOST (GAME MASTER - PROTECTED) */}
        {activeMode === "host" && isHostAuthenticated && (
          <>
            {!hostSession ? (
              <QuizEditor
                onQuizCreated={(quiz) => handleSelectQuizToHost(quiz.id)}
                onSelectExistingQuiz={handleSelectQuizToHost}
                existingQuizzes={quizzes}
              />
            ) : (
              <>
                {hostStep === "LOBBY" && (
                  <HostLobby
                    pin={hostSession.pin}
                    quiz={hostSession.quiz || quizzes[0]}
                    participants={hostParticipants}
                    onStartQuiz={handleHostStartQuiz}
                  />
                )}

                {hostStep === "QUESTION" && hostSession.quiz && hostSession.quiz.questions && (
                  <HostQuestion
                    question={
                      hostSession.quiz.questions[hostCurrentQuestionIdx] || hostSession.quiz.questions[0]
                    }
                    questionIndex={hostCurrentQuestionIdx}
                    totalQuestions={(hostSession.quiz.questions || []).length}
                    answers={hostCurrentAnswers}
                    totalPlayers={hostParticipants.length}
                    onNextStep={handleHostNextQuestion}
                  />
                )}

                {hostStep === "LEADERBOARD" && (
                  <HostLeaderboard
                    participants={hostParticipants}
                    onPlayAgain={() => {
                      localStorage.removeItem(STORAGE_KEYS.ACTIVE_HOST_SESSION);
                      setHostSession(null);
                      setHostStep("LOBBY");
                    }}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* VIEW MODE 3: QUIZ EDITOR (PROTECTED) */}
        {activeMode === "editor" && isHostAuthenticated && (
          <QuizEditor
            onQuizCreated={(quiz) => {
              setQuizzes((prev) => [quiz, ...prev]);
              handleSelectQuizToHost(quiz.id);
            }}
            onSelectExistingQuiz={handleSelectQuizToHost}
            existingQuizzes={quizzes}
          />
        )}
      </main>

      {/* Host Authentication Modal Guard */}
      <HostAuthModal
        isOpen={showHostAuthModal}
        onClose={() => {
          setShowHostAuthModal(false);
          setPendingMode(null);
        }}
        onSuccess={handleHostAuthSuccess}
      />

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-purple-300/60 border-t border-white/5">
        QCPP Quiz App • 2026
      </footer>
    </div>
  );
};

export default App;
