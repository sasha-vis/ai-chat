"use client";

import { ChatWindow } from "@/src/shared/ui";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    {
      question: string;
      answer: string | null;
      isLoading?: boolean;
    }[]
  >([]);

  const handleSendMessageToAi = async () => {
    if (!text) return;

    setChatHistory((prev) => [
      ...prev,
      {
        question: text,
        answer: null,
        isLoading: true,
      },
    ]);

    try {
      const response = await fetch("/api/send-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      setChatHistory((prev) => {
        const newHistory = [...prev];

        const lastIndex = newHistory.findIndex((item) => item.isLoading);
        if (lastIndex !== -1) {
          newHistory[lastIndex] = {
            question: text,
            answer: data.message,
            isLoading: false,
          };
        }
        return newHistory;
      });
    } catch (error) {
      setChatHistory((prev) => {
        const newHistory = [...prev];
        const lastIndex = newHistory.findIndex((item) => item.isLoading);
        if (lastIndex !== -1) {
          newHistory[lastIndex] = {
            question: text,
            answer: "Error while getting response",
            isLoading: false,
          };
        }
        return newHistory;
      });
    }

    setText("");
  };

  const handleClearHistory = () => {
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <div className="max-w-4xl py-20 mx-auto text-white px-4">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/ai.png"
            alt=""
            width={120}
            height={100}
            className="w-12 h-auto sm:w-20 md:w-28 lg:w-32 xl:w-[120px]"
          />
        </div>
        <div className="flex flex-col gap-4">
          <textarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            className="border-white/50 outline-none text-xl p-4 resize-none w-full h-40 transition-all duration-300 focus:border-white border rounded-md"
            placeholder="Write your question..."
          />
          <div className="flex gap-4 items-center w-full">
            <button
              disabled={!text}
              onClick={handleSendMessageToAi}
              className="border border-white/50 flex-1 cursor-pointer hover:border-white transition-all rounded-sm h-12 bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            <button
              onClick={handleClearHistory}
              className="border border-white/50 flex-1 cursor-pointer hover:border-white transition-all rounded-sm h-12 bg-black text-white"
            >
              Clear chat history
            </button>
          </div>
          <h2 className="text-center font-semibold text-2xl">Chat history</h2>
          {chatHistory.length ? (
            chatHistory.map(({ question, answer, isLoading }, index) => (
              <ChatWindow
                key={index}
                question={question}
                answer={answer}
                isLoading={isLoading}
              />
            ))
          ) : (
            <div className="text-center text-white/50">
              Your chat history is empty. Please, write at least 1 question
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
