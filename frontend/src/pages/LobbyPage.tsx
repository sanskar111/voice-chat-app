import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import RoomCard from '../components/RoomCard';
import { useNavigate } from 'react-router-dom';

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

const LobbyPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get('/rooms');
            // Ensure we handle both array and { rooms: [] } shapes if backend changes
            const data = Array.isArray(response.data) ? response.data : response.data.rooms || [];
            setRooms(data);
            setError('');
        } catch (err) {
            setError('Failed to load rooms');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        const title = prompt('Room Title:');
        if (!title) return;
        const topic = prompt('Topic (optional):');

        try {
            const response = await axios.post('/rooms', {
                title,
                topic,
                visibility: 'PUBLIC'
            });
            navigate(`/room/${response.data.id}`);
        } catch (err: any) {
            console.error('Create room error:', err);
            alert(`Failed to create room: ${err.response?.data?.error || err.message}`);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold">Live Rooms</h1>
                    <p className="text-gray-500">Jump into what’s happening right now.</p>
                </div>
                <button
                    onClick={handleCreateRoom}
                    className="bg-primary text-secondary px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/50 transition-all transform hover:-translate-y-1"
                >
                    + Start a Room
                </button>
            </div>

            {/* Filters (Mock for now) */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {['All', 'Chill', 'Tech', 'Music', 'Debate', 'Language'].map((tag) => (
                    <button key={tag} className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
                        {tag}
                    </button>
                ))}
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {rooms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="text-4xl mb-4">😴</div>
                    <h3 className="text-xl font-bold mb-2">No rooms yet</h3>
                    <p className="text-gray-500 mb-6">Be the first to start something!</p>
                    <button
                        onClick={handleCreateRoom}
                        className="text-primary font-bold hover:underline"
                    >
                        Create a Room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LobbyPage;
