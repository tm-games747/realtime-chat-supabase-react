import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Input, Stack, Text } from "@chakra-ui/react";
import { useAppContext } from "../context/appContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setLoggedInUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      (username === "M" && password === "M143") ||
      (username === "J" && password === "J143")
    ) {
      setLoggedInUser(username);
      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <Container maxW="sm" centerContent>
      <Box
        p="6"
        mt="10"
        bg="white"
        borderRadius="10px"
        boxShadow="md"
        width="100%"
      >
        <Text fontSize="2xl" mb="4">
          Login
        </Text>
        <form onSubmit={handleLogin}>
          <Stack spacing="4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}
            <Button type="submit" colorScheme="teal">
              Login
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
