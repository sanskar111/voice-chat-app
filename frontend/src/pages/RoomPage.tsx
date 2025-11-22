import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import ChatBox from '../components/ChatBox';
import AudioControls from '../components/AudioControls';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAudioAnalysis } from '../hooks/useAudioAnalysis';
import { XCircle } from 'lucide-react';

const Avatar: React.FC<{ name: string, isSpeaking: boolean, onKick?: () => void, canKick: boolean }> = ({ name, isSpeaking, onKick, canKick }) => (
    <div className="relative group">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold border-4 shadow-lg transition-all duration-200 ${isSpeaking ? 'border-green-500 scale-105' : 'border-gray-700'}`} style={{ backgroundColor: stringToColor(name) }}>
            {name.substring(0, 2).toUpperCase()}
        </div>
        <div className="text-center mt-2 text-sm font-medium truncate w-20">{name}</div>
        {canKick && onKick && (
            <button
                onClick={onKick}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Kick User"
            >
                <XCircle size={16} />
            </button>
        )}
    </div>
);

// Helper to generate consistent colors
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const RoomPage: React.FC = () => {
    const { id: roomId } = useParams();
    const { socket } = useSocket();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [messages, setMessages] = useState<any[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [hostId, setHostId] = useState<string | null>(null); // Ideally fetch from API

    // WebRTC Hook
    const { remoteStreams, toggleMute } = useWebRTC(socket, roomId, user?.id);

    // Local Audio Analysis (Mocking stream for local user for now, or use actual localStream from hook if exposed)
    // For simplicity in this MVP, we won't visualize local user speaking without exposing localStream from useWebRTC

    useEffect(() => {
        if (!socket || !user || !roomId) return;

        // Chat Listeners
        socket.on('chat:message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('room:user-joined', ({ userId }) => {
            setMessages(prev => [...prev, { sender: 'System', content: `User ${userId} joined` }]);
        });

        socket.on('room:user-left', ({ userId }) => {
            setMessages(prev => [...prev, { sender: 'System', content: `User ${userId} left` }]);
        });

        socket.on('room:user-kicked', ({ userId }) => {
            if (userId === user.id) {
                alert('You have been kicked from the room.');
                navigate('/');
            } else {
                setMessages(prev => [...prev, { sender: 'System', content: `User ${userId} was kicked` }]);
            }
        });

        return () => {
            socket.emit('room:leave', roomId, user.id);
            socket.off('chat:message');
            socket.off('room:user-joined');
            socket.off('room:user-left');
            socket.off('room:user-kicked');
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

    const handleKick = (targetUserId: string) => {
        if (socket && roomId && user) {
            socket.emit('room:kick', roomId, targetUserId, user.id);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
            <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-6 relative overflow-hidden flex flex-col">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Room: {roomId}</h2>
                        <p className="text-gray-400">Voice Connected (Mesh P2P)</p>
                    </div>

                    <div className="flex gap-8 justify-center flex-wrap content-start overflow-y-auto p-4">
                        {/* Me */}
                        <Avatar name={user?.username || 'Me'} isSpeaking={false} canKick={false} />

                        {/* Remote Peers */}
                        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
                            <RemotePeer key={socketId} socketId={socketId} stream={stream} onKick={() => handleKick(socketId)} canKick={true} /> // Assuming everyone can kick for MVP demo, or check hostId
                        ))}
                    </div>
                </div>
                <AudioControls isMuted={isMuted} onToggleMute={handleToggleMute} onLeave={leaveRoom} />
            </div>

            <div className="lg:col-span-1 h-full min-h-[300px]">
                <ChatBox messages={messages} onSendMessage={sendMessage} />
            </div>
        </div>
    );
};

const RemotePeer: React.FC<{ socketId: string, stream: MediaStream, onKick: () => void, canKick: boolean }> = ({ socketId, stream, onKick, canKick }) => {
    const isSpeaking = useAudioAnalysis(stream);
    return (
        <div className="relative">
            <Avatar name={`User ${socketId.substr(0, 4)}`} isSpeaking={isSpeaking} onKick={onKick} canKick={canKick} />
            <audio
                autoPlay
                ref={audio => {
                    if (audio) audio.srcObject = stream;
                }}
            />
        </div>
    );
};

export default RoomPage;
