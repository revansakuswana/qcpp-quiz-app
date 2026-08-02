import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
  fetchPlayerAnswersForQuestion,
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

  // Question Timer Timestamp Sync
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());

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
  const [playerSessionId, setPlayerSessionId] = useState<string>("");
  const [playerQuiz, setPlayerQuiz] = useState<Quiz | null>(null);
  const [playerQuestionIdx, setPlayerQuestionIdx] = useState<number>(0);
  const [playerForceTimeUp, setPlayerForceTimeUp] = useState<boolean>(false);
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

  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Load Initial Quizzes & Restore Active Sessions on Refresh
  useEffect(() => {
    async function initApp() {
      try {
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
                setPlayerSessionId(validSession.id);
                if (validSession.quiz) setPlayerQuiz(validSession.quiz);
                setPlayerQuestionIdx(validSession.current_question_index || 0);
                setPlayerStep(parsed.step || "WAITING");

                const parts = await fetchSessionParticipants(validSession.id);
                setPlayerRoomParticipants(parts);
              }
            }
          } catch {
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAYER_SESSION);
          }
        }
      } finally {
        setIsInitializing(false);
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

  // 1.5-Second Live Polling for Host Question Answers Collected
  useEffect(() => {
    if (activeMode !== "host" || hostStep !== "QUESTION" || !hostSession || !hostSession.quiz) return;

    const currentQ = hostSession.quiz.questions[hostCurrentQuestionIdx];
    if (!currentQ) return;

    async function syncAnswers() {
      const answersList = await fetchPlayerAnswersForQuestion(hostSession!.id, currentQ.id);
      if (answersList) {
        setHostCurrentAnswers(answersList);
      }
    }

    syncAnswers();
    const interval = setInterval(syncAnswers, 1500);
    return () => clearInterval(interval);
  }, [activeMode, hostStep, hostSession, hostCurrentQuestionIdx]);

  const handleHostStartQuiz = async () => {
    if (!hostSession) return;
    const now = Date.now();
    setQuestionStartedAt(now);
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
        startedAt: now,
      })
    );

    await updateSessionStatus(hostSession.id, "QUESTION", 0, now);
  };

  const handleHostNextQuestion = async () => {
    if (!hostSession || !hostSession.quiz) return;
    const now = Date.now();
    setQuestionStartedAt(now);
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
          startedAt: now,
        })
      );

      await updateSessionStatus(hostSession.id, "QUESTION", nextIdx, now);
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
      await updateSessionStatus(hostSession.id, "FINISHED", nextIdx, now);
    }
  };

  const handleHostSkipTimer = async () => {
    if (!hostSession) return;
    const pastTime = Date.now() - 100000;
    setQuestionStartedAt(pastTime);
    await updateSessionStatus(
      hostSession.id,
      "SHOW_RESULT",
      hostCurrentQuestionIdx,
      pastTime
    );
  };

  // ==========================================
  // PLAYER ACTIONS & LIVE GAME STATUS SYNC
  // ==========================================

  const handlePlayerJoined = async (pin: string, pName: string, avatar: string, sessionId?: string) => {
    setPlayerPin(pin);
    setParticipantName(pName);
    setPlayerAvatar(avatar);
    setPlayerStep("WAITING");

    let realSessId = sessionId;
    if (!realSessId) {
      const sess = await verifyGameSessionPin(pin);
      if (sess) {
        realSessId = sess.id;
        if (sess.quiz) setPlayerQuiz(sess.quiz);
      }
    }
    if (!realSessId) {
      realSessId = hostSession?.pin === pin ? hostSession.id : `sess-${pin}`;
    }

    setPlayerSessionId(realSessId);

    // Fetch initial room participants directly from Supabase Cloud
    const initialParts = await fetchSessionParticipants(realSessId);
    if (initialParts && initialParts.length > 0) {
      setPlayerRoomParticipants(initialParts);
    } else {
      setPlayerRoomParticipants(getSessionParticipants(realSessId));
    }

    // Persist Player Session state across refreshes
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_PLAYER_SESSION,
      JSON.stringify({
        pin,
        participantName: pName,
        avatar,
        sessionId: realSessId,
        step: "WAITING",
      })
    );

    // Subscribe to real-time events on the REAL Supabase Session UUID!
    subscribeToSession(realSessId, (event: any) => {
      if (event.type === "PLAYER_JOINED") {
        if (event.participants && event.participants.length > 0) {
          setPlayerRoomParticipants([...event.participants]);
        }
      } else if (event.type === "SESSION_UPDATED") {
        if (event.status === "QUESTION") {
          setPlayerStep("QUESTION");
          setPlayerQuestionIdx(event.questionIndex || 0);
          setHasAnsweredCurrent(false);
          setSelectedAnswerIdx(null);
        } else if (event.status === "FINISHED") {
          setPlayerStep("FINAL");
        }
      }
    });
  };

  // 1.5-Second Live Polling for Player Game Session Status (Game Start & Question Switch)
  useEffect(() => {
    if (activeMode !== "player" || playerStep === "JOIN" || !playerPin) return;

    async function pollGameStatus() {
      const liveSess = await verifyGameSessionPin(playerPin);
      if (!liveSess) return;

      if (liveSess.quiz) {
        setPlayerQuiz(liveSess.quiz);
      }

      if (liveSess.question_started_at) {
        setQuestionStartedAt(liveSess.question_started_at);
      }

      const remoteQIdx = liveSess.current_question_index || 0;

      if (liveSess.status === "QUESTION") {
        setPlayerForceTimeUp(false);
        if (playerStep !== "QUESTION" || playerQuestionIdx !== remoteQIdx) {
          setPlayerStep("QUESTION");
          setPlayerQuestionIdx(remoteQIdx);
          setHasAnsweredCurrent(false);
          setSelectedAnswerIdx(null);
        }
      } else if (liveSess.status === "SHOW_RESULT") {
        setPlayerForceTimeUp(true);
      } else if (liveSess.status === "FINISHED" && playerStep !== "FINAL") {
        setPlayerStep("FINAL");
      }

      // Live sync player scores and room participants from Supabase Cloud
      const updatedParts = await fetchSessionParticipants(liveSess.id, playerPin);
      if (updatedParts && updatedParts.length > 0) {
        setPlayerRoomParticipants(updatedParts);
        const myStats = updatedParts.find((p) => p.participant_name === participantName);
        if (myStats) {
          setLastResult((prev) =>
            prev ? { ...prev, totalScore: myStats.score, streak: myStats.streak } : prev
          );
        }
      }
    }

    pollGameStatus();
    const interval = setInterval(pollGameStatus, 1500);
    return () => clearInterval(interval);
  }, [activeMode, playerStep, playerPin, playerQuestionIdx, participantName]);

  const handlePlayerSubmitAnswer = async (
    answerIndex: number,
    timeTaken: number
  ) => {
    const activeQuiz = playerQuiz || hostSession?.quiz || quizzes[0];
    const activeQIdx = playerQuestionIdx;
    if (!activeQuiz || !activeQuiz.questions || activeQuiz.questions.length === 0) return;

    const currentQ = activeQuiz.questions[activeQIdx] || activeQuiz.questions[0];
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

    const activeSessId = playerSessionId || hostSession?.id;
    if (activeSessId) {
      await submitPlayerAnswer(
        activeSessId,
        currentQ.id,
        participantName,
        answerIndex,
        isCorrect,
        pointsEarned,
        timeTaken
      );

      const updatedParts = await fetchSessionParticipants(activeSessId, playerPin);
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
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#1a054a] flex flex-col items-center justify-center p-4 text-white font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="relative flex flex-col items-center space-y-6 max-w-sm w-full text-center">
          {/* Animated Glowing Ring & Logo */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-kahoot-red via-kahoot-blue to-kahoot-yellow rounded-full blur-lg opacity-75 animate-pulse" />
            <div className="relative bg-[#240a5e] border-2 border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl flex items-center justify-center space-x-2">
              <span className="text-3xl sm:text-4xl font-black font-['Fredoka',sans-serif] bg-gradient-to-r from-kahoot-yellow to-amber-300 bg-clip-text text-transparent">
                QCPP
              </span>
              <span className="px-2.5 py-1 bg-kahoot-red text-white font-extrabold text-xs sm:text-sm rounded-md shadow">
                Quiz
              </span>
            </div>
          </div>

          {/* Spinner and Loading Text */}
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-9 h-9 text-kahoot-yellow animate-spin" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Memuat Kuis & Sinkronisasi Room...</h3>
              <p className="text-xs text-purple-200/70">Mohon tunggu sebentar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentActiveQuiz = playerQuiz || hostSession?.quiz || quizzes[0];

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

            {playerStep === "QUESTION" && currentActiveQuiz && currentActiveQuiz.questions && (
              <PlayerQuestion
                question={
                  currentActiveQuiz.questions[playerQuestionIdx] ||
                  currentActiveQuiz.questions[0]
                }
                questionIndex={playerQuestionIdx}
                totalQuestions={(currentActiveQuiz.questions || []).length}
                forceTimeUp={playerForceTimeUp}
                onSubmitAnswer={handlePlayerSubmitAnswer}
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
                participants={playerRoomParticipants.length > 0 ? playerRoomParticipants : hostParticipants}
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
                    questionStartedAt={questionStartedAt}
                    answers={hostCurrentAnswers}
                    totalPlayers={hostParticipants.length}
                    onNextStep={handleHostNextQuestion}
                    onSkipTimer={handleHostSkipTimer}
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
