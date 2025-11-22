import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [socket, setSocket] = useState<Socket | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            // In production, pass token in auth handshake
            const newSocket = io(SOCKET_URL, {
                path: '/socket.io',
                // auth: { token } 
            });
            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};
