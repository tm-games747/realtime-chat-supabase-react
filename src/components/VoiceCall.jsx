import React, { useEffect, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { useAppContext } from "../context/appContext";
import { io } from "socket.io-client";

const VoiceCall = () => {
  const { loggedInUser } = useAppContext();
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to voice call server");
    });

    newSocket.on("call-accepted", () => {
      setIsInCall(true);
      setIsCalling(false);
    });

    newSocket.on("call-ended", () => {
      setIsInCall(false);
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
  };

  return (
    <Box>
      <Text fontSize="2xl" mb="4">
        Voice Call
      </Text>
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

export default VoiceCall;
