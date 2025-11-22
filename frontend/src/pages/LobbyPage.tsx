import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import RoomCard from '../components/RoomCard';
import { Plus } from 'lucide-react';

interface Room {
    id: string;
    name: string;
    topic: string;
    language: string;
    _count: { participants: number };
}

const LobbyPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newRoom, setNewRoom] = useState({ name: '', topic: '', language: 'English' });
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const res = await axios.post('/api/rooms', { ...newRoom, hostId: user.id });
            setShowCreate(false);
            navigate(`/room/${res.data.id}`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoin = (id: string) => {
        navigate(`/room/${id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Lobby</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-secondary hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 transition"
                >
                    <Plus size={20} /> Create Room
                </button>
            </div>

            {showCreate && (
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">Create New Room</h3>
                    <form onSubmit={handleCreateRoom} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            placeholder="Room Name"
                            value={newRoom.name}
                            onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                            className="bg-gray-900 border border-gray-600 rounded p-2"
                            required
                        />
                        <input
                            placeholder="Topic"
                            value={newRoom.topic}
                            onChange={e => setNewRoom({ ...newRoom, topic: e.target.value })}
                            className="bg-gray-900 border border-gray-600 rounded p-2"
                        />
                        <select
                            value={newRoom.language}
                            onChange={e => setNewRoom({ ...newRoom, language: e.target.value })}
                            className="bg-gray-900 border border-gray-600 rounded p-2"
                        >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Japanese</option>
                        </select>
                        <button type="submit" className="bg-primary hover:bg-blue-600 text-white p-2 rounded md:col-span-3 mt-2">
                            Launch Room
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <RoomCard
                        key={room.id}
                        id={room.id}
                        name={room.name}
                        topic={room.topic}
                        language={room.language}
                        participantCount={room._count?.participants || 0}
                        onJoin={handleJoin}
                    />
                ))}
            </div>
        </div>
    );
};

export default LobbyPage;
