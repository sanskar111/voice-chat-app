import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

export const useWebRTC = (socket: Socket | null, roomId: string | undefined, userId: string | undefined) => {
    const [, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map()); // Ref for mutable access in callbacks

    useEffect(() => {
        if (!socket || !roomId || !userId) return;

        const initLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                localStreamRef.current = stream;
            } catch (err) {
                console.error('Error accessing microphone:', err);
            }
        };

        initLocalStream().then(() => {
            socket.emit('room:join', roomId, userId);
        });

        const createPeer = (targetSocketId: string, initiator: boolean) => {
            const peer = new RTCPeerConnection(STUN_SERVERS);

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => peer.addTrack(track, localStreamRef.current!));
            }

            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('webrtc:ice-candidate', { targetSocketId, candidate: event.candidate });
                }
            };

            peer.ontrack = (event) => {
                setRemoteStreams((prev: Map<string, MediaStream>) => {
                    const newMap = new Map(prev);
                    newMap.set(targetSocketId, event.streams[0]);
                    return newMap;
                });
            };

            if (initiator) {
                peer.createOffer().then(offer => {
                    peer.setLocalDescription(offer);
                    socket.emit('webrtc:offer', { targetSocketId, sdp: offer });
                });
            }

            peersRef.current.set(targetSocketId, peer);
            setPeers(new Map(peersRef.current));
            return peer;
        };

        socket.on('room:existing-users', (users: string[]) => {
            users.forEach(socketId => {
                createPeer(socketId, true);
            });
        });

        socket.on('room:user-joined', ({ socketId }) => {
            createPeer(socketId, false); // Wait for offer
        });

        socket.on('webrtc:offer', async ({ sdp, senderSocketId }) => {
            let peer = peersRef.current.get(senderSocketId);
            if (!peer) {
                peer = createPeer(senderSocketId, false);
            }
            await peer.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit('webrtc:answer', { targetSocketId: senderSocketId, sdp: answer });
        });

        socket.on('webrtc:answer', async ({ sdp, senderSocketId }) => {
            const peer = peersRef.current.get(senderSocketId);
            if (peer) {
                await peer.setRemoteDescription(new RTCSessionDescription(sdp));
            }
        });

        socket.on('webrtc:ice-candidate', async ({ candidate, senderSocketId }) => {
            const peer = peersRef.current.get(senderSocketId);
            if (peer) {
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        socket.on('room:user-left', ({ socketId }) => {
            const peer = peersRef.current.get(socketId);
            if (peer) {
                peer.close();
                peersRef.current.delete(socketId);
                setPeers(new Map(peersRef.current));
                setRemoteStreams((prev: Map<string, MediaStream>) => {
                    const newMap = new Map(prev);
                    newMap.delete(socketId);
                    return newMap;
                });
            }
        });

        return () => {
            socket.off('room:existing-users');
            socket.off('room:user-joined');
            socket.off('webrtc:offer');
            socket.off('webrtc:answer');
            socket.off('webrtc:ice-candidate');
            socket.off('room:user-left');

            localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            peersRef.current.forEach((peer: RTCPeerConnection) => peer.close());
        };
    }, [socket, roomId, userId]);

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track: MediaStreamTrack) => {
                track.enabled = !track.enabled;
            });
            return !localStreamRef.current.getAudioTracks()[0].enabled; // Return isMuted status
        }
        return false;
    };

    return { remoteStreams, toggleMute };
};
