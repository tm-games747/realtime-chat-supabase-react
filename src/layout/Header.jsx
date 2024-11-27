import { Grid, GridItem, Text } from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";

export default function Header() {
  return (
    <Grid
      templateColumns="1fr"
      justifyItems="center"
      alignItems="center"
      bg="white"
      position="sticky"
      top="0"
      zIndex="10"
      borderBottom="20px solid #edf2f7"
    >
      <GridItem justifySelf="center" m="2">
        <Text fontSize="2xl" fontWeight="bold">
          Private Chat <FaHeart color="red" />
        </Text>
      </GridItem>
    </Grid>
  );
}
