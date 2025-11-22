import React from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

interface AudioControlsProps {
    isMuted: boolean;
    onToggleMute: () => void;
    onLeave: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ isMuted, onToggleMute, onLeave }) => {
    return (
        <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700 justify-center">
            <button
                onClick={onToggleMute}
                className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
                onClick={onLeave}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
                title="Leave Room"
            >
                <PhoneOff size={24} />
            </button>
        </div>
    );
};

export default AudioControls;
