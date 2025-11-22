import React from 'react';
import { Users, MessageSquare } from 'lucide-react';

interface RoomProps {
    id: string;
    name: string;
    topic?: string;
    language?: string;
    participantCount?: number;
    onJoin: (id: string) => void;
}

const RoomCard: React.FC<RoomProps> = ({ id, name, topic, language, participantCount = 0, onJoin }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-primary transition shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">{name}</h3>
                    <p className="text-sm text-gray-400">{topic || 'No topic'}</p>
                </div>
                {language && (
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 uppercase">
                        {language}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1"><Users size={16} /> {participantCount}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={16} /> Chat</span>
                </div>
                <button
                    onClick={() => onJoin(id)}
                    className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md transition font-medium"
                >
                    Join Room
                </button>
            </div>
        </div>
    );
};

export default RoomCard;
