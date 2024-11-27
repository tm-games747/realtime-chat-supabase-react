import { useState } from "react";
import {
  Input,
  Stack,
  IconButton,
  useToast,
  Box,
  Container,
  Button,
} from "@chakra-ui/react";
import { BiSend } from "react-icons/bi";
import { useAppContext } from "../context/appContext";
import supabase from "../supabaseClient";

export default function MessageForm() {
  const { username, country, session, loggedInUser } = useAppContext();
  const [message, setMessage] = useState("");
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    if (!message && !file) return;

    setMessage("");
    setFile(null);

    try {
      let fileUrl = null;
      if (file) {
        const { data, error: uploadError } = await supabase.storage
          .from("chat-files")
          .upload(`public/${file.name}`, file);

        if (uploadError) {
          throw uploadError;
        }

        fileUrl = data.Key;
      }

      const { error } = await supabase.from("messages").insert([
        {
          text: message,
          username: loggedInUser,
          country,
          is_authenticated: session ? true : false,
          file_url: fileUrl,
        },
      ]);

      if (error) {
        console.error(error.message);
        toast({
          title: "Error sending",
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        return;
      }
      console.log("Successfully sent!");
    } catch (error) {
      console.log("error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box py="10px" pt="15px" bg="gray.100">
      <Container maxW="600px">
        <form onSubmit={handleSubmit} autoComplete="off">
          <Stack direction="row">
            <Input
              name="message"
              placeholder="Enter a message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              bg="white"
              border="none"
              autoFocus
              maxLength="500"
            />
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              bg="white"
              border="none"
            />
            <IconButton
              colorScheme="teal"
              aria-label="Send"
              fontSize="20px"
              icon={<BiSend />}
              type="submit"
              disabled={!message && !file}
              isLoading={isSending}
            />
          </Stack>
        </form>
        <Box fontSize="10px" mt="1">
          Warning: do not share any sensitive information, it's a public chat
          room 🙂
        </Box>
      </Container>
    </Box>
  );
}
