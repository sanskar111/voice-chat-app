import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import ChatBox from '../components/ChatBox';
import { useWebRTC } from '../hooks/useWebRTC';
import axios from '../config/axios';
import { Mic, MicOff, Hand, MessageSquare, ShieldAlert } from 'lucide-react';

interface Participant {
    userId: string;
    username: string;
    avatar?: string;
    role: 'OWNER' | 'CO_OWNER' | 'MEMBER';
    status: 'SPEAKER' | 'LISTENER';
    wantsToSpeak: boolean;
    socketId?: string; // Optional, might not know for all
}

const RoomPage: React.FC = () => {
    const { id: roomId } = useParams();
    const { socket } = useSocket();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState<any>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [showChat, setShowChat] = useState(false); // Mobile toggle

    // WebRTC Hook
    const { remoteStreams, toggleMute } = useWebRTC(socket, roomId, user?.id);

    useEffect(() => {
        if (!roomId) return;
        fetchRoomDetails();
    }, [roomId]);

    const fetchRoomDetails = async () => {
        try {
            const res = await axios.get(`/rooms/${roomId}`);
            setRoom(res.data);
            // Transform API participants to local state
            const parts = res.data.participants.map((p: any) => ({
                userId: p.user.id,
                username: p.user.username,
                avatar: p.user.avatar,
                role: p.role,
                status: p.status,
                wantsToSpeak: p.wantsToSpeak
            }));
            setParticipants(parts);
        } catch (err) {
            console.error(err);
            // navigate('/'); // Redirect if not found?
        }
    };

    useEffect(() => {
        if (!socket || !user || !roomId) return;

        // --- Socket Listeners ---

        socket.on('room:user-joined', () => {
            // We might need to fetch user details if we don't have them.
            // For now, add a placeholder or fetch.
            // Let's assume we re-fetch room details to be safe or just add if we can.
            // Ideally backend sends full user object.
            fetchRoomDetails();
            setMessages(prev => [...prev, { sender: 'System', content: `User joined` }]);
        });

        socket.on('room:user-left', ({ userId }) => {
            setParticipants(prev => prev.filter(p => p.userId !== userId));
            setMessages(prev => [...prev, { sender: 'System', content: `User left` }]);
        });

        socket.on('room:user-kicked', ({ userId }) => {
            if (userId === user.id) {
                alert('You have been kicked from the room.');
                navigate('/');
            } else {
                setParticipants(prev => prev.filter(p => p.userId !== userId));
                setMessages(prev => [...prev, { sender: 'System', content: `User was kicked` }]);
            }
        });

        socket.on('room:role-updated', ({ userId, status }) => {
            setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, status } : p));
        });

        socket.on('room:hand-raised', ({ userId }) => {
            setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, wantsToSpeak: true } : p));
        });

        socket.on('chat:message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.emit('room:leave', roomId, user.id);
            socket.off('room:user-joined');
            socket.off('room:user-left');
            socket.off('room:user-kicked');
            socket.off('room:role-updated');
            socket.off('room:hand-raised');
            socket.off('chat:message');
        };
    }, [socket, roomId, user]);

    const sendMessage = (content: string) => {
        if (socket && roomId && user) {
            const msg = { sender: user.username, content };
            socket.emit('chat:message', roomId, msg);
        }
    };

    const handleToggleMute = () => {
        const muted = toggleMute();
        setIsMuted(muted);
    };

    const leaveRoom = () => {
        navigate('/');
    };

    // Moderation Actions
    const handleKick = (targetUserId: string) => {
        if (socket && roomId && user) {
            socket.emit('room:kick', roomId, targetUserId, user.id);
        }
    };

    const handlePromoteSpeaker = (targetUserId: string) => {
        if (socket && roomId && user) {
            socket.emit('room:grant-speaker', roomId, targetUserId, user.id);
        }
    };

    const handleMoveToAudience = (targetUserId: string) => {
        if (socket && roomId && user) {
            socket.emit('room:revoke-speaker', roomId, targetUserId, user.id);
        }
    };

    const handleRaiseHand = () => {
        if (socket && roomId && user) {
            socket.emit('room:raise-hand', roomId, user.id);
        }
    };

    // Derived State
    const speakers = participants.filter(p => p.status === 'SPEAKER');
    const listeners = participants.filter(p => p.status === 'LISTENER');
    const me = participants.find(p => p.userId === user?.id);
    const amIOwner = me?.role === 'OWNER' || me?.role === 'CO_OWNER';

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Main Room Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-heading font-bold">{room?.title || 'Loading...'}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {room?.topic && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{room.topic}</span>}
                            <span>{participants.length} online</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="lg:hidden p-2 rounded-full bg-gray-100"
                        >
                            <MessageSquare size={20} />
                        </button>
                        <button
                            onClick={leaveRoom}
                            className="bg-red-50 text-red-500 px-4 py-2 rounded-full font-bold text-sm hover:bg-red-100 transition"
                        >
                            Leave Quietly ✌️
                        </button>
                    </div>
                </div>

                {/* Stage (Speakers) */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-6 mb-6 overflow-y-auto shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Stage</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
                        {speakers.map(speaker => (
                            <div key={speaker.userId} className="flex flex-col items-center group relative">
                                <div className="relative">
                                    <img
                                        src={speaker.avatar || `https://ui-avatars.com/api/?name=${speaker.username}`}
                                        alt={speaker.username}
                                        className={`w-20 h-20 rounded-full object-cover border-4 ${false ? 'border-primary' : 'border-transparent'}`} // TODO: isSpeaking check
                                    />
                                    {speaker.role === 'OWNER' && (
                                        <span className="absolute -bottom-1 -right-1 bg-primary text-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                            HOST
                                        </span>
                                    )}
                                </div>
                                <span className="mt-2 font-bold text-sm truncate max-w-full">{speaker.username}</span>

                                {/* Mod Controls Overlay */}
                                {amIOwner && speaker.userId !== user?.id && (
                                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                        <button onClick={() => handleMoveToAudience(speaker.userId)} className="bg-gray-900 text-white p-1 rounded-full" title="Move to Audience"><MicOff size={12} /></button>
                                        <button onClick={() => handleKick(speaker.userId)} className="bg-red-500 text-white p-1 rounded-full" title="Kick"><ShieldAlert size={12} /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audience (Listeners) */}
                <div className="bg-gray-50 rounded-3xl p-6 overflow-y-auto h-1/3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Audience</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                        {listeners.map(listener => (
                            <div key={listener.userId} className="flex flex-col items-center group relative">
                                <div className="relative">
                                    <img
                                        src={listener.avatar || `https://ui-avatars.com/api/?name=${listener.username}`}
                                        alt={listener.username}
                                        className="w-12 h-12 rounded-full object-cover opacity-80"
                                    />
                                    {listener.wantsToSpeak && (
                                        <span className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm animate-bounce">
                                            ✋
                                        </span>
                                    )}
                                </div>
                                <span className="mt-1 text-xs text-gray-500 truncate max-w-full">{listener.username}</span>

                                {/* Mod Controls */}
                                {amIOwner && (
                                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                        <button onClick={() => handlePromoteSpeaker(listener.userId)} className="bg-primary text-secondary p-1 rounded-full" title="Invite to Speak"><Mic size={12} /></button>
                                        <button onClick={() => handleKick(listener.userId)} className="bg-red-500 text-white p-1 rounded-full" title="Kick"><ShieldAlert size={12} /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={handleToggleMute}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-100 text-red-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                    </button>
                    <button
                        onClick={handleRaiseHand}
                        className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                        title="Raise Hand"
                    >
                        <Hand />
                    </button>
                </div>
            </div>

            {/* Chat Sidebar (Desktop) */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:transform-none lg:shadow-none lg:w-80 lg:block border-l border-gray-100 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center lg:hidden">
                        <h3 className="font-bold">Chat</h3>
                        <button onClick={() => setShowChat(false)}>✕</button>
                    </div>
                    <ChatBox messages={messages} onSendMessage={sendMessage} />
                </div>
            </div>

            {/* Audio Elements for Remote Streams */}
            {Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
                <AudioPlayer key={socketId} stream={stream} />
            ))}
        </div>
    );
};

const AudioPlayer: React.FC<{ stream: MediaStream }> = ({ stream }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.srcObject = stream;
        }
    }, [stream]);
    return <audio ref={audioRef} autoPlay />;
};

export default RoomPage;
