import { create } from "zustand";
import type {
  InterviewMode,
  InterviewQuestion,
  ChatMessage,
} from "../services/user/interviewService";

export interface PreviousQuestion {
  question: InterviewQuestion;
  messages: ChatMessage[]; // For interactive mode
  userAnswer: string; // For stress mode
}

interface InterviewState {
  // Current interview
  interviewId: number | null;
  interviewMode: InterviewMode | null;
  interviewTitle: string;

  // Current question state
  currentQuestion: InterviewQuestion | null;
  isComplete: boolean;
  messages: ChatMessage[];
  isAnswering: boolean;

  // Previous questions (in-memory only, lost on reload)
  previousQuestions: PreviousQuestion[];
  viewingPreviousIndex: number | null; // null = viewing current question

  // Actions
  setInterview: (id: number, mode: InterviewMode, title: string) => void;
  setCurrentQuestion: (question: InterviewQuestion) => void;
  setIsComplete: (complete: boolean) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsAnswering: (answering: boolean) => void;

  // Save current question to history before moving to next
  saveCurrentToHistory: (userAnswer: string) => void;

  // Navigate previous questions (read-only)
  viewPrevious: (index: number) => void;
  viewCurrent: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  interviewId: null,
  interviewMode: null,
  interviewTitle: "",
  currentQuestion: null,
  isComplete: false,
  messages: [],
  isAnswering: false,
  previousQuestions: [],
  viewingPreviousIndex: null,
};

const useInterviewStore = create<InterviewState>((set, get) => ({
  ...initialState,

  setInterview: (id, mode, title) =>
    set({ interviewId: id, interviewMode: mode, interviewTitle: title }),

  setCurrentQuestion: (question) =>
    set({
      currentQuestion: question,
      isComplete: false,
      messages: [],
      viewingPreviousIndex: null,
    }),

  setIsComplete: (complete) => set({ isComplete: complete }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setIsAnswering: (answering) => set({ isAnswering: answering }),

  saveCurrentToHistory: (userAnswer) => {
    const { currentQuestion, messages } = get();
    if (!currentQuestion) return;

    set((state) => ({
      previousQuestions: [
        ...state.previousQuestions,
        {
          question: currentQuestion,
          messages: [...messages],
          userAnswer,
        },
      ],
    }));
  },

  viewPrevious: (index) => set({ viewingPreviousIndex: index }),
  viewCurrent: () => set({ viewingPreviousIndex: null }),

  reset: () => set(initialState),
}));

export default useInterviewStore;
