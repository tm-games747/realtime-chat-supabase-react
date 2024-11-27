import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { useAppContext } from "../context/appContext";
import { io } from "socket.io-client";

const VideoCall = () => {
  const { loggedInUser } = useAppContext();
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [socket, setSocket] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to video call server");
    });

    newSocket.on("call-accepted", async () => {
      setIsInCall(true);
      setIsCalling(false);
      await startVideoCall();
    });

    newSocket.on("call-ended", () => {
      setIsInCall(false);
      endVideoCall();
    });

    newSocket.on("offer", async (offer) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", answer);
      }
    });

    newSocket.on("answer", async (answer) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    });

    newSocket.on("ice-candidate", async (candidate) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startCall = () => {
    setIsCalling(true);
    socket.emit("start-call", { username: loggedInUser });
  };

  const endCall = () => {
    socket.emit("end-call", { username: loggedInUser });
    setIsInCall(false);
    endVideoCall();
  };

  const startVideoCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = localStream;

    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer);
  };

  const endVideoCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <Box>
      <Text fontSize="2xl" mb="4">
        Video Call
      </Text>
      <Box display="flex" justifyContent="center" mb="4">
        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "45%", marginRight: "10px" }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "45%" }} />
      </Box>
      {isInCall ? (
        <Button colorScheme="red" onClick={endCall}>
          End Call
        </Button>
      ) : (
        <Button colorScheme="teal" onClick={startCall} isLoading={isCalling}>
          Start Call
        </Button>
      )}
    </Box>
  );
};

export default VideoCall;
