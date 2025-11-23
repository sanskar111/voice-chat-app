import React from 'react';
import { Link } from 'react-router-dom';

interface Room {
    id: string;
    title: string;
    topic?: string;
    language?: string;
    participantCount: number;
    owner?: {
        username: string;
        avatar?: string;
    };
    status: string;
}

interface RoomCardProps {
    room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{room.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        {room.topic && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {room.topic}
                            </span>
                        )}
                        {room.language && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {room.language}
                            </span>
                        )}
                    </div>
                </div>
                {room.status === 'LIVE' && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                        LIVE
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                    <img
                        src={room.owner?.avatar || `https://ui-avatars.com/api/?name=${room.owner?.username || 'User'}`}
                        alt="Host"
                        className="w-8 h-8 rounded-full border border-gray-100"
                    />
                    <span className="text-sm text-gray-500 truncate max-w-[100px]">
                        {room.owner?.username}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <span>👥</span>
                    <span>{room.participantCount}</span>
                </div>
            </div>

            <Link
                to={`/room/${room.id}`}
                className="mt-4 block w-full py-2.5 text-center rounded-xl bg-gray-50 text-gray-900 font-semibold text-sm group-hover:bg-primary group-hover:text-secondary transition-colors"
            >
                Join Room
            </Link>
        </div>
    );
};

export default RoomCard;
