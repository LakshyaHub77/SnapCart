"use client";

import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import { Bot, Send, Sparkles, User as UserIcon, X, MessageCircle } from 'lucide-react'

function OrderChatBot() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chatLog, setChatLog] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [chatLog, loading])

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage = { role: "user", content: message }
    setChatLog((prev) => [...prev, userMessage])
    setMessage("")
    setLoading(true)

    try {
      const { data } = await axios.post("/api/ai",{message},{withCredentials: true})
      setChatLog((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (error) {
      console.log(error)
      setChatLog((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className='fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform'
        >
          <MessageCircle className='w-6 h-6' />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className='fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[560px] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-gray-200 bg-white'>

          {/* Header */}
          <div className='flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center'>
                <Sparkles className='w-5 h-5' />
              </div>
              <div>
                <p className='font-semibold text-sm leading-tight'>Grocery Assistant</p>
                <p className='text-xs text-white/80 leading-tight'>Order Support Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className='w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className='flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 bg-gradient-to-b from-gray-50 to-white'
          >
            {chatLog.length === 0 && (
              <div className='flex flex-col items-center justify-center text-center gap-2 h-full text-gray-400 px-6'>
                <div className='w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-2'>
                  <Bot className='w-7 h-7 text-green-600' />
                </div>
                <p className='text-sm font-medium text-gray-600'>Hi! I'm Jarvis 👋</p>
                <p className='text-xs text-gray-400'>
                  Ask me about your orders — status, items, delivery, anything.
                </p>
              </div>
            )}

            {chatLog.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "flex-row-reverse self-end" : "flex-row self-start"
                } max-w-[85%]`}
              >
        
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-gray-800" : "bg-green-100"
                  }`}
                >
                  {msg.role === "user" ? (
                    <UserIcon className='w-4 h-4 text-white' />
                  ) : (
                    <Bot className='w-4 h-4 text-green-600' />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className='prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-gray-900 prose-headings:my-1'>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && ( 
              <div className='flex items-end gap-2 self-start max-w-[85%]'>
                <div className='w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0'>
                  <Bot className='w-4 h-4 text-green-600' />
                </div>
                <div className='px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-md flex gap-1 items-center'>
                  <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]' />
                  <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]' />
                  <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce' />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className='flex items-center gap-2 p-3 border-t border-gray-100 bg-white'>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your order..."
              className='flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all'
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className='w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all'
            >
              <Send className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default OrderChatBot