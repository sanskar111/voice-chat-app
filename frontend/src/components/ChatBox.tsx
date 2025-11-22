import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
    id?: string;
    sender: string;
    content: string;
    timestamp?: string;
}

interface ChatBoxProps {
    messages: Message[];
    onSendMessage: (msg: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-750 border-b border-gray-700 font-semibold">
                Room Chat
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                    <div key={idx} className="flex flex-col">
                        <span className="text-xs text-gray-400 mb-1">{msg.sender}</span>
                        <div className="bg-gray-700 p-2 rounded-lg self-start max-w-[80%] break-words">
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-primary"
                />
                <button
                    type="submit"
                    className="bg-primary hover:bg-blue-600 p-2 rounded text-white transition"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
