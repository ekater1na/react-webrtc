import React, { useCallback, useEffect, useRef } from 'react';
import { useStateWithCallback } from './useStateWithCallback';
import socket from '../socket';
import ACTIONS from '../socket/actions';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

export const useWebRTC = (roomID) => {
  const [clients, updateClients] = useStateWithCallback([]);

  const addNewClient = useCallback(
    (newClient, cb) => {
      updateClients((list) => {
        if (!list.includes(newClient)) {
          return [...list, newClient];
        }

        return list;
      }, cb);
    },
    [clients, updateClients]
  );

  const peerConnections = useRef({});
  const localMediaStream = useRef(null);
  const peerMediaElements = useRef({
    [LOCAL_VIDEO]: null
  });

  useEffect(() => {
    async function startCapture() {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 1200,
          height: 720
        }
      });

      addNewClient(LOCAL_VIDEO, () => {
        const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];

        if (localVideoElement) {
          localVideoElement.volume = 0;
          localVideoElement.srcObject = localMediaStream.current;
        }
      });
    }

    startCapture()
      .then(() => socket.emit(ACTIONS.JOIN, { room: roomID }))
      .catch((e) => console.error('Error getting userMedia', e));
  }, [roomID]);

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node;
  }, []);

  return { clients, provideMediaRef };
};